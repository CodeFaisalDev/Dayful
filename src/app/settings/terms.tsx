import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function TermsScreen() {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Terms & Conditions</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Acceptance of Terms</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        By downloading or using the Dayful app, these terms will automatically apply to you – you should make sure therefore that you read them carefully before using the app.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Data & Privacy</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        Dayful is designed with privacy at its core. **We do not store any of your personal data, tasks, habits, or events on our servers.** All your information is stored locally on your device. If you delete the app or clear its data, your information will be lost.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Monetization</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        Dayful uses advertisements to monetize the service and provide it for free to users. By using the app, you agree to the display of ads as integrated within the application.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Changes to Terms</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        We may update our Terms and Conditions from time to time. You are advised to review this page periodically for any changes.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>Last Updated: February 2026</Text>
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
    footer: {
        marginTop: 20,
        marginBottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
    }
});
