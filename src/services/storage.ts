import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SubTask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export interface Task {
    id: string;
    name: string;
    time?: string;
    category?: string;
    duration?: string;
    completedDates: string[]; // ISO Strings of dates completed (YYYY-MM-DD)
    createdAt: string;
    streak: number;
    frozenUntil?: string; // ISO String (YYYY-MM-DD)
    isFavorite?: boolean;
    subTasks?: SubTask[];
    repeatDays?: number[]; // [0,1,2,3,4,5,6] (Empty means it's a "habit" that repeats daily or as specified)
}

export interface OneOffTask {
    id: string;
    name: string;
    time?: string;
    category?: string;
    isCompleted: boolean;
    createdAt: string;
    subTasks?: SubTask[];
}

export interface SpecialEvent {
    id: string;
    name: string;
    date: string; // ISO String (YYYY-MM-DD)
    category: string;
    color: string;
    icon: string; // Icon name
    priority?: 'low' | 'medium' | 'high';
    description?: string;
}

const STORAGE_KEY = '@dayful_tasks';
const ONE_OFF_TASKS_KEY = '@dayful_one_off_tasks';
const EVENTS_KEY = '@dayful_events';
const FAVORITES_KEY = '@dayful_favorites';

export const StorageService = {
    async getFavorites(): Promise<string[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error fetching favorites', e);
            return [];
        }
    },

    async toggleFavorite(quote: string): Promise<string[]> {
        try {
            const favorites = await this.getFavorites();
            const isFavorite = favorites.includes(quote);
            let updatedFavorites;
            if (isFavorite) {
                updatedFavorites = favorites.filter(q => q !== quote);
            } else {
                updatedFavorites = [...favorites, quote];
            }
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
            return updatedFavorites;
        } catch (e) {
            console.error('Error toggling favorite', e);
            return [];
        }
    },

    async getTasks(): Promise<Task[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error fetching tasks', e);
            return [];
        }
    },

    async saveTask(task: Task): Promise<void> {
        try {
            const tasks = await this.getTasks();
            const updatedTasks = [...tasks, task];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
        } catch (e) {
            console.error('Error saving task', e);
        }
    },

    async updateTasks(tasks: Task[]): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.error('Error updating tasks', e);
        }
    },

    async updateTask(taskId: string, updates: Partial<Task>): Promise<Task[]> {
        const tasks = await this.getTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, ...updates };
            }
            return task;
        });
        await this.updateTasks(updatedTasks);
        return updatedTasks;
    },

    async toggleTaskCompletion(taskId: string, date: string): Promise<Task[]> {
        const tasks = await this.getTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                const isCompleted = task.completedDates.includes(date);
                let newCompletedDates = [...task.completedDates];

                if (isCompleted) {
                    newCompletedDates = newCompletedDates.filter(d => d !== date);
                } else {
                    newCompletedDates.push(date);
                }

                const streak = this.calculateStreak(newCompletedDates, task.frozenUntil);

                return { ...task, completedDates: newCompletedDates, streak };
            }
            return task;
        });

        await this.updateTasks(updatedTasks);
        return updatedTasks;
    },

    async toggleTaskFavorite(taskId: string): Promise<Task[]> {
        const tasks = await this.getTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, isFavorite: !task.isFavorite };
            }
            return task;
        });
        await this.updateTasks(updatedTasks);
        return updatedTasks;
    },

    async addSubTask(taskId: string, title: string): Promise<Task[]> {
        const tasks = await this.getTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                const subTasks = task.subTasks || [];
                const newSubTask: SubTask = {
                    id: Math.random().toString(36).substr(2, 9),
                    title,
                    isCompleted: false
                };
                return { ...task, subTasks: [...subTasks, newSubTask] };
            }
            return task;
        });
        await this.updateTasks(updatedTasks);
        return updatedTasks;
    },

    async toggleSubTask(taskId: string, subTaskId: string): Promise<Task[]> {
        const tasks = await this.getTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId && task.subTasks) {
                const updatedSubTasks = task.subTasks.map(st => {
                    if (st.id === subTaskId) {
                        return { ...st, isCompleted: !st.isCompleted };
                    }
                    return st;
                });
                return { ...task, subTasks: updatedSubTasks };
            }
            return task;
        });
        await this.updateTasks(updatedTasks);
        return updatedTasks;
    },

    async deleteSubTask(taskId: string, subTaskId: string): Promise<Task[]> {
        const tasks = await this.getTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId && task.subTasks) {
                const updatedSubTasks = task.subTasks.filter(st => st.id !== subTaskId);
                return { ...task, subTasks: updatedSubTasks };
            }
            return task;
        });
        await this.updateTasks(updatedTasks);
        return updatedTasks;
    },

    async freezeStreak(taskId: string, date: string): Promise<Task[]> {
        const tasks = await this.getTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, frozenUntil: date };
            }
            return task;
        });
        await this.updateTasks(updatedTasks);
        return updatedTasks;
    },

    async reorderTasks(newOrder: Task[]): Promise<void> {
        await this.updateTasks(newOrder);
    },

    async deleteTask(taskId: string): Promise<void> {
        const tasks = await this.getTasks();
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        await this.updateTasks(updatedTasks);
    },

    // --- One-off Tasks ---
    async getOneOffTasks(): Promise<OneOffTask[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(ONE_OFF_TASKS_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error fetching one-off tasks', e);
            return [];
        }
    },

    async saveOneOffTask(task: OneOffTask): Promise<void> {
        const tasks = await this.getOneOffTasks();
        const updatedTasks = [...tasks, task];
        await AsyncStorage.setItem(ONE_OFF_TASKS_KEY, JSON.stringify(updatedTasks));
    },

    async updateOneOffTask(taskId: string, updates: Partial<OneOffTask>): Promise<OneOffTask[]> {
        const tasks = await this.getOneOffTasks();
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        await AsyncStorage.setItem(ONE_OFF_TASKS_KEY, JSON.stringify(updatedTasks));
        return updatedTasks;
    },

    async deleteOneOffTask(taskId: string): Promise<void> {
        const tasks = await this.getOneOffTasks();
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        await AsyncStorage.setItem(ONE_OFF_TASKS_KEY, JSON.stringify(updatedTasks));
    },

    async addOneOffSubTask(taskId: string, title: string): Promise<OneOffTask[]> {
        const tasks = await this.getOneOffTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                const subTasks = task.subTasks || [];
                const newSubTask: SubTask = {
                    id: Math.random().toString(36).substr(2, 9),
                    title,
                    isCompleted: false
                };
                return { ...task, subTasks: [...subTasks, newSubTask] };
            }
            return task;
        });
        await AsyncStorage.setItem(ONE_OFF_TASKS_KEY, JSON.stringify(updatedTasks));
        return updatedTasks;
    },

    async toggleOneOffSubTask(taskId: string, subTaskId: string): Promise<OneOffTask[]> {
        const tasks = await this.getOneOffTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId && task.subTasks) {
                const updatedSubTasks = task.subTasks.map(st => {
                    if (st.id === subTaskId) {
                        return { ...st, isCompleted: !st.isCompleted };
                    }
                    return st;
                });
                return { ...task, subTasks: updatedSubTasks };
            }
            return task;
        });
        await AsyncStorage.setItem(ONE_OFF_TASKS_KEY, JSON.stringify(updatedTasks));
        return updatedTasks;
    },

    async deleteOneOffSubTask(taskId: string, subTaskId: string): Promise<OneOffTask[]> {
        const tasks = await this.getOneOffTasks();
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId && task.subTasks) {
                const updatedSubTasks = task.subTasks.filter(st => st.id !== subTaskId);
                return { ...task, subTasks: updatedSubTasks };
            }
            return task;
        });
        await AsyncStorage.setItem(ONE_OFF_TASKS_KEY, JSON.stringify(updatedTasks));
        return updatedTasks;
    },

    // --- Special Events ---
    async getEvents(): Promise<SpecialEvent[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(EVENTS_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error fetching events', e);
            return [];
        }
    },

    async saveEvent(event: SpecialEvent): Promise<void> {
        const events = await this.getEvents();
        const updatedEvents = [...events, event];
        await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
    },

    async deleteEvent(eventId: string): Promise<void> {
        const events = await this.getEvents();
        const updatedEvents = events.filter(e => e.id !== eventId);
        await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
    },

    calculateStreak(completedDates: string[], frozenUntil?: string): number {
        if (completedDates.length === 0) return 0;

        const sortedDates = [...completedDates].sort((a, b) =>
            new Date(b).getTime() - new Date(a).getTime()
        );

        let streak = 0;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let lastDateToCheck = todayStr;
        if (!completedDates.includes(todayStr) && frozenUntil !== todayStr) {
            lastDateToCheck = yesterdayStr;
        }

        let currentDate = new Date(lastDateToCheck);

        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (completedDates.includes(dateStr) || frozenUntil === dateStr) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    },

    // User Data
    async saveUserName(name: string) {
        await AsyncStorage.setItem('@dayful_user_name', name);
    },

    async getUserName() {
        return await AsyncStorage.getItem('@dayful_user_name');
    },

    async isFirstLaunch() {
        const launched = await AsyncStorage.getItem('@dayful_launched');
        return !launched;
    },

    async setLaunched() {
        await AsyncStorage.setItem('@dayful_launched', 'true');
    }
};
