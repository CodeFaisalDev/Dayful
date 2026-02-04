import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { NotificationService } from '../services/notifications';
import { ThemeProvider, useTheme as useAppTheme } from '../context/ThemeContext';
import { useFonts } from 'expo-font';
import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { SoundService } from '../services/sound';
import { AdsService } from '../services/ads';
import { useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { OnboardingFlow } from '../components/OnboardingFlow';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
        PlusJakartaSans_800ExtraBold,
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
        // Sounds auto-init now
    }, [loaded, error]);

    useEffect(() => {
        NotificationService.registerForPushNotificationsAsync();
        AdsService.init();
    }, []);

    if (!loaded && !error) {
        return null;
    }

    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <Content />
            </SafeAreaProvider>
        </ThemeProvider>
    );
}

function Content() {
    const { isDark, isFirstLaunch, setLaunched, setUserName } = useAppTheme();
    const [appReady, setAppReady] = useState(false);

    useEffect(() => {
        // Show loading screen for at least 2 seconds
        const timer = setTimeout(() => {
            setAppReady(true);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleOnboardingComplete = (name: string) => {
        setUserName(name);
        setLaunched();
    };

    if (!appReady) {
        return <LoadingScreen />;
    }

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style={isDark ? 'light' : 'dark'} translucent />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <OnboardingFlow
                isVisible={isFirstLaunch}
                onComplete={handleOnboardingComplete}
            />
        </View>
    );
}
