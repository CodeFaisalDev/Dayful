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
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Gift, PartyPopper, Briefcase, Heart, Trophy, Bell } from 'lucide-react-native';
import { StorageService } from '../../services/storage';
import { NotificationService } from '../../services/notifications';
import { SoundService } from '../../services/sound';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AddEventScreen() {
    const { theme, isDark } = useTheme();
    const router = useRouter();

    const [eventName, setEventName] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedIcon, setSelectedIcon] = useState('Gift');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarViewDate, setCalendarViewDate] = useState(new Date());

    useFocusEffect(
        useCallback(() => {
            return () => {
                setEventName('');
                setSelectedDate(new Date());
                setSelectedIcon('Gift');
                setPriority('medium');
                setShowCalendar(false);
            };
        }, [])
    );

    const icons = [
        { name: 'Gift', icon: <Gift size={24} color="#F43F5E" />, color: '#FFF1F2' },
        { name: 'Party', icon: <PartyPopper size={24} color="#8B5CF6" />, color: '#F5F3FF' },
        { name: 'Work', icon: <Briefcase size={24} color="#3B82F6" />, color: '#E0F2FE' },
        { name: 'Health', icon: <Heart size={24} color="#10B981" />, color: '#DCFCE7' },
        { name: 'Goal', icon: <Trophy size={24} color="#F59E0B" />, color: '#FFFBEB' },
        { name: 'Alert', icon: <Bell size={24} color="#64748B" />, color: '#F1F5F9' },
    ];

    const renderCalendar = () => {
        const year = calendarViewDate.getFullYear();
        const month = calendarViewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<View key={`e-${i}`} style={styles.calDay} />);
        for (let d = 1; d <= daysInMonth; d++) {
            const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === month;
            days.push(
                <TouchableOpacity
                    key={d}
                    style={[styles.calDay, isSelected && { backgroundColor: theme.primary, borderRadius: 12 }]}
                    onPress={() => { setSelectedDate(new Date(year, month, d)); setShowCalendar(false); }}
                >
                    <Text style={{ color: isSelected ? '#FFF' : theme.text, fontFamily: 'PlusJakartaSans_700Bold' }}>{d}</Text>
                </TouchableOpacity>
            );
        }
        return days;
    };

    const handleCreateEvent = async () => {
        if (!eventName.trim()) return;

        const eventId = Date.now().toString();
        // Use local date components to avoid timezone shifts (off-by-one error)
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        await StorageService.saveEvent({
            id: eventId,
            name: eventName.trim(),
            date: dateStr,
            category: selectedIcon,
            color: icons.find(i => i.name === selectedIcon)?.color || '#F1F5F9',
            icon: selectedIcon,
            priority
        });

        await SoundService.playCreate();
        await NotificationService.scheduleEventReminder(eventId, eventName.trim(), dateStr);

        // router.dismissAll(); // potentially causing POP_TO_TOP error
        router.replace('/(tabs)');
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.circleBtn, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                    <X size={20} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Special Event</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <Text style={[styles.title, { color: theme.text }]}>Mark the date.</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Count down to your milestones.</Text>
                </View>

                <View style={[styles.inputBox, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                    <TextInput style={[styles.input, { color: theme.text }]} placeholder="John's Birthday..." placeholderTextColor={theme.textSecondary} value={eventName} onChangeText={setEventName} />
                </View>

                <Text style={styles.label}>WHEN IS IT?</Text>
                <TouchableOpacity style={[styles.picker, { backgroundColor: isDark ? theme.surface : '#FFF' }]} onPress={() => setShowCalendar(true)}>
                    <View style={styles.pickerLeft}>
                        <CalendarIcon size={20} color={theme.primary} />
                        <Text style={[styles.val, { color: theme.text }]}>{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.label}>PRIORITY</Text>
                <View style={styles.priorityRow}>
                    {['low', 'medium', 'high'].map(p => (
                        <TouchableOpacity key={p} style={[styles.pBtn, { backgroundColor: isDark ? theme.surface : '#FFF', borderColor: priority === p ? theme.primary : 'transparent', borderWidth: 2 }]} onPress={() => setPriority(p as any)}>
                            <Text style={[styles.pText, { color: priority === p ? theme.primary : theme.textSecondary }]}>{p.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>CHOOSE ICON</Text>
                <View style={styles.iconGrid}>
                    {icons.map(item => (
                        <TouchableOpacity key={item.name} style={[styles.iBtn, { backgroundColor: selectedIcon === item.name ? theme.primary + '15' : (isDark ? theme.surface : item.color), borderColor: selectedIcon === item.name ? theme.primary : 'transparent', borderWidth: 2 }]} onPress={() => setSelectedIcon(item.name)}>
                            {item.icon}
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[
                        styles.createBtn,
                        { backgroundColor: theme.primary, marginBottom: 120 },
                        !eventName.trim() && { opacity: 0.6 }
                    ]}
                    onPress={handleCreateEvent}
                    disabled={!eventName.trim()}
                >
                    <PartyPopper size={24} color="#FFF" />
                    <Text style={styles.createBtnText}>Create Event</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={showCalendar} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={[styles.inner, { backgroundColor: theme.surface }]}>
                            <View style={styles.calHeader}>
                                <TouchableOpacity onPress={() => setCalendarViewDate(new Date(calendarViewDate.setMonth(calendarViewDate.getMonth() - 1)))}>
                                    <ChevronLeft size={24} color={theme.text} />
                                </TouchableOpacity>
                                <Text style={[styles.month, { color: theme.text }]}>{calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                                <TouchableOpacity onPress={() => setCalendarViewDate(new Date(calendarViewDate.setMonth(calendarViewDate.getMonth() + 1)))}>
                                    <ChevronRight size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.grid}>
                                {WEEKDAYS.map((d, index) => <View key={index} style={styles.calDay}><Text style={styles.dayH}>{d}</Text></View>)}
                                {renderCalendar()}
                            </View>
                            <TouchableOpacity style={[styles.save, { backgroundColor: theme.primary }]} onPress={() => setShowCalendar(false)}>
                                <Text style={styles.saveT}>Confirm Date</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    circleBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold' },
    content: { flex: 1, paddingHorizontal: 24 },
    hero: { marginVertical: 20 },
    title: { fontSize: 32, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -1 },
    subtitle: { fontSize: 14, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 4, opacity: 0.6 },
    inputBox: { height: 68, borderRadius: 28, paddingHorizontal: 24, justifyContent: 'center', marginBottom: 32 },
    input: { fontSize: 20, fontFamily: 'PlusJakartaSans_700Bold' },
    label: { fontSize: 11, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.5, color: '#94A3B8', marginBottom: 16, marginTop: 8 },
    picker: { height: 64, borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center', marginBottom: 24 },
    pickerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    val: { fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold' },
    priorityRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    pBtn: { flex: 1, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    pText: { fontSize: 12, fontFamily: 'PlusJakartaSans_800ExtraBold' },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 5 },
    iBtn: { width: '30.5%', aspectRatio: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
    createBtn: { flexDirection: 'row', height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', gap: 12, marginVertical: 20 },
    createBtnText: { fontSize: 20, fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#FFF' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
    modalCard: { width: '100%' },
    inner: { borderRadius: 36, padding: 24 },
    calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    month: { fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    calDay: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
    dayH: { fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', opacity: 0.3 },
    save: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
    saveT: { color: '#FFF', fontSize: 16, fontFamily: 'PlusJakartaSans_800ExtraBold' }
});
