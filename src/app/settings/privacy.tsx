import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacyScreen() {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Privacy Policy</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={[styles.shieldBox, { backgroundColor: theme.primaryFade }]}>
                        <Shield size={40} color={theme.primary} />
                    </View>
                    <Text style={[styles.heroText, { color: theme.text }]}>Your privacy is our priority.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Information Collection</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        We do not collect any personal information when you use Dayful. All data you enter (tasks, habits, events, subtasks) is stored exclusively on your device's local storage.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Third Party Services</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        We use Google AdMob to display advertisements. AdMob may collect certain information to serve relevant ads, such as your IP address, device identifiers, and approximate location. This information is handled by Google in accordance with their privacy policy.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Security</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        Since your data is stored locally, its security depends on the security of your device. We recommend using device-level security like PINs, passwords, or biometrics to protect your information.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Children's Privacy</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        Our app does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>For any questions, contact us at privacy@dayful.app</Text>
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
    heroSection: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 10,
    },
    shieldBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    heroText: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        marginTop: 20,
        marginBottom: 60,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
    }
});
