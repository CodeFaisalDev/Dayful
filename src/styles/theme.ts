// Stitch Design Specs - Improved Contrast
export const Colors = {
    light: {
        background: '#F1F5F9', // Slightly darker for better card separation
        surface: '#FFFFFF',
        primary: '#6C5DD3',
        secondary: '#CFC8FF',
        accent: '#FFCF5C',
        text: '#1A1D23',       // Slightly deeper black
        textSecondary: '#475569', // Improved contrast (Slate 600)
        border: '#CBD5E1',     // Slate 300
        muted: '#E2E8F0',      // Slate 200
        success: '#22C55E',
        danger: '#EF4444',

        // HIGH SATURATION PLAYFUL PALETTE
        pastelBlue: '#A5D8FF',
        pastelGreen: '#B9EACD',
        pastelYellow: '#FFE082',
        pastelPurple: '#C1AFFF',
        pastelPink: '#FFACC8',

        // Navigation
        tabBar: '#FFFFFF',
        tabBarBorder: 'rgba(0,0,0,0.05)',
        iconActive: '#1A1D23',
        iconInactive: 'rgba(26, 29, 35, 0.4)',

        primaryFade: 'rgba(108, 93, 211, 0.08)',
    },
    dark: {
        background: '#17161bff', // Deep Navy/Black
        surface: '#252836',    // Lighter Navy
        primary: '#6C5DD3',
        secondary: '#252836',
        accent: '#FFCF5C',
        text: '#FFFFFF',
        textSecondary: '#808191',
        border: '#2D2F3F',
        muted: '#252836',
        success: '#4ADE80',
        danger: '#FF754C',

        pastelBlue: '#8E82E3',   // Lighter for dark text
        pastelGreen: '#4FD1C5',
        pastelYellow: '#FFCA28',
        pastelPurple: '#9575CD',
        pastelPink: '#F06292',

        tabBar: '#252836',       // Slightly lighter than bg
        tabBarBorder: 'transparent',
        iconActive: '#FFFFFF',   // Pure White for contrast
        iconInactive: '#696C7D',

        primaryFade: 'rgba(108, 93, 211, 0.15)',
    }
};

export const Typography = {
    fontFamily: {
        regular: 'PlusJakartaSans_400Regular',
        medium: 'PlusJakartaSans_500Medium',
        semiBold: 'PlusJakartaSans_600SemiBold',
        bold: 'PlusJakartaSans_700Bold',
        extraBold: 'PlusJakartaSans_800ExtraBold',
    },
    h1: {
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        fontSize: 32,
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    h2: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: -0.3,
    },
    body: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 16,
        lineHeight: 24,
    },
    caption: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 13,
        lineHeight: 18,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};
