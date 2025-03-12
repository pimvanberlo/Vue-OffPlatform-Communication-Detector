
import { 
  EMAIL_PATTERNS,
  PHONE_PATTERNS,
  SOCIAL_MEDIA_PATTERNS,
  URL_PATTERNS,
  PLATFORM_INVITATION_PATTERNS,
  OBFUSCATION_PATTERNS
} from './regexPatterns';

/**
 * Detects potential off-platform communication attempts using regex patterns
 * 
 * @param {string} message - The message to analyze
 * @returns {{detected: boolean, confidence: number, reason: string}} - Detection result
 */
export function detectWithRegex(message) {
  if (!message || message.length < 6) {
    return { detected: false, confidence: 0, reason: '' };
  }

  // Normalize the message for more accurate detection
  const normalizedMessage = message.toLowerCase().trim();
  
  // Skip detection for very short messages (reduces false positives)
  if (normalizedMessage.length < 15) {
    return { detected: false, confidence: 0, reason: '' };
  }
  
  // Check all pattern groups
  const patterns = [
    { patterns: EMAIL_PATTERNS, type: 'email', confidence: 95, reason: 'Contains email address' },
    { patterns: PHONE_PATTERNS, type: 'phone', confidence: 90, reason: 'Contains phone number' },
    { patterns: SOCIAL_MEDIA_PATTERNS, type: 'social', confidence: 85, reason: 'Contains social media handle' },
    { patterns: URL_PATTERNS, type: 'url', confidence: 80, reason: 'Contains URL or domain name' },
    { patterns: PLATFORM_INVITATION_PATTERNS, type: 'invitation', confidence: 75, reason: 'Contains invitation to another platform' },
    { patterns: OBFUSCATION_PATTERNS, type: 'obfuscation', confidence: 70, reason: 'Contains obfuscated contact information' }
  ];
  
  // Check each pattern group
  for (const patternGroup of patterns) {
    for (const pattern of patternGroup.patterns) {
      if (pattern.test(normalizedMessage)) {
        return { 
          detected: true, 
          confidence: patternGroup.confidence, 
          reason: patternGroup.reason 
        };
      }
    }
  }
  
  return { detected: false, confidence: 0, reason: '' };
}
