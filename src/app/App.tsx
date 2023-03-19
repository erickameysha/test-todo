import React, {useCallback, useEffect} from 'react'
import './App.css';
import {Todolist} from '../features/Todolists/Todolist';
import {AddItemForm} from '../components/AddItemForm/AddItemForm';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import {Menu} from '@mui/icons-material';
import {
    addTodolistAC,
    changeTodolistFilterAC,
    changeTodolistTitleAC, changeTodolistTitleTC, createTodolistTC,
    FilterValuesType, getTodolistsAC, getTodoTC,
    removeTodolistAC, removeTodolistTC,
    TodolistDomainType
} from '../state/todolists-reducer'
import {
    addTaskAC, changeStatusTC,
    changeTaskStatusAC,
    changeTaskTitleAC, changeTitleTC,
    createTasksTC,
    removeTaskAC,
    removeTaskTC
} from '../state/tasks-reducer';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStateType, useAppDispatch, useAppSelector} from '../state/store';
import {TaskStatuses, TaskType, todolistsAPI} from '../api/todolists-api'
import {TodolistList} from "../features/TodolistList/TodolistList";
import {CircularProgress, LinearProgress} from "@mui/material";
import {RequestStatusType} from "./app_reducer";
import {ErrorSnackbar} from "../components/ErrorSnackbar/ErrorSnackbar";


export type TasksStateType = {
    [key: string]: Array<TaskType>
}


function App() {
const status= useAppSelector<RequestStatusType>((s)=> s.app.status)

    return (
        <div className="App">
            <ErrorSnackbar/>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu">
                        <Menu/>
                    </IconButton>
                    <Typography variant="h6">
                        News
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>
            {
                status === 'loading' && <LinearProgress color='secondary'/>


            }
            <Container fixed>
                <TodolistList/>
            </Container>
        </div>
    );
}

export default App;

