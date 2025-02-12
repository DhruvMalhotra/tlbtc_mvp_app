import SpeechRecognizer from "./speechRecognizer.js";
import LLM_gemini from "./llm_gemini.js";
import FaceGenerator from "./faceGenerator.js";

// Create a namespace for your project
window.TLBTC = window.TLBTC || {};

window.TLBTC.speechRecognizer = new SpeechRecognizer();
window.TLBTC.llm = new LLM_gemini();
window.TLBTC.faceGenerator = new FaceGenerator();