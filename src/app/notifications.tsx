import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../hooks/useTasks';
import { ChevronLeft, Bell, Clock, Star, Zap, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const COLORS = [
    '#FF6B6B', // Coral
    '#4ECDC4', // Turquoise
    '#FFE66D', // Yellow
    '#95E1D3', // Mint
    '#EA9085', // Salmon
    '#FFCC5C', // Sunflower
    '#A193D4', // Lavender (The theme color)
    '#77D970', // Green
];

const ICONS = [Bell, Clock, Star, Zap, Target];

export default function NotificationsScreen() {
    const { theme, isDark } = useTheme();
    const router = useRouter();
    const { tasks, oneOffTasks } = useTasks();

    const todayStr = new Date().toISOString().split('T')[0];

    // Helper to convert "08:30 AM" to minutes from midnight
    const timeToMinutes = (timeStr?: string) => {
        if (!timeStr) return 9999; // Lower priority for items without time
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let h = hours;
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + minutes;
    };

    const upcomingItems = [
        ...tasks.map(t => ({ ...t, type: 'habit' })),
        ...oneOffTasks.filter(t => !t.isCompleted).map(t => ({ ...t, type: 'task' }))
    ].sort((a, b) => {
        const timeA = timeToMinutes(a.time);
        const timeB = timeToMinutes(b.time);
        return timeA - timeB;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}
                >
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Upcoming</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {upcomingItems.length > 0 ? (
                    upcomingItems.map((item, index) => {
                        const bgColor = COLORS[index % COLORS.length];
                        const Icon = ICONS[index % ICONS.length];

                        return (
                            <Animated.View
                                key={item.id}
                                entering={FadeInDown.delay(index * 100).springify()}
                                style={[styles.card, { backgroundColor: bgColor }]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconCircle}>
                                        <Icon size={20} color={bgColor} />
                                    </View>
                                    <View style={styles.typeBadge}>
                                        <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                                    </View>
                                </View>

                                <Text style={styles.cardTitle}>{item.name}</Text>

                                <View style={styles.cardFooter}>
                                    <View style={styles.timeLabel}>
                                        <Clock size={14} color="#FFF" />
                                        <Text style={styles.timeText}>{item.time || 'Not set'}</Text>
                                    </View>
                                    {item.category && (
                                        <Text style={styles.categoryText}>#{item.category}</Text>
                                    )}
                                </View>
                            </Animated.View>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Bell size={64} color={theme.textSecondary} opacity={0.3} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            No upcoming tasks for today!
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    scrollContent: {
        padding: 24,
        gap: 16,
    },
    card: {
        width: '100%',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: 'PlusJakartaSans_700Bold',
        letterSpacing: 0.5,
    },
    cardTitle: {
        fontSize: 22,
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    categoryText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_500Medium',
        textAlign: 'center',
    },
});
