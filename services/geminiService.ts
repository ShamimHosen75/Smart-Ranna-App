
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name_en: { type: Type.STRING, description: "The full, exact name of the recipe in English." },
        name_bn: { type: Type.STRING, description: "The full, exact name of the recipe in Bengali." },
        category: { type: Type.STRING, description: "The cuisine category (e.g., Bangladeshi, Indian, Chinese)." },
        ingredients_en: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of all ingredients required, in English." },
        ingredients_bn: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of all ingredients required, in Bengali." },
        steps_en: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step cooking instructions, in English." },
        steps_bn: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step cooking instructions, in Bengali." },
        youtube_link: { type: Type.STRING, description: "A full, direct YouTube URL for a video tutorial that EXACTLY matches the recipe name and content. If no exact match exists, it can be a close suggestion for the same dish. Must be an empty string if no relevant video is found." },
        youtube_link_is_suggested: { type: Type.BOOLEAN, description: "Set to true if the YouTube link is a close suggestion, not an exact match. Set to false if it is an exact match or if no link is provided." },
      },
      required: ["name_en", "name_bn", "category", "ingredients_en", "ingredients_bn", "steps_en", "steps_bn", "youtube_link", "youtube_link_is_suggested"],
    },
};

// This is the shape of the recipe data from the first AI call, before image generation.
type RawRecipe = Omit<Recipe, 'id' | 'imageBase64'>;

export async function fetchRecipesFromAI(query: string): Promise<Recipe[]> {
    console.log(`Fetching recipe details for query: ${query}`);
    
    // Step 1: Fetch the text-based recipe data from the AI.
    let rawRecipes: RawRecipe[] = [];
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `The user is searching for recipes related to: "${query}". This could be a specific dish or a broad category. Follow your system instructions to provide a comprehensive and accurate list of recipes.`,
            config: {
                systemInstruction: `You are an expert recipe API. Your top priority is providing accurate, relevant recipes with consistent assets (image, video).

Rules:
- **Recipe Matching & Category Expansion**: Your goal is to return the most relevant recipes.
    - **For specific queries** (e.g., "Chicken Biryani", "lentil soup"): Return the most accurate and direct matches for that dish.
    - **For broad category queries** (e.g., "Lunch", "Breakfast", "Bangladeshi", "Dessert"): You MUST interpret this as a request for a *collection* of recipes. Return a diverse and comprehensive list of at least 10-12 popular and representative recipes from that category. For example, for "Lunch", you should return a mix of items like different curries, rice dishes, biryanis, etc. For "Dessert", provide a variety of sweets. Do not just return 2-3 items. The goal is to give the user a rich list to browse. If no relevant recipes are found at all, return an empty array.
- **YouTube Tutorial Link Accuracy (CRITICAL)**: You must adhere to these rules with extreme precision.
    - **Rule 1: Exact Match is Paramount.** Search for a high-quality YouTube tutorial whose title and content **exactly match** the recipe's 'name_en' and 'name_bn'. The video must clearly demonstrate how to cook the specific dish described in the recipe steps. If an exact match is found, provide its full URL in 'youtube_link' and set 'youtube_link_is_suggested' to false.
    - **Rule 2: Suggested Match as a Last Resort.** Only if an exact match is impossible to find, you may provide a link to a video for the **exact same dish** but perhaps from a different creator or with minor stylistic differences. This is a **suggestion**. You MUST set 'youtube_link_is_suggested' to true in this case.
    - **Rule 3: No Irrelevant Links.** If you cannot find a video for the exact dish, you **MUST** return an empty string ("") for 'youtube_link' and set 'youtube_link_is_suggested' to false. DO NOT provide a link to a *similar* but different dish (e.g., providing a 'Mutton Korma' video for a 'Chicken Korma' recipe is forbidden).
- **Image Consistency**: The 'name_en' field is used to generate a photorealistic image. It must be a precise, accurate name for the dish to ensure the generated image is correct.
- **Bilingual Content**: All text fields (names, ingredients, steps) must be accurately populated for both English and Bengali.
- Do NOT provide an image URL. Images will be generated in a separate step based on the recipe name.`,
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });
        
        const jsonText = response.text.trim();
        rawRecipes = JSON.parse(jsonText);
        
        if (!Array.isArray(rawRecipes)) {
            console.error("Parsed recipe data is not an array:", rawRecipes);
            throw new Error("The AI returned an invalid data structure.");
        }
        console.log(`Found ${rawRecipes.length} recipe details from AI. Now generating images...`);

    } catch (error) {
        console.error("Error fetching recipe details from AI:", error);
        throw new Error("Failed to fetch recipe details. The service might be temporarily unavailable.");
    }

    // Step 2: Generate an image for each recipe in parallel.
    const recipesWithImages = await Promise.all(
        rawRecipes.map(async (recipe) => {
            try {
                const imagePrompt = `A stunning, professional, high-quality, photorealistic food photograph of "${recipe.name_en}". The dish is presented beautifully on a simple, elegant plate or bowl with a clean, out-of-focus background. The lighting is bright and natural, highlighting the textures and colors of the food. It looks incredibly delicious and appetizing.`;
                
                const imageResponse = await ai.models.generateImages({
                    model: 'imagen-3.0-generate-002',
                    prompt: imagePrompt,
                    config: {
                      numberOfImages: 1,
                      outputMimeType: 'image/jpeg',
                      aspectRatio: '1:1', // Consistent aspect ratio for cards
                    },
                });

                const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;

                return {
                    ...recipe,
                    id: crypto.randomUUID(),
                    imageBase64: `data:image/jpeg;base64,${base64ImageBytes}`,
                };
            } catch (imageError) {
                console.error(`Failed to generate image for "${recipe.name_en}":`, imageError);
                // Return a version with an ID but an empty image string to be filtered out.
                return {
                    ...recipe,
                    id: crypto.randomUUID(),
                    imageBase64: '', 
                };
            }
        })
    );

    console.log("Finished generating all recipe assets.");
    // Filter out any recipes where image generation failed.
    const finalRecipes = recipesWithImages.filter(recipe => recipe.imageBase64);

    if (finalRecipes.length === 0 && rawRecipes.length > 0) {
        throw new Error("Successfully fetched recipe details, but failed to generate any images. Please try again.");
    }
    
    return finalRecipes;
}
