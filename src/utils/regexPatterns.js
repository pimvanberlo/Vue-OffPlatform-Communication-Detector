/**
 * Collection of regex patterns to detect common off-platform communication attempts
 * Patterns include phone numbers, emails, social media handles, etc. in multiple languages
 */

// Email patterns
const EMAIL_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // Standard email
  /\b[A-Za-z0-9._%+-]+\s?[\[\(]at[\]\)]\s?[A-Za-z0-9.-]+\s?[\[\(]dot[\]\)]\s?[A-Za-z]{2,}\b/gi, // Obfuscated email with (at) and (dot)
  /\b[A-Za-z0-9._%+-]+\s?[@＠]\s?[A-Za-z0-9.-]+\s?[.．]\s?[A-Za-z]{2,}\b/g, // Email with spaces or special chars
];

// Phone number patterns (international formats)
const PHONE_PATTERNS = [
  /\b(?:\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // North American: +1 123-456-7890
  /\b(?:\+\d{1,3}[-\s]?)?\d{1,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}\b/g, // International variable formats
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Simple 10-digit: 123-456-7890
  /\b\d{5}[-.\s]?\d{6}\b/g, // Asian format: 12345-123456
];

// Social media handles
const SOCIAL_MEDIA_PATTERNS = [
  /\b(?:facebook|fb|insta|instagram|twitter|x.com|tiktok|discord|snap|snapchat|reddit|telegram|whatsapp|signal|youtube|linkedin)\s?(?:[:.]|username|handle|profile|id)?\s?[:#@]?\s?[\w.]{3,30}\b/gi,
  /\b@[\w.]{3,30}\b/g, // Generic handle with @
  // Removed overly broad pattern that was causing false positives
];

// URL patterns
const URL_PATTERNS = [
  /\bhttps?:\/\/\S+\b/gi, // Full URLs
  /\bwww\.\S+\b/gi, // www URLs
  /\b\S+\.(com|org|net|io|co|me|app|xyz|site|online)\b/gi, // Domain names
  /\b\S+\s?\.\s?(?:com|org|net|io|co|me|app|xyz|site|online)\b/gi, // Domains with spaces or obfuscation
];

// Chat platform invitations
const PLATFORM_INVITATION_PATTERNS = [
  /\b(?:add|join|meet|talk|chat|speak|connect|contact|reach|message|msg|dm|pm|find)\s(?:me|us|with me|with us)?\s(?:on|at|in|via|using|through)\s(?:facebook|fb|insta|instagram|twitter|x.com|tiktok|discord|snap|snapchat|reddit|telegram|whatsapp|signal|youtube|linkedin)\b/gi,
  /\b(?:let's|we can|we could|we should|would you like to|want to|wanna)\s(?:talk|chat|speak|connect|meet)\s(?:on|at|in|via|using|through)\s(?:facebook|fb|insta|instagram|twitter|x.com|tiktok|discord|snap|snapchat|reddit|telegram|whatsapp|signal|youtube|linkedin)\b/gi,
];

// Obfuscation patterns (attempts to hide contact info)
const OBFUSCATION_PATTERNS = [
  /\b\d+\s*[oO0]\s*\d+\s*[oO0]\s*\d+\s*[oO0]\s*\d+\b/g, // Replacing zeros with letter 'o'
  /f\s*a\s*c\s*e\s*b\s*o\s*o\s*k/gi, // Spaced out platform names
  /i\s*n\s*s\s*t\s*a\s*g\s*r\s*a\s*m/gi,
  /t\s*e\s*l\s*e\s*g\s*r\s*a\s*m/gi,
  /w\s*h\s*a\s*t\s*s\s*a\s*p\s*p/gi,
];

// Non-English patterns (common in international contexts)
const INTERNATIONAL_PATTERNS = {
  // Spanish
  es: [
    /\b(?:hablar|chatear|contactar|agregar|añadir|encontrar|buscar)\s(?:me|nos|conmigo)?\s(?:en|por|via|usando|a través de)\s(?:facebook|fb|insta|instagram|twitter|x.com|tiktok|discord|snapchat|reddit|telegram|whatsapp|signal|youtube|linkedin)\b/gi,
  ],
  // French
  fr: [
    /\b(?:parler|discuter|contacter|ajouter|trouver)\s(?:moi|nous|avec moi)?\s(?:sur|via|en utilisant|par)\s(?:facebook|fb|insta|instagram|twitter|x.com|tiktok|discord|snapchat|reddit|telegram|whatsapp|signal|youtube|linkedin)\b/gi,
  ],
  // German
  de: [
    /\b(?:sprechen|chatten|kontaktieren|hinzufügen|finden)\s(?:mich|uns|mit mir)?\s(?:auf|über|mit|durch)\s(?:facebook|fb|insta|instagram|twitter|x.com|tiktok|discord|snapchat|reddit|telegram|whatsapp|signal|youtube|linkedin)\b/gi,
  ],
  // Chinese (simplified patterns for common terms)
  zh: [
    /\b(?:联系|添加|找到)\s?(?:我|我们)?\s?(?:在|通过|用|使用)?\s?(?:微信|QQ|微博|陌陌|抖音|快手)\b/gi,
  ],
  // Japanese
  ja: [
    /\b(?:連絡|追加|見つける)\s?(?:私|私たち)?\s?(?:で|を通じて|を使って)?\s?(?:LINE|インスタ|フェイスブック|ツイッター)\b/gi,
  ],
  // Russian
  ru: [
    /\b(?:говорить|общаться|связаться|добавить|найти)\s(?:меня|нас|со мной)?\s(?:в|на|через|используя)\s(?:телеграм|вконтакте|инстаграм|фейсбук|вацап)\b/gi,
  ]
};

// Combined pattern dictionary
const ALL_PATTERNS = {
  email: EMAIL_PATTERNS,
  phone: PHONE_PATTERNS,
  socialMedia: SOCIAL_MEDIA_PATTERNS,
  url: URL_PATTERNS,
  platformInvitation: PLATFORM_INVITATION_PATTERNS,
  obfuscation: OBFUSCATION_PATTERNS,
  international: INTERNATIONAL_PATTERNS
};

/**
 * Tests if a message contains potential off-platform communication attempts using regex patterns
 * 
 * @param {string} message - The message to check
 * @param {Array<string>} languages - Language codes to check against (e.g., ['en', 'es'])
 * @returns {{detected: boolean, pattern: string}} Result with detection status and pattern type
 */
export function basicRegexCheck(message, languages = ['en']) {
  if (!message || typeof message !== 'string') {
    return { detected: false, pattern: '' };
  }

  // Check standard patterns
  const standardPatterns = ['email', 'phone', 'socialMedia', 'url', 'platformInvitation', 'obfuscation'];
  
  for (const patternType of standardPatterns) {
    const patterns = ALL_PATTERNS[patternType];
    
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return { 
          detected: true, 
          pattern: patternType 
        };
      }
    }
  }
  
  // Check language-specific patterns
  if (languages.length > 0 && languages[0] !== 'en') {
    for (const lang of languages) {
      if (ALL_PATTERNS.international[lang]) {
        for (const pattern of ALL_PATTERNS.international[lang]) {
          if (pattern.test(message)) {
            return { 
              detected: true, 
              pattern: `international (${lang})` 
            };
          }
        }
      }
    }
  }
  
  return { detected: false, pattern: '' };
}

/**
 * Extracts potential contact information from a message
 * Useful for logging or reporting purposes
 * 
 * @param {string} message - The message to extract from
 * @returns {Object} Object containing extracted patterns by type
 */
export function extractContactInfo(message) {
  if (!message || typeof message !== 'string') {
    return {};
  }

  const result = {};
  
  // Extract each type of pattern
  for (const patternType in ALL_PATTERNS) {
    if (patternType === 'international') continue; // Skip international patterns for extraction
    
    const patterns = ALL_PATTERNS[patternType];
    const matches = [];
    
    for (const pattern of patterns) {
      const patternMatches = message.match(pattern);
      if (patternMatches) {
        matches.push(...patternMatches);
      }
    }
    
    if (matches.length > 0) {
      result[patternType] = [...new Set(matches)]; // Remove duplicates
    }
  }
  
  return result;
}

/**
 * Checks if the message contains keywords that might indicate off-platform intent
 * 
 * @param {string} message - The message to analyze
 * @returns {{score: number, keywords: Array<string>}} Score and found keywords
 */
export function intentKeywordCheck(message) {
  if (!message || typeof message !== 'string') {
    return { score: 0, keywords: [] };
  }
  
  const intentKeywords = [
    /\b(?:contact|reach|message|chat|talk|communicate|connect|meet|find|add)\b/gi,
    /\b(?:outside|elsewhere|privately|direct|dm|pm|offsite|off-site|off site)\b/gi,
    /\b(?:give me your|send me your|what's your|share your|do you have)\b/gi
  ];
  
  let score = 0;
  const foundKeywords = [];
  
  intentKeywords.forEach(pattern => {
    const matches = message.match(pattern);
    if (matches) {
      score += matches.length;
      foundKeywords.push(...matches);
    }
  });
  
  return {
    score: Math.min(score, 10), // Cap at 10
    keywords: [...new Set(foundKeywords)] // Remove duplicates
  };
}
