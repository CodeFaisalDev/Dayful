import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, Check, Stars, Layout, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        title: "Welcome to Dayful",
        description: "Your playful companion for organization.",
        icon: Stars,
        color: '#6C5DD3'
    },
    {
        title: "Track Everything",
        description: "Habits, tasks, and special events in one place.",
        icon: Layout,
        color: '#FFA2C0'
    },
    {
        title: "Stay Motivated",
        description: "Build streaks and celebrate your progress.",
        icon: Heart,
        color: '#FFCF5C'
    }
];

interface OnboardingFlowProps {
    isVisible: boolean;
    onComplete: (name: string) => void;
}

export const OnboardingFlow = ({ isVisible, onComplete }: OnboardingFlowProps) => {
    const { theme, isDark } = useTheme();
    const [step, setStep] = useState<'name' | 'slides' | 'start'>('name');
    const [name, setName] = useState('');
    const [slideIndex, setSlideIndex] = useState(0);

    const handleNext = () => {
        if (step === 'name') {
            if (name.trim()) setStep('slides');
        } else if (step === 'slides') {
            if (slideIndex < SLIDES.length - 1) {
                setSlideIndex(slideIndex + 1);
            } else {
                setStep('start');
            }
        }
    };

    const CurrentSlide = SLIDES[slideIndex];

    return (
        <Modal visible={isVisible} animationType="fade" transparent>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    {step === 'name' && (
                        <Animated.View entering={FadeIn} style={styles.stepContent}>
                            <View style={[styles.iconCircle, { backgroundColor: theme.primaryFade }]}>
                                <Heart size={40} color={theme.primary} />
                            </View>
                            <Text style={[styles.title, { color: theme.text }]}>What should we call you?</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                We'll use this to personalize your experience.
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: isDark ? theme.surface : '#FFFFFF',
                                    color: theme.text,
                                    borderColor: theme.border
                                }]}
                                placeholder="Your name..."
                                placeholderTextColor={theme.textSecondary}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                            />
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={handleNext}
                                disabled={!name.trim()}
                            >
                                <Text style={styles.buttonText}>Continue</Text>
                                <ArrowRight size={20} color="#FFF" />
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {step === 'slides' && (
                        <Animated.View
                            key={`slide-${slideIndex}`}
                            entering={FadeInRight}
                            exiting={FadeOutLeft}
                            style={styles.stepContent}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: CurrentSlide.color + '20' }]}>
                                <CurrentSlide.icon size={40} color={CurrentSlide.color} />
                            </View>
                            <Text style={[styles.title, { color: theme.text }]}>{CurrentSlide.title}</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                {CurrentSlide.description}
                            </Text>

                            <View style={styles.indicatorRow}>
                                {SLIDES.map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.indicator,
                                            { backgroundColor: i === slideIndex ? theme.primary : theme.muted }
                                        ]}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={handleNext}
                            >
                                <Text style={styles.buttonText}>
                                    {slideIndex === SLIDES.length - 1 ? "Got it" : "Next"}
                                </Text>
                                <ArrowRight size={20} color="#FFF" />
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {step === 'start' && (
                        <Animated.View entering={FadeIn} style={styles.stepContent}>
                            <View style={styles.logoContainer}>
                                <Image source={require('../../assets/logo.jpg')} style={styles.finalLogo} />
                            </View>
                            <Text style={[styles.title, { color: theme.text }]}>Ready to roll, {name}!</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                Let's start organizing your day beautifully.
                            </Text>

                            <TouchableOpacity
                                style={[styles.startBtn, { backgroundColor: theme.primary }]}
                                onPress={() => onComplete(name)}
                            >
                                <Text style={styles.startBtnText}>Start Organizing</Text>
                                <Check size={20} color="#FFF" />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
    },
    stepContent: {
        alignItems: 'center',
        width: '100%',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    input: {
        width: '100%',
        height: 60,
        borderRadius: 20,
        paddingHorizontal: 20,
        fontSize: 18,
        borderWidth: 1,
        marginBottom: 30,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 20,
        gap: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    indicatorRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 40,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    logoContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        overflow: 'hidden',
        marginBottom: 30,
        borderWidth: 4,
        borderColor: '#FFF',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    finalLogo: {
        width: '100%',
        height: '100%',
    },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 50,
        borderRadius: 25,
        gap: 12,
        marginTop: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    startBtnText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
    }
});
