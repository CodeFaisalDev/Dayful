import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Animated as RNAnimated,
    Platform,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import {
    Moon,
    Sun,
    Palette,
    ChevronRight,
    Bell,
    User,
    Heart,
    Shield,
    FileText,
    Mail,
    Star,
    Trash2,
    Info,
    Zap
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SoundService } from '../../services/sound';
import { useRouter } from 'expo-router';
import { NotificationService } from '../../services/notifications';

interface SettingItemProps {
    icon: any;
    label: string;
    iconBg: string;
    iconColor: string;
    onPress: () => void;
    rightElement?: React.ReactNode;
}

const SettingItem = ({ icon: Icon, label, iconBg, iconColor, onPress, rightElement }: SettingItemProps) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                    <Icon size={18} color={iconColor} />
                </View>
                <Text style={[styles.itemLabel, { color: theme.text }]}>{label}</Text>
            </View>
            {rightElement || <ChevronRight size={18} color={theme.textSecondary} />}
        </TouchableOpacity>
    );
};

export default function SettingsScreen() {
    const { theme, isDark, mode, setMode, accentColor, setAccentColor, unlockedAccents, userName } = useTheme();
    const router = useRouter();

    const handleAction = (pathOrAction: string | (() => void)) => {
        SoundService.playClick();
        if (typeof pathOrAction === 'string') {
            router.push(pathOrAction as any);
        } else {
            pathOrAction();
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

                {/* Profile Section */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
                    <View style={[styles.card, {
                        backgroundColor: isDark ? theme.surface : '#FFFFFF',
                        borderWidth: isDark ? 1 : 0,
                        borderColor: theme.border,
                    }]}>
                        <View style={styles.profileInfo}>
                            <View style={[styles.avatar, { backgroundColor: theme.primaryFade }]}>
                                <User color={theme.primary} size={24} />
                            </View>
                            <View>
                                <Text style={[styles.profileName, { color: theme.text }]}>{userName}</Text>
                                <Text style={[styles.profileStatus, { color: theme.textSecondary }]}>Free User</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Theme Section */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>APPEARANCE</Text>
                    <View style={[styles.card, {
                        backgroundColor: isDark ? theme.surface : '#FFFFFF',
                        borderWidth: isDark ? 1 : 0,
                        borderColor: theme.border,
                    }]}>
                        <SettingItem
                            icon={isDark ? Moon : Sun}
                            label="Dark Mode"
                            iconBg={isDark ? '#4A90E230' : '#FFF9E6'}
                            iconColor={isDark ? '#4A90E2' : '#F2C94C'}
                            onPress={() => setMode(isDark ? 'light' : 'dark')}
                            rightElement={
                                <Switch
                                    value={isDark}
                                    onValueChange={(val) => setMode(val ? 'dark' : 'light')}
                                    trackColor={{ false: theme.muted, true: theme.primary }}
                                    thumbColor="#FFFFFF"
                                />
                            }
                        />
                        <SettingItem
                            icon={Info}
                            label="About Dayful"
                            iconBg={isDark ? '#E24A9B30' : '#FFF0F7'}
                            iconColor="#E24A9B"
                            onPress={() => handleAction('/settings/about')}
                        />
                    </View>
                </Animated.View>

                {/* Legal Section */}
                <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>LEGAL</Text>
                    <View style={[styles.card, {
                        backgroundColor: isDark ? theme.surface : '#FFFFFF',
                        borderWidth: isDark ? 1 : 0,
                        borderColor: theme.border,
                    }]}>
                        <SettingItem
                            icon={Shield}
                            label="Privacy Policy"
                            iconBg={isDark ? '#4A90E230' : '#E7F3FF'}
                            iconColor="#4A90E2"
                            onPress={() => handleAction('/settings/privacy')}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <SettingItem
                            icon={FileText}
                            label="Terms of Service"
                            iconBg={isDark ? '#9B51E030' : '#F3E8FF'}
                            iconColor="#9B51E0"
                            onPress={() => handleAction('/settings/terms')}
                        />
                    </View>
                </Animated.View>

                {/* Developer Tools Removed */}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.version, { color: theme.textSecondary }]}>Version 1.0.0</Text>
                    <Text style={[styles.appName, { color: theme.textSecondary }]}>Dayful by Axion Square</Text>
                    <View style={styles.madeWith}>
                        <Text style={[styles.madeWithText, { color: theme.textSecondary }]}>Made with</Text>
                        <Heart size={14} color="#EF4444" fill="#EF4444" />
                        <Text style={[styles.madeWithText, { color: theme.textSecondary }]}>for better days</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        marginTop: 16,
        marginBottom: 28,
    },
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    itemLabel: {
        fontSize: 15,
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    divider: {
        height: 1,
        marginLeft: 68,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    profileStatus: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_500Medium',
        opacity: 0.7,
    },
    footer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    version: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    appName: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_700Bold',
        marginTop: 4,
    },
    madeWith: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 4,
    },
    madeWithText: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_500Medium',
    }
});
