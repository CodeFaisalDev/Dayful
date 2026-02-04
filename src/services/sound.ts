import { createAudioPlayer, AudioPlayer } from 'expo-audio';

const SOUND_FILES = {
    click: require('../../assets/sounds/click.wav'),
    create: require('../../assets/sounds/create.wav'),
    delete: require('../../assets/sounds/delete.wav'),
    // complete: require('../../assets/sounds/complete.wav'), // File corrupted
    pop: require('../../assets/sounds/pop.mp3'),
};

type SoundKey = keyof typeof SOUND_FILES;

class SoundServiceImpl {
    private players: Partial<Record<SoundKey, AudioPlayer>> = {};
    private isInitialized = false;

    async init() {
        if (this.isInitialized) return;

        try {
            const keys = Object.keys(SOUND_FILES) as SoundKey[];
            // Preload sounds
            for (const key of keys) {
                try {
                    const player = createAudioPlayer(SOUND_FILES[key]);
                    this.players[key] = player;
                    // Setting volume explicitly
                    player.volume = 1.0;
                } catch (e) {
                    console.log(`Failed to load sound ${key}`, e);
                }
            }
            this.isInitialized = true;
        } catch (error) {
            console.log('Error initializing audio', error);
        }
    }

    async play(key: SoundKey) {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            let player = this.players[key];

            if (!player) {
                // If missing, try to create it on the fly
                player = createAudioPlayer(SOUND_FILES[key]);
                this.players[key] = player;
            }

            // Always reset to start
            if (player) {
                player.seekTo(0);
                player.play();
            }
        } catch (error) {
            // Silently fail to avoid disrupting user flow, but log
            console.log(`Failed to play sound ${key}`, error);
        }
    }

    // Fallback logic
    async playComplete() { await this.play('pop'); }
    async playCreate() { await this.play('create'); }
    async playDelete() { await this.play('delete'); }
    async playPop() { await this.play('pop'); }
    async playClick() { await this.play('click'); }
}

export const SoundService = new SoundServiceImpl();
// Initialize
SoundService.init();
