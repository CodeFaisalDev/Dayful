import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Check, Play, ArrowUp, ArrowDown, Trash2, Heart, Plus, ChevronDown, ChevronUp, X, Brain, Dumbbell, Leaf } from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SoundService } from '../services/sound';

interface SubTask {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface Task {
    id: string;
    name: string;
    time?: string;
    category?: string;
    duration?: string;
    completedDates: string[];
    streak: number;
    frozenUntil?: string;
    isFavorite?: boolean;
    subTasks?: SubTask[];
}

interface TaskItemProps {
    task: Task;
    index: number;
    isSorting: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onToggle: () => void;
    onDelete: () => void;
    onEdit: () => void;
    onToggleFavorite: () => void;
    onAddSubTask: (title: string) => void;
    onToggleSubTask: (subTaskId: string) => void;
    onDeleteSubTask: (subTaskId: string) => void;
}

const getTaskEmoji = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('water') || lowerName.includes('drink')) return '💧';
    if (lowerName.includes('stretch') || lowerName.includes('yoga')) return '🧘';
    if (lowerName.includes('read') || lowerName.includes('book')) return '📖';
    if (lowerName.includes('workout') || lowerName.includes('exercise')) return '💪';
    if (lowerName.includes('meditat')) return '🧘';
    if (lowerName.includes('run') || lowerName.includes('walk')) return '🏃';
    return '✨';
};

const getCategoryIcon = (category?: string, name?: string) => {
    if (category === 'mindfulness') return <Brain size={26} color="#3B82F6" />;
    if (category === 'workout') return <Dumbbell size={26} color="#64748B" />;
    if (category === 'health') return <Leaf size={26} color="#10B981" />;
    if (category === 'selfcare') return <Heart size={26} color="#F43F5E" />;
    return <Text style={styles.iconEmoji}>{getTaskEmoji(name || '')}</Text>;
};

const getTimeLabel = (time?: string) => {
    if (!time) return 'ANYTIME';
    const [t, modifier] = time.split(' ');
    let [hours, minutes] = t.split(':');
    let h = parseInt(hours);

    if (modifier === 'PM' && h !== 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;

    if (h < 12) return 'MORNING';
    if (h < 17) return 'AFTERNOON';
    return 'EVENING';
};

export const TaskItem: React.FC<TaskItemProps> = ({
    task,
    index,
    isSorting,
    onMoveUp,
    onMoveDown,
    onToggle,
    onDelete,
    onEdit,
    onToggleFavorite,
    onAddSubTask,
    onToggleSubTask,
    onDeleteSubTask
}) => {
    const { theme, isDark } = useTheme();
    const [expanded, setExpanded] = useState(false);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
    const [isAddingSubTask, setIsAddingSubTask] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const isCompleted = task.completedDates.includes(today);

    // Dynamic color selection based on index or category
    const getThemeColor = () => {
        if (task.category === 'mindfulness') return theme.pastelPurple;
        if (task.category === 'workout') return theme.pastelBlue;
        if (task.category === 'health') return theme.pastelGreen;
        if (task.category === 'selfcare') return theme.pastelPink;

        // Fallback rotation
        const colors = [theme.pastelBlue, theme.pastelGreen, theme.pastelYellow, theme.pastelPurple, theme.pastelPink];
        return colors[index % colors.length];
    };

    const cardColor = getThemeColor();
    const bgColor = cardColor;
    const accentColor = theme.text;
    const textColor = '#1F1D2B';
    const secondaryTextColor = 'rgba(31, 29, 43, 0.6)';
    const badgeTextColor = '#1F1D2B';

    const handleToggle = () => {
        if (!isCompleted) SoundService.playComplete();
        onToggle();
    };

    const handleDelete = () => {
        SoundService.playDelete();
        onDelete();
    };

    const handleAddSubTask = () => {
        if (newSubTaskTitle.trim()) {
            onAddSubTask(newSubTaskTitle.trim());
            setNewSubTaskTitle('');
            setIsAddingSubTask(false);
        }
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100)}
            layout={Layout.springify()}
            style={[
                styles.container,
                { backgroundColor: bgColor },
                isDark && { borderWidth: 1, borderColor: theme.border }
            ]}
        >
            <View style={styles.mainRow}>
                {/* Left: Icon Circle */}
                <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF' }]}>
                    {getCategoryIcon(task.category, task.name)}
                </View>

                {/* Center: Info */}
                <View style={styles.infoContainer}>
                    <Text style={[styles.taskName, { color: textColor }]} numberOfLines={1}>
                        {task.name}
                    </Text>
                    <View style={styles.metaRow}>
                        {task.duration && (
                            <View style={[styles.badge, { backgroundColor: '#FFFFFF' }]}>
                                <Text style={[styles.badgeText, { color: badgeTextColor }]}>{task.duration}</Text>
                            </View>
                        )}
                        <Text style={[styles.timeLabel, { color: secondaryTextColor }]}>{getTimeLabel(task.time)}</Text>
                    </View>
                </View>

                {/* Right: Action Column */}
                <View style={[styles.actionColumn, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                    {!isSorting && (
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                            <Trash2 size={20} color={secondaryTextColor} opacity={0.6} />
                        </TouchableOpacity>
                    )}


                    {isSorting ? (
                        <View style={styles.sortControls}>
                            <TouchableOpacity onPress={onMoveUp} style={styles.miniBtn}><ArrowUp size={16} color={secondaryTextColor} /></TouchableOpacity>
                            <TouchableOpacity onPress={onMoveDown} style={styles.miniBtn}><ArrowDown size={16} color={secondaryTextColor} /></TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleToggle}
                            style={[
                                styles.statusBtn,
                                { backgroundColor: isCompleted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.9)' }
                            ]}
                        >
                            {isCompleted ? (
                                <Check size={20} color={badgeTextColor} strokeWidth={3} />
                            ) : (
                                <Play size={16} color={badgeTextColor} fill={badgeTextColor} />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Expanded Controls Header (Subtle) */}
            {(expanded || (task.subTasks?.length ?? 0) > 0) && (
                <TouchableOpacity
                    style={styles.expandHeader}
                    onPress={() => setExpanded(!expanded)}
                >
                    <View style={styles.subtaskStatus}>
                        <View style={[styles.dot, { backgroundColor: textColor }]} />
                        <Text style={[styles.subtaskCount, { color: secondaryTextColor }]}>
                            {task.subTasks?.filter(s => s.isCompleted).length || 0}/{task.subTasks?.length || 0} STEPS
                        </Text>
                    </View>
                    {expanded ? <ChevronUp size={14} color={secondaryTextColor} /> : <ChevronDown size={14} color={secondaryTextColor} />}
                </TouchableOpacity>
            )}

            {/* Sub-tasks Section */}
            {expanded && (
                <View style={styles.expandedSection}>
                    {task.subTasks?.map((st) => (
                        <View key={st.id} style={styles.subtaskRow}>
                            <TouchableOpacity
                                style={[styles.checkSquare, { borderColor: secondaryTextColor, backgroundColor: st.isCompleted ? textColor : 'transparent' }]}
                                onPress={() => onToggleSubTask(st.id)}
                            >
                                {st.isCompleted && <Check size={10} color={cardColor} strokeWidth={4} />}
                            </TouchableOpacity>
                            <Text style={[styles.subtaskTitle, { color: textColor, opacity: st.isCompleted ? 0.5 : 1 }]}>
                                {st.title}
                            </Text>
                            <TouchableOpacity onPress={() => onDeleteSubTask(st.id)}>
                                <X size={14} color={secondaryTextColor} />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <View style={styles.quickAddRow}>
                        <TextInput
                            style={[styles.quickInput, { color: textColor, borderBottomColor: secondaryTextColor }]}
                            placeholder="Add step..."
                            placeholderTextColor={secondaryTextColor}
                            value={newSubTaskTitle}
                            onChangeText={setNewSubTaskTitle}
                            onSubmitEditing={handleAddSubTask}
                        />
                        <TouchableOpacity onPress={handleAddSubTask}>
                            <Plus size={18} color={textColor} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionMenu}>
                        <TouchableOpacity onPress={onToggleFavorite} style={styles.menuItem}>
                            <Heart size={16} color={task.isFavorite ? 'rgba(255, 99, 99, 1)' : secondaryTextColor} fill={task.isFavorite ? 'rgba(255, 99, 99, 1)' : 'transparent'} />
                            <Text style={[styles.menuText, { color: secondaryTextColor }]}>Favorite</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete} style={styles.menuItem}>
                            <Trash2 size={16} color={isDark ? secondaryTextColor : theme.danger} />
                            <Text style={[styles.menuText, { color: isDark ? secondaryTextColor : theme.danger }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 12,
        borderWidth: 1, // subtle border for pop
        borderColor: 'rgba(255,255,255,0.4)', // light highlight
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconEmoji: {
        fontSize: 26,
    },
    infoContainer: {
        flex: 1,
    },
    taskName: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 0.5,
    },
    timeLabel: {
        fontSize: 11,
        fontFamily: 'PlusJakartaSans_700Bold',
        letterSpacing: 0.5,
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    actionColumn: {
        marginLeft: 10,
    },
    statusBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    expandHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    subtaskStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    subtaskCount: {
        fontSize: 10,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        letterSpacing: 1,
    },
    expandedSection: {
        marginTop: 14,
        paddingHorizontal: 4,
    },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    checkSquare: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtaskTitle: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    quickAddRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
    },
    quickInput: {
        flex: 1,
        height: 36,
        borderBottomWidth: 1.5,
        fontSize: 13,
        fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    actionMenu: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 20,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    menuText: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_700Bold',
    },
    chevronBtn: {
        padding: 4,
        marginLeft: 4,
    },
    deleteBtn: {
        padding: 8,
    },
    sortControls: {
        flexDirection: 'row',
        gap: 4,
    },
    miniBtn: {
        padding: 6,
    }
});
