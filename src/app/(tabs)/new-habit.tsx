import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Switch,
    Modal,
    Platform,
    KeyboardAvoidingView,
    Dimensions,
    Keyboard,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { X, MoreHorizontal, Clock, Calendar as CalendarIcon, Dumbbell, Heart, Leaf, Brain, Plus, Trash2, Timer, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SoundService } from '../../services/sound';
import { StorageService } from '../../services/storage';
import { AdsService } from '../../services/ads';
import { NotificationService } from '../../services/notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Use a fixed padding for the modal content to calculate relative widths
const CAL_MODAL_MARGIN = 40;

interface Category {
    id: string;
    name: string;
    color: string;
    icon: React.ReactNode;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DURATIONS = ['5 min', '10 min', '15 min', '20 min', '30 min', '45 min', '1 hour', 'Anytime'];

export default function NewHabitScreen() {
    const { theme, isDark } = useTheme();
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);

    const [habitName, setHabitName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('mindfulness');
    const [selectedTime, setSelectedTime] = useState('08:00');
    const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');
    const [selectedDuration, setSelectedDuration] = useState('15 min');
    const [repeatEnabled, setRepeatEnabled] = useState(true);
    const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
    const [selectedStartDate, setSelectedStartDate] = useState(new Date());

    // UI States
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showDurationModal, setShowDurationModal] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [tempTime, setTempTime] = useState('08:00');

    // Simple Calendar State
    const [calendarViewDate, setCalendarViewDate] = useState(new Date());

    const [subTasks, setSubTasks] = useState<string[]>([]);
    const [newSubTask, setNewSubTask] = useState('');

    const categories: Category[] = [
        { id: 'mindfulness', name: 'Mindfulness', color: '#E0F2FE', icon: <Brain size={24} color="#3B82F6" /> },
        { id: 'workout', name: 'Workout', color: '#E2E8F0', icon: <Dumbbell size={24} color="#64748B" /> },
        { id: 'health', name: 'Health', color: '#DCFCE7', icon: <Leaf size={24} color="#10B981" /> },
        { id: 'selfcare', name: 'Self Care', color: '#FCE7F3', icon: <Heart size={24} color="#F43F5E" /> },
    ];

    const resetState = React.useCallback(() => {
        setHabitName('');
        setSelectedCategory('mindfulness');
        setSelectedTime('08:00');
        setTimePeriod('AM');
        setSelectedDuration('15 min');
        setRepeatEnabled(true);
        setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
        setSelectedStartDate(new Date());
        setSubTasks([]);
        setNewSubTask('');
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            resetState();
        }, [resetState])
    );

    const handleClose = () => {
        router.back();
    };

    const handleAddSubTask = () => {
        if (newSubTask.trim()) {
            setSubTasks([...subTasks, newSubTask.trim()]);
            setNewSubTask('');
        }
    };

    const removeSubTask = (index: number) => {
        setSubTasks(subTasks.filter((_, i) => i !== index));
    };

    const toggleDay = (dayIndex: number) => {
        if (selectedDays.includes(dayIndex)) {
            if (selectedDays.length > 1) {
                setSelectedDays(selectedDays.filter(d => d !== dayIndex));
            }
        } else {
            setSelectedDays([...selectedDays, dayIndex].sort());
        }
    };

    const handleCreateRoutine = async () => {
        if (!habitName.trim()) return;

        SoundService.playCreate();

        const subTasksObjects = subTasks.map(title => ({
            id: Math.random().toString(36).substr(2, 9),
            title,
            isCompleted: false
        }));

        const timeToSave = `${selectedTime} ${timePeriod}`;
        const habitId = Date.now().toString();
        const repeatDays = repeatEnabled ? selectedDays : [];

        await StorageService.saveTask({
            id: habitId,
            name: habitName.trim(),
            time: timeToSave,
            category: selectedCategory,
            duration: selectedDuration,
            completedDates: [],
            createdAt: selectedStartDate.toISOString(),
            streak: 0,
            subTasks: subTasksObjects,
            isFavorite: false,
            repeatDays
        });

        await NotificationService.scheduleHabitReminder(habitId, habitName.trim(), timeToSave, repeatDays);
        AdsService.showInterstitial();

        router.back();
    };

    const confirmTime = () => {
        setSelectedTime(tempTime);
        setShowTimeModal(false);
    };

    const getTimeLabel = (timeStr: string, period: 'AM' | 'PM') => {
        const hours = parseInt(timeStr.split(':')[0], 10);

        if (period === 'AM') {
            if (hours >= 5 && hours < 12) return 'MORNING';
            if (hours >= 12 || hours < 5) return 'MIDNIGHT';
            return 'MORNING';
        } else {
            if (hours === 12 || hours < 2) return 'NOON';
            if (hours >= 2 && hours < 5) return 'AFTERNOON';
            if (hours >= 5 && hours < 9) return 'EVENING';
            return 'NIGHT';
        }
    };

    const getRepeatHint = () => {
        if (!repeatEnabled) return 'ONCE';
        if (selectedDays.length === 7) return `EVERY DAY FROM ${selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`;
        return selectedDays.map(d => WEEKDAYS[d]).join(', ');
    };

    const renderCalendar = () => {
        const year = calendarViewDate.getFullYear();
        const month = calendarViewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const isSelected = selectedStartDate.getDate() === d && selectedStartDate.getMonth() === month && selectedStartDate.getFullYear() === year;
            days.push(
                <TouchableOpacity
                    key={d}
                    style={[styles.calendarDay, isSelected && { backgroundColor: theme.primary, borderRadius: 12, }]}
                    onPress={() => {
                        setSelectedStartDate(new Date(year, month, d));
                        setShowCalendarModal(false);
                    }}
                >
                    <Text style={[styles.calendarDayText, { color: isSelected ? '#FFFFFF' : theme.text }]}>{d}</Text>
                </TouchableOpacity>
            );
        }
        return days;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={[styles.circleBtn, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                    <X size={20} color={theme.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>New Habit</Text>
                <TouchableOpacity style={styles.circleBtn}>
                    <MoreHorizontal size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollRef}
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View style={styles.heroSection}>
                    <Text style={[styles.title, { color: theme.text }]}>What's the plan?</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Keep it simple, keep it steady.
                    </Text>
                </View>

                {/* Habit Name Input */}
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Go for a run..."
                        placeholderTextColor={theme.textSecondary}
                        value={habitName}
                        onChangeText={setHabitName}
                    />
                </View>

                {/* Category Selection Grid (Only icons and name) */}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
                <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setSelectedCategory(cat.id)}
                            style={[
                                styles.catCard,
                                { backgroundColor: isDark ? theme.surface : cat.color },
                                selectedCategory === cat.id && { borderColor: theme.primary, borderWidth: 2 }
                            ]}
                        >
                            <View style={[styles.catIconBox, { backgroundColor: '#FFFFFF' }]}>
                                {cat.icon}
                            </View>
                            <Text style={[styles.catName, { color: theme.text }]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Pickers Card */}
                <View style={[styles.settingsCard, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                    {/* Time Picker Row */}
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => {
                            setTempTime(selectedTime);
                            setShowTimeModal(true);
                        }}
                    >
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconBadge, { backgroundColor: '#E0F2FE' }]}>
                                <Clock size={22} color="#3B82F6" />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: theme.text }]}>Set Time</Text>
                                <Text style={[styles.settingHint, { color: theme.textSecondary }]}>{getTimeLabel(selectedTime, timePeriod)}</Text>
                            </View>
                        </View>
                        <View style={[styles.valueBox, { backgroundColor: '#F1F5F9' }]}>
                            <Text style={[styles.valueText, { color: '#3B82F6' }]}>{selectedTime} {timePeriod}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Duration Picker Row */}
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => setShowDurationModal(true)}
                    >
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconBadge, { backgroundColor: '#F5F3FF' }]}>
                                <Timer size={22} color="#8B5CF6" />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: theme.text }]}>Duration</Text>
                                <Text style={[styles.settingHint, { color: theme.textSecondary }]}>HOW LONG?</Text>
                            </View>
                        </View>
                        <View style={[styles.valueBox, { backgroundColor: '#F1F5F9' }]}>
                            <Text style={[styles.valueText, { color: '#8B5CF6' }]}>{selectedDuration}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Repeat Row with Calendar Button */}
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => setShowCalendarModal(true)}
                    >
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconBadge, { backgroundColor: '#FFFBEB' }]}>
                                <CalendarIcon size={22} color="#F59E0B" />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: theme.text }]}>Repeat / Date</Text>
                                <Text style={[styles.settingHint, { color: theme.textSecondary }]}>{getRepeatHint()}</Text>
                            </View>
                        </View>
                        <View style={[styles.valueBox, { backgroundColor: '#F1F5F9' }]}>
                            <CalendarIcon size={18} color="#F59E0B" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.daySelectorRow}>
                        {WEEKDAYS.map((day, idx) => (
                            <TouchableOpacity
                                key={`day-${idx}`}
                                onPress={() => toggleDay(idx)}
                                style={[
                                    styles.dayDot,
                                    selectedDays.includes(idx) && { backgroundColor: theme.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.dayText,
                                    { color: selectedDays.includes(idx) ? '#FFFFFF' : theme.textSecondary }
                                ]}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Sub-tasks Section */}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 32 }]}>STEPS (TO-DO)</Text>
                <View style={[styles.todoCard, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                    {subTasks.map((st, index) => (
                        <View key={index} style={styles.todoItem}>
                            <Text style={[styles.todoText, { color: theme.text }]}>{st}</Text>
                            <TouchableOpacity onPress={() => removeSubTask(index)}>
                                <Trash2 size={16} color={theme.danger} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <View style={styles.todoInputRow}>
                        <TextInput
                            style={[styles.todoInput, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Add another step..."
                            placeholderTextColor={theme.textSecondary}
                            value={newSubTask}
                            onChangeText={setNewSubTask}
                            onSubmitEditing={handleAddSubTask}
                        />
                        <TouchableOpacity onPress={handleAddSubTask} style={[styles.addBtn, { backgroundColor: theme.primary }]}>
                            <Plus size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Embedded "Create Routine" Button */}
                <View style={styles.routineBtnContainer}>
                    <TouchableOpacity
                        style={[
                            styles.createBtn,
                            { backgroundColor: '#FFFFFF' },
                            !habitName.trim() && { opacity: 0.6 }
                        ]}
                        onPress={handleCreateRoutine}
                        disabled={!habitName.trim()}
                    >
                        <Plus size={24} color="#1E293B" strokeWidth={3} />
                        <Text style={styles.createBtnText}>Create Routine</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerNote}>BUILDING BETTER HABITS TOGETHER</Text>
                </View>
            </ScrollView>

            {/* Time Selector Modal */}
            <Modal visible={showTimeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior="padding" style={styles.modalContentWrapper}>
                        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Time</Text>
                            <View style={styles.timePickerContainer}>
                                <TextInput
                                    style={[styles.largeTimeInput, { color: theme.primary }]}
                                    value={tempTime}
                                    onChangeText={setTempTime}
                                    placeholder="08:00"
                                    keyboardType="numbers-and-punctuation"
                                    maxLength={5}
                                    autoFocus
                                />
                                <View style={styles.periodToggle}>
                                    <TouchableOpacity
                                        onPress={() => setTimePeriod('AM')}
                                        style={[styles.periodBtn, timePeriod === 'AM' && { backgroundColor: theme.primary }]}
                                    >
                                        <Text style={[styles.periodText, { color: timePeriod === 'AM' ? '#FFFFFF' : theme.textSecondary }]}>AM</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setTimePeriod('PM')}
                                        style={[styles.periodBtn, timePeriod === 'PM' && { backgroundColor: theme.primary }]}
                                    >
                                        <Text style={[styles.periodText, { color: timePeriod === 'PM' ? '#FFFFFF' : theme.textSecondary }]}>PM</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.saveModalBtn, { backgroundColor: theme.primary }]} onPress={confirmTime}>
                                <Text style={styles.saveModalText}>Confirm Time</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowTimeModal(false)} style={styles.cancelModalBtn}>
                                <Text style={{ color: theme.textSecondary, fontFamily: 'PlusJakartaSans_700Bold' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Calendar Modal */}
            <Modal visible={showCalendarModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContentWrapper}>
                        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                            <View style={styles.centeredModalHeader}>
                                <View>
                                    <Text style={[styles.modalTitle, { color: theme.text, marginBottom: 4 }]}>Select Date</Text>
                                    <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Starting From</Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                                    <X size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.calendarHeader}>
                                <TouchableOpacity onPress={() => setCalendarViewDate(new Date(calendarViewDate.setMonth(calendarViewDate.getMonth() - 1)))}>
                                    <ChevronLeft size={24} color={theme.primary} />
                                </TouchableOpacity>
                                <Text style={[styles.calendarMonthText, { color: theme.text }]}>
                                    {calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </Text>
                                <TouchableOpacity onPress={() => setCalendarViewDate(new Date(calendarViewDate.setMonth(calendarViewDate.getMonth() + 1)))}>
                                    <ChevronRight size={24} color={theme.primary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.calendarGrid}>
                                {WEEKDAYS.map((d, i) => (
                                    <View key={`header-${d}-${i}`} style={styles.calendarDayHeader}>
                                        <Text style={[styles.dayHeaderText, { color: theme.textSecondary }]}>{d}</Text>
                                    </View>
                                ))}
                                {renderCalendar()}
                            </View>

                            <TouchableOpacity
                                style={[styles.saveModalBtn, { backgroundColor: theme.primary, marginTop: 24 }]}
                                onPress={() => setShowCalendarModal(false)}
                            >
                                <Text style={styles.saveModalText}>Confirm Date</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Duration Selector Modal */}
            <Modal visible={showDurationModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContentWrapper}>
                        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                            <View style={styles.centeredModalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Select Duration</Text>
                                <TouchableOpacity onPress={() => setShowDurationModal(false)}>
                                    <X size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ maxHeight: 350, width: '100%' }} showsVerticalScrollIndicator={false}>
                                {DURATIONS.map((d) => (
                                    <TouchableOpacity
                                        key={d}
                                        style={[
                                            styles.durationItem,
                                            selectedDuration === d && { backgroundColor: theme.primary + '10' }
                                        ]}
                                        onPress={() => {
                                            setSelectedDuration(d);
                                            setShowDurationModal(false);
                                        }}
                                    >
                                        <View style={styles.durationLeft}>
                                            <Timer size={18} color={selectedDuration === d ? theme.primary : theme.textSecondary} />
                                            <Text style={[styles.durationText, { color: selectedDuration === d ? theme.primary : theme.text }]}>{d}</Text>
                                        </View>
                                        {selectedDuration === d && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    heroSection: {
        marginVertical: 20,
    },
    title: {
        fontSize: 32,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_500Medium',
        marginTop: 4,
        opacity: 0.6,
    },
    inputWrapper: {
        height: 68,
        borderRadius: 28,
        paddingHorizontal: 20,
        justifyContent: 'center',
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 1,
    },
    input: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    catCard: {
        width: '47.5%',
        aspectRatio: 1.2,
        borderRadius: 36,
        padding: 24,
        justifyContent: 'space-between',
    },
    catIconBox: {
        width: 48,
        height: 48,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    catName: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    settingsCard: {
        borderRadius: 40,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 1,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    settingHint: {
        fontSize: 11,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 0.5,
        marginTop: 2,
        opacity: 0.5,
    },
    valueBox: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
    },
    valueText: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.03)',
        marginHorizontal: 20,
    },
    daySelectorRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    dayDot: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    todoCard: {
        borderRadius: 32,
        padding: 20,
    },
    todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    todoText: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    todoInputRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14,
    },
    todoInput: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    addBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    routineBtnContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    createBtn: {
        flexDirection: 'row',
        width: '100%',
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 6,
    },
    createBtnText: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        color: '#1E293B',
    },
    footerNote: {
        fontSize: 11,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 2.5,
        color: '#94A3B8',
        marginVertical: 24,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContentWrapper: {
        width: '100%',
    },
    modalContent: {
        borderRadius: 36,
        padding: 32,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    modalSubtitle: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        opacity: 0.6,
    },
    timePickerContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 32,
    },
    largeTimeInput: {
        fontSize: 56,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        textAlign: 'center',
        letterSpacing: 2,
    },
    periodToggle: {
        flexDirection: 'row',
        marginTop: 20,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        padding: 4,
    },
    periodBtn: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 12,
    },
    periodText: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    saveModalBtn: {
        width: '100%',
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    saveModalText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    cancelModalBtn: {
        padding: 8,
    },
    centeredModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    calendarMonthText: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        marginTop: 5,
    },
    calendarDayHeader: {
        width: '14.28%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayHeaderText: {
        fontSize: 10,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        opacity: 0.4,
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 1,
    },
    calendarDayText: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    durationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 12,
        borderRadius: 16,
        width: '100%',
    },
    durationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    durationText: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    }
});
