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
class LLM {
    constructor() {
        this.msgs = [];
        this.systemPrompt = "";
        this.lastState = 0;
        this.lastSpeaker = "astro";
        this.responseTimeout = 5000;
    }

    async startConversation(key, system_prompt, user_prompt) {
        this.resetChat();
        this.systemPrompt = system_prompt;
        this.msgs.push({ role: "system", content: this.systemPrompt });
        this.msgs.push({ role: "user", content: user_prompt });
        let response = await this.timedResponse(key, this.msgs);
        this.msgs.push({ role: "assistant", content: response.text });
        return JSON.stringify(response);
    }
    
    async addTurn(key, user_prompt) {
        this.msgs.push({ role: "user", content: user_prompt });
        let response = await this.timedResponse(key, this.msgs);
        this.msgs.push({ role: "assistant", content: response.text });
        return JSON.stringify(response);
    }

    resetChat() {
        this.msgs = [];
        this.systemPrompt = "";
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
        }
        , this.responseTimeout);

        getResponse(key, msgs).then((response) => {
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
        });}

    );
    }
}

// Call llm via fetch
async function getResponse(key, msgs) {
    const api_key = String(key);
    try {
        const response = await fetch(`${googleurl}?key=${key}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: msgs
                }]
              }]
            })
          });
        const data = await response.json();

        if (response.ok) {
            console.log('Response OK')
            const generatedJson = JSON.parse(data.choices[0].message.content);
            console.log("Generated text:", generatedJson.text);
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


export default LLM;