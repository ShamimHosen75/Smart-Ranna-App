import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, TranslatedRecipe } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PLACEHOLDER_IMAGE_URL = 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg';

const recipeSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "The full name of the recipe.",
        },
        image: {
            type: Type.STRING,
            description: "A URL of a publicly accessible, royalty-free image of the finished dish. The URL must be a direct link to a .jpg, .png, or .webp file. Do not link to a webpage. e.g., 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'."
        },
        cuisine: {
            type: Type.STRING,
            description: "The cuisine type (e.g., Bangladeshi, Indian)."
        },
        ingredients: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of all ingredients required.",
        },
        instructions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Step-by-step cooking instructions.",
        },
        youtubeSearchQuery: {
            type: Type.STRING,
            description: "A good search query for finding a video tutorial on YouTube for this recipe. Should be in English. e.g., 'How to make beef biryani'."
        }
      },
      required: ["name", "image", "cuisine", "ingredients", "instructions", "youtubeSearchQuery"],
      propertyOrdering: ["name", "cuisine", "image", "ingredients", "instructions", "youtubeSearchQuery"],
    },
};

const translationSchema = {
    type: Type.OBJECT,
    properties: {
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The list of ingredients, translated to Bengali.",
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The step-by-step instructions, translated to Bengali.",
        },
    },
    required: ["ingredients", "instructions"],
};

export async function fetchRecipesFromAI(query: string): Promise<Recipe[]> {
    console.log(`Fetching recipes for query: ${query}`);
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 5-8 recipes related to "${query}". Focus on Bangladeshi and popular South Asian cuisine. Ensure every recipe has a valid image URL as specified in the system instructions.`,
            config: {
                systemInstruction: "You are a helpful recipe assistant. For every recipe you suggest, you must provide a direct, publicly accessible, high-resolution (minimum 800px width), and royalty-free image URL. The URL must point directly to an image file (e.g., ending in .jpg, .jpeg, .png, or .webp). Do not provide links to HTML pages. Prioritize images from free-to-use sources like Wikimedia Commons, Unsplash, or Pexels. If you cannot find a suitable image, you must still provide a valid fallback image URL that meets these criteria.",
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });
        
        const jsonText = response.text.trim();
        let rawRecipes: Omit<Recipe, 'id'>[] = [];
        try {
             rawRecipes = JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse recipes JSON:", e);
            console.error("Received text:", jsonText);
            throw new Error("The AI returned an invalid recipe format. Please try a different search term.");
        }
        
        if (!Array.isArray(rawRecipes)) {
            console.error("Parsed recipe data is not an array:", rawRecipes);
            throw new Error("The AI returned an invalid data structure.");
        }

        console.log(`Found ${rawRecipes.length} recipes from AI.`);

        return rawRecipes.map(recipe => ({
            ...recipe,
            id: crypto.randomUUID(),
            image: recipe.image && recipe.image.startsWith('http') ? recipe.image : PLACEHOLDER_IMAGE_URL,
        }));

    } catch (error) {
        console.error("Error fetching recipes from AI:", error);
        throw new Error("Failed to fetch recipes from AI. The service might be temporarily unavailable. Please try again later.");
    }
}


export async function translateRecipeToBengali(recipe: Recipe): Promise<TranslatedRecipe> {
    try {
        const prompt = `Translate the following recipe ingredients and instructions to Bengali. Keep the translation natural and easy for a native speaker to understand.

Ingredients:
${recipe.ingredients.join('\n')}

Instructions:
${recipe.instructions.join('\n')}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: translationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const translatedContent = JSON.parse(jsonText);
        
        if (!translatedContent.ingredients || !translatedContent.instructions) {
            throw new Error("Invalid translation format received.");
        }

        return translatedContent;

    } catch (error) {
        console.error('Error translating recipe to Bengali:', error);
        throw new Error('Failed to translate recipe. Please try again.');
    }
}