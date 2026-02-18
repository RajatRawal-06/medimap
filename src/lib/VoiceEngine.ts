/**
 * VoiceEngine provides a wrapper around the Web Speech API 
 * to handle navigation instructions.
 */
class VoiceEngine {
    private synth: SpeechSynthesis | null = null;
    private voice: SpeechSynthesisVoice | null = null;
    private enabled: boolean = false;

    constructor() {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            this.synth = window.speechSynthesis;
            // Load voices
            this.loadVoices();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = this.loadVoices;
            }
        }
    }

    private loadVoices = () => {
        if (!this.synth) return;
        const voices = this.synth.getVoices();
        // Prefer a natural sounding English voice if available
        this.voice = voices.find(v => v.lang.includes('en-US')) || voices[0];
    };

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
        this.stop();
    }

    speak(text: string) {
        if (!this.synth || !this.enabled) return;

        // Cancel any current speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) {
            utterance.voice = this.voice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        this.synth.speak(utterance);
    }

    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled && this.synth) {
            this.synth.cancel();
        }
    }

    isEnabled() {
        return this.enabled;
    }
}

export const voiceEngine = new VoiceEngine();
