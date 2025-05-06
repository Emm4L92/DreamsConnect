// Simple NLP for generating tags from dream descriptions
// In a production environment, this could be replaced with more sophisticated NLP libraries
// or API calls to services like OpenAI

/**
 * A set of predefined categories and their related keywords
 */
const tagCategories = {
  places: [
    'house', 'home', 'building', 'city', 'mountain', 'mountains', 'ocean', 'sea', 
    'beach', 'forest', 'woods', 'jungle', 'desert', 'river', 'lake', 'island', 
    'cave', 'castle', 'school', 'office', 'hospital', 'church', 'park', 'garden',
    'sky', 'space', 'underwater', 'subway', 'train', 'airplane', 'car', 'road', 'street'
  ],
  actions: [
    'flying', 'falling', 'running', 'swimming', 'walking', 'jumping', 'climbing',
    'fighting', 'hiding', 'escaping', 'chasing', 'searching', 'finding', 'losing',
    'talking', 'singing', 'dancing', 'eating', 'drinking', 'sleeping', 'waking',
    'traveling', 'driving', 'riding', 'sailing', 'diving', 'floating'
  ],
  emotions: [
    'fear', 'afraid', 'scared', 'happy', 'excited', 'sad', 'angry', 'confused',
    'lost', 'alone', 'trapped', 'free', 'peaceful', 'calm', 'anxious', 'stressed',
    'overwhelmed', 'love', 'hate', 'joy', 'sorrow', 'surprise', 'disgust', 'shame',
    'embarrassed', 'proud', 'guilty', 'jealous', 'envious', 'nostalgic'
  ],
  characters: [
    'family', 'friend', 'stranger', 'monster', 'animal', 'dog', 'cat', 'bird',
    'snake', 'spider', 'insect', 'bear', 'wolf', 'lion', 'tiger', 'fish', 'shark',
    'human', 'child', 'adult', 'parent', 'mother', 'father', 'sister', 'brother',
    'baby', 'ghost', 'spirit', 'angel', 'demon', 'alien', 'robot', 'zombie'
  ],
  elements: [
    'water', 'fire', 'earth', 'air', 'wind', 'light', 'dark', 'darkness', 'sun',
    'moon', 'stars', 'cloud', 'clouds', 'rain', 'snow', 'ice', 'storm', 'thunder', 
    'lightning', 'rainbow', 'shadow', 'nature', 'tree', 'trees', 'flower', 'flowers',
    'rock', 'rocks', 'mountain', 'mountains', 'metal'
  ],
  concepts: [
    'time', 'death', 'life', 'birth', 'future', 'past', 'memory', 'memories',
    'dream', 'nightmare', 'reality', 'fantasy', 'magic', 'power', 'control',
    'freedom', 'prison', 'escape', 'transformation', 'change', 'beginning', 'end',
    'infinity', 'void', 'universe', 'world', 'dimension', 'portal', 'door', 'gates'
  ]
};

// Flattened list of all keywords with their categories
const keywordCategories: Map<string, string> = new Map();
for (const [category, keywords] of Object.entries(tagCategories)) {
  for (const keyword of keywords) {
    keywordCategories.set(keyword, category);
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
  
  // Use a Set to avoid duplicate tags
  const tagsSet = new Set<string>();
  
  // Find matching keywords in the content
  for (const keyword of keywordCategories.keys()) {
    // Simple word boundary check to match whole words
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(normalizedContent)) {
      tagsSet.add(keyword);
    }
  }
  
  // If we don't have enough tags, try partial matching for longer content
  if (tagsSet.size < 3 && normalizedContent.length > 50) {
    for (const keyword of keywordCategories.keys()) {
      if (normalizedContent.includes(keyword) && keyword.length > 4) {
        tagsSet.add(keyword);
      }
    }
  }
  
  // Convert the Set back to an array and limit to 5 tags
  const tags = Array.from(tagsSet).slice(0, 5);
  
  // If still no tags found, provide some generic tags based on language
  if (tags.length === 0) {
    switch(language) {
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
  
  return tags;
}

/**
 * Calculate the similarity between two dream contents
 * @param content1 First dream content
 * @param content2 Second dream content
 * @returns Similarity score (0-100)
 */
export function calculateSimilarity(content1: string, content2: string): number {
  // Simple implementation based on common keywords
  const words1 = new Set(content1.toLowerCase().split(/\W+/).filter(word => word.length > 3));
  const words2 = new Set(content2.toLowerCase().split(/\W+/).filter(word => word.length > 3));
  
  // Count words in common
  let commonCount = 0;
  for (const word of words1) {
    if (words2.has(word)) {
      commonCount++;
    }
  }
  
  // Calculate Jaccard similarity
  const totalUniqueWords = new Set([...words1, ...words2]).size;
  if (totalUniqueWords === 0) return 0;
  
  return (commonCount / totalUniqueWords) * 100;
}
