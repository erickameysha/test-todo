import {TasksStateType} from '../app/App';
import {AddTodolistActionType, getTodolistACType, getTodoTC, RemoveTodolistActionType} from './todolists-reducer';
import { TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";
import {setErrorAC, setStatusAC} from "../app/app_reducer";

type ActionsType = ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof changeTaskTitleAC>
    | ReturnType<typeof changeTaskStatusAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | getTodolistACType
| ReturnType<typeof getTasksAC>
const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case "GET-TASKS":{
            return { ...state,
            [action.todolistID]: action.tasks
            }
        }
        case "GET-TODOLIST": {
            const copyState = {...state}
            action.todolist.forEach((tl) => {
                copyState[tl.id] = []
            })
            return copyState
        }

        case 'REMOVE-TASK': {
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)};
        }
        case 'ADD-TASK': {
            return {...state, [action.task.todoListId]: [ action.task ,...state[action.task.todoListId]]};
        }
        case 'CHANGE-TASK-STATUS': {
            return {
                ...state,
                [action.todolistId]: state[action.todolistId].map(t => t.id === action.taskId ? {...t, status: action.status} : t)
            };
        }
        case 'CHANGE-TASK-TITLE': {
            let todolistTasks = state[action.todolistId];
            // найдём нужную таску:
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.todolist.id]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string)=> {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}as const
}
export const addTaskAC = (task:TaskType, todolistId: string) => {
    return {type: 'ADD-TASK',task,  todolistId}as const
}
export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string) => {
    return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId}as const
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string) => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId}as const
}
export const getTasksAC = ( tasks: TaskType[], todolistID: string) => {
    return {type: 'GET-TASKS', tasks, todolistID}as const
}
export const createTasksAC = ( tasks: TaskType[], todolistID: string) => {
    return {type: 'GET-TASKS', tasks, todolistID}as const
}


export const getTasksTC = (todolistID: string) => (dispatch: Dispatch) => {
    dispatch(setStatusAC('loading'))
    todolistsAPI.getTasks(todolistID)
        .then((res) => {
            dispatch(getTasksAC(res.data.items, todolistID))
            dispatch(setStatusAC('succeeded'))
        })

}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setStatusAC('loading'))

    todolistsAPI.deleteTask(todolistId, taskId )
        .then((res)=> {
            dispatch(removeTaskAC(taskId, todolistId))
            dispatch(setStatusAC('succeeded'))
        })

}
export const createTasksTC = (todolistID: string, title:string) => (dispatch: any) => {
    dispatch(setStatusAC('loading'))

    todolistsAPI.createTask(todolistID,title)
        .then((res) => {
 if (res.data.resultCode=== 0){
     dispatch(addTaskAC(res.data.data.item, title))

 }
        else {
            if (res.data.messages.length) {
                dispatch(setErrorAC(res.data.messages[0]))
            }
            else {
                dispatch(setErrorAC('some error'))
            }
        }
            dispatch(setStatusAC('succeeded'))

        })

}
export const changeStatusTC = (todolistID: string, status:TaskStatuses, taskID: string) => (dispatch: Dispatch, getState:()=> AppRootStateType) => {
 const task = getState().tasks[todolistID].find((t)=> t.id ===taskID )
    dispatch(setStatusAC('loading'))

    if (task) {
        todolistsAPI.updateTask(todolistID, taskID, {
            title: task.title,
            startDate: task.startDate,
            priority: task.priority,
            description: task.description,
            deadline: task.deadline,
            status: status
        }).then(() => {
            const action = changeTaskStatusAC(taskID, status, todolistID)
            dispatch(action)
            dispatch(setStatusAC('succeeded'))
        })
    }
}
export const changeTitleTC = (todolistID: string, title: string, taskID: string) => (dispatch: Dispatch, getState:()=> AppRootStateType) => {
    dispatch(setStatusAC('loading'))

    const task = getState().tasks[todolistID].find((t)=> t.id ===taskID )

    if (task) {
        todolistsAPI.updateTask(todolistID, taskID, {
            title,
            startDate: task.startDate,
            priority: task.priority,
            description: task.description,
            deadline: task.deadline,
            status: task.status
        }).then(() => {
            const action = changeTaskTitleAC(taskID, title, todolistID)
            dispatch(action)
            dispatch(setStatusAC('succeeded'))
        })
    }
}