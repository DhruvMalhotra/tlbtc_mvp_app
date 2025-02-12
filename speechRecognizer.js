// Declare local vars to strictly enforce private access
let _recognitionStopped = true;

class SpeechRecognizer {
    constructor() {
        this.recognizedText = "";
        
        // Check if speech recognition is available
        if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            return;
        }
        
        // Log which version we're using
        console.log('Using webkitSpeechRecognition:', 'webkitSpeechRecognition' in window);
        console.log('Using SpeechRecognition:', 'SpeechRecognition' in window);
        
        try {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.lang = "en-US";
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            
            // Add more detailed error logging
            this.recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                console.error("Error details:", event);
            };
            
            this.setupRecognitionHandlers();
            this.setupMicrophone();
        } catch (error) {
            console.error('Error initializing speech recognition:', error);
        }
    }

    async setupMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { 'type': 'audio/wav; codecs=opus' });
                this.audioURL = URL.createObjectURL(this.audioBlob);
                this.audioChunks = [];
            };

            console.log("Microphone setup complete.");
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    }

    setupRecognitionHandlers() {
        this.recognition.onstart = () => {
            console.log("Speech recognition started");
        };

        this.recognition.onend = () => {
            console.log("Speech recognition ended");
            
            if (_recognitionStopped === false)
                this.recognition.start();
        };

        this.recognition.onresult = (event) => {
            this.recognizedText = ""; // Clear previous results for fresh display
            for (let i = 0; i < event.results.length; i++) {
                this.recognizedText += event.results[i][0].transcript;
            }
            console.log("Recognized Text (real-time):", this.recognizedText);
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };
    }

    startListening() {
        _recognitionStopped = false;
        this.recognizedText = "";  // Clear text when starting
        this.recognition.start();
    }

    stopListening() {
        _recognitionStopped = true;
        this.recognition.stop();
    }

    getRecognizedText() {
        return this.recognizedText;
    }
}

export default SpeechRecognizer;