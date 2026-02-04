import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography, Spacing } from '../styles/theme';
import { useTheme } from '../context/ThemeContext';

interface AdBannerProps {
    position?: 'bottom' | 'inline';
}

export const AdBanner: React.FC<AdBannerProps> = ({ position = 'bottom' }) => {
    const { theme } = useTheme();

    return (
        <View style={[
            styles.container,
            { backgroundColor: theme.muted, borderTopColor: theme.border },
            position === 'bottom' ? styles.bottomBanner : [styles.inlineBanner, { borderColor: theme.border }]
        ]}>
            <Text style={[styles.adLabel, { color: theme.textSecondary }]}>SPONSORED</Text>
            <View style={styles.adContent}>
                <Text style={[styles.adPlaceholderText, { color: theme.textSecondary }]}>AdMob Banner Placeholder</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
        padding: Spacing.xs,
    },
    bottomBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inlineBanner: {
        height: 80,
        marginVertical: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adLabel: {
        ...Typography.caption,
        fontSize: 9,
        position: 'absolute',
        top: 2,
        left: 5,
    },
    adContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adPlaceholderText: {
        ...Typography.caption,
        fontWeight: '700',
    }
});
