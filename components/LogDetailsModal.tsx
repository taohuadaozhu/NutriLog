import React from 'react';
import { DailyLog } from '../types';
import { X, Calendar, Activity, Utensils, Flame, Sparkles, ChefHat } from 'lucide-react';

interface Props {
  log: DailyLog | null;
  onClose: () => void;
}

export const LogDetailsModal: React.FC<Props> = ({ log, onClose }) => {
  if (!log) return null;

  const hasMeals = log.meals && log.meals.length > 0;
  const hasSuggestions = log.suggestions && log.suggestions.length > 0;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{log.date} 记录详情</h3>
              <p className="text-sm text-gray-500">净热量: {log.netCalories > 0 ? '+' : ''}{log.netCalories} kcal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">

          {/* New Meal Analysis Table */}
          {hasMeals && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-emerald-500" />
                三餐营养分析
              </h4>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap w-20">餐别</th>
                      <th className="px-4 py-3">食物内容</th>
                      <th className="px-4 py-3 text-right">热量 (kcal)</th>
                      <th className="px-4 py-3 text-right">蛋白质 (g)</th>
                      <th className="px-4 py-3 text-right">脂肪 (g)</th>
                      <th className="px-4 py-3 text-right">碳水 (g)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {log.meals!.map((meal, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-emerald-700 whitespace-nowrap">{meal.type}</td>
                        <td className="px-4 py-3 text-gray-600">{meal.items}</td>
                        <td className="px-4 py-3 text-right font-medium">{meal.nutrition.calories}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{meal.nutrition.protein}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{meal.nutrition.fat}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{meal.nutrition.carbs}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50/80 font-semibold text-gray-800">
                      <td className="px-4 py-3">总计</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right">{log.intake.calories}</td>
                      <td className="px-4 py-3 text-right">{log.intake.protein}</td>
                      <td className="px-4 py-3 text-right">{log.intake.fat}</td>
                      <td className="px-4 py-3 text-right">{log.intake.carbs}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {hasSuggestions && (
             <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  健康建议
                </h4>
                <ul className="space-y-2">
                  {log.suggestions!.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-indigo-900 text-sm">
                      <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
             </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Raw Text Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                原始输入内容
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-600 whitespace-pre-wrap font-mono text-xs leading-relaxed shadow-inner max-h-60 overflow-y-auto">
                {log.rawText}
              </div>
            </div>

            {/* Quick Stats Grid (Legacy/Summary View) */}
            <div className="space-y-4">
               <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    运动消耗
                  </h4>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <ul className="space-y-2">
                      {log.exercise.map((ex, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex justify-between items-center pb-2 border-b border-orange-100 last:border-0 last:pb-0">
                          <span>{ex.description}</span>
                          <span className="font-bold text-orange-600">-{ex.caloriesBurned}</span>
                        </li>
                      ))}
                      {log.exercise.length === 0 && <li className="text-sm text-gray-400 italic">无运动记录</li>}
                    </ul>
                    <div className="mt-3 pt-2 border-t border-orange-200 text-right text-xs font-bold text-orange-700 uppercase tracking-wide">
                      总计消耗: {log.totalBurned} kcal (含基础代谢)
                    </div>
                  </div>
               </div>
               
               {log.notes && (
                 <div>
                   <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">备注</h4>
                   <p className="text-gray-600 text-sm italic border-l-4 border-gray-300 pl-3 py-1">
                     {log.notes}
                   </p>
                 </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};