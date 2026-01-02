// voice.js - Browser-based voice input using Web Speech API

export class VoiceService {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.onResult = null;
        this.onError = null;

        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            if (event.results[0].isFinal && this.onResult) {
                this.onResult(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech error:', event.error);
            if (this.onError) this.onError(event.error);
            this.isRecording = false;
        };

        this.recognition.onend = () => {
            this.isRecording = false;
        };
    }

    isSupported() {
        return !!this.recognition;
    }

    start() {
        if (!this.recognition || this.isRecording) return;
        this.recognition.start();
        this.isRecording = true;
    }

    stop() {
        if (!this.recognition || !this.isRecording) return;
        this.recognition.stop();
        this.isRecording = false;
    }

    toggle() {
        if (this.isRecording) {
            this.stop();
        } else {
            this.start();
        }
        return this.isRecording;
    }
}
