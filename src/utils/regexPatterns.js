/**
 * Collection of regex patterns to detect common off-platform communication attempts
 * Simplified to include only email, phone, social media and obfuscation patterns.
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
  /\b(?:facebook|fb|insta|instagram|twitter|x\.com|tiktok|discord|snap|snapchat|reddit|telegram|whatsapp|signal|youtube|linkedin)\s?(?:[:.]|username|handle|profile|id)?\s?[:#@]?\s?[\w.]{3,30}\b/gi,
  /\b@[\w.]{3,30}\b/g, // Generic handle with @
];

// Obfuscation patterns (attempts to hide contact info)
const OBFUSCATION_PATTERNS = [
  /\b\d+\s*[oO0]\s*\d+\s*[oO0]\s*\d+\s*[oO0]\s*\d+\b/g, // Replacing zeros with letter 'o'
  /f\s*a\s*c\s*e\s*b\s*o\s*o\s*k/gi, // Spaced out platform names
  /i\s*n\s*s\s*t\s*a\s*g\s*r\s*a\s*m/gi,
  /t\s*e\s*l\s*e\s*g\s*r\s*a\s*m/gi,
  /w\s*h\s*a\s*t\s*s\s*a\s*p\s*p/gi,
];

// Combined pattern dictionary with only the selected patterns
const ALL_PATTERNS = {
  email: EMAIL_PATTERNS,
  phone: PHONE_PATTERNS,
  socialMedia: SOCIAL_MEDIA_PATTERNS,
  obfuscation: OBFUSCATION_PATTERNS,
};

/**
 * Tests if a message contains potential off-platform communication attempts using regex patterns
 *
 * @param {string} message - The message to check
 * @returns {{detected: boolean, pattern: string}} Result with detection status and pattern type
 */
export function basicRegexCheck(message) {
  if (!message || typeof message !== "string") {
    return { detected: false, pattern: "" };
  }

  // Only check selected pattern types
  const patternTypes = ["email", "phone", "socialMedia", "obfuscation"];

  for (const patternType of patternTypes) {
    const patterns = ALL_PATTERNS[patternType];

    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return {
          detected: true,
          pattern: patternType,
        };
      }
    }
  }

  return { detected: false, pattern: "" };
}

/**
 * Extracts potential contact information from a message
 * Useful for logging or reporting purposes
 *
 * @param {string} message - The message to extract from
 * @returns {Object} Object containing extracted patterns by type
 */
export function extractContactInfo(message) {
  if (!message || typeof message !== "string") {
    return {};
  }

  const result = {};

  // Extract each type of pattern
  for (const patternType in ALL_PATTERNS) {
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
  if (!message || typeof message !== "string") {
    return { score: 0, keywords: [] };
  }

  const intentKeywords = [
    /\b(?:contact|reach|message|chat|talk|communicate|connect|meet|find|add)\b/gi,
    /\b(?:outside|elsewhere|privately|direct|dm|pm|offsite|off-site|off site)\b/gi,
    /\b(?:give me your|send me your|what's your|share your|do you have)\b/gi,
  ];

  let score = 0;
  const foundKeywords = [];

  intentKeywords.forEach((pattern) => {
    const matches = message.match(pattern);
    if (matches) {
      score += matches.length;
      foundKeywords.push(...matches);
    }
  });

  return {
    score: Math.min(score, 10), // Cap at 10
    keywords: [...new Set(foundKeywords)], // Remove duplicates
  };
}
