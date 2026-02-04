import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Home, BarChart2, Plus, Settings } from 'lucide-react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

export default function TabLayout() {
    const { theme, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: theme.iconActive,
                tabBarInactiveTintColor: theme.iconInactive,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 32 : 24,
                    left: 20,
                    right: 20,
                    height: 72,
                    borderRadius: 40,
                    backgroundColor: isDark ? '#1F1D2B' : '#FFFFFF',
                    borderTopWidth: 0,
                    borderWidth: 1,
                    borderColor: isDark ? '#333' : 'rgba(0,0,0,0.05)',
                    elevation: 15,
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.2,
                    shadowRadius: 20,
                    paddingBottom: 0,
                    paddingTop: 15,
                    marginLeft: 20,
                    marginRight: 20,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Animated.View
                            entering={FadeInDown.delay(100).duration(600)}
                            style={[
                                styles.pillIndicator,
                                focused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                            ]}
                        >
                            <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </Animated.View>
                    ),
                }}
            />
            <Tabs.Screen
                name="summary"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, focused }) => (
                        <Animated.View
                            entering={FadeInDown.delay(200).duration(600)}
                            style={[
                                styles.pillIndicator,
                                focused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                            ]}
                        >
                            <BarChart2 size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </Animated.View>
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Create',
                    tabBarIcon: ({ color, focused }) => (
                        <Animated.View
                            entering={ZoomIn.delay(300).duration(500)}
                            style={[
                                styles.plusCircle,
                                focused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                            ]}
                        >
                            <Plus size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </Animated.View>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <Animated.View
                            entering={FadeInDown.delay(400).duration(600)}
                            style={[
                                styles.pillIndicator,
                                focused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                            ]}
                        >
                            <Settings size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </Animated.View>
                    ),
                }}
            />
            {/* Hidden screens from nav */}
            <Tabs.Screen name="new-habit" options={{ href: null }} />
            <Tabs.Screen name="add-task" options={{ href: null }} />
            <Tabs.Screen name="add-event" options={{ href: null }} />
            <Tabs.Screen name="favorites" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    pillIndicator: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
