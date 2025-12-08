export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export interface UserProfile {
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: Gender;
  bmr: number; // Basal Metabolic Rate
}

export interface NutritionData {
  calories: number; // kcal
  protein: number; // g
  fat: number; // g
  carbs: number; // g
  fiber: number; // g
  sodium: number; // mg
}

export interface ExerciseData {
  description: string;
  caloriesBurned: number;
}

export interface MealEntry {
  type: string; // '早餐', '午餐', '晚餐', '加餐'
  items: string; // Description of food items
  nutrition: NutritionData;
}

export interface DailyLog {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  rawText: string;
  intake: NutritionData;
  meals?: MealEntry[]; // New field for meal breakdown
  exercise: ExerciseData[];
  totalBurned: number; 
  netCalories: number; 
  notes: string;
  suggestions?: string[]; // New field for AI advice
  timestamp: number;
}

export interface AnalysisResult {
  date: string;
  intake: NutritionData;
  meals: MealEntry[];
  exercises: ExerciseData[];
  notes: string;
  suggestions: string[];
}