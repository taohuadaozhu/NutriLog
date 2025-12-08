import React, { useState } from 'react';
import { UserProfile, Gender } from '../types';
import { calculateBMR } from '../utils/calculations';
import { ArrowRight, Activity } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: Gender.Male
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const age = parseInt(formData.age);

    if (height && weight && age) {
      const bmr = calculateBMR(weight, height, age, formData.gender);
      onComplete({
        height,
        weight,
        age,
        gender: formData.gender,
        bmr
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in-up">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-100 p-3 rounded-full mb-4">
            <Activity className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">欢迎使用 NutriLog AI</h2>
          <p className="text-gray-500 text-center mt-2">请设置您的个人资料，以便我们准确计算您的基础代谢率。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: Gender.Male })}
                className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                  formData.gender === Gender.Male
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-emerald-200'
                }`}
              >
                男
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: Gender.Female })}
                className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                  formData.gender === Gender.Female
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-emerald-200'
                }`}
              >
                女
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身高 (cm)</label>
              <input
                type="number"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
                placeholder="175"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
              <input
                type="number"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                placeholder="70"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
            <input
              type="number"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              placeholder="30"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6"
          >
            开始记录 <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};