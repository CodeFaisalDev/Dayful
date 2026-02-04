import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography } from '../../styles/theme';
import { useTasks } from '../../hooks/useTasks';
import { TaskItem } from '../../components/TaskItem';
import { Bell, Plus, X, Star, Calendar, ChevronRight, Trash2, ChevronDown } from 'lucide-react-native';
import { SoundService } from '../../services/sound';
import { AdsService } from '../../services/ads';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { QUOTES } from '../../constants/quotes';

export default function HomeScreen() {
    const { theme, isDark, userName } = useTheme();
    const router = useRouter();
    const {
        tasks,
        oneOffTasks,
        events,
        loading,
        toggleComplete,
        deleteTask,
        toggleOneOffComplete,
        deleteOneOffTask,
        deleteEvent,
        toggleFavorite,
        addSubTask,
        toggleSubTask,
        deleteSubTask,
        addOneOffSubTask,
        toggleOneOffSubTask,
        deleteOneOffSubTask,
    } = useTasks();

    const [expandedOneOffs, setExpandedOneOffs] = useState<string[]>([]);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState<{ [key: string]: string }>({});

    const toggleOneOffExpansion = (id: string) => {
        setExpandedOneOffs(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const quote = React.useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

    const [isSorting, setIsSorting] = useState(false);
    const [activeTab, setActiveTab] = useState<'habits' | 'tasks'>('habits');

    const todayStr = new Date().toISOString().split('T')[0];

    // Derived state for the progress card based on current tab
    const currentList = activeTab === 'habits' ? tasks : oneOffTasks.filter(t => t.createdAt.startsWith(todayStr));
    const completedCount = activeTab === 'habits'
        ? tasks.filter(t => t.completedDates.includes(todayStr)).length
        : oneOffTasks.filter(t => t.isCompleted && t.createdAt.startsWith(todayStr)).length;
    const totalCount = currentList.length;
    const progress = totalCount > 0 ? completedCount / totalCount : 0;

    // Upcoming events logic (within 7 days)
    const upcomingEvents = events.filter(e => {
        const diff = new Date(e.date).getTime() - new Date(todayStr).getTime();
        const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 7;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Circular Progress settings
    const size = 100;
    const strokeWidth = 10;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const arcPercentage = 0.75;
    const arcLength = circumference * arcPercentage;
    const progressOffset = arcLength * (1 - progress);

    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    }).toUpperCase();

    const handleCreateChoice = () => {
        SoundService.playClick();
        router.push('/explore');
    };



    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Animated.View entering={FadeInDown.duration(600)} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={[styles.greeting, { color: theme.text }]}>Hello, {userName} 👋</Text>
                            <Text style={[styles.date, { color: theme.textSecondary }]}>{formattedDate}</Text>
                            <Text style={[styles.quote, { color: theme.primary }]}>
                                "{quote}"
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.circleBtn, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}
                            onPress={() => router.push('/notifications')}
                        >
                            <Bell size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* PROMINENT EVENT CARD (If any) */}
                    {upcomingEvents.length > 0 && (() => {
                        const [y, m, d] = upcomingEvents[0].date.split('-').map(Number);
                        const eventDate = new Date(y, m - 1, d);
                        const todayDate = new Date();
                        todayDate.setHours(0, 0, 0, 0);

                        const diffTime = eventDate.getTime() - todayDate.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        return (
                            <Animated.View
                                entering={FadeInDown}
                                style={[styles.eventFocusCard, {
                                    backgroundColor: theme.primary, // Vibrant Purple
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    borderWidth: 1,
                                    shadowColor: theme.primary,
                                    shadowOpacity: 0.4,
                                    shadowRadius: 12,
                                    elevation: 8
                                }]}
                            >
                                <View style={styles.eventCardHeader}>
                                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                        <Calendar size={24} color="#FFFFFF" />
                                    </View>
                                    <View style={[styles.eventTag, { backgroundColor: '#FFFFFF' }]}>
                                        <Text style={[styles.eventTagText, { color: theme.primary }]}>SPECIAL EVENT</Text>
                                    </View>
                                </View>

                                <Text style={[styles.eventTitle, { color: '#FFFFFF' }]}>{upcomingEvents[0].name}</Text>

                                <Text style={[styles.eventDate, { color: 'rgba(255,255,255,0.8)' }]}>
                                    {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • {
                                        diffDays <= 0 ? 'HAPPENING TODAY!' : `IN ${diffDays} DAYS`
                                    }
                                </Text>

                                <TouchableOpacity
                                    style={[styles.eventAction, {
                                        backgroundColor: '#FFFFFF',
                                    }]}
                                    onPress={() => deleteEvent(upcomingEvents[0].id)}
                                >
                                    <Text style={[styles.eventActionText, { color: theme.primary }]}>Mark as Done</Text>
                                    <ChevronRight size={16} color={theme.primary} />
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })()}

                    {/* Progress Card */}
                    <Animated.View
                        entering={FadeInDown.delay(200)}
                        style={[styles.progressCard, {
                            backgroundColor: isDark ? theme.surface : '#FFFFFF',
                            borderWidth: isDark ? 1 : 0,
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)',
                        }]}
                    >
                        <View style={styles.progressLeft}>
                            <Text style={[styles.progressTitle, { color: theme.text }]}>
                                {activeTab === 'habits' ? 'Habit Streak' : 'Daily Chores'}
                            </Text>
                            <View style={styles.progressTextContainer}>
                                <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>
                                    You've done <Text style={{ color: theme.primary, fontWeight: '800' }}>{completedCount}</Text>
                                </Text>
                                <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>
                                    out of <Text style={{ color: theme.primary, fontWeight: '800' }}>{totalCount}</Text> {activeTab} today!
                                </Text>
                            </View>
                            <View style={[styles.progressTag, { backgroundColor: theme.primary + '15' }]}>
                                <Text style={[styles.progressTagText, { color: theme.primary }]}>
                                    {progress >= 1 && totalCount > 0 ? 'GOAL REACHED! 🔥' : 'STAY FOCUSED'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.ringContainer}>
                            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                                <G rotation="135" origin={`${center}, ${center}`}>
                                    <Circle cx={center} cy={center} r={radius} stroke={isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round" />
                                    <Circle cx={center} cy={center} r={radius} stroke={theme.primary} strokeWidth={strokeWidth + 4} fill="transparent" strokeDasharray={`${arcLength} ${circumference}`} strokeDashoffset={progressOffset} strokeLinecap="round" opacity={isDark ? 0.15 : 0.08} />
                                    <Circle cx={center} cy={center} r={radius} stroke={theme.primary} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${arcLength} ${circumference}`} strokeDashoffset={progressOffset} strokeLinecap="round" />
                                </G>
                            </Svg>
                            <View style={styles.percentageContainer}>
                                <Text style={[styles.percentageText, { color: theme.text }]}>
                                    {totalCount > 0 ? Math.round(progress * 100) : 0}%
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* TAB SWITCHER */}
                    <View style={[styles.tabContainer, { backgroundColor: isDark ? theme.surface : '#F1F5F9' }]}>
                        <TouchableOpacity
                            style={[styles.tabItem, activeTab === 'habits' && { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                            onPress={() => setActiveTab('habits')}
                        >
                            <Calendar size={18} color={activeTab === 'habits' ? theme.primary : theme.textSecondary} />
                            <Text style={[styles.tabText, { color: activeTab === 'habits' ? theme.textSecondary : theme.textSecondary }]}>Habits</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabItem, activeTab === 'tasks' && { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                            onPress={() => setActiveTab('tasks')}
                        >
                            <Star size={18} color={activeTab === 'tasks' ? theme.primary : theme.textSecondary} />
                            <Text style={[styles.tabText, { color: activeTab === 'tasks' ? theme.textSecondary : theme.textSecondary }]}>Daily Tasks</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Section Header */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            {activeTab === 'habits' ? "Today's Routine" : "Things to Do"}
                        </Text>
                        {activeTab === 'habits' && (
                            <TouchableOpacity onPress={() => router.push('/summary')}>
                                <Text style={[styles.viewHistoryLink, { color: '#4A90E2' }]}>View History</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter/Sort Bar */}
                    <View style={styles.filterBar}>
                        <TouchableOpacity onPress={() => setIsSorting(!isSorting)}>
                            <Text style={[styles.filterText, { color: theme.textSecondary }]}>
                                {isSorting ? 'DONE' : 'SORT'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCreateChoice}>
                            <Plus size={20} color={theme.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Unified Task/Habit List */}
                    <View style={styles.taskList}>
                        {activeTab === 'habits' ? (
                            <>
                                {tasks.map((task, index) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        index={index}
                                        isSorting={isSorting}
                                        onMoveUp={() => { }}
                                        onMoveDown={() => { }}
                                        onToggle={() => {
                                            const isCompleting = !task.completedDates.includes(todayStr);
                                            toggleComplete(task.id);
                                            if (isCompleting) {
                                                AdsService.showRewarded();
                                            }
                                        }}
                                        onDelete={() => deleteTask(task.id)}
                                        onEdit={() => router.push({ pathname: '/new-habit', params: { editId: task.id } })}
                                        onToggleFavorite={() => toggleFavorite(task.id)}
                                        onAddSubTask={(title: string) => addSubTask(task.id, title)}
                                        onToggleSubTask={(subId: string) => toggleSubTask(task.id, subId)}
                                        onDeleteSubTask={(subId: string) => deleteSubTask(task.id, subId)}
                                    />
                                ))}
                                {tasks.length === 0 && (
                                    <View style={styles.emptyState}>
                                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No habits for today. Start building!</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <>
                                {oneOffTasks.length > 0 ? (
                                    oneOffTasks.map((t, idx) => {
                                        const isExpanded = expandedOneOffs.includes(t.id);
                                        return (
                                            <Animated.View key={t.id} entering={FadeInDown.delay(idx * 50)} layout={Layout.springify()} style={[styles.oneOffItemContainer, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                                                <View style={styles.oneOffMainRow}>
                                                    <TouchableOpacity
                                                        style={[styles.taskCheck, { borderColor: theme.primary, backgroundColor: t.isCompleted ? theme.primary : 'transparent' }]}
                                                        onPress={() => toggleOneOffComplete(t.id)}
                                                    >
                                                        {t.isCompleted && <X size={14} color="#FFF" style={{ transform: [{ rotate: '45deg' }] }} />}
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={{ flex: 1 }}
                                                        onPress={() => toggleOneOffExpansion(t.id)}
                                                    >
                                                        <Text style={[styles.oneOffTitle, { color: theme.text, textDecorationLine: t.isCompleted ? 'line-through' : 'none', opacity: t.isCompleted ? 0.5 : 1 }]}>{t.name}</Text>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                            <Text style={[styles.oneOffMeta, { color: theme.textSecondary }]}>{t.time || 'Today'}</Text>
                                                            {(t.subTasks?.length ?? 0) > 0 && (
                                                                <View style={styles.subtaskBadge}>
                                                                    <Text style={styles.subtaskBadgeText}>{t.subTasks?.filter(s => s.isCompleted).length}/{t.subTasks?.length}</Text>
                                                                </View>
                                                            )}
                                                            <ChevronDown size={14} color={theme.textSecondary} style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
                                                        </View>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => deleteOneOffTask(t.id)}>
                                                        <Trash2 size={18} color={theme.danger} opacity={0.6} />
                                                    </TouchableOpacity>
                                                </View>

                                                {isExpanded && (
                                                    <View style={styles.oneOffExpanded}>
                                                        {t.subTasks?.map(st => (
                                                            <View key={st.id} style={styles.oneOffSubtaskRow}>
                                                                <TouchableOpacity
                                                                    style={[styles.miniCheck, { borderColor: theme.textSecondary, backgroundColor: st.isCompleted ? theme.primary : 'transparent' }]}
                                                                    onPress={() => toggleOneOffSubTask(t.id, st.id)}
                                                                >
                                                                    {st.isCompleted && <X size={10} color="#FFF" style={{ transform: [{ rotate: '45deg' }] }} />}
                                                                </TouchableOpacity>
                                                                <Text style={[styles.oneOffSubtaskTitle, { color: theme.text, opacity: st.isCompleted ? 0.5 : 1 }]}>{st.title}</Text>
                                                                <TouchableOpacity onPress={() => deleteOneOffSubTask(t.id, st.id)}>
                                                                    <X size={12} color={theme.textSecondary} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}
                                                        <View style={styles.oneOffAddSubtask}>
                                                            <TextInput
                                                                style={[styles.oneOffSubtaskInput, { color: theme.text, borderBottomColor: theme.border }]}
                                                                placeholder="Add sub-task..."
                                                                placeholderTextColor={theme.textSecondary}
                                                                value={newSubTaskTitle[t.id] || ''}
                                                                onChangeText={(text) => setNewSubTaskTitle(prev => ({ ...prev, [t.id]: text }))}
                                                                onSubmitEditing={() => {
                                                                    if (newSubTaskTitle[t.id]?.trim()) {
                                                                        addOneOffSubTask(t.id, newSubTaskTitle[t.id]);
                                                                        setNewSubTaskTitle(prev => ({ ...prev, [t.id]: '' }));
                                                                    }
                                                                }}
                                                            />
                                                        </View>
                                                    </View>
                                                )}
                                            </Animated.View>
                                        );
                                    })
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nothing in your to-do list yet.</Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>




                    <View style={{ height: 60 }} />
                    {/* Ads Section */}
                    <View style={styles.adContainer}>
                        <AdsService.Banner />
                    </View>
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
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    greeting: {
        fontSize: 28,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: -0.5,
    },
    date: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_700Bold',
        letterSpacing: 0.5,
        opacity: 0.6,
        marginVertical: 4,
        textTransform: 'uppercase',
    },
    quote: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: '#6C5DD3', // Primary Purple
    },
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    eventFocusCard: {
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 20,
        borderRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    eventCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    eventTagText: {
        fontSize: 10,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 0.5,
    },
    eventTitle: {
        fontSize: 22,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    eventDate: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        opacity: 0.8,
        marginBottom: 20,
    },
    eventAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        gap: 8,
    },
    eventActionText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    progressCard: {
        marginHorizontal: 20,
        marginBottom: 28,
        padding: 24,
        borderRadius: 36,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
        backgroundColor: '#FFFFFF', // Fallback, override inline
    },
    progressLeft: {
        flex: 1,
        marginRight: 12,
    },
    progressTextContainer: {
        marginTop: 6,
    },
    progressTitle: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    progressSubtitle: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_500Medium',
        lineHeight: 18,
        opacity: 0.8,
    },
    progressTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 12,
    },
    progressTagText: {
        fontSize: 11,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 0.5,
    },
    ringContainer: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentageContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentageText: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: -0.5,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        padding: 6,
        borderRadius: 20,
        marginBottom: 24,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        gap: 8,
    },
    tabText: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    oneOffItemContainer: {
        borderRadius: 24,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 8,
    },
    oneOffMainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    oneOffExpanded: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingLeft: 44,
    },
    oneOffSubtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    oneOffSubtaskTitle: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    oneOffAddSubtask: {
        marginTop: 4,
    },
    oneOffSubtaskInput: {
        fontSize: 13,
        paddingVertical: 4,
        borderBottomWidth: 1,
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    miniCheck: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtaskBadge: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 6,
    },
    subtaskBadgeText: {
        fontSize: 9,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        opacity: 0.6,
    },
    taskCheck: {
        width: 28,
        height: 28,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    oneOffTitle: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    oneOffMeta: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_500Medium',
        opacity: 0.7,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: -0.5,
    },
    viewHistoryLink: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    filterText: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 1,
    },
    taskList: {
        paddingHorizontal: 20,
        gap: 14,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_500Medium',
        opacity: 0.6,
    },
    moodSection: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    moodCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 2,
    },
    illustration: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moodWave: {
        width: 60,
        height: 12,
        borderTopWidth: 3,
        borderRadius: 30,
        position: 'absolute',
        top: 0,
    },
    moodEyes: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 10,
    },
    eye: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    moodMouth: {
        width: 40,
        height: 20,
        borderBottomWidth: 4,
        borderRadius: 20,
    },
    moodLabel: {
        fontSize: 11,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 2,
        opacity: 0.7,
    },
    adBanner: {
        padding: 20,
        alignItems: 'center',
    },
    adContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        width: '100%',
    },
    adText: {
        fontSize: 10,
        fontFamily: 'PlusJakartaSans_700Bold',
        textAlign: 'center',
        opacity: 0.5,
        lineHeight: 16,
    }
});
