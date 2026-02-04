import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { X, Clock, Plus, Trash2, Star } from 'lucide-react-native';
import { StorageService } from '../../services/storage';
import { NotificationService } from '../../services/notifications';
import { SoundService } from '../../services/sound';
import { AdsService } from '../../services/ads';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTaskScreen() {
    const { theme, isDark } = useTheme();
    const router = useRouter();

    const [taskName, setTaskName] = useState('');
    const [date, setDate] = useState(new Date());
    const [subTasks, setSubTasks] = useState<string[]>([]);
    const [newSubTask, setNewSubTask] = useState('');
    const [showPicker, setShowPicker] = useState(false);

    useFocusEffect(
        useCallback(() => {
            return () => {
                // Reset on blur (leaving the screen)
                setTaskName('');
                setDate(new Date());
                setSubTasks([]);
                setNewSubTask('');
                setShowPicker(false);
            };
        }, [])
    );

    const handleAddSubTask = () => {
        if (newSubTask.trim()) {
            setSubTasks([...subTasks, newSubTask.trim()]);
            setNewSubTask('');
        }
    };

    const removeSubTask = (index: number) => {
        setSubTasks(subTasks.filter((_, i) => i !== index));
    };

    const onChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleCreateTask = async () => {
        if (!taskName.trim()) return;

        const taskId = Date.now().toString();

        await StorageService.saveOneOffTask({
            id: taskId,
            name: taskName.trim(),
            time: formattedTime, // Save as "10:30 AM"
            isCompleted: false,
            createdAt: new Date().toISOString(),
            subTasks: subTasks.map(title => ({
                id: Math.random().toString(36).substr(2, 9),
                title,
                isCompleted: false
            }))
        });

        await SoundService.playCreate();
        await NotificationService.scheduleTaskReminder(taskId, taskName.trim(), formattedTime);
        AdsService.showInterstitial();

        // router.dismissAll();
        router.replace('/(tabs)');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.circleBtn, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                    <X size={20} color={theme.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Daily Task</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <Text style={[styles.title, { color: theme.text }]}>Focus on today.</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>What's the one thing you MUST do?</Text>
                </View>

                <View style={[styles.inputWrapper, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Pick up groceries..."
                        placeholderTextColor={theme.textSecondary}
                        value={taskName}
                        onChangeText={setTaskName}
                        autoFocus
                    />
                </View>

                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>SCHEDULE</Text>
                <TouchableOpacity
                    style={[styles.timePicker, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}
                    onPress={() => setShowPicker(true)}
                >
                    <View style={styles.timeInfo}>
                        <View style={[styles.iconBadge, { backgroundColor: '#E0F2FE' }]}>
                            <Clock size={20} color="#3B82F6" />
                        </View>
                        <Text style={[styles.timeLabel, { color: theme.text }]}>{formattedTime}</Text>
                    </View>
                    <Text style={{ color: theme.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>Change</Text>
                </TouchableOpacity>

                {/* Android Picker */}
                {showPicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode="time"
                        is24Hour={false}
                        onChange={onChange}
                    />
                )}

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 32 }]}>BREAK IT DOWN</Text>
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
                            placeholder="Add a sub-step..."
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

                <TouchableOpacity
                    style={[styles.createBtn, { backgroundColor: theme.primary }, !taskName.trim() && { opacity: 0.6 }]}
                    onPress={handleCreateTask}
                    disabled={!taskName.trim()}
                >
                    <Star size={24} color="#FFFFFF" />
                    <Text style={styles.createBtnText}>Add Task</Text>
                </TouchableOpacity>

                <Text style={[styles.footerNote, { marginBottom: 120 }]}>JUST ONE STEP AT A TIME</Text>
            </ScrollView>

            {/* iOS Picker Modal */}
            {Platform.OS === 'ios' && (
                <Modal visible={showPicker} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.surface, paddingBottom: 40 }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
                                <TouchableOpacity onPress={() => setShowPicker(false)}>
                                    <Text style={{ color: theme.primary, fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold' }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode="time"
                                display="spinner"
                                onChange={onChange}
                                textColor={theme.text}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    circleBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold' },
    content: { flex: 1, paddingHorizontal: 20 },
    heroSection: { marginVertical: 20 },
    title: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 4, opacity: 0.6 },
    inputWrapper: { height: 60, borderRadius: 24, paddingHorizontal: 20, justifyContent: 'center', marginBottom: 28 },
    input: { fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold' },
    sectionLabel: { fontSize: 11, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.5, marginBottom: 14 },
    timePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 20 },
    timeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBadge: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    timeLabel: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold' },
    todoCard: { borderRadius: 28, padding: 18 },
    todoItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
    todoText: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' },
    todoInputRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
    todoInput: { flex: 1, height: 44, borderBottomWidth: 1, fontSize: 14 },
    addBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    createBtn: { flexDirection: 'row', height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 40 },
    createBtnText: { fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#FFFFFF' },
    footerNote: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 2, color: '#94A3B8', marginVertical: 24, marginBottom: 120, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, width: '100%' },
});
