import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StylePreset, MetadataResult, PromptRefinementType, PromptResult } from '../types';

const getPromptConfig = (stylePreset: StylePreset) => {
    let titleConstraint, tagsConstraint, descriptionConstraint, systemInstruction;

    const baseSystemInstruction = "You are an expert metadata generator. Your task is to analyze an image and create a relevant, SEO-friendly title, a descriptive summary, and a list of tags.\n- The title must be plain English text, without any special characters like quotes, emojis, or symbols.\n- The description should be a complete sentence or two.\n- All tags must be single, lowercase English words.\n- Strictly adhere to the output format.";

    switch (stylePreset) {
        case StylePreset.Long:
            titleConstraint = "The title must be between 5 and 10 words.";
            tagsConstraint = "Generate between 15 and 25 relevant tags.";
            descriptionConstraint = "A detailed, paragraph-length description (40-60 words), highlighting key elements and context.";
            systemInstruction = baseSystemInstruction;
            break;
        case StylePreset.SEO:
            titleConstraint = "The title must be a click-worthy, SEO-optimized headline (5-7 words).";
            tagsConstraint = "Generate between 15 and 30 high-value, relevant SEO keywords, including long-tail keywords.";
            descriptionConstraint = "An SEO-optimized description (25-40 words), naturally incorporating relevant keywords about the image's subject and potential use cases.";
            systemInstruction = "You are an SEO expert specializing in image optimization. Your goal is to generate a click-worthy title, an SEO-friendly description, and a comprehensive list of high-traffic keywords to maximize visibility on stock photography websites and search engines. Focus on commercial-intent keywords.";
            break;
        case StylePreset.Creative:
            titleConstraint = "The title should be an evocative, poetic, or artistic phrase (3-6 words).";
            tagsConstraint = "Generate 10-20 creative, abstract, or conceptual tags related to the mood, theme, and feeling of the image.";
            descriptionConstraint = "A creative and evocative description (20-35 words) that captures the mood and tells a short story about the image.";
            systemInstruction = "You are a poet and artist. Your task is to view this image and write an evocative, short title, a creative description, and a list of abstract, emotional, and conceptual tags that capture the essence and feeling of the image, rather than just describing the objects in it.";
            break;
        case StylePreset.Short:
        default:
            titleConstraint = "The title must be a concise description, between 1 and 4 words.";
            tagsConstraint = "Generate between 1 and 10 relevant, single-word tags.";
            descriptionConstraint = "A brief, one-sentence description (15-25 words).";
            systemInstruction = baseSystemInstruction;
            break;
    }

    const userPrompt = `Analyze the provided image.\nConstraints:\n- ${titleConstraint}\n- ${descriptionConstraint}\n- ${tagsConstraint}`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: `A title for the image. ${titleConstraint}`,
        },
        description: {
          type: Type.STRING,
          description: `A descriptive summary of the image. ${descriptionConstraint}`,
        },
        tags: {
          type: Type.ARRAY,
          description: `A list of keywords for the image. ${tagsConstraint}`,
          items: {
            type: Type.STRING,
          },
        },
      },
      required: ['title', 'description', 'tags'],
    };

    return { systemInstruction, userPrompt, responseSchema };
}


export const generateMetadata = async (
  apiKey: string,
  base64ImageData: string,
  stylePreset: StylePreset
): Promise<MetadataResult> => {

    if (!apiKey) {
        throw new Error("API key is not provided.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const { systemInstruction, userPrompt, responseSchema } = getPromptConfig(stylePreset);

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ImageData,
      },
    };

    const textPart = {
      text: userPrompt
    };

    let response: GenerateContentResponse;
    try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.4,
            }
        });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
             throw new Error("Invalid API Key. Please check it in the settings.");
        }
        throw new Error("Failed to communicate with the AI service.");
    }

    try {
        const jsonText = response.text;
        const parsedJson = JSON.parse(jsonText);

        if (!parsedJson.title || !Array.isArray(parsedJson.tags) || !parsedJson.description) {
             throw new Error("Invalid format in AI response. Missing title, tags, or description.");
        }

        const result: MetadataResult = {
            title: parsedJson.title.replace(/["'.]/g, ''), 
            description: parsedJson.description,
            tags: parsedJson.tags.map((tag: any) => String(tag).toLowerCase().trim()).filter(Boolean),
        };

        return result;

    } catch (error) {
        console.error("Error processing Gemini response:", error);
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
            throw new Error(`Request blocked by AI. Reason: ${finishReason}`);
        }
        
        throw new Error("Could not parse the AI's response. The format might be incorrect.");
    }
};

export const generateStyledPrompt = async (
    apiKey: string,
    refinementType: PromptRefinementType,
    base64ImageData?: string,
    userIdea?: string,
): Promise<PromptResult> => {
    if (!apiKey) throw new Error("API key is not provided.");
    if (!base64ImageData && !userIdea) throw new Error("Please provide an image or an idea to generate a prompt.");

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an expert prompt engineer for text-to-image AI models. Your task is to analyze the user's input (which can be an image, text, or both) and generate a structured JSON output. IMPORTANT: Even if the user's text idea is in another language, you must generate all output fields in English.
    The JSON object must contain these three fields:
    1.  "positive": An effective, detailed, and coherent prompt in English for generating a high-quality image. This should be a single string of comma-separated keywords and descriptive phrases.
    2.  "negative": A string of common negative keywords to avoid unwanted elements (e.g., "blurry, ugly, deformed, watermark, text, signature").
    3.  "styleAnalysis": An array of 5-10 single-word or short-phrase tags in English, analyzing the artistic style, camera view, lighting, and other technical aspects.

    Strictly adhere to the JSON output format and ensure all text is in English.`;

    let userPrompt = '';
    const styleInstruction = refinementType !== PromptRefinementType.General ? `The final prompt must be in a '${refinementType}' style.` : 'Generate a general, high-quality prompt based on the input.';
    
    let baseInput = '';
    if(userIdea) {
        baseInput = `The user's idea is: "${userIdea}".`;
    }
    if(base64ImageData && userIdea) {
        userPrompt = `Analyze the provided image AND the user's idea. Combine them to create a refined prompt. ${baseInput} ${styleInstruction}`;
    } else if (base64ImageData) {
        userPrompt = `Analyze this image. ${styleInstruction}`;
    } else if (userIdea) {
        userPrompt = `Take the user's idea and expand it into a detailed prompt. ${baseInput} ${styleInstruction}`;
    }
    
    const parts = [];
    if (base64ImageData) {
        parts.push({
            inlineData: { mimeType: 'image/jpeg', data: base64ImageData },
        });
    }
    parts.push({ text: userPrompt });
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
          positive: { type: Type.STRING, description: 'The main, positive prompt text in English.' },
          negative: { type: Type.STRING, description: 'A comma-separated string of negative keywords in English.' },
          styleAnalysis: { 
              type: Type.ARRAY, 
              description: 'An array of English keywords describing the style.',
              items: { type: Type.STRING }
          },
        },
        required: ['positive', 'negative', 'styleAnalysis'],
    };

    let response: GenerateContentResponse;
    try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.6,
            }
        });
    } catch (error) {
        console.error("Error calling Gemini API for prompt generation:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
             throw new Error("Invalid API Key. Please check it in the settings.");
        }
        throw new Error("Failed to communicate with the AI service.");
    }
    
    try {
        const jsonText = response.text;
        const parsedJson = JSON.parse(jsonText);
        
        if (!parsedJson.positive || !parsedJson.negative || !Array.isArray(parsedJson.styleAnalysis)) {
            throw new Error("Invalid format in AI response. Missing required fields.");
        }
        
        return parsedJson as PromptResult;
        
    } catch (error) {
        console.error("Error processing Gemini prompt response:", error);
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
            throw new Error(`Request blocked by AI. Reason: ${finishReason}`);
        }
        throw new Error("Could not parse the AI's prompt response.");
    }
};
