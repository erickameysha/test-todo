import {TasksStateType} from '../app/App';
import {
    AddTodolistActionType,
    changeEntityStatusAC,
    getTodolistACType,
    getTodoTC,
    RemoveTodolistActionType
} from './todolists-reducer';
import {ResultCode, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";
import {RequestStatusType, setErrorAC, setStatusAC} from "../app/app-reducer";
import {handleServerAppError, handleServerNetworkError} from "../utils/error-utils";
import axios, {AxiosError} from "axios";

type ActionsType = ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof changeTaskTitleAC>
    | ReturnType<typeof changeTaskStatusAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | getTodolistACType
    | ReturnType<typeof getTasksAC>
    | ReturnType<typeof changeEntityTaskStatusAC>


const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case "GET-TASKS": {
            return {
                ...state,
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
            return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]};
        }
        case 'CHANGE-TASK-STATUS': {
            return {
                ...state,
                [action.todolistId]: state[action.todolistId].map(t => t.id === action.taskId ? {
                    ...t,
                    status: action.status
                } : t)
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
        case "CHANGE-ENTITY-TASK-STATUS":
            return {
                ...state,
                [action.todolistID]: state[action.todolistID].map(el => el.id === action.id ? {
                    ...el,
                    entityStatus: action.status
                } : el)
            }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string) => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId} as const
}
export const addTaskAC = (task: TaskType, todolistId: string) => {
    return {type: 'ADD-TASK', task, todolistId} as const
}
export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string) => {
    return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId} as const
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string) => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId} as const
}
export const getTasksAC = (tasks: TaskType[], todolistID: string) => {
    return {type: 'GET-TASKS', tasks, todolistID} as const
}
export const createTasksAC = (tasks: TaskType[], todolistID: string) => {
    return {type: 'GET-TASKS', tasks, todolistID} as const
}

export const changeEntityTaskStatusAC = (todolistID: string, id: string, status: RequestStatusType) => {
    return {type: 'CHANGE-ENTITY-TASK-STATUS', todolistID, id: id, status: status} as const
}

export const getTasksTC = (todolistID: string) => (dispatch: Dispatch) => {
    dispatch(setStatusAC('loading'))
    todolistsAPI.getTasks(todolistID)
        .then((res) => {
            dispatch(getTasksAC(res.data.items, todolistID))
            dispatch(setStatusAC('succeeded'))

        })

}
export const removeTaskTC = (taskId: string, todolistId: string) => async (dispatch: Dispatch) => {
    dispatch(changeEntityTaskStatusAC(todolistId, taskId, 'loading'))
    dispatch(setStatusAC('loading'))
    try {
        let res = await todolistsAPI.deleteTask(todolistId, taskId)
        if (res.data.resultCode === ResultCode.OK) {

            dispatch(removeTaskAC(taskId, todolistId))
            dispatch(setStatusAC('succeeded'))
        } else {
            handleServerAppError(res.data, dispatch)
        }
    } catch (error) {
        if (axios.isAxiosError<{ message: string }>(error)) {
            const err = error.response?.data ? error.response.data.message : error.message
            dispatch(changeEntityTaskStatusAC(todolistId, taskId, "failed"))
            handleServerNetworkError(dispatch, err)
        }
    }
    dispatch(setStatusAC('succeeded'))

}
export const createTasksTC = (todolistID: string, title: string) => async (dispatch: any) => {
    dispatch(setStatusAC('loading'))

    // const res = await todolistsAPI.createTask(todolistID, title)
    try {
        const res = await todolistsAPI.createTask(todolistID, title)
        if (res.data.resultCode === 0) {
            dispatch(addTaskAC(res.data.data.item, title))
            dispatch(setStatusAC('succeeded'))
        } else {
            handleServerAppError(res.data, dispatch)
        }
    } catch (error) {

        if (axios.isAxiosError<{ message: string }>(error)) {
            const err = error.response?.data ? error.response.data.message : error.message
            handleServerNetworkError(dispatch, err)
        }
    }

}
export const changeStatusTC = (todolistID: string, status: TaskStatuses, taskID: string) => async (dispatch: Dispatch, getState: () => AppRootStateType) => {
    const task = getState().tasks[todolistID].find((t) => t.id === taskID)
    dispatch(setStatusAC('loading'))

    try {
        if (task) {
            // const task = getState().tasks[todolistID].find((t) => t.id === taskID)
            let res = await todolistsAPI.updateTask(todolistID, taskID, {
                title: task.title,
                startDate: task.startDate,
                priority: task.priority,
                description: task.description,
                deadline: task.deadline,
                status: status
            })
            if (res.data.resultCode === ResultCode.OK) {
                const action = changeTaskStatusAC(taskID, status, todolistID)
                dispatch(action)
                dispatch(setStatusAC('succeeded'))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        }
    } catch (error) {
        if (axios.isAxiosError<{ message: string }>(error)) {
            const err = error.response?.data ? error.response.data.message : error.message

            handleServerNetworkError(dispatch, err)
        }

    }
}
export const changeTitleTC = (todolistID: string, title: string, taskID: string) => async (dispatch: Dispatch, getState: () => AppRootStateType) => {
    dispatch(setStatusAC('loading'))


    const task = getState().tasks[todolistID].find((t) => t.id === taskID)
    try {
        if (task) {
            let res = await todolistsAPI.updateTask(todolistID, taskID, {
                title,
                startDate: task.startDate,
                priority: task.priority,
                description: task.description,
                deadline: task.deadline,
                status: task.status
            })
            if (res.data.resultCode === ResultCode.OK) {
                const action = changeTaskTitleAC(taskID, title, todolistID)
                dispatch(action)
                dispatch(setStatusAC('succeeded'))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        }
    } catch (error) {
        if (axios.isAxiosError<{ message: string }>(error)) {
            const err = error.response?.data ? error.response.data.message : error.message

            handleServerNetworkError(dispatch, err)
        }
    }

}