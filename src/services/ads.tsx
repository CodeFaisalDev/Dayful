import React from 'react';
import {
    BannerAd,
    BannerAdSize,
    TestIds,
    InterstitialAd,
    AdEventType,
    AppOpenAd,
    RewardedAd,
    RewardedAdEventType
} from 'react-native-google-mobile-ads';

const AD_UNITS = {
    banner: 'ca-app-pub-9134194923528949/8497024699',
    interstitial: 'ca-app-pub-9134194923528949/4977016852',
    rewarded: 'ca-app-pub-9134194923528949/1931616348',
    appOpen: 'ca-app-pub-9134194923528949/3986934041'
};

// Use production IDs
const UNIT_ID = (type: keyof typeof AD_UNITS) => {
    return AD_UNITS[type];
};

let interstitial: InterstitialAd | null = null;
let appOpen: AppOpenAd | null = null;
let rewarded: RewardedAd | null = null;

export const AdsService = {
    init() {
        // App Open Ad
        if (!appOpen) {
            try {
                appOpen = AppOpenAd.createForAdRequest(UNIT_ID('appOpen'), {
                    keywords: ['productivity', 'organization', 'lifestyle'],
                });
                appOpen.load();
            } catch (e) {
                console.warn('Failed to init AppOpenAd', e);
            }
        }

        // Interstitial Ad
        if (!interstitial) {
            interstitial = InterstitialAd.createForAdRequest(UNIT_ID('interstitial'), {
                keywords: ['productivity', 'routines'],
            });
            interstitial.load();
        }

        // Rewarded Ad
        if (!rewarded) {
            rewarded = RewardedAd.createForAdRequest(UNIT_ID('rewarded'), {
                keywords: ['productivity', 'reward'],
            });
            rewarded.load();
        }
    },

    showAppOpen() {
        if (appOpen && appOpen.loaded) {
            appOpen.show();
            appOpen.load(); // Load next
        } else {
            appOpen?.load();
        }
    },

    async showInterstitial() {
        if (interstitial && interstitial.loaded) {
            interstitial.show();
            // Reload after it finishes
            const unsubscribe = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                interstitial?.load();
                unsubscribe();
            });
        } else {
            interstitial?.load();
        }
    },

    async showRewarded() {
        if (rewarded && rewarded.loaded) {
            rewarded.show();
            // Reload after close
            const unsubscribe = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
                // Reward earned (optional logic)
            });
            const unsubscribeClose = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
                rewarded?.load();
                unsubscribe();
                unsubscribeClose();
            });
        } else {
            rewarded?.load();
        }
    },

    Banner: ({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }: { size?: BannerAdSize }) => {
        return (
            <BannerAd
                unitId={UNIT_ID('banner')}
                size={size}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            />
        );
    }
};
