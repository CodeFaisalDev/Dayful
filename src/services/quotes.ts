const QUOTES = [
    "Small steps every day create big change.",
    "Your future is created by what you do today, not tomorrow.",
    "Consistency is the key to all success.",
    "The only person you should try to be better than is the person you were yesterday.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Focus on the step, not the mountain.",
    "Every morning is a new chance to begin again.",
    "Your routines define your reality.",
    "Discipline is choosing between what you want now and what you want most.",
    "Make today your masterpiece."
];

export const QuoteService = {
    getDailyQuote(): string {
        // Deterministic quote based on day of the year
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        return QUOTES[dayOfYear % QUOTES.length];
    }
};
