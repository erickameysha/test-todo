import {v1} from 'uuid';
import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux";



const initialState: Array<TodolistDomainType> = []

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case "GET-TODOLIST": {
            return action.todolist.map(el => ({...el, filter: 'all'}))
        }
        case 'REMOVE-TODOLIST': {
            return state.filter(tl => tl.id !== action.id)
        }
        case 'ADD-TODOLIST': {
            let newTodolist: TodolistDomainType = {...action.todolist, filter: 'all'}
            return [
                newTodolist
                , ...state]
        }
        case 'CHANGE-TODOLIST-TITLE': {
            return state.map(el=> el.id === action.id? {...el, title: action.title}: el)
        }
        case 'CHANGE-TODOLIST-FILTER': {
            return state.map(el=> el.id === action.id ?{...el, filter: action.filter}: el)
        }
        default:
            return state;
    }
}




export const removeTodolistAC = (todolistId: string): RemoveTodolistActionType => {
    return {type: 'REMOVE-TODOLIST', id: todolistId} as const
}
export const addTodolistAC = (todolist: TodolistType): AddTodolistActionType => {
    return {type: 'ADD-TODOLIST', todolist} as const
}
export const changeTodolistTitleAC = (id: string, title: string) => {
    return {type: 'CHANGE-TODOLIST-TITLE', id: id, title: title} as const
}
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => {
    return {type: 'CHANGE-TODOLIST-FILTER', id: id, filter: filter} as const
}
export const getTodolistsAC = (todolist: TodolistType[]) => {
    return {type: 'GET-TODOLIST', todolist} as const
}



export const getTodoTC = (dispatch: Dispatch) => {

    todolistsAPI.getTodolists()
        .then((res) => {
            dispatch(getTodolistsAC(res.data))
        })

}
export const removeTodolistTC = (todolistID: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTodolist(todolistID)
        .then((res) => {
            dispatch(removeTodolistAC(todolistID))
        })
}
export const createTodolistTC = (title: string) => (dispatch: Dispatch) => {
    todolistsAPI.createTodolist(title)
        .then((res) => {
            dispatch(addTodolistAC(res.data.data.item))
        })
}
export const changeTodolistTitleTC = (id: string, title: string) => (dispatch: Dispatch) => {
    todolistsAPI.updateTodolist(id, title)
        .then((res) => {
            dispatch(changeTodolistTitleAC(id, title))
        })
}

type ActionsType =
    RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | ReturnType<typeof getTodolistsAC>

export type RemoveTodolistActionType = {
    type: 'REMOVE-TODOLIST',
    id: string
}
export type AddTodolistActionType = {
    type: 'ADD-TODOLIST',

    todolist: TodolistType
}
export type getTodolistACType = ReturnType<typeof getTodolistsAC>
