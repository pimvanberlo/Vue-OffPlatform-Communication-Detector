import axios from "axios";

// Config constants
const GEMINI_API_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
const API_KEY = process.env.VUE_APP_GEMINI_API_KEY || "";

/**
 * Detects potential off-platform communication attempts using Google Gemini 2.0 Flash Lite API
 *
 * @param {string} message - The message to analyze
 * @returns {Promise<{detected: boolean, confidence: number, reason: string}>} Detection result
 */
export async function detectOffPlatformCommunication(message) {
  if (!message || !API_KEY) {
    return { detected: false, confidence: 0, reason: "" };
  }

  try {
    const response = await axios.post(`${GEMINI_API_ENDPOINT}?key=${API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: `
                You are a content moderator tasked with identifying attempts to move communication off-platform.
                
                Analyze the following message and determine if it contains attempts to share contact information or move communication to another platform.
                Examples include: phone numbers, emails, social media handles, URLs to other platforms (excluding example content inspiration links to platforms like Instagram, YouTube, or TikTok), or subtle hints about meeting elsewhere.
                                
                Message: "${message}"
                
                Respond in the following JSON format only:
                {
                  "is_off_platform_attempt": true/false,
                  "confidence_percentage": 0-100,
                }
                `,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
      },
    });

    // Parse the response from Gemini
    if (response?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const rawText = response.data.candidates[0].content.parts[0].text;

      try {
        // Extract the JSON from the response text
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);

          // Ensure we're properly handling the AI confidence check
          const confidence = result.confidence_percentage || 0;
          return {
            detected: result.is_off_platform_attempt === true,
            confidence: confidence,
            reason: result.reasoning || "Unknown reason",
          };
        }
      } catch (parseError) {
        console.error("Error parsing Gemini API response:", parseError);
      }
    }

    // Default fallback response
    return {
      detected: false,
      confidence: 0,
      reason: "Could not analyze message properly",
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze message for off-platform communication");
  }
}
