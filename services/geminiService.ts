import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to remove white background from an image.
 */
const removeWhiteBackground = (base64Data: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Data);
        return;
      }
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Iterate through pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Threshold for "white"
        if (r > 230 && g > 230 && b > 230) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => resolve(base64Data); // Fallback
    img.src = base64Data;
  });
};

/**
 * Generates a character image using Nano Banana (Gemini 2.5 Flash Image).
 */
export const generateCharacterImage = async (
  prompt: string,
  size: ImageSize = ImageSize.S_1K,
  aspectRatio: AspectRatio = AspectRatio.SQUARE
): Promise<string> => {
  try {
    // Explicitly ask for isolated white background to make removal easier
    const fullPrompt = `Supercell Clash of Clans style 3D character render. Cute, stylized, high quality. ${prompt}. Isolated on a pure solid white background.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const rawImage = `data:image/png;base64,${part.inlineData.data}`;
        // Process transparency before returning
        return await removeWhiteBackground(rawImage);
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Error generating character:", error);
    throw error;
  }
};

/**
 * Generates a coloring page (black and white line art) using Nano Banana (Flash Image).
 */
export const generateColoringPage = async (prompt: string): Promise<string> => {
  try {
    const fullPrompt = `High quality black and white line art coloring page of a Clash of Clans building: ${prompt}. 
    Thick black outlines, pure white background, no shading, no gray, 2D vector style. 
    Ensure the lines are closed and clear for coloring.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Error generating coloring page:", error);
    throw error;
  }
};

/**
 * Uses Gemini Flash to analyze audio and return text.
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          { text: "Transcribe this audio precisely into Turkish or English text." },
        ],
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return "Error listening...";
  }
};

/**
 * Edit an image using Gemini Flash Image (e.g., adding filters).
 */
export const editImage = async (base64Image: string, instruction: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image.replace(/^data:image\/(png|jpeg);base64,/, ''),
            },
          },
          { text: instruction },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        // We don't remove background on edits usually as it might be a scene
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

/**
 * Generates hints or logic for the Bilsem game using Flash.
 */
export const generateBilsemHint = async (patternDescription: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful tutor for 6-year-old Turkish children. 
      Explain this pattern logic simply in Turkish: ${patternDescription}. 
      Keep it under 15 words.`,
    });
    return response.text || "Deseni takip et!";
  } catch (error) {
    return "Dikkatli bak!";
  }
};