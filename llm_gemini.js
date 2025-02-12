const models = ['gpt-4o-mini-2024-07-18','llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama-3.1-8b-instant', 'llama3-8b-8192'];
const groqurl = "https://api.groq.com/openai/v1/chat/completions";
const openaiurl = "https://api.openai.com/v1/chat/completions";
const googleurl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const standardResponses = [
    "Oops! My circuits hiccuped. Mind saying that again?",
    "Sorry, I zoned out like a cat in a sunbeam. One more time?",
    "Wow, that went right over my head. Let’s give it another shot.",
    "Oh no, I missed that! Could you repeat it, pretty please?",
    "Sorry, I blinked and missed that. Care to say it one more time?",
    "I think my brain glitched. Let’s try that one more time, shall we?",
    "Oh boy, that’s on me. Let’s hit rewind and try again!",
];
class LLM_Gemini {
    constructor() {
        this.contents = [];
        this.systemPrompt = null;
        this.lastState = 0;
        this.lastSpeaker = "astro";
        this.responseTimeout = 5000;
    }

    async startConversation(key, system_prompt, user_prompt) {
        this.resetChat();
        this.systemInstruction = {
            parts: { text: system_prompt }
        };
        this.contents.push({
            role: "user",
            parts: [{ text: user_prompt }]
        });
        let response = await this.timedResponse(key, this.contents);
        this.contents.push({
            role: "model",
            parts: [{ text: response.text }]
        });
        return JSON.stringify(response);
    }
    
    async addTurn(key, user_prompt) {
        this.contents.push({
            role: "user",
            parts: [{ text: user_prompt }]
        });
        let response = await this.timedResponse(key, this.contents);
        this.contents.push({
            role: "model",
            parts: [{ text: response.text }]
        });
        return JSON.stringify(response);
    }

    resetChat() {
        this.contents = [];
        this.systemInstruction = null;
        console.log('Chat reset');
    }

    getStandardResponse()  {
        return {
            text: standardResponses[Math.floor(Math.random() * standardResponses.length)],
            state: this.lastState,
            emotion: "idle",
            speaker: this.lastSpeaker,
        }
    }
    saveStats(response) {
        this.lastState = response.state;
        this.lastSpeaker = response.speaker;
    }

    async timedResponse (key, msgs) {
        var responseSent = false;
        return new Promise( (resolve)  => {
            const timer = setTimeout(() => {
                console.log("Waiting for response",this.responseTimeout);
                if (!responseSent) {
                    responseSent = true;
                    resolve(this.getStandardResponse());
                }
            }, this.responseTimeout);

            getResponse(key, this.contents, this.systemInstruction).then((response) => {
                if (!responseSent) {
                    clearTimeout(timer);
                    responseSent = true;
                    resolve(response);
                }
            }).catch(() => { 
                if (!responseSent) {
                    clearTimeout(timer);
                    responseSent = true;
                    resolve(this.getStandardResponse());
                }
            });
        });
    }
}

// Call llm via fetch
async function getResponse(key, contents, systemInstruction) {
    const api_key = String(key);
    try {
        const requestBody = {
            contents: contents,
            generationConfig: {
                "response_mime_type": "application/json",
                "temperature": 0,
                "maxOutputTokens": 200,
            }
        };

        // Add system instruction if present
        if (systemInstruction) {
            requestBody.system_instruction = systemInstruction;
        }

        const response = await fetch(`${googleurl}?key=${key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();

        if (response.ok) {
            console.log('Response OK')
            var generatedJson = ""
            if (data.candidates && data.candidates[0].content) {
                generatedJson = JSON.parse(data.candidates[0].content.parts[0].text);
            }
            console.log("Generated text:", generatedJson);
            return generatedJson;
        }
        else {
            console.log('error', response,);
            return LLM.getStandardResponse();
        }

    } catch (error) {
        console.error('Error calling llm', error.message, window.recognizedText);
        return LLM.getStandardResponse();
    }
}


export default LLM_Gemini;