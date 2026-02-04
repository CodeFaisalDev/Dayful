import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Flame, TrendingUp, Droplets, Brain, Heart, Dumbbell, Leaf } from 'lucide-react-native';
import { useTasks } from '../../hooks/useTasks';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SummaryScreen() {
    const { theme, isDark } = useTheme();
    const { tasks } = useTasks();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Calculate dates for the last 7 days
    const last7Days = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    }, []);

    // Statistics calculations
    const stats = useMemo(() => {
        if (tasks.length === 0) return { totalDone: 0, currentStreak: 0, bestStreak: 0, avgCompletion: 0, chartPoints: [] };

        const totalDone = tasks.reduce((acc, t) => acc + (t.completedDates?.length || 0), 0);
        const currentStreak = Math.max(...tasks.map(t => t.streak || 0));
        const bestStreak = Math.max(...tasks.map(t => t.streak || 0));

        const getCompletionForDate = (date: string) => {
            const activeOnDay = tasks.filter(t => {
                if (!t.repeatDays || t.repeatDays.length === 0) return true;
                const dayNum = new Date(date).getDay();
                return t.repeatDays.includes(dayNum);
            });
            if (activeOnDay.length === 0) return 1; // 100% if no tasks due
            const completedOnDay = activeOnDay.filter(t => t.completedDates?.includes(date)).length;
            return completedOnDay / activeOnDay.length;
        };

        const weeklyCompletion = last7Days.map(d => getCompletionForDate(d));
        const avgCompletion = weeklyCompletion.reduce((a, b) => a + b, 0) / 7;
        const chartPoints = weeklyCompletion.map(c => Math.round(c * 100));

        return { totalDone, currentStreak, bestStreak, avgCompletion, chartPoints };
    }, [tasks, last7Days]);

    // Dynamic Category List from Tasks
    const categories = useMemo(() => {
        const uniqueCats = Array.from(new Set(tasks.map(t => t.category))).filter((c): c is string => typeof c === 'string');
        return [{ id: 'all', label: 'All Habits' }, ...uniqueCats.map(c => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))];
    }, [tasks]);

    // Dynamic Consistency Data
    const consistencyData = useMemo(() => {
        const filteredTasks = selectedCategory === 'all' ? tasks : tasks.filter(t => t.category === selectedCategory);

        return filteredTasks.map(task => {
            const last7Count = last7Days.filter(d => task.completedDates?.includes(d)).length;
            const progress = (last7Count / 7) * 100;

            let icon = Brain;
            let color = '#3B82F6';
            if (task.category === 'workout') { icon = Dumbbell; color = '#10B981'; }
            if (task.category === 'health') { icon = Leaf; color = '#F59E0B'; }
            if (task.category === 'selfcare') { icon = Heart; color = '#F43F5E'; }

            return {
                id: task.id,
                name: task.name,
                icon,
                progress: Math.round(progress),
                color,
                days: `${last7Count} OF 7 DAYS`
            };
        }).sort((a, b) => b.progress - a.progress);
    }, [tasks, selectedCategory, last7Days]);

    // SVG Chart Path Generation
    const generateChartPath = () => {
        const width = SCREEN_WIDTH - 88;
        const height = 100;
        const padding = 10;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        if (stats.chartPoints.length === 0) return '';

        const points = stats.chartPoints.map((value, index) => {
            const x = padding + (index / (stats.chartPoints.length - 1)) * chartWidth;
            const y = height - padding - (value / 100) * chartHeight;
            return { x, y };
        });

        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            path += ` Q ${prev.x + (curr.x - prev.x) / 4} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`;
            path += ` Q ${curr.x - (curr.x - prev.x) / 4} ${curr.y} ${curr.x} ${curr.y}`;
        }
        return path;
    };

    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Animated.View entering={FadeInDown.duration(600)} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={[styles.circleBtn, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                            <ChevronLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Stat History</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Activity Chart Card */}
                    <Animated.View
                        entering={FadeInDown.delay(100)}
                        style={[styles.chartCard, {
                            backgroundColor: isDark ? theme.surface : '#FFFFFF',
                            borderWidth: isDark ? 1 : 0,
                            borderColor: 'rgba(255,255,255,0.05)',
                        }]}
                    >
                        <View style={styles.chartHeader}>
                            <View>
                                <Text style={[styles.chartTitle, { color: theme.text }]}>Activity</Text>
                                <Text style={[styles.chartSubtitle, { color: theme.textSecondary }]}>
                                    LAST 7 DAYS
                                </Text>
                            </View>
                            <View style={[styles.avgBadge, { backgroundColor: theme.primary + '15' }]}>
                                <Text style={[styles.avgText, { color: theme.primary }]}>
                                    • {Math.round(stats.avgCompletion * 100)}% Average
                                </Text>
                            </View>
                        </View>

                        <View style={styles.chartContainer}>
                            <Svg width="100%" height={120} viewBox={`0 0 ${SCREEN_WIDTH - 88} 120`}>
                                <Path
                                    d={generateChartPath()}
                                    stroke={theme.primary}
                                    strokeWidth={4}
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                {stats.chartPoints.map((val, idx) => {
                                    const x = 10 + (idx / 6) * (SCREEN_WIDTH - 88 - 20);
                                    const y = 100 - 10 - (val / 100) * 80;
                                    return (
                                        <Circle
                                            key={idx}
                                            cx={x}
                                            cy={y}
                                            r={idx === 6 ? 6 : 4}
                                            fill={idx === 6 ? theme.primary : (isDark ? theme.surface : '#FFFFFF')}
                                            stroke={theme.primary}
                                            strokeWidth={2}
                                        />
                                    );
                                })}
                            </Svg>
                        </View>

                        <View style={styles.dayLabelsRow}>
                            {dayLabels.map((day, index) => (
                                <Text
                                    key={index}
                                    style={[
                                        styles.dayLabel,
                                        { color: index === 6 ? theme.primary : theme.textSecondary }
                                    ]}
                                >
                                    {day}
                                </Text>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Insights Section */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Insights</Text>

                    <Animated.View
                        entering={FadeInDown.delay(200)}
                        style={[styles.streakCard, {
                            backgroundColor: isDark ? '#1D4ED8' : '#1E293B'
                        }]}
                    >
                        <View style={styles.streakHeader}>
                            <Text style={styles.streakLabel}>Current Best Streak</Text>
                            <Flame size={24} color="#FBBF24" />
                        </View>
                        <Text style={styles.streakValue}>{stats.bestStreak} Days</Text>
                        <Text style={styles.streakMotivation}>YOU'RE ON FIRE, FAISAL! ⚡️</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300)} style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: isDark ? theme.surface : '#F1F5F9' }]}>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TOTAL DONE</Text>
                            <View style={styles.statValueRow}>
                                <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalDone}</Text>
                                <TrendingUp size={16} color="#10B981" />
                            </View>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: isDark ? theme.surface : '#F1F5F9' }]}>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>ACTIVE GOALS</Text>
                            <Text style={[styles.statValue, { color: theme.text }]}>{tasks.length}</Text>
                        </View>
                    </Animated.View>

                    {/* Consistency Section */}
                    <View style={styles.consistencyHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
                            Consistency
                        </Text>
                    </View>

                    {/* Category Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryTab,
                                    {
                                        backgroundColor: selectedCategory === cat.id ? theme.primary : (isDark ? theme.surface : '#F1F5F9'),
                                    }
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Text style={[
                                    styles.categoryTabText,
                                    { color: selectedCategory === cat.id ? '#FFFFFF' : theme.textSecondary }
                                ]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Consistency Items (Dynamically Derived) */}
                    {consistencyData.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInDown.delay(500 + index * 100)}
                            style={[styles.consistencyItem, {
                                backgroundColor: isDark ? theme.surface : '#FFFFFF',
                                borderWidth: isDark ? 1 : 0,
                                borderColor: 'rgba(255,255,255,0.05)',
                            }]}
                        >
                            <View style={[styles.consistencyIcon, { backgroundColor: item.color + '15' }]}>
                                <item.icon size={20} color={item.color} />
                            </View>
                            <View style={styles.consistencyInfo}>
                                <Text style={[styles.consistencyName, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[styles.consistencyDays, { color: theme.textSecondary }]}>{item.days}</Text>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' }]}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { backgroundColor: item.color, width: `${item.progress}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.progressText, { color: item.color }]}>{item.progress}%</Text>
                            </View>
                        </Animated.View>
                    ))}

                    {consistencyData.length === 0 && (
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No habits found for this category.</Text>
                    )}

                    <View style={{ height: 160 }} />
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingTop: 40,
    },
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    placeholder: {
        width: 44,
    },
    chartCard: {
        borderRadius: 32,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 1,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 22,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    chartSubtitle: {
        fontSize: 11,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 1,
        marginTop: 2,
    },
    avgBadge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
    },
    avgText: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    chartContainer: {
        height: 120,
        marginBottom: 12,
    },
    dayLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    dayLabel: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    streakCard: {
        borderRadius: 32,
        padding: 24,
        marginBottom: 16,
    },
    streakHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    streakLabel: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_700Bold',
        color: 'rgba(255,255,255,0.7)',
    },
    streakValue: {
        fontSize: 42,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        color: '#FFFFFF',
        marginTop: 4,
    },
    streakMotivation: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        color: '#FBBF24',
        letterSpacing: 1,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        borderRadius: 24,
        padding: 20,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 1,
        marginBottom: 12,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statValue: {
        fontSize: 32,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    consistencyHeader: {
        marginBottom: 16,
    },
    categoryTabs: {
        marginBottom: 20,
    },
    categoryTab: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        marginRight: 10,
    },
    categoryTabText: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    consistencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 28,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 1,
    },
    consistencyIcon: {
        width: 48,
        height: 48,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    consistencyInfo: {
        flex: 1,
    },
    consistencyName: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    consistencyDays: {
        fontSize: 11,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        marginTop: 4,
        opacity: 0.5,
    },
    progressContainer: {
        alignItems: 'flex-end',
        width: 80,
    },
    progressBar: {
        width: 64,
        height: 6,
        borderRadius: 3,
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_600SemiBold',
    }
});
