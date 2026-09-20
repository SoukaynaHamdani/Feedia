import { stripMarkdown } from '../utils/markdown';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

let currentAudio = null; // Global reference for HTML5 Audio

export const generateReportFromGroq = async (animalType, animalBreed, herdSize, age, location, season, budget, language = 'en') => {
  try {
    const response = await fetch("/api/generate-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        animalType,
        animalBreed,
        herdSize,
        age,
        location,
        season,
        budget,
        language
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend API Error Details:", errorData);
      throw new Error(`API request failed with status ${response.status}: ${errorData.detail || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from Backend API:", error);
    throw error;
  }
};

// ─── Text-to-Speech using Browser SpeechSynthesis ───
// Works for all languages — Arabic voices are built into most modern browsers.
// No API key needed, no CORS issues, instant playback.

const LANG_VOICE_MAP = {
  fr: { lang: 'fr-FR', rate: 0.9 },
  en: { lang: 'en-US', rate: 0.9 },
  darija: { lang: 'ar-MA', rate: 0.85 },      // Moroccan Arabic voice
  tamazight: { lang: 'ar-MA', rate: 0.8 },     // Fallback to Arabic voice (closest available)
};

/**
 * Helper to ensure voices are loaded before we try to use them.
 */
const ensureVoicesLoaded = () => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    // If empty, wait for the event
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
};

// ─── Cloud Text-to-Speech (Fallback for Arabic/Amazigh) ───
// Using a robust, free cloud endpoint (Google Translate TTS) because HuggingFace
// free inference API frequently returns 404 for heavy TTS models.
const speakWithCloudTTS = async (text, language) => {
  const langCode = (language === 'darija' || language === 'tamazight') ? 'ar' : 'en';

  // Google TTS limits strings to ~200 chars. We split into safe chunks of <= 150 chars.
  const words = text.split(/\s+/);
  const sentences = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + word).length > 150) {
      sentences.push(currentChunk.trim());
      currentChunk = word + ' ';
    } else {
      currentChunk += word + ' ';
    }
  }
  if (currentChunk.trim()) {
    sentences.push(currentChunk.trim());
  }
  
  return new Promise((resolve, reject) => {
    let index = 0;

    const playNext = () => {
      // If we stop speaking manually, currentAudio is set to null
      if (!currentAudio && index > 0) {
        reject(new Error("Audio playback stopped"));
        return;
      }

      if (index >= sentences.length) {
        currentAudio = null;
        resolve();
        return;
      }

      const chunk = sentences[index].trim();
      if (!chunk) {
        index++;
        playNext();
        return;
      }

      const encodedText = encodeURIComponent(chunk);
      // Use the Vite proxy to bypass Google's Referer block
      const url = `/google-tts/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;
      
      currentAudio = new Audio(url);
      
      currentAudio.onended = () => {
        index++;
        playNext();
      };
      
      currentAudio.onerror = (e) => {
        console.error("Cloud TTS Error on chunk:", chunk);
        currentAudio = null;
        reject(e);
      };

      const audioToPlay = currentAudio;
      
      audioToPlay.play().catch(e => {
        if (e.name === 'AbortError') {
          // The play() was interrupted by a pause() call (likely from stopSpeaking / React Strict Mode).
          // We intentionally stopped it, so we shouldn't reject or nullify the global state if it's already a new audio.
          console.warn("Audio playback aborted intentionally.");
          return;
        }
        console.error("Autoplay prevented or network error:", e);
        if (currentAudio === audioToPlay) {
          currentAudio = null;
        }
        reject(e);
      });
    };

    playNext();
  });
};

/**
 * Speaks the given text, routing Darija/Amazigh to Cloud TTS and English to Native.
 * Returns a Promise that resolves when speech ends.
 */
export const speakText = async (text, language = 'fr') => {
  // Always stop previous audio
  stopSpeaking();
  text = stripMarkdown(text);

  if (language === 'darija' || language === 'tamazight') {
    return speakWithCloudTTS(text, language);
  }
  if (!window.speechSynthesis) {
    return Promise.reject(new Error("SpeechSynthesis not supported in this browser"));
  }
  // Wait for voices to be fully loaded by the browser
  const voices = await ensureVoicesLoaded();

  return new Promise((resolve, reject) => {
    const config = LANG_VOICE_MAP[language] || LANG_VOICE_MAP.en;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Explicitly set the language code so the browser knows to apply Arabic phonetics
    utterance.lang = config.lang;
    utterance.rate = config.rate;
    utterance.pitch = 1;

    // 1. Try exact match (e.g., ar-MA)
    let matchingVoice = voices.find(v => v.lang === config.lang);
    
    // 2. Try prefix match (e.g., any 'ar-' voice like ar-SA, ar-AE, etc.)
    if (!matchingVoice) {
      const prefix = config.lang.split('-')[0]; // 'ar'
      matchingVoice = voices.find(v => v.lang.startsWith(prefix));
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    } else {
      console.warn(`No suitable voice found for language: ${language}. Falling back to default.`);
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Stop any currently playing speech (Cloud or Native).
 */
export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if speech is currently playing.
 */
export const isSpeaking = () => {
  const isCloudSpeaking = currentAudio !== null && !currentAudio.paused;
  const isNativeSpeaking = window.speechSynthesis?.speaking || false;
  return isCloudSpeaking || isNativeSpeaking;
};
