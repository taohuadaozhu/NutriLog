import { Gender, UserProfile } from '../types';

// Mifflin-St Jeor Equation
export const calculateBMR = (weight: number, height: number, age: number, gender: Gender): number => {
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === Gender.Male) {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
};

// Estimate weight change: 7700 kcal deficit/surplus ~= 1kg change
export const calculateprojectedWeightChange = (totalNetCalories: number): number => {
  return totalNetCalories / 7700;
};
