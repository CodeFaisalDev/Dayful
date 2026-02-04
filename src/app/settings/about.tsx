import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Github, Twitter, Globe, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function AboutScreen() {
    const { theme, isDark } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>About Dayful</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Image source={require('../../../assets/logo.jpg')} style={styles.logo} />
                    </View>
                    <Text style={[styles.appName, { color: theme.text }]}>Dayful</Text>
                    <Text style={[styles.version, { color: theme.textSecondary }]}>Version 1.0.0 (Build 20260204)</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Mission</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        Dayful was born from the idea that productivity should be a joyful experience. We believe that tracking your daily routines, habits, and special moments shouldn't feel like a chore, but like a playful journey towards a better self.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Privacy First</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        We value your privacy above all else. Dayful works entirely offline, meaning your data never leaves your device. No cloud, no tracking, just you and your journey.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Connect With Us</Text>
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.primaryFade }]}>
                            <Twitter size={24} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.primaryFade }]}>
                            <Github size={24} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.primaryFade }]}>
                            <Globe size={24} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>Made with <Heart size={14} color="#EF4444" fill="#EF4444" /> for a better day.</Text>
                    <Text style={[styles.copyright, { color: theme.textSecondary }]}>© 2026 Faisal. All rights reserved.</Text>
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
        padding: 20,
        gap: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#FFF',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        marginBottom: 20,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 5,
    },
    version: {
        fontSize: 14,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 10,
    },
    socialIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginTop: 40,
        marginBottom: 60,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    copyright: {
        fontSize: 12,
        marginTop: 10,
    }
});
