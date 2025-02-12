import { frame_dict, viseme_dict } from "./visemeMaps.js";

let _speechConfig = null;
let _audio = null;

class FaceGenerator {
    constructor() {
        this.currentViseme = 1;
        this.visemeTimeouts = [];
    }

    initializeTTS(key) {
        _speechConfig = SpeechSDK.SpeechConfig.fromSubscription(String(key), "southeastasia");
        _speechConfig.speechSynthesisOutputFormat = SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoWithMetadata;
    }

    async generate(text, voice, onlyAudio = false) {
        if (!text) return;
        this.stop();

        const visemes = [];
        return new Promise((resolve, reject) => {
            const synthesizer = new SpeechSDK.SpeechSynthesizer(_speechConfig, null);

            synthesizer.visemeReceived = (_, e) => {
                visemes.push([e.visemeId, e.audioOffset / 10000]);
            };

            const ssml = `<speak version='1.0' xml:lang='en-US' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts'> \r\n \
				<voice name='${voice}'> \r\n \
					<mstts:viseme type='redlips_front'/> \r\n \
					${text} \r\n \
					</voice> \r\n \
					</speak>`;

            synthesizer.speakSsmlAsync(
                ssml,
                result => {
                    if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                        this.setupAudio(result.audioData, visemes, onlyAudio, resolve, reject);
                    } else {
                        reject(result.errorDetails);
                    }
                    synthesizer.close();
                },
                error => reject(error)
            );
        });
    }

    setupAudio(audioData, visemes, onlyAudio, resolve, reject) {
        try {
			if (!window.audioContext) {
				window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
			}
		 
			// Convert audio data to AudioBuffer
			audioContext.decodeAudioData(audioData, (audioBuffer) => {
				const source = audioContext.createBufferSource();
				source.buffer = audioBuffer;
				source.connect(audioContext.destination);
				
				// Handle completion
				source.onended = () => {
					this.cleanup();
					resolve();
				};
		 
				// Start playing and handle visemes
				source.start(0);
				if (!onlyAudio) {
					this.playVisemes(visemes);
				}
		 
			}, (error) => {
				console.error("Error decoding audio data:", error);
				reject(error);
				this.cleanup();
			});
		 
		 } catch (error) {
			console.error("Audio context setup failed:", error);
			this.cleanup();
			reject(error);
		 }

    playVisemes(visemes) {
        visemes.forEach(([visemeId, duration], index) => {
            const timeout = setTimeout(() => {
                this.currentViseme = frame_dict[viseme_dict[visemeId]];
                if (index === visemes.length - 1) {
                    this.resetState();
                }
            }, duration);
            this.visemeTimeouts.push(timeout);
        });
    }

    stop() {
        if (_audio) {
            _audio.pause();
            _audio.currentTime = 0;
        }
        this.cleanup();
    }

    cleanup() {
        if (_audio?.src) {
            URL.revokeObjectURL(_audio.src);
            _audio = null;
        }
        this.visemeTimeouts.forEach(clearTimeout);
        this.visemeTimeouts = [];
        this.resetState();
    }

    resetState() {
        this.currentViseme = 1;
        if (window.TLBTC) {
            window.TLBTC.dialogue_state = 'idle';
        }
    }
}

export default FaceGenerator;