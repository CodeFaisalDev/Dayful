import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Clock, Calendar, Star, ChevronRight, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CreateChoiceScreen() {
    const { theme, isDark } = useTheme();
    const router = useRouter();

    const choices = [
        {
            id: 'task',
            title: 'Daily Task',
            subtitle: 'One-off thing to get done today',
            icon: <Star size={28} color="#FFFFFF" strokeWidth={2.5} />,
            bgColor: theme.pastelBlue,
            route: '/add-task'
        },
        {
            id: 'habit',
            title: 'New Habit',
            subtitle: 'Build a steady daily routine',
            icon: <Clock size={28} color="#FFFFFF" strokeWidth={2.5} />,
            bgColor: theme.pastelPurple,
            route: '/new-habit'
        },
        {
            id: 'event',
            title: 'Special Event',
            subtitle: 'Countdown to something big',
            icon: <Calendar size={28} color="#FFFFFF" strokeWidth={2.5} />,
            bgColor: theme.pastelYellow,
            route: '/add-event'
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Animated.View entering={FadeInDown.duration(600)} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>Choose Action</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>What's on your mind today?</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: isDark ? theme.surface : '#FFFFFF', elevation: 4 }]}>
                        <X size={24} color={theme.text} strokeWidth={3} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {choices.map((choice) => (
                        <TouchableOpacity
                            key={choice.id}
                            onPress={() => router.push(choice.route as any)}
                            style={[
                                styles.choiceCard,
                                { backgroundColor: choice.bgColor }
                            ]}
                        >
                            <View style={styles.contentRow}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                                    {choice.icon}
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.choiceTitle, { color: '#FFFFFF' }]}>{choice.title}</Text>
                                    <Text style={[styles.choiceSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>{choice.subtitle}</Text>
                                </View>
                                <View style={styles.goBtn}>
                                    <ChevronRight size={24} color="#FFFFFF" strokeWidth={3} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <View style={styles.tipBox}>
                        <View style={[styles.infoDot, { backgroundColor: theme.pastelBlue }]} />
                        <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                            You can always edit or delete these later in your Home dashboard.
                        </Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'PlusJakartaSans_500Medium',
        marginTop: 6,
        opacity: 0.7,
    },
    closeBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 24,
        paddingBottom: 40,
    },
    choiceCard: {
        borderRadius: 40,
        padding: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 68,
        height: 68,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 22,
    },
    choiceTitle: {
        fontSize: 22,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: -0.5,
    },
    choiceSubtitle: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        marginTop: 4,
    },
    goBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginTop: 16,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
        paddingVertical: 16,
        borderRadius: 20,
    },
    infoDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    tipText: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        flex: 1,
        lineHeight: 18,
    }
});
