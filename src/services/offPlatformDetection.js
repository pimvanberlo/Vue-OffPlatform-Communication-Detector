import axios from 'axios';

// Config constants
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const API_KEY = process.env.VUE_APP_GEMINI_API_KEY || '';

/**
 * Detects potential off-platform communication attempts using Google Gemini 2.0 Flash Lite API
 * 
 * @param {string} message - The message to analyze
 * @returns {Promise<{detected: boolean, confidence: number, reason: string}>} Detection result
 */
export async function detectOffPlatformCommunication(message) {
  if (!message || !API_KEY) {
    return { detected: false, confidence: 0, reason: '' };
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_ENDPOINT}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `
                You are a content moderator tasked with identifying attempts to move communication off-platform.
                
                Analyze the following message and determine if it contains attempts to share contact information or move communication to another platform.
                Examples include: phone numbers, emails, social media handles, URLs to other platforms, or subtle hints about meeting elsewhere.
                
                Message: "${message}"
                
                Respond in the following JSON format only:
                {
                  "is_off_platform_attempt": true/false,
                  "confidence_percentage": 0-100,
                  "reasoning": "brief explanation of why this is or isn't an off-platform attempt"
                }
                `
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40
        }
      }
    );

    // Parse the response from Gemini
    if (response?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const rawText = response.data.candidates[0].content.parts[0].text;
      
      try {
        // Extract the JSON from the response text
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          
          return {
            detected: result.is_off_platform_attempt === true,
            confidence: result.confidence_percentage || 0,
            reason: result.reasoning || 'Unknown reason'
          };
        }
      } catch (parseError) {
        console.error('Error parsing Gemini API response:', parseError);
      }
    }
    
    // Default fallback response
    return { 
      detected: false, 
      confidence: 0, 
      reason: 'Could not analyze message properly' 
    };
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to analyze message for off-platform communication');
  }
}

/**
 * Analyzes message for urgency or pressure tactics that might indicate off-platform attempts
 * 
 * @param {string} message - The message to analyze
 * @returns {Promise<{detected: boolean, urgencyScore: number}>} Urgency detection result
 */
export async function detectUrgencyPatterns(message) {
  // Patterns indicating urgency or pressure
  const urgencyPatterns = [
    /quickly|urgent|asap|right away|hurry|don't wait|limited time/gi,
    /before it's too late|running out of time|expires soon|offer ends/gi,
    /contact me now|message me soon|reach out immediately/gi
  ];
  
  let urgencyScore = 0;
  const maxScore = urgencyPatterns.length;
  
  // Check each pattern
  urgencyPatterns.forEach(pattern => {
    if (pattern.test(message)) {
      urgencyScore++;
    }
  });
  
  // Calculate percentage
  const urgencyPercentage = (urgencyScore / maxScore) * 100;
  
  return {
    detected: urgencyScore > 0,
    urgencyScore: urgencyPercentage
  };
}
