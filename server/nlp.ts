import natural from 'natural';
import compromise from 'compromise';
import keywordExtractor from 'keyword-extractor';

/**
 * Avanzato modulo NLP per generare tag dai contenuti dei sogni
 * Utilizza tecniche di elaborazione del linguaggio naturale per estrarre automaticamente tag significativi
 * Nessun dizionario predefinito di parole chiave, ma algoritmi automatici di estrazione
 */

// Inizializziamo i tokenizer per diverse lingue
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Lingue supportate
const supportedLanguages = ['en', 'it', 'es', 'fr', 'de'];

/**
 * Ottieni tag generici quando non è stato possibile estrarre tag significativi
 * @param language Codice della lingua
 * @returns Array di tag generici
 */
function getGenericTags(language: string): string[] {
  switch(language) {
    case 'it':
      return ['sogno', 'mistero', 'esperienza', 'immaginazione', 'emozione'];
    case 'es':
      return ['sueño', 'misterio', 'experiencia', 'imaginación', 'emoción'];
    case 'fr':
      return ['rêve', 'mystère', 'expérience', 'imagination', 'émotion'];
    case 'de':
      return ['traum', 'mysterium', 'erfahrung', 'vorstellung', 'gefühl'];
    default: // English o qualsiasi altra lingua
      return ['dream', 'mystery', 'experience', 'imagination', 'emotion'];
  }
}

/**
 * Mappa qualsiasi codice lingua alle nostre lingue supportate
 * @param lang Codice lingua
 * @returns Codice lingua normalizzato
 */
function matchLanguage(lang: string): string {
  // Normalizza il codice lingua (es. 'it-IT' -> 'it')
  const normLang = lang.split('-')[0].toLowerCase();
  
  // Controlla se la lingua è direttamente supportata
  if (supportedLanguages.includes(normLang)) {
    return normLang;
  }
  
  // Fallback per varianti linguistiche
  const languageFamilies: Record<string, string> = {
    // Varianti spagnole
    'es_mx': 'es', 'es_ar': 'es', 'es_co': 'es',
    // Varianti francesi
    'fr_ca': 'fr', 'fr_be': 'fr', 'fr_ch': 'fr',
    // Varianti tedesche
    'de_at': 'de', 'de_ch': 'de',
    // Varianti italiane
    'it_ch': 'it'
  };
  
  if (languageFamilies[normLang]) {
    return languageFamilies[normLang];
  }
  
  // Default a inglese
  return 'en';
}

/**
 * Aggiungi termini comuni relativi ai sogni come tag di fallback
 * @param tagSet Set di candidati tag da aumentare
 * @param scoreMap Mappa dei punteggi da aggiornare
 * @param language Codice della lingua da utilizzare
 */
function addDreamRelatedTags(
  tagSet: Set<string>, 
  scoreMap: Record<string, number>, 
  language: string
) {
  // Temi comuni dei sogni per lingua
  const dreamThemes: Record<string, string[]> = {
    'en': ['dream', 'flying', 'falling', 'chase', 'water', 'family', 'journey'],
    'it': ['sogno', 'volare', 'cadere', 'inseguimento', 'acqua', 'famiglia', 'viaggio'],
    'es': ['sueño', 'volar', 'caer', 'persecución', 'agua', 'familia', 'viaje'],
    'fr': ['rêve', 'voler', 'tomber', 'poursuite', 'eau', 'famille', 'voyage'],
    'de': ['traum', 'fliegen', 'fallen', 'verfolgung', 'wasser', 'familie', 'reise']
  };
  
  // Ottieni la lista appropriata per la lingua
  const themeList = dreamThemes[language] || dreamThemes['en'];
  
  // Aggiungi temi ai candidati con punteggi bassi (così vengono usati solo se non viene trovato nulla di meglio)
  for (const theme of themeList) {
    if (!tagSet.has(theme)) {
      tagSet.add(theme);
      scoreMap[theme] = 1;  // Punteggio basso così vengono usati solo come fallback
    }
  }
}

/**
 * Genera tag dal contenuto di un sogno utilizzando tecniche NLP
 * @param content Descrizione del sogno
 * @param language Lingua del contenuto
 * @returns Array di tag
 */
export async function generateTags(content: string, language: string): Promise<string[]> {
  if (!content || content.trim().length === 0) {
    return getGenericTags(language);
  }

  // Normalizza il codice della lingua
  const langCode = matchLanguage(language);
  
  // Crea una versione pulita del testo
  const cleanedContent = content
    .replace(/[^\w\s\u00C0-\u017F]/g, ' ')
    .toLowerCase()
    .trim();
  
  // Estrai i candidati per i tag utilizzando diverse tecniche
  const tagCandidates = new Set<string>();
  const tagScores: Record<string, number> = {};

  // 1. Riconoscimento delle entità con compromise
  try {
    const doc = compromise(cleanedContent);
    const entities: string[] = [];
    
    // Estrai persone se disponibile
    if (doc.people && typeof doc.people === 'function') {
      const people = doc.people().out('array');
      entities.push(...people);
    }
    
    // Estrai luoghi se disponibile
    if (doc.places && typeof doc.places === 'function') {
      const places = doc.places().out('array');
      entities.push(...places);
    }
    
    // Aggiungi le entità estratte ai candidati
    for (const entity of entities) {
      if (entity && entity.length > 2) {
        const normalizedEntity = entity.toLowerCase().trim();
        tagCandidates.add(normalizedEntity);
        tagScores[normalizedEntity] = 8; // Alto punteggio per le entità riconosciute
      }
    }
  } catch (error) {
    console.error('Entity extraction error:', error);
  }

  // 2. Estrai sostantivi e verbi con compromise
  try {
    const doc = compromise(cleanedContent);
    
    // Estrai sostantivi
    if (doc.nouns && typeof doc.nouns === 'function') {
      const nouns = doc.nouns().out('array');
      for (const noun of nouns) {
        if (noun && noun.length > 3) {
          const normalizedNoun = noun.toLowerCase().trim();
          tagCandidates.add(normalizedNoun);
          tagScores[normalizedNoun] = tagScores[normalizedNoun] || 5;
        }
      }
    }
    
    // Estrai verbi
    if (doc.verbs && typeof doc.verbs === 'function') {
      const verbs = doc.verbs().out('array');
      for (const verb of verbs) {
        if (verb && verb.length > 3) {
          // Rimuovi le desinenze comuni per ottenere la forma base del verbo
          const normalizedVerb = verb.toLowerCase()
            .replace(/ing$|ed$|s$|ando$|endo$|are$|ere$|ire$/, '')
            .trim();
            
          if (normalizedVerb.length > 3) {
            tagCandidates.add(normalizedVerb);
            tagScores[normalizedVerb] = tagScores[normalizedVerb] || 4;
          }
        }
      }
    }
  } catch (error) {
    console.error('POS tagging error:', error);
  }

  // 3. Usa keyword-extractor per l'estrazione di parole chiave specifiche per lingua
  try {
    // Mappa i nostri codici linguistici a quelli supportati da keyword-extractor
    const extractorLangMap: Record<string, string> = {
      'en': 'english',
      'it': 'italian',
      'es': 'spanish',
      'fr': 'french',
      'de': 'german'
    };
    
    const extractorLang = extractorLangMap[langCode] || 'english';
    
    const extractionResult = keywordExtractor.extract(cleanedContent, {
      language: extractorLang as any, // Type assertion per evitare l'errore
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    });
    
    for (const keyword of extractionResult) {
      if (keyword && keyword.length > 3) {
        tagCandidates.add(keyword);
        // Aumenta il punteggio se già rilevato da altri metodi
        tagScores[keyword] = (tagScores[keyword] || 0) + 3;
      }
    }
  } catch (error) {
    console.error('Keyword extraction error:', error);
  }

  // 4. Usa TF-IDF per valutare i termini in base all'importanza
  try {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(cleanedContent);
    
    // Ottieni i termini principali
    tfidf.listTerms(0).forEach(item => {
      if (item.term && item.term.length > 3 && !/^\d+$/.test(item.term)) {
        // Aggiungi ai candidati se non già presente
        tagCandidates.add(item.term);
        // Usa il punteggio TF-IDF per influenzare il nostro punteggio (normalizza a 0-10)
        const normalizedScore = Math.min(10, Math.max(0, item.tfidf * 2));
        tagScores[item.term] = (tagScores[item.term] || 0) + normalizedScore;
      }
    });
  } catch (error) {
    console.error('TF-IDF error:', error);
  }

  // 5. Tokenizzazione e analisi di frequenza
  try {
    const tokens = tokenizer.tokenize(cleanedContent);
    const frequencies: Record<string, number> = {};
    
    // Conta le frequenze dei token
    for (const token of tokens) {
      if (token && token.length > 3) {
        const normalizedToken = token.toLowerCase();
        frequencies[normalizedToken] = (frequencies[normalizedToken] || 0) + 1;
        
        // Aggiungi i token frequenti ai candidati
        if (frequencies[normalizedToken] > 1) {
          tagCandidates.add(normalizedToken);
          // Bonus di frequenza
          tagScores[normalizedToken] = (tagScores[normalizedToken] || 0) + 
                                     Math.min(3, frequencies[normalizedToken]);
        }
      }
    }
  } catch (error) {
    console.error('Tokenization error:', error);
  }

  // 6. Stemming per raggruppare parole correlate
  try {
    // Crea una mappa di stems a parole originali
    const stemMap: Record<string, string[]> = {};
    
    // Esamina i nostri candidati tag
    const candidatesArray = Array.from(tagCandidates);
    for (const tag of candidatesArray) {
      try {
        // Ottieni lo stem
        const stem = stemmer.stem(tag);
        
        // Inizializza l'array se è la prima volta che vediamo questo stem
        if (!stemMap[stem]) {
          stemMap[stem] = [];
        }
        
        // Aggiungi questo tag all'array per questo stem
        stemMap[stem].push(tag);
      } catch (e) {
        // Salta i termini problematici
        continue;
      }
    }
    
    // Per ogni stem, mantieni solo il termine con il punteggio più alto o più frequente
    for (const [stem, relatedTags] of Object.entries(stemMap)) {
      if (relatedTags.length > 1) {
        // Ordina per punteggio
        relatedTags.sort((a, b) => (tagScores[b] || 0) - (tagScores[a] || 0));
        
        // Mantieni solo il tag con il punteggio più alto
        const bestTag = relatedTags[0];
        
        // Rimuovi gli altri dai candidati
        for (let i = 1; i < relatedTags.length; i++) {
          tagCandidates.delete(relatedTags[i]);
        }
        
        // Aumenta leggermente il punteggio del miglior tag
        tagScores[bestTag] = (tagScores[bestTag] || 0) + 1;
      }
    }
  } catch (error) {
    console.error('Stemming error:', error);
  }
  
  // 7. Analisi della coesione semantica
  try {
    // Identifica gruppi di parole che potrebbero formare concetti coesi
    const phrases = cleanedContent.split(/[,.!?;:]/g).filter(p => p.trim().length > 0);
    
    for (const phrase of phrases) {
      if (phrase.split(/\s+/).length >= 2 && phrase.split(/\s+/).length <= 4) {
        // Questa è una frase di lunghezza ragionevole, potrebbe essere un concetto coeso
        const normalizedPhrase = phrase.trim().toLowerCase();
        
        // Controlla se la frase contiene parti di tagCandidates già trovati
        let containsCandidate = false;
        const candidatesArray = Array.from(tagCandidates);
        for (const candidate of candidatesArray) {
          if (normalizedPhrase.includes(candidate)) {
            containsCandidate = true;
            break;
          }
        }
        
        // Se contiene candidati esistenti, potrebbe essere una frase significativa
        if (containsCandidate) {
          // Prendi la frase come un unico tag se non è troppo lunga
          if (normalizedPhrase.length < 25) {
            tagCandidates.add(normalizedPhrase);
            tagScores[normalizedPhrase] = 6; // Buon punteggio per frasi semanticamente coese
          }
        }
      }
    }
  } catch (error) {
    console.error('Semantic cohesion analysis error:', error);
  }

  // Se non abbiamo abbastanza candidati, aggiungi termini comuni relativi ai sogni
  if (tagCandidates.size < 5) {
    addDreamRelatedTags(tagCandidates, tagScores, langCode);
  }

  // Converti il set in array per ordinamento e selezione finale
  const tagArray = Array.from(tagCandidates);
  
  // Ordina tag per punteggio (più alto prima)
  tagArray.sort((a, b) => (tagScores[b] || 0) - (tagScores[a] || 0));
  
  // Prendi i migliori 5 tag
  let finalTags = tagArray.slice(0, 5);
  
  // Controllo finale di qualità: rimuovi tag con meno di 3 caratteri
  finalTags = finalTags.filter(tag => tag.length >= 3);
  
  // Se non abbiamo trovato tag, restituisci quelli generici
  if (finalTags.length === 0) {
    return getGenericTags(langCode);
  }
  
  return finalTags;
}

/**
 * Calcola la similarità tra due contenuti di sogni
 * @param content1 Primo contenuto di sogno
 * @param content2 Secondo contenuto di sogno
 * @returns Punteggio di similarità (0-100)
 */
export function calculateSimilarity(content1: string, content2: string): number {
  if (!content1 || !content2) return 0;
  
  // Normalizza e tokenizza il testo
  const text1 = content1.toLowerCase();
  const text2 = content2.toLowerCase();
  
  // Estrai parole significative (3+ caratteri)
  const words1 = text1.split(/\W+/).filter(word => word.length > 3);
  const words2 = text2.split(/\W+/).filter(word => word.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Crea Sets per ricerche più veloci
  const uniqueWords1 = new Set(words1);
  const uniqueWords2 = new Set(words2);
  
  // Conta le parole comuni
  let commonWords = 0;
  
  // Utilizza Array.from per convertire il Set in array e iterare in modo compatibile
  Array.from(uniqueWords1).forEach(word => {
    if (uniqueWords2.has(word)) {
      commonWords++;
    }
  });
  
  // Calcola punteggio di similarità pesato
  // Similarità Jaccard di base
  const totalUniqueWords = uniqueWords1.size + uniqueWords2.size - commonWords;
  if (totalUniqueWords === 0) return 0;
  const jaccardSimilarity = (commonWords / totalUniqueWords) * 100;
  
  // Similarità di lunghezza - penalizza grandi differenze di lunghezza
  const shorterLength = Math.min(text1.length, text2.length);
  const longerLength = Math.max(text1.length, text2.length);
  const lengthRatio = shorterLength / longerLength;
  const lengthSimilarity = lengthRatio * 100;
  
  // Densità di parole chiave - se le parole comuni rappresentano un'alta percentuale di entrambi i testi, aumenta la similarità
  const keywordDensity1 = commonWords / uniqueWords1.size;
  const keywordDensity2 = commonWords / uniqueWords2.size;
  const keywordDensityBoost = Math.max(keywordDensity1, keywordDensity2) * 20; // da 0-20% boost
  
  // Punteggio finale pesato - enfatizza la similarità Jaccard ma considera altri fattori
  const weightedScore = (jaccardSimilarity * 0.65) + 
                        (lengthSimilarity * 0.15) + 
                        (keywordDensityBoost * 0.2);
  
  // Assicura che il punteggio sia nell'intervallo 0-100
  return Math.min(100, Math.max(0, weightedScore));
}