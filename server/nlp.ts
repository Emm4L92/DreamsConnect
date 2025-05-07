// Multi-language NLP for generating tags from dream descriptions
// In a production environment, this could be replaced with more sophisticated NLP libraries
// or API calls to services like OpenAI

/**
 * A set of predefined categories and their related keywords in different languages
 */
interface LanguageKeywords {
  [key: string]: string[];
}

interface TagCategories {
  [key: string]: LanguageKeywords;
}

const tagCategories: TagCategories = {
  places: {
    en: [
      'house', 'home', 'building', 'city', 'mountain', 'mountains', 'ocean', 'sea', 
      'beach', 'forest', 'woods', 'jungle', 'desert', 'river', 'lake', 'island', 
      'cave', 'castle', 'school', 'office', 'hospital', 'church', 'park', 'garden',
      'sky', 'space', 'underwater', 'subway', 'train', 'airplane', 'car', 'road', 'street',
      'spaceship', 'spacecraft', 'ufo', 'mars', 'moon', 'planet', 'galaxy', 'universe',
      'rocket', 'shuttle', 'station', 'satellite'
    ],
    it: [
      'casa', 'edificio', 'città', 'montagna', 'montagne', 'oceano', 'mare', 
      'spiaggia', 'foresta', 'bosco', 'giungla', 'deserto', 'fiume', 'lago', 'isola', 
      'grotta', 'castello', 'scuola', 'ufficio', 'ospedale', 'chiesa', 'parco', 'giardino',
      'cielo', 'spazio', 'sottomarino', 'metropolitana', 'treno', 'aereo', 'auto', 'strada', 'via',
      'astronave', 'navicella', 'astronavi', 'ufo', 'marte', 'luna', 'pianeta', 'galassia', 'universo',
      'razzo', 'navetta', 'stazione', 'satellite'
    ],
    es: [
      'casa', 'edificio', 'ciudad', 'montaña', 'montañas', 'océano', 'mar', 
      'playa', 'bosque', 'selva', 'desierto', 'río', 'lago', 'isla', 
      'cueva', 'castillo', 'escuela', 'oficina', 'hospital', 'iglesia', 'parque', 'jardín',
      'cielo', 'espacio', 'submarino', 'metro', 'tren', 'avión', 'coche', 'carretera', 'calle',
      'nave espacial', 'ovni', 'marte', 'luna', 'planeta', 'galaxia', 'universo',
      'cohete', 'estación', 'satélite'
    ],
    fr: [
      'maison', 'bâtiment', 'ville', 'montagne', 'montagnes', 'océan', 'mer', 
      'plage', 'forêt', 'bois', 'jungle', 'désert', 'rivière', 'lac', 'île', 
      'grotte', 'château', 'école', 'bureau', 'hôpital', 'église', 'parc', 'jardin',
      'ciel', 'espace', 'sous-marin', 'métro', 'train', 'avion', 'voiture', 'route', 'rue',
      'vaisseau spatial', 'ovni', 'mars', 'lune', 'planète', 'galaxie', 'univers',
      'fusée', 'navette', 'station', 'satellite'
    ],
    de: [
      'haus', 'gebäude', 'stadt', 'berg', 'berge', 'ozean', 'meer', 
      'strand', 'wald', 'dschungel', 'wüste', 'fluss', 'see', 'insel', 
      'höhle', 'schloss', 'schule', 'büro', 'krankenhaus', 'kirche', 'park', 'garten',
      'himmel', 'weltraum', 'unterwasser', 'u-bahn', 'zug', 'flugzeug', 'auto', 'straße', 'weg',
      'raumschiff', 'ufo', 'mars', 'mond', 'planet', 'galaxie', 'universum',
      'rakete', 'shuttle', 'station', 'satellit'
    ]
  },
  actions: {
    en: [
      'flying', 'falling', 'running', 'swimming', 'walking', 'jumping', 'climbing',
      'fighting', 'hiding', 'escaping', 'chasing', 'searching', 'finding', 'losing',
      'talking', 'singing', 'dancing', 'eating', 'drinking', 'sleeping', 'waking',
      'traveling', 'driving', 'riding', 'sailing', 'diving', 'floating', 'exploring',
      'spaceflight', 'journeying', 'teleporting', 'landing', 'launching', 'hovering', 'floating'
    ],
    it: [
      'volare', 'volavo', 'volando', 'cadere', 'correre', 'nuotare', 'camminare', 
      'saltare', 'arrampicare', 'combattere', 'nascondere', 'fuggire', 'inseguire', 
      'cercare', 'trovare', 'perdere', 'parlare', 'cantare', 'ballare', 'mangiare', 
      'bere', 'dormire', 'svegliare', 'viaggiare', 'viaggiando', 'guidare', 'cavalcare', 
      'navigare', 'tuffare', 'galleggiare', 'esplorare', 'esplorando', 'astronavigare', 
      'teletrasportare', 'atterrare', 'lanciare', 'sospendere', 'fluttuare', 'andare'
    ],
    es: [
      'volar', 'caer', 'correr', 'nadar', 'caminar', 'saltar', 'escalar',
      'luchar', 'esconder', 'escapar', 'perseguir', 'buscar', 'encontrar', 'perder',
      'hablar', 'cantar', 'bailar', 'comer', 'beber', 'dormir', 'despertar',
      'viajar', 'conducir', 'montar', 'navegar', 'sumergir', 'flotar'
    ],
    fr: [
      'voler', 'tomber', 'courir', 'nager', 'marcher', 'sauter', 'grimper',
      'combattre', 'cacher', 'échapper', 'poursuivre', 'chercher', 'trouver', 'perdre',
      'parler', 'chanter', 'danser', 'manger', 'boire', 'dormir', 'réveiller',
      'voyager', 'conduire', 'monter', 'naviguer', 'plonger', 'flotter'
    ],
    de: [
      'fliegen', 'fallen', 'rennen', 'schwimmen', 'gehen', 'springen', 'klettern',
      'kämpfen', 'verstecken', 'entkommen', 'jagen', 'suchen', 'finden', 'verlieren',
      'sprechen', 'singen', 'tanzen', 'essen', 'trinken', 'schlafen', 'aufwachen',
      'reisen', 'fahren', 'reiten', 'segeln', 'tauchen', 'schweben'
    ]
  },
  emotions: {
    en: [
      'fear', 'afraid', 'scared', 'happy', 'excited', 'sad', 'angry', 'confused',
      'lost', 'alone', 'trapped', 'free', 'peaceful', 'calm', 'anxious', 'stressed',
      'overwhelmed', 'love', 'hate', 'joy', 'sorrow', 'surprise', 'disgust', 'shame'
    ],
    it: [
      'paura', 'spaventato', 'terrorizzato', 'felice', 'eccitato', 'triste', 'arrabbiato', 'confuso',
      'perso', 'solo', 'intrappolato', 'libero', 'pacifico', 'calmo', 'ansioso', 'stressato',
      'sopraffatto', 'amore', 'odio', 'gioia', 'dolore', 'sorpresa', 'disgusto', 'vergogna'
    ],
    es: [
      'miedo', 'asustado', 'aterrado', 'feliz', 'emocionado', 'triste', 'enfadado', 'confundido',
      'perdido', 'solo', 'atrapado', 'libre', 'pacífico', 'tranquilo', 'ansioso', 'estresado',
      'abrumado', 'amor', 'odio', 'alegría', 'tristeza', 'sorpresa', 'asco', 'vergüenza'
    ],
    fr: [
      'peur', 'effrayé', 'terrifié', 'heureux', 'excité', 'triste', 'en colère', 'confus',
      'perdu', 'seul', 'piégé', 'libre', 'paisible', 'calme', 'anxieux', 'stressé',
      'débordé', 'amour', 'haine', 'joie', 'chagrin', 'surprise', 'dégoût', 'honte'
    ],
    de: [
      'angst', 'ängstlich', 'erschrocken', 'glücklich', 'aufgeregt', 'traurig', 'wütend', 'verwirrt',
      'verloren', 'allein', 'gefangen', 'frei', 'friedlich', 'ruhig', 'besorgt', 'gestresst',
      'überfordert', 'liebe', 'hass', 'freude', 'kummer', 'überraschung', 'ekel', 'scham'
    ]
  },
  characters: {
    en: [
      'family', 'friend', 'stranger', 'monster', 'animal', 'dog', 'cat', 'bird',
      'snake', 'spider', 'insect', 'bear', 'wolf', 'lion', 'tiger', 'fish', 'shark',
      'human', 'child', 'adult', 'mother', 'father', 'sister', 'brother',
      'ghost', 'spirit', 'angel', 'demon', 'alien', 'aliens', 'extraterrestrial', 'robot', 'astronaut', 'zombie'
    ],
    it: [
      'famiglia', 'amico', 'sconosciuto', 'mostro', 'animale', 'cane', 'gatto', 'uccello',
      'serpente', 'ragno', 'insetto', 'orso', 'lupo', 'leone', 'tigre', 'pesce', 'squalo',
      'umano', 'bambino', 'adulto', 'madre', 'padre', 'sorella', 'fratello',
      'fantasma', 'spirito', 'angelo', 'demone', 'alieno', 'alieni', 'extraterrestre', 'robot', 'astronauta', 'zombi'
    ],
    es: [
      'familia', 'amigo', 'extraño', 'monstruo', 'animal', 'perro', 'gato', 'pájaro',
      'serpiente', 'araña', 'insecto', 'oso', 'lobo', 'león', 'tigre', 'pez', 'tiburón',
      'humano', 'niño', 'adulto', 'madre', 'padre', 'hermana', 'hermano',
      'fantasma', 'espíritu', 'ángel', 'demonio', 'extraterrestre', 'robot', 'zombi'
    ],
    fr: [
      'famille', 'ami', 'étranger', 'monstre', 'animal', 'chien', 'chat', 'oiseau',
      'serpent', 'araignée', 'insecte', 'ours', 'loup', 'lion', 'tigre', 'poisson', 'requin',
      'humain', 'enfant', 'adulte', 'mère', 'père', 'soeur', 'frère',
      'fantôme', 'esprit', 'ange', 'démon', 'extraterrestre', 'robot', 'zombie'
    ],
    de: [
      'familie', 'freund', 'fremder', 'monster', 'tier', 'hund', 'katze', 'vogel',
      'schlange', 'spinne', 'insekt', 'bär', 'wolf', 'löwe', 'tiger', 'fisch', 'hai',
      'mensch', 'kind', 'erwachsener', 'mutter', 'vater', 'schwester', 'bruder',
      'geist', 'seele', 'engel', 'dämon', 'alien', 'roboter', 'zombie'
    ]
  },
  elements: {
    en: [
      'water', 'fire', 'earth', 'air', 'wind', 'light', 'dark', 'darkness', 'sun',
      'moon', 'stars', 'cloud', 'rain', 'snow', 'ice', 'storm', 'thunder', 
      'lightning', 'rainbow', 'shadow', 'nature', 'tree', 'flower', 'rock', 'mountain'
    ],
    it: [
      'acqua', 'fuoco', 'terra', 'aria', 'vento', 'luce', 'buio', 'oscurità', 'sole',
      'luna', 'stelle', 'nuvola', 'pioggia', 'neve', 'ghiaccio', 'tempesta', 'tuono', 
      'fulmine', 'arcobaleno', 'ombra', 'natura', 'albero', 'fiore', 'roccia', 'montagna'
    ],
    es: [
      'agua', 'fuego', 'tierra', 'aire', 'viento', 'luz', 'oscuro', 'oscuridad', 'sol',
      'luna', 'estrellas', 'nube', 'lluvia', 'nieve', 'hielo', 'tormenta', 'trueno', 
      'relámpago', 'arcoíris', 'sombra', 'naturaleza', 'árbol', 'flor', 'roca', 'montaña'
    ],
    fr: [
      'eau', 'feu', 'terre', 'air', 'vent', 'lumière', 'sombre', 'obscurité', 'soleil',
      'lune', 'étoiles', 'nuage', 'pluie', 'neige', 'glace', 'tempête', 'tonnerre', 
      'éclair', 'arc-en-ciel', 'ombre', 'nature', 'arbre', 'fleur', 'rocher', 'montagne'
    ],
    de: [
      'wasser', 'feuer', 'erde', 'luft', 'wind', 'licht', 'dunkel', 'dunkelheit', 'sonne',
      'mond', 'sterne', 'wolke', 'regen', 'schnee', 'eis', 'sturm', 'donner', 
      'blitz', 'regenbogen', 'schatten', 'natur', 'baum', 'blume', 'felsen', 'berg'
    ]
  },
  concepts: {
    en: [
      'time', 'death', 'life', 'birth', 'future', 'past', 'memory', 'dream', 
      'nightmare', 'reality', 'fantasy', 'magic', 'power', 'control', 'freedom', 
      'escape', 'transformation', 'change', 'beginning', 'end', 'infinity', 
      'universe', 'world', 'dimension', 'portal', 'door'
    ],
    it: [
      'tempo', 'morte', 'vita', 'nascita', 'futuro', 'passato', 'memoria', 'sogno', 
      'incubo', 'realtà', 'fantasia', 'magia', 'potere', 'controllo', 'libertà', 
      'fuga', 'trasformazione', 'cambiamento', 'inizio', 'fine', 'infinito', 
      'universo', 'mondo', 'dimensione', 'portale', 'porta'
    ],
    es: [
      'tiempo', 'muerte', 'vida', 'nacimiento', 'futuro', 'pasado', 'memoria', 'sueño', 
      'pesadilla', 'realidad', 'fantasía', 'magia', 'poder', 'control', 'libertad', 
      'escape', 'transformación', 'cambio', 'comienzo', 'fin', 'infinito', 
      'universo', 'mundo', 'dimensión', 'portal', 'puerta'
    ],
    fr: [
      'temps', 'mort', 'vie', 'naissance', 'futur', 'passé', 'mémoire', 'rêve', 
      'cauchemar', 'réalité', 'fantaisie', 'magie', 'pouvoir', 'contrôle', 'liberté', 
      'évasion', 'transformation', 'changement', 'début', 'fin', 'infini', 
      'univers', 'monde', 'dimension', 'portail', 'porte'
    ],
    de: [
      'zeit', 'tod', 'leben', 'geburt', 'zukunft', 'vergangenheit', 'erinnerung', 'traum', 
      'albtraum', 'realität', 'fantasie', 'magie', 'kraft', 'kontrolle', 'freiheit', 
      'flucht', 'verwandlung', 'veränderung', 'anfang', 'ende', 'unendlichkeit', 
      'universum', 'welt', 'dimension', 'portal', 'tür'
    ]
  }
};

// Language-specific keyword maps
const keywordCategoriesByLang: Record<string, Map<string, string>> = {};

// Initialize maps for each supported language
const supportedLanguages = ['en', 'it', 'es', 'fr', 'de'];

for (const lang of supportedLanguages) {
  keywordCategoriesByLang[lang] = new Map<string, string>();
  
  // Populate language-specific keyword maps
  for (const [category, langKeywords] of Object.entries(tagCategories)) {
    if (langKeywords[lang]) {
      for (const keyword of langKeywords[lang]) {
        keywordCategoriesByLang[lang].set(keyword, category);
      }
    }
  }
}

/**
 * Generates tags from dream content
 * @param content The dream description
 * @param language The language of the content
 * @returns Array of tags
 */
export async function generateTags(content: string, language: string): Promise<string[]> {
  // Convert content to lowercase for easier matching
  const normalizedContent = content.toLowerCase();
  
  // Map ISO language codes to our supported codes
  const langCode = matchLanguage(language);
  
  // Use a Set to avoid duplicate tags
  const tagsSet = new Set<string>();
  
  // Tag scoring system to prioritize better matches
  const tagScores: Record<string, number> = {};
  
  // Get category representatives (one tag per category to ensure diversity)
  const categoryTags: Record<string, string[]> = {
    places: [],
    actions: [],
    emotions: [],
    characters: [],
    elements: [],
    concepts: []
  };
  
  // Match language-specific tags first
  if (keywordCategoriesByLang[langCode]) {
    const keywordMap = keywordCategoriesByLang[langCode];
    
    // First pass: exact phrase match (highest priority)
    keywordMap.forEach((category, keyword) => {
      try {
        // Check for exact phrase match
        if (normalizedContent.includes(` ${keyword} `) || 
            normalizedContent.startsWith(`${keyword} `) || 
            normalizedContent.endsWith(` ${keyword}`) || 
            normalizedContent === keyword) {
          // Add to category-specific array with high score
          categoryTags[category].push(keyword);
          tagsSet.add(keyword);
          tagScores[keyword] = 10; // Higher score for exact matches
        }
      } catch (e) {
        // Error handling fallback - should never happen with this approach
        console.error("Error in exact phrase matching:", e);
      }
    });
    
    // Second pass: word boundary match
    keywordMap.forEach((category, keyword) => {
      if (!tagsSet.has(keyword)) { // Skip if already added
        try {
          // Word boundary regex
          const regex = new RegExp(`(^|\\W)${keyword}(\\W|$)`, 'i');
          if (regex.test(normalizedContent)) {
            categoryTags[category].push(keyword);
            tagsSet.add(keyword);
            tagScores[keyword] = 8; // Good score for word boundary matches
          }
        } catch (e) {
          // In case of regex compilation error, fall back to includes for short keywords
          if (keyword.length <= 4 && normalizedContent.includes(` ${keyword} `)) {
            categoryTags[category].push(keyword);
            tagsSet.add(keyword);
            tagScores[keyword] = 6;
          }
        }
      }
    });
    
    // Third pass: partial word match for longer words (for handling conjugations, plurals, etc.)
    if (tagsSet.size < 5) {
      keywordMap.forEach((category, keyword) => {
        // Only consider keywords with 5+ characters for partial matching
        // and only if we haven't already added this keyword
        if (keyword.length >= 5 && !tagsSet.has(keyword)) {
          // For Italian verbs, check common conjugation patterns
          if (langCode === 'it' && category === 'actions') {
            // Check for common verb conjugations in Italian
            // Examples: volare -> volavo, volando, vola, etc.
            const wordRoot = keyword.substring(0, keyword.length - 3); // Remove 'are', 'ere', 'ire'
            if (wordRoot.length >= 3) {
              const conjugationRegex = new RegExp(`\\b${wordRoot}[a-z]{1,5}\\b`, 'i');
              if (conjugationRegex.test(normalizedContent)) {
                categoryTags[category].push(keyword);
                tagsSet.add(keyword);
                tagScores[keyword] = 7; // Good score for conjugation matches
                return; // Skip the standard substring check
              }
            }
          }
          
          // For plurals and general partial matches
          if (normalizedContent.includes(keyword.substring(0, keyword.length - 1))) {
            categoryTags[category].push(keyword);
            tagsSet.add(keyword);
            tagScores[keyword] = 5; // Lower score for partial matches
          }
        }
      });
    }
    
    // Fourth pass: context-aware special cases based on combinations of words
    if (normalizedContent.includes('astronave') || normalizedContent.includes('navicella')) {
      // These often go together
      if (!tagsSet.has('astronave')) {
        categoryTags['places'].push('astronave');
        tagsSet.add('astronave');
        tagScores['astronave'] = 9;
      }
      
      // If we mention spacecraft, we might be dealing with aliens
      if (!tagsSet.has('alieno') && normalizedContent.match(/\b(alien|extraterr|marz)/i)) {
        categoryTags['characters'].push('alieno');
        tagsSet.add('alieno');
        tagScores['alieno'] = 8;
      }
    }
    
    // If we see "andare" or "andavamo" with "marte", add "spazio" as a tag
    if ((normalizedContent.includes('andare') || normalizedContent.includes('andavamo') || 
         normalizedContent.includes('andando')) && 
        (normalizedContent.includes('marte') || normalizedContent.includes('pianeta'))) {
      if (!tagsSet.has('spazio')) {
        categoryTags['places'].push('spazio');
        tagsSet.add('spazio');
        tagScores['spazio'] = 9;
      }
    }
  }
  
  // Look for English tags as a fallback if we don't have enough
  if (langCode !== 'en' && tagsSet.size < 4) {
    const englishKeywordMap = keywordCategoriesByLang['en'];
    
    englishKeywordMap.forEach((category, keyword) => {
      if (!tagsSet.has(keyword)) { // Skip if already added in native language
        try {
          const regex = new RegExp(`(^|\\W)${keyword}(\\W|$)`, 'i');
          if (regex.test(normalizedContent)) {
            categoryTags[category].push(keyword);
            tagsSet.add(keyword);
            tagScores[keyword] = 4; // Lower score for English fallbacks
          }
        } catch (e) {
          // Fallback
          if (normalizedContent.includes(keyword)) {
            categoryTags[category].push(keyword);
            tagsSet.add(keyword);
            tagScores[keyword] = 3;
          }
        }
      }
    });
  }
  
  // Select the best tags, prioritizing category diversity and scores
  const prioritizedTags: string[] = [];
  
  // Sort keywords in each category by score
  for (const category of Object.keys(categoryTags)) {
    if (categoryTags[category].length > 0) {
      // Sort tags within each category by score (highest first)
      categoryTags[category].sort((a, b) => (tagScores[b] || 0) - (tagScores[a] || 0));
      
      // Take the highest-scoring tag from this category
      prioritizedTags.push(categoryTags[category][0]);
    }
  }
  
  // Add remaining tags if we don't have enough
  if (prioritizedTags.length < 5) {
    // Get all remaining tags, sorted by score
    const remainingTags = Array.from(tagsSet)
      .filter(tag => !prioritizedTags.includes(tag))
      .sort((a, b) => (tagScores[b] || 0) - (tagScores[a] || 0));
    
    prioritizedTags.push(...remainingTags.slice(0, 5 - prioritizedTags.length));
  }
  
  const finalTags = prioritizedTags.slice(0, 5);
  
  // If still no tags found, provide some generic tags based on language
  if (finalTags.length === 0) {
    switch(langCode) {
      case 'it':
        return ['sogno', 'mistero', 'esperienza'];
      case 'es':
        return ['sueño', 'misterio', 'experiencia'];
      case 'fr':
        return ['rêve', 'mystère', 'expérience'];
      case 'de':
        return ['traum', 'mysterium', 'erfahrung'];
      default: // English or any other
        return ['dream', 'mystery', 'experience'];
    }
  }
  
  return finalTags;
}

/**
 * Maps any language code to our supported languages
 */
function matchLanguage(lang: string): string {
  // Normalize language code (e.g., 'it-IT' -> 'it')
  const normLang = lang.split('-')[0].toLowerCase();
  
  // Check if language is directly supported
  if (supportedLanguages.includes(normLang)) {
    return normLang;
  }
  
  // Language family fallbacks
  const languageFamilies: Record<string, string> = {
    // Spanish variants
    'es_mx': 'es', 'es_ar': 'es', 'es_co': 'es',
    // French variants
    'fr_ca': 'fr', 'fr_be': 'fr', 'fr_ch': 'fr',
    // German variants
    'de_at': 'de', 'de_ch': 'de',
    // Italian variants
    'it_ch': 'it'
  };
  
  if (languageFamilies[normLang]) {
    return languageFamilies[normLang];
  }
  
  // Default to English
  return 'en';
}

/**
 * Calculate the similarity between two dream contents
 * @param content1 First dream content
 * @param content2 Second dream content
 * @returns Similarity score (0-100)
 */
export function calculateSimilarity(content1: string, content2: string): number {
  if (!content1 || !content2) return 0;
  
  // Normalize and tokenize text
  const text1 = content1.toLowerCase();
  const text2 = content2.toLowerCase();
  
  // Extract significant words (3+ chars)
  const words1 = text1.split(/\W+/).filter(word => word.length > 3);
  const words2 = text2.split(/\W+/).filter(word => word.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Create Sets for faster lookups
  const uniqueWords1 = new Set(words1);
  const uniqueWords2 = new Set(words2);
  
  // Count common words
  let commonWords = 0;
  for (const word of uniqueWords1) {
    if (uniqueWords2.has(word)) {
      commonWords++;
    }
  }
  
  // Calculate weighted similarity score
  // Base Jaccard similarity
  const totalUniqueWords = uniqueWords1.size + uniqueWords2.size - commonWords;
  if (totalUniqueWords === 0) return 0;
  const jaccardSimilarity = (commonWords / totalUniqueWords) * 100;
  
  // Length similarity - penalize large differences in length
  const shorterLength = Math.min(text1.length, text2.length);
  const longerLength = Math.max(text1.length, text2.length);
  const lengthRatio = shorterLength / longerLength;
  const lengthSimilarity = lengthRatio * 100;
  
  // Keyword density - if common words represent a high percentage of either text, boost similarity
  const keywordDensity1 = commonWords / uniqueWords1.size;
  const keywordDensity2 = commonWords / uniqueWords2.size;
  const keywordDensityBoost = Math.max(keywordDensity1, keywordDensity2) * 20; // gives 0-20% boost
  
  // Final weighted score - emphasize Jaccard similarity but consider other factors
  const weightedScore = (jaccardSimilarity * 0.65) + 
                        (lengthSimilarity * 0.15) + 
                        (keywordDensityBoost * 0.2);
  
  // Ensure score is in 0-100 range
  return Math.min(100, Math.max(0, weightedScore));
}
