import {TasksStateType} from '../App';
import {AddTodolistActionType, getTodolistACType, getTodoTC, RemoveTodolistActionType} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";

export type RemoveTaskActionType = {
    type: 'REMOVE-TASK',
    todolistId: string
    taskId: string
}

export type AddTaskActionType = {
    type: 'ADD-TASK',
    todolistId: string,
    task:TaskType

}

export type ChangeTaskStatusActionType = {
    type: 'CHANGE-TASK-STATUS',
    todolistId: string
    taskId: string
    status: TaskStatuses
}

export type ChangeTaskTitleActionType = {
    type: 'CHANGE-TASK-TITLE',
    todolistId: string
    taskId: string
    title: string
}

type ActionsType = RemoveTaskActionType | AddTaskActionType
    | ChangeTaskStatusActionType
    | ChangeTaskTitleActionType
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
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId];
            const newTasks = tasks.filter(t => t.id !== action.taskId);
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case 'ADD-TASK': {
            const stateCopy = {...state}
            // const newTask: TaskType = {
            //     id: v1(),
            //     title: action.title,
            //     status: TaskStatuses.New,
            //     todoListId: action.todolistId, description: '',
            //     startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            // }
            // const tasks = stateCopy[action.todolistId];
            // const newTasks = [newTask, ...tasks];
            // stateCopy[action.todolistId] = newTasks;'
            return {...state,
            [action.task.todoListId]: [ action.task ,...state[action.task.todoListId]]
            };
        }
        case 'CHANGE-TASK-STATUS': {
            // let todolistTasks = state[action.todolistId];
            // let newTasksArray = todolistTasks
            //     .map(t => t.id === action.taskId ? {...t, status: action.status} : t);
            //
            // state[action.todolistId] = newTasksArray;
            // return ({...state});
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

export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task:TaskType, todolistId: string): AddTaskActionType => {
    return {type: 'ADD-TASK',task,  todolistId}
}
export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string): ChangeTaskStatusActionType => {
    return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId}
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string): ChangeTaskTitleActionType => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId}
}
export const getTasksAC = ( tasks: TaskType[], todolistID: string) => {
    return {type: 'GET-TASKS', tasks, todolistID}as const
}
export const createTasksAC = ( tasks: TaskType[], todolistID: string) => {
    return {type: 'GET-TASKS', tasks, todolistID}as const
}


export const getTasksTC = (todolistID: string) => (dispatch: Dispatch) => {

    todolistsAPI.getTasks(todolistID)
        .then((res) => {
            dispatch(getTasksAC(res.data.items, todolistID))
        })

}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId )
        .then((res)=> {
            dispatch(removeTaskAC(taskId, todolistId))
        })

}
export const createTasksTC = (todolistID: string, title:string) => (dispatch: any) => {

    todolistsAPI.createTask(todolistID,title)
        .then((res) => {
           // dispatch(getTodoTC)
            dispatch(addTaskAC(res.data.data.item, title))
        })

}
export const changeStatusTC = (todolistID: string, status:TaskStatuses, taskID: string) => (dispatch: Dispatch, getState:()=> AppRootStateType) => {
 const task = getState().tasks[todolistID].find((t)=> t.id ===taskID )

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
        })
    }
}
export const changeTitleTC = (todolistID: string, title: string, taskID: string) => (dispatch: Dispatch, getState:()=> AppRootStateType) => {
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
        })
    }
}