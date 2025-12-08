import React, { useState, useEffect, useMemo } from 'react';
import { Onboarding } from './components/Onboarding';
import { HistoryChart } from './components/HistoryChart';
import { NutrientCard } from './components/NutrientCard';
import { LogDetailsModal } from './components/LogDetailsModal';
import { UserProfile, DailyLog, NutritionData, ExerciseData } from './types';
import { analyzeHealthLog } from './services/gemini';
import { calculateBMR, calculateprojectedWeightChange } from './utils/calculations';
import { 
  Send, 
  Loader2, 
  Calendar, 
  Flame, 
  Utensils, 
  Activity, 
  TrendingUp,
  Scale,
  History,
  Plus,
  ChevronRight
} from 'lucide-react';

const SAMPLE_PLACEHOLDER = `📅 日期：12月4日
🕗 起床时间：7:00
🏃‍♀️ 运动情况：散步半小时

🍽 早餐：牛奶200ml   水煮蛋2个 面包1片
🍎 加餐（上午）：无
🥗 午餐：番茄牛肉意大利面一份
🍌 加餐（下午）：果冻橙1个 
🍲 晚餐：

🧠 身体状态/备注：正常`;

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [inputText, setInputText] = useState(SAMPLE_PLACEHOLDER);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedDays, setSelectedDays] = useState<number>(7);
  const [error, setError] = useState<string | null>(null);
  const [viewingLog, setViewingLog] = useState<DailyLog | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('nutri_profile');
    const savedLogs = localStorage.getItem('nutri_logs');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  // Persist logs
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem('nutri_logs', JSON.stringify(logs));
    }
  }, [logs]);

  // Persist profile
  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('nutri_profile', JSON.stringify(newProfile));
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() || !profile) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeHealthLog(inputText);
      
      if (result) {
        const exerciseBurn = result.exercises.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
        const totalBurned = exerciseBurn + profile.bmr;
        const netCalories = result.intake.calories - totalBurned;

        const newLog: DailyLog = {
          id: Date.now().toString(),
          date: result.date,
          rawText: inputText,
          intake: result.intake,
          meals: result.meals,
          exercise: result.exercises,
          totalBurned,
          netCalories,
          notes: result.notes,
          suggestions: result.suggestions,
          timestamp: Date.now(),
        };

        setLogs(prev => {
          // Remove existing log for same date if exists to avoid duplicates
          const filtered = prev.filter(l => l.date !== newLog.date);
          return [...filtered, newLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });

        setInputText(SAMPLE_PLACEHOLDER); // Reset to template for next use
      } else {
        setError("无法解析日志，请尝试提供更详细的信息。");
      }
    } catch (err) {
      setError("分析失败，请检查网络或 API Key 设置。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Derived Stats
  const recentLogs = useMemo(() => {
    // Get last N distinct days
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse().slice(0, selectedDays);
    return logs.filter(l => uniqueDates.includes(l.date));
  }, [logs, selectedDays]);

  const aggregateStats = useMemo(() => {
    if (recentLogs.length === 0) return null;
    
    const totalNet = recentLogs.reduce((acc, log) => acc + log.netCalories, 0);
    const weightChange = calculateprojectedWeightChange(totalNet);
    
    return {
      totalNet,
      weightChange,
      avgCalories: Math.round(recentLogs.reduce((acc, log) => acc + log.intake.calories, 0) / recentLogs.length),
      avgBurn: Math.round(recentLogs.reduce((acc, log) => acc + log.totalBurned, 0) / recentLogs.length),
    };
  }, [recentLogs]);

  if (!profile) {
    return <Onboarding onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">NutriLog AI</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <Scale className="w-4 h-4" />
              <span>基础代谢 (BMR): {profile.bmr} 千卡</span>
            </div>
            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
              {profile.gender === 'Male' ? '男' : '女'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              记录您的一天
            </h2>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={SAMPLE_PLACEHOLDER}
                className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none transition-shadow text-gray-700 font-normal leading-relaxed font-mono text-sm"
              />
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow-md transition-all ${
                    isAnalyzing || !inputText.trim()
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg active:scale-95'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 正在分析...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> 保存日志
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <p className="mt-3 text-xs text-gray-400">
              提示：您可以直接在上方修改模板内容，点击保存即可。
            </p>
          </div>
        </section>

        {/* Dashboard Grid */}
        {logs.length > 0 && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-4 flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  分析与预测
                </h2>
                <select 
                  value={selectedDays} 
                  onChange={(e) => setSelectedDays(Number(e.target.value))}
                  className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2"
                >
                  <option value={3}>最近 3 条记录</option>
                  <option value={7}>最近 7 条记录</option>
                  <option value={10}>最近 10 条记录</option>
                  <option value={30}>最近 30 条记录</option>
                </select>
              </div>

              {/* Prediction Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg lg:col-span-2">
                 <div className="flex items-start justify-between">
                    <div>
                      <p className="text-indigo-100 font-medium mb-1">预计体重变化</p>
                      <p className="text-xs text-indigo-200 opacity-80">基于最近 {recentLogs.length} 条记录</p>
                    </div>
                    <Scale className="w-6 h-6 text-indigo-200" />
                 </div>
                 <div className="mt-6">
                    {aggregateStats ? (
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${aggregateStats.weightChange > 0 ? 'text-white' : 'text-green-200'}`}>
                          {aggregateStats.weightChange > 0 ? '+' : ''}{aggregateStats.weightChange.toFixed(2)}
                        </span>
                        <span className="text-lg opacity-80">kg</span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-white/50">--</span>
                    )}
                    <p className="mt-2 text-sm text-indigo-100 opacity-90">
                      {aggregateStats && aggregateStats.weightChange < 0 
                        ? "做得好！由于热量缺口，预计体重会下降。" 
                        : "您目前的摄入超过了消耗，预计体重会上升。"}
                    </p>
                 </div>
              </div>

              {/* Average Stats */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 grid grid-cols-2 gap-4">
                 <div className="flex flex-col justify-center">
                    <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">平均摄入</span>
                    <div className="text-2xl font-bold text-gray-800 mt-1">
                      {aggregateStats?.avgCalories || 0} <span className="text-sm font-normal text-gray-400">千卡</span>
                    </div>
                 </div>
                 <div className="flex flex-col justify-center">
                    <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">平均消耗</span>
                    <div className="text-2xl font-bold text-orange-500 mt-1">
                      {aggregateStats?.avgBurn || 0} <span className="text-sm font-normal text-gray-400">千卡</span>
                    </div>
                 </div>
                 <div className="col-span-2 pt-4 border-t border-gray-100">
                    <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">平均热量盈亏</span>
                    <div className={`text-xl font-bold mt-1 ${aggregateStats?.totalNet && aggregateStats.totalNet < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {aggregateStats ? (aggregateStats.totalNet / recentLogs.length).toFixed(0) : 0} <span className="text-sm font-normal text-gray-400">千卡</span>
                    </div>
                 </div>
              </div>
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <HistoryChart logs={recentLogs} />
              </div>
              
              {/* Recent Logs List */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-700">最近记录</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-4">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      onClick={() => setViewingLog(log)}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-emerald-50/50 hover:shadow-md transition-all border border-gray-100 cursor-pointer group relative"
                    >
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-gray-800">{log.date}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${log.netCalories < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {log.netCalories > 0 ? '+' : ''}{log.netCalories} 净热量
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-3">
                         <div className="text-center bg-white rounded p-1 shadow-sm">
                            <div className="text-xs text-gray-400">蛋白质</div>
                            <div className="font-medium text-emerald-600">{log.intake.protein}g</div>
                         </div>
                         <div className="text-center bg-white rounded p-1 shadow-sm">
                            <div className="text-xs text-gray-400">碳水</div>
                            <div className="font-medium text-blue-600">{log.intake.carbs}g</div>
                         </div>
                         <div className="text-center bg-white rounded p-1 shadow-sm">
                            <div className="text-xs text-gray-400">脂肪</div>
                            <div className="font-medium text-orange-600">{log.intake.fat}g</div>
                         </div>
                      </div>

                      <div className="space-y-1">
                        {log.exercise.length > 0 && (
                          <div className="text-xs text-gray-600 flex items-start gap-1">
                             <Flame className="w-3 h-3 text-orange-500 mt-0.5" />
                             <span className="line-clamp-1">{log.exercise.map(e => e.description).join(', ')}</span>
                          </div>
                        )}
                         <div className="text-xs text-gray-600 flex items-start gap-1">
                             <Utensils className="w-3 h-3 text-emerald-500 mt-0.5" />
                             <span className="line-clamp-1 text-gray-400 italic">{log.intake.calories} 千卡 摄入</span>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Modal */}
        <LogDetailsModal log={viewingLog} onClose={() => setViewingLog(null)} />
        
      </main>
    </div>
  );
}