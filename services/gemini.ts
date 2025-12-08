import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const parseLogSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    date: {
      type: Type.STRING,
      description: "The date of the log in YYYY-MM-DD format. If the user says 'today', use the current date provided in context. If 'yesterday', calculate relative to current date.",
    },
    intake: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER, description: "Total calories in kcal" },
        protein: { type: Type.NUMBER, description: "Total protein in grams" },
        fat: { type: Type.NUMBER, description: "Total fat in grams" },
        carbs: { type: Type.NUMBER, description: "Total carbohydrates in grams" },
        fiber: { type: Type.NUMBER, description: "Total fiber in grams" },
        sodium: { type: Type.NUMBER, description: "Total sodium in mg" },
      },
      required: ["calories", "protein", "fat", "carbs", "fiber", "sodium"],
    },
    meals: {
      type: Type.ARRAY,
      description: "Breakdown of nutrition by meal (Breakfast, Lunch, Dinner, Snack)",
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Meal type, e.g., '早餐', '午餐', '晚餐', '加餐'" },
          items: { type: Type.STRING, description: "List of food items in this meal" },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER },
              sodium: { type: Type.NUMBER },
            },
            required: ["calories", "protein", "fat", "carbs", "fiber", "sodium"]
          }
        },
        required: ["type", "items", "nutrition"]
      }
    },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Short description of the activity (in Chinese)" },
          caloriesBurned: { type: Type.NUMBER, description: "Estimated calories burned" },
        },
        required: ["description", "caloriesBurned"],
      },
    },
    notes: { type: Type.STRING, description: "Summary of mood, body state, or general remarks (in Chinese)." },
    suggestions: {
      type: Type.ARRAY,
      description: "3-5 personalized health and nutritional suggestions based on this day's log.",
      items: { type: Type.STRING }
    }
  },
  required: ["date", "intake", "meals", "exercises", "notes", "suggestions"],
};

export const analyzeHealthLog = async (text: string): Promise<AnalysisResult | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
      You are an expert nutritionist and fitness tracker. 
      Analyze the following user input text (in Chinese) which contains diet and exercise information.
      
      Current Date Context: ${today}
      
      Tasks:
      1. Extract the date.
      2. Analyze each meal (Breakfast, Lunch, Dinner, Snacks/Other). 
         - Identify food items.
         - Estimate nutritional content (Calories, Protein, Fat, Carbs, Fiber, Sodium) for EACH meal separately.
         - Sum them up for the daily total 'intake' object.
      3. Analyze all exercises. Estimate calories burned.
      4. Extract any health notes or mood.
      5. Provide 3-5 specific, actionable suggestions (in Chinese) based on the nutrient balance (e.g., "Dinner was too heavy", "Lack of protein in breakfast").
      
      User Input:
      """
      ${text}
      """
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: parseLogSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    return null;

  } catch (error) {
    console.error("Error parsing health log with Gemini:", error);
    throw error;
  }
};