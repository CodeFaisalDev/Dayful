import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const PLAYFUL_TITLES = [
    "✨ Magic awaits!",
    "🚀 Time to shine!",
    "💪 You got this!",
    "🌟 Level up time!",
    "🎯 Mission ready!",
];

const getRandomTitle = () => PLAYFUL_TITLES[Math.floor(Math.random() * PLAYFUL_TITLES.length)];

export const NotificationService = {
    async registerForPushNotificationsAsync() {
        let token;
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return false;
        }
        return true;
    },

    async scheduleTaskReminder(taskId: string, taskName: string, timeStr: string) {
        try {
            const [time, period] = timeStr.split(' ');
            const parts = time.split(':');
            let hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);

            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const baseDate = new Date();
            baseDate.setHours(hours, minutes, 0, 0);
            if (baseDate <= new Date()) baseDate.setDate(baseDate.getDate() + 1);

            // 1. Exact Time Reminder
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: getRandomTitle(),
                    body: `Time for "${taskName}"! Let's get it done. 🎯`,
                    sound: 'default',
                    data: { taskId, type: 'exact' },
                },
                trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: baseDate },
            });

            // 2. Upcoming Reminder (5 mins before)
            const upcomingDate = new Date(baseDate.getTime() - 5 * 60000);
            if (upcomingDate > new Date()) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "👀 Getting close...",
                        body: `"${taskName}" starts in 5 minutes!`,
                        sound: 'default',
                        data: { taskId, type: 'upcoming' },
                    },
                    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: upcomingDate },
                });
            }

            // 3. Missed Task Follow-up (15 mins after)
            const missedDate = new Date(baseDate.getTime() + 15 * 60000);
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "❓ Still there?",
                    body: `We noticed you haven't marked "${taskName}" as complete yet.`,
                    sound: 'default',
                    data: { taskId, type: 'missed' },
                },
                trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: missedDate },
            });

        } catch (e) {
            console.log("Error scheduling task", e);
        }
    },

    async scheduleEventReminder(eventId: string, eventName: string, dateStr: string) {
        try {
            const [year, month, day] = dateStr.split('-').map(Number);
            const trigger = new Date(year, month - 1, day, 9, 0, 0);

            if (trigger > new Date()) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "🎉 Big Day Alert!",
                        body: `Today is ${eventName}! Make it memorable.`,
                        sound: 'default',
                        data: { eventId },
                    },
                    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger }
                });
            }
        } catch (e) {
            console.log("Error scheduling event", e);
        }
    },

    async scheduleHabitReminder(habitId: string, habitName: string, timeStr: string, repeatDays: number[]) {
        try {
            const [time, period] = timeStr.split(' ');
            const parts = time.split(':');
            let hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);

            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            await Promise.all(repeatDays.map(dayIdx => {
                const weekday = dayIdx + 1;
                return Notifications.scheduleNotificationAsync({
                    content: {
                        title: "🌱 Habit Time!",
                        body: `Time to build that streak: ${habitName}`,
                        sound: 'default',
                        data: { habitId },
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                        hour: hours,
                        minute: minutes,
                        weekday,
                    },
                });
            }));
        } catch (e) {
            console.log("Error scheduling habit", e);
        }
    },

    async scheduleDailyBriefing(taskCount: number, eventCount: number) {
        try {
            const trigger = new Date();
            trigger.setHours(8, 0, 0, 0); // 8 AM
            if (trigger <= new Date()) trigger.setDate(trigger.getDate() + 1);

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "☀️ Good Morning!",
                    body: `You have ${taskCount} tasks and ${eventCount} events today. Let's make it a great one!`,
                    sound: 'default',
                    data: { type: 'briefing' },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: 8,
                    minute: 0,
                },
            });
        } catch (e) {
            console.log("Error scheduling briefing", e);
        }
    },

    async notifyNow(title: string, body: string, data: any = {}) {
        await Notifications.scheduleNotificationAsync({
            content: { title, body, data, sound: 'default' },
            trigger: null, // Pull immediately
        });
    },

    async cancelReminder(itemId: string) {
        try {
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            const targets = scheduled.filter(n =>
                n.content.data?.taskId === itemId ||
                n.content.data?.habitId === itemId ||
                n.content.data?.eventId === itemId
            );

            await Promise.all(targets.map(t => Notifications.cancelScheduledNotificationAsync(t.identifier)));
        } catch (e) {
            console.log("Error cancelling reminder", e);
        }
    }
};
