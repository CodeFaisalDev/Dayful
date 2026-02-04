import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Typography, Spacing } from '../styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Check, PlayCircle } from 'lucide-react-native';
import { useTheme, ACCENT_COLORS } from '../context/ThemeContext';
import { useRouter } from 'expo-router';

export default function ThemeScreen() {
    const { theme, accentColor, setAccentColor, unlockedAccents, unlockAccent } = useTheme();
    const router = useRouter();
    const [loadingColor, setLoadingColor] = useState<string | null>(null);

    const handleSelectColor = (color: string) => {
        const isUnlocked = unlockedAccents.includes(color);

        if (isUnlocked) {
            setAccentColor(color);
        } else {
            Alert.alert(
                "Unlock Theme",
                "Watch a short video to unlock this premium theme color forever! [Rewarded Ad Placeholder]",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Watch Ad",
                        onPress: () => simulateRewardedAd(color)
                    }
                ]
            );
        }
    };

    const simulateRewardedAd = (color: string) => {
        setLoadingColor(color);
        // Simulate loading and watching
        setTimeout(() => {
            unlockAccent(color);
            setAccentColor(color);
            setLoadingColor(null);
            Alert.alert("Success!", "New theme color unlocked! 🎉");
        }, 2000);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>App Theme</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Pick your favorite accent color</Text>

                <View style={styles.grid}>
                    {ACCENT_COLORS.map((color) => {
                        const isSelected = accentColor === color;
                        const isUnlocked = unlockedAccents.includes(color);
                        const isLoading = loadingColor === color;

                        return (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorCard,
                                    { backgroundColor: theme.surface },
                                    isSelected && { borderColor: theme.primary, borderWidth: 2 }
                                ]}
                                onPress={() => handleSelectColor(color)}
                                disabled={isLoading}
                            >
                                <View style={[styles.colorBubble, { backgroundColor: color }]}>
                                    {isSelected && <Check size={20} color={theme.text} />}
                                    {!isUnlocked && !isSelected && <Lock size={16} color={theme.text} style={styles.lockIcon} />}
                                </View>

                                <Text style={[styles.colorLabel, { color: theme.text }]}>
                                    {color === ACCENT_COLORS[0] ? 'Classic' : 'Premium'}
                                </Text>

                                {!isUnlocked && (
                                    <View style={styles.unlockBadge}>
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color={theme.primary} />
                                        ) : (
                                            <>
                                                <PlayCircle size={14} color={theme.textSecondary} />
                                                <Text style={[styles.unlockText, { color: theme.textSecondary }]}>Unlock</Text>
                                            </>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
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
        padding: Spacing.md,
    },
    backButton: {
        padding: Spacing.sm,
        marginRight: Spacing.sm,
    },
    title: {
        ...Typography.h2,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    subtitle: {
        ...Typography.body,
        marginBottom: Spacing.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    colorCard: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 20,
        marginBottom: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    colorBubble: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
        position: 'relative',
    },
    lockIcon: {
        position: 'absolute',
        opacity: 0.6,
    },
    colorLabel: {
        ...Typography.caption,
        fontWeight: '700',
    },
    unlockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    unlockText: {
        ...Typography.caption,
        fontSize: 10,
        marginLeft: 4,
    }
});
