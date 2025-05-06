/**
 * Simple translation service using open-source translation models
 * In a production environment, this would connect to an actual translation service API
 */

// Cache for translation results to avoid redundant translation requests
const translationCache = new Map<string, string>();

// Sample translations for common dream keywords
const translations: Record<string, Record<string, string>> = {
  en: {
    dream: "dream",
    nightmare: "nightmare",
    flying: "flying",
    falling: "falling",
    chased: "chased",
    water: "water",
    mountain: "mountain",
    forest: "forest",
    city: "city",
    family: "family",
    friend: "friend",
    stranger: "stranger",
    monster: "monster",
    animal: "animal",
    fear: "fear",
    joy: "joy",
    sadness: "sadness",
    surprise: "surprise"
  },
  it: {
    dream: "sogno",
    nightmare: "incubo",
    flying: "volare",
    falling: "cadere",
    chased: "inseguito",
    water: "acqua",
    mountain: "montagna",
    forest: "foresta",
    city: "città",
    family: "famiglia",
    friend: "amico",
    stranger: "sconosciuto",
    monster: "mostro",
    animal: "animale",
    fear: "paura",
    joy: "gioia",
    sadness: "tristezza",
    surprise: "sorpresa"
  },
  es: {
    dream: "sueño",
    nightmare: "pesadilla",
    flying: "volar",
    falling: "caer",
    chased: "perseguido",
    water: "agua",
    mountain: "montaña",
    forest: "bosque",
    city: "ciudad",
    family: "familia",
    friend: "amigo",
    stranger: "extraño",
    monster: "monstruo",
    animal: "animal",
    fear: "miedo",
    joy: "alegría",
    sadness: "tristeza",
    surprise: "sorpresa"
  },
  fr: {
    dream: "rêve",
    nightmare: "cauchemar",
    flying: "voler",
    falling: "tomber",
    chased: "poursuivi",
    water: "eau",
    mountain: "montagne",
    forest: "forêt",
    city: "ville",
    family: "famille",
    friend: "ami",
    stranger: "étranger",
    monster: "monstre",
    animal: "animal",
    fear: "peur",
    joy: "joie",
    sadness: "tristesse",
    surprise: "surprise"
  },
  de: {
    dream: "Traum",
    nightmare: "Albtraum",
    flying: "fliegen",
    falling: "fallen",
    chased: "verfolgt",
    water: "Wasser",
    mountain: "Berg",
    forest: "Wald",
    city: "Stadt",
    family: "Familie",
    friend: "Freund",
    stranger: "Fremder",
    monster: "Monster",
    animal: "Tier",
    fear: "Angst",
    joy: "Freude",
    sadness: "Traurigkeit",
    surprise: "Überraschung"
  }
};

/**
 * Translate a text from one language to another
 * @param text Text to translate
 * @param sourceLang Source language code
 * @param targetLang Target language code
 * @returns Translated text
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  // If source and target languages are the same, return the original text
  if (sourceLang === targetLang) {
    return text;
  }
  
  // Check cache first
  const cacheKey = `${sourceLang}:${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  // Simplified translation for demo purposes
  // In a real implementation, this would call an actual translation API
  let translatedText = text;
  
  // Replace known words with their translations
  if (translations[sourceLang] && translations[targetLang]) {
    const sourceDict = translations[sourceLang];
    const targetDict = translations[targetLang];
    
    for (const [enWord, sourceWord] of Object.entries(sourceDict)) {
      const targetWord = targetDict[enWord];
      if (targetWord) {
        // Case-insensitive replacement
        const regex = new RegExp('\\b' + sourceWord + '\\b', 'gi');
        translatedText = translatedText.replace(regex, targetWord);
      }
    }
  }
  
  // Simulate translation delay for realism
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Cache the result
  translationCache.set(cacheKey, translatedText);
  
  return translatedText;
}

/**
 * Get supported languages
 * @returns Array of supported language codes
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(translations);
}
