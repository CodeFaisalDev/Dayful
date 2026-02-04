import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../styles/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    accentColor: string;
    setAccentColor: (color: string) => void;
    isDark: boolean;
    theme: typeof Colors.light & { accentColor: string };
    unlockedAccents: string[];
    unlockAccent: (color: string) => void;
    userName: string;
    setUserName: (name: string) => void;
    isFirstLaunch: boolean;
    setLaunched: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Accent colors for personalization (decorative elements only)
export const ACCENT_COLORS = [
    '#3B82F6', // Blue (default)
    '#22C55E', // Green
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>('system');
    const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
    const [unlockedAccents, setUnlockedAccents] = useState<string[]>([ACCENT_COLORS[0]]);
    const [userName, setUserName] = useState('User');
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedMode = await AsyncStorage.getItem('@dayful_theme_mode');
            const savedAccent = await AsyncStorage.getItem('@dayful_accent_color');
            const savedUnlocked = await AsyncStorage.getItem('@dayful_unlocked_accents');
            const savedName = await AsyncStorage.getItem('@dayful_user_name');
            const launched = await AsyncStorage.getItem('@dayful_launched');

            if (savedMode) setMode(savedMode as ThemeMode);
            if (savedAccent) setAccentColor(savedAccent);
            if (savedUnlocked) setUnlockedAccents(JSON.parse(savedUnlocked));
            if (savedName) setUserName(savedName);
            setIsFirstLaunch(!launched);
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    };

    const saveName = async (name: string) => {
        setUserName(name);
        await AsyncStorage.setItem('@dayful_user_name', name);
    };

    const setLaunched = async () => {
        setIsFirstLaunch(false);
        await AsyncStorage.setItem('@dayful_launched', 'true');
    };

    const saveMode = async (newMode: ThemeMode) => {
        setMode(newMode);
        await AsyncStorage.setItem('@dayful_theme_mode', newMode);
    };

    const saveAccent = async (color: string) => {
        setAccentColor(color);
        await AsyncStorage.setItem('@dayful_accent_color', color);
    };

    const unlockAccent = async (color: string) => {
        const nextUnlocked = [...unlockedAccents, color];
        setUnlockedAccents(nextUnlocked);
        await AsyncStorage.setItem('@dayful_unlocked_accents', JSON.stringify(nextUnlocked));
    };

    const isDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';

    const theme = isDark ? Colors.dark : Colors.light;

    // Keep primary color from theme, add accentColor as separate property
    const personalizedTheme = {
        ...theme,
        accentColor: accentColor, // For decorative elements
    };

    return (
        <ThemeContext.Provider value={{
            mode,
            setMode: saveMode,
            accentColor,
            setAccentColor: saveAccent,
            isDark,
            theme: personalizedTheme,
            unlockedAccents,
            unlockAccent,
            userName,
            setUserName: saveName,
            isFirstLaunch,
            setLaunched
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
