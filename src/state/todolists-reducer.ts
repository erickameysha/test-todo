import {v1} from 'uuid';
import {ResultCode, todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {RequestStatusType, setErrorAC, setStatusAC} from "../app/app_reducer";
import {handleServerAppError, handleServerNetworkError} from "../utils/error-utils";


const initialState: Array<TodolistDomainType> = []

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType,
    entityStatus: RequestStatusType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case "GET-TODOLIST": {
            return action.todolist.map(el => ({...el, filter: 'all', entityStatus: 'idle'}))
        }
        case 'REMOVE-TODOLIST': {
            return state.filter(tl => tl.id !== action.id)
        }
        case 'ADD-TODOLIST': {
            let newTodolist: TodolistDomainType = {...action.todolist, filter: 'all', entityStatus: 'idle'}
            return [
                newTodolist
                , ...state]
        }
        case 'CHANGE-TODOLIST-TITLE': {
            return state.map(el => el.id === action.id ? {...el, title: action.title} : el)
        }
        case 'CHANGE-TODOLIST-FILTER': {
            return state.map(el => el.id === action.id ? {...el, filter: action.filter} : el)
        }
        case "CHANGE-ENTITY-STATUS": {
            return state.map(el => el.id === action.id ? {...el, entityStatus: action.status} : el)
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
export const changeEntityStatusAC = (id: string, status: RequestStatusType) => {
    return {type: 'CHANGE-ENTITY-STATUS', id: id, status: status} as const
}
export const getTodolistsAC = (todolist: TodolistType[]) => {
    return {type: 'GET-TODOLIST', todolist} as const
}


export const getTodoTC = (dispatch: Dispatch) => {
    dispatch(setStatusAC('loading'))
    todolistsAPI.getTodolists()
        .then((res) => {
            dispatch(getTodolistsAC(res.data))
            dispatch(setStatusAC('succeeded'))
        })

}

export const removeTodolistTC = (todolistID: string) => (dispatch: Dispatch) => {
    dispatch(setStatusAC('loading'))
    dispatch(changeEntityStatusAC(todolistID, "loading"))
    todolistsAPI.deleteTodolist(todolistID)
        .then((res) => {
            if (res.data.resultCode === ResultCode.OK) {
                dispatch(removeTodolistAC(todolistID))
                dispatch(setStatusAC('succeeded'))
            } else {
                handleServerAppError(res.data, dispatch)
            }

        })
        .catch((error) => {


            handleServerNetworkError(dispatch, error)
            dispatch(changeEntityStatusAC(todolistID, 'failed'))

        })
}
export const createTodolistTC = (title: string) => (dispatch: Dispatch) => {
    dispatch(setStatusAC('loading'))
    todolistsAPI.createTodolist(title)
        .then((res) => {
            if (res.data.resultCode === ResultCode.OK) {
                dispatch(addTodolistAC(res.data.data.item))
                dispatch(setStatusAC('succeeded'))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        }).catch((err) => {
        handleServerNetworkError(dispatch, err)
    })
}
export const changeTodolistTitleTC = (id: string, title: string) => (dispatch: Dispatch) => {
    dispatch(setStatusAC('loading'))
    todolistsAPI.updateTodolist(id, title)
        .then((res) => {
            dispatch(changeTodolistTitleAC(id, title))
            dispatch(setStatusAC('succeeded'))
        })
}

type ActionsType =
    RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | ReturnType<typeof changeEntityStatusAC>
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
