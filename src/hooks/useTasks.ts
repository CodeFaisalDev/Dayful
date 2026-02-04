import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { StorageService, Task, OneOffTask, SpecialEvent } from '../services/storage';
import { NotificationService } from '../services/notifications';

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [oneOffTasks, setOneOffTasks] = useState<OneOffTask[]>([]);
    const [events, setEvents] = useState<SpecialEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [habitsData, tasksData, eventsData] = await Promise.all([
            StorageService.getTasks(),
            StorageService.getOneOffTasks(),
            StorageService.getEvents()
        ]);
        setTasks(habitsData);
        setOneOffTasks(tasksData);
        setEvents(eventsData);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const addTask = async (name: string, time?: string, category?: string, duration?: string) => {
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            time,
            category,
            duration,
            completedDates: [],
            createdAt: new Date().toISOString(),
            streak: 0,
            subTasks: [],
            isFavorite: false,
        };
        await StorageService.saveTask(newTask);
        if (time) {
            await NotificationService.scheduleTaskReminder(newTask.id, name, time);
        }
        await fetchData();
    };

    const toggleOneOffComplete = async (taskId: string) => {
        const task = oneOffTasks.find(t => t.id === taskId);
        if (task) {
            const updated = await StorageService.updateOneOffTask(taskId, { isCompleted: !task.isCompleted });
            setOneOffTasks(updated);
        }
    };

    const deleteOneOffTask = async (taskId: string) => {
        await NotificationService.cancelReminder(taskId);
        await StorageService.deleteOneOffTask(taskId);
        await fetchData();
    };

    const deleteEvent = async (eventId: string) => {
        await NotificationService.cancelReminder(eventId);
        await StorageService.deleteEvent(eventId);
        await fetchData();
    };

    const editTask = async (taskId: string, name: string, time?: string, category?: string, duration?: string) => {
        const updates: Partial<Task> = { name, time, category, duration };
        const updatedTasks = await StorageService.updateTask(taskId, updates);

        await NotificationService.cancelReminder(taskId);
        if (time) {
            await NotificationService.scheduleTaskReminder(taskId, name, time);
        }

        setTasks(updatedTasks);
    };

    const toggleComplete = async (taskId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const updatedTasks = await StorageService.toggleTaskCompletion(taskId, today);
        setTasks(updatedTasks);
    };

    const toggleFavorite = async (taskId: string) => {
        const updatedTasks = await StorageService.toggleTaskFavorite(taskId);
        setTasks(updatedTasks);
    };

    const deleteTask = async (taskId: string) => {
        await NotificationService.cancelReminder(taskId);
        const allTasks = await StorageService.getTasks();
        const updatedTasks = allTasks.filter(t => t.id !== taskId);
        await StorageService.updateTasks(updatedTasks);
        setTasks(updatedTasks);
    };

    const addSubTask = async (taskId: string, title: string) => {
        const updatedTasks = await StorageService.addSubTask(taskId, title);
        setTasks(updatedTasks);
    };

    const toggleSubTask = async (taskId: string, subTaskId: string) => {
        const updatedTasks = await StorageService.toggleSubTask(taskId, subTaskId);
        setTasks(updatedTasks);
    };

    const deleteSubTask = async (taskId: string, subTaskId: string) => {
        const updatedTasks = await StorageService.deleteSubTask(taskId, subTaskId);
        setTasks(updatedTasks);
    };

    const addOneOffSubTask = async (taskId: string, title: string) => {
        const updatedTasks = await StorageService.addOneOffSubTask(taskId, title);
        setOneOffTasks(updatedTasks);
    };

    const toggleOneOffSubTask = async (taskId: string, subTaskId: string) => {
        const updatedTasks = await StorageService.toggleOneOffSubTask(taskId, subTaskId);
        setOneOffTasks(updatedTasks);
    };

    const deleteOneOffSubTask = async (taskId: string, subTaskId: string) => {
        const updatedTasks = await StorageService.deleteOneOffSubTask(taskId, subTaskId);
        setOneOffTasks(updatedTasks);
    };

    const freezeStreak = async (taskId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const updatedTasks = await StorageService.freezeStreak(taskId, today);
        setTasks(updatedTasks);
    };

    const reorderTasks = async (newTasks: Task[]) => {
        setTasks(newTasks);
        await StorageService.reorderTasks(newTasks);
    };

    return {
        tasks,
        oneOffTasks,
        events,
        loading,
        addTask,
        editTask,
        toggleComplete,
        toggleFavorite,
        deleteTask,
        toggleOneOffComplete,
        deleteOneOffTask,
        deleteEvent,
        addSubTask,
        toggleSubTask,
        deleteSubTask,
        addOneOffSubTask,
        toggleOneOffSubTask,
        deleteOneOffSubTask,
        freezeStreak,
        reorderTasks,
        refreshTasks: fetchData
    };
};
