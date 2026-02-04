import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share, Alert, ActivityIndicator } from 'react-native';
import { Typography, Spacing } from '../styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, Heart, Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { StorageService } from '../services/storage';

export default function FavoritesScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        const favs = await StorageService.getFavorites();
        setFavorites(favs);
        setLoading(false);
    };

    const handleRemove = async (quote: string) => {
        Alert.alert(
            "Remove Favorite",
            "Are you sure you want to remove this quote from your favorites?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        const updated = await StorageService.toggleFavorite(quote);
                        setFavorites(updated);
                    }
                }
            ]
        );
    };

    const handleShare = async (quote: string) => {
        try {
            await Share.share({
                message: `"${quote}"\n\n- Shared from Dayful`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Favorite Quotes</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
                ) : favorites.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Heart size={48} color={theme.border} style={{ marginBottom: 16 }} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            You haven't saved any quotes yet. Tap the heart icon on your daily quote to save it here!
                        </Text>
                    </View>
                ) : (
                    favorites.map((quote, index) => (
                        <View key={index} style={[styles.quoteCard, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.quoteText, { color: theme.text }]}>“{quote}”</Text>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => handleRemove(quote)}>
                                    <Trash2 size={18} color={theme.textSecondary} />
                                    <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Remove</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(quote)}>
                                    <Share2 size={18} color={theme.primary} />
                                    <Text style={[styles.actionLabel, { color: theme.primary }]}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
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
    quoteCard: {
        borderRadius: 16,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    quoteText: {
        ...Typography.body,
        fontSize: 18,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: Spacing.md,
        lineHeight: 26,
    },
    divider: {
        height: 1,
        marginBottom: Spacing.md,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    actionLabel: {
        ...Typography.caption,
        fontWeight: '700',
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        ...Typography.body,
        textAlign: 'center',
        lineHeight: 22,
    },
});
