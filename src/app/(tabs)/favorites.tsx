import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../styles/theme';
import { StorageService, Task } from '../../services/storage';
import { useTasks } from '../../hooks/useTasks';
import { TaskItem } from '../../components/TaskItem';
import { Heart, Share2, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { SoundService } from '../../services/sound';
import { useFocusEffect } from 'expo-router';

export default function FavoritesScreen() {
    const { theme, isDark } = useTheme();
    const {
        tasks,
        toggleFavorite,
        deleteTask,
        toggleComplete,
        editTask,
        freezeStreak,
        reorderTasks,
        addSubTask,
        toggleSubTask,
        deleteSubTask
    } = useTasks();

    const [favoriteQuotes, setFavoriteQuotes] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'habits' | 'quotes'>('habits');

    const loadQuotes = async () => {
        const favs = await StorageService.getFavorites();
        setFavoriteQuotes(favs);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadQuotes();
        }, [])
    );

    const favoriteTasks = tasks.filter(t => t.isFavorite);

    const handleUnfavoriteQuote = async (quote: string) => {
        SoundService.playClick();
        const updated = await StorageService.toggleFavorite(quote);
        setFavoriteQuotes(updated);
    };

    const handleCopy = async (quote: string) => {
        SoundService.playClick();
        await Clipboard.setStringAsync(`"${quote}"`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    onPress={() => setActiveTab('habits')}
                    style={[styles.tab, activeTab === 'habits' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'habits' ? theme.primary : theme.textSecondary }]}>HABITS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('quotes')}
                    style={[styles.tab, activeTab === 'quotes' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'quotes' ? theme.primary : theme.textSecondary }]}>QUOTES</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {activeTab === 'habits' ? (
                    favoriteTasks.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Heart size={48} color={theme.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No favorited habits yet. Tap the heart on a habit to save it here.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={favoriteTasks}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item, index }) => (
                                <TaskItem
                                    task={item}
                                    index={index}
                                    isSorting={false}
                                    onMoveUp={() => { }}
                                    onMoveDown={() => { }}
                                    onToggle={() => toggleComplete(item.id)}
                                    onDelete={() => deleteTask(item.id)}
                                    onEdit={() => { }}
                                    onToggleFavorite={() => toggleFavorite(item.id)}
                                    onAddSubTask={(title) => addSubTask(item.id, title)}
                                    onToggleSubTask={(subId) => toggleSubTask(item.id, subId)}
                                    onDeleteSubTask={(subId) => deleteSubTask(item.id, subId)}
                                />
                            )}
                        />
                    )
                ) : (
                    favoriteQuotes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Heart size={48} color={theme.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No favorited quotes yet.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={favoriteQuotes}
                            keyExtractor={(item) => item}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => (
                                <View style={[styles.card, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
                                    <Text style={[styles.quoteText, { color: theme.text }]}>"{item}"</Text>
                                    <View style={styles.actions}>
                                        <TouchableOpacity onPress={() => handleCopy(item)} style={styles.actionBtn}>
                                            <Copy size={18} color={theme.textSecondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleUnfavoriteQuote(item)} style={styles.actionBtn}>
                                            <Heart size={18} color={theme.danger} fill={theme.danger} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    )
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: Spacing.lg,
    },
    title: {
        ...Typography.h1,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
    },
    tabText: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_700Bold',
        letterSpacing: 1,
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    quoteText: {
        ...Typography.body,
        fontStyle: 'italic',
        marginBottom: 16,
        lineHeight: 24,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    actionBtn: {
        padding: 4,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'PlusJakartaSans_500Medium',
        lineHeight: 22,
    }
});
