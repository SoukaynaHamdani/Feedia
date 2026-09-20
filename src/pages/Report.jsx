import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, Droplets, Wheat, Clock, TrendingUp, AlertTriangle, Volume2, Loader2, VolumeX } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useAppStore from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { speakText, stopSpeaking } from '../services/aiService';
import { translations } from '../utils/translations';

const COLORS = ['#059669', '#d97706', '#0284c7', '#ea580c', '#65a30d']; // Forest Green, Amber, Sky Blue, Rust Orange, Leaf Green

const LANG_LABELS = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  darija: { name: 'الدارجة', flag: '🇲🇦' },
  tamazight: { name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'ⵣ' },
};

export default function Report() {
  const { currentReport, setView, language } = useAppStore();
  const [isPlaying, setIsPlaying] = React.useState(false);

  const t = translations[language] || translations.en;
  const isRtl = language === 'darija';

  if (!currentReport) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Button onClick={() => setView('assistant')}>{t.goBack}</Button>
      </div>
    );
  }

  const { overview, dailyNeeds, nutritionalBreakdown, schedule, recommendations } = currentReport;

  const playReportAudio = async () => {
    try {
      setIsPlaying(true);
      
      let fullText = "";
      
      const isUnavailable = (text) => text && text.toLowerCase().includes('unavailable');
      const water = isUnavailable(dailyNeeds.water) ? 
        (language === 'darija' || language === 'ar' ? 'ماعندناش هاد المعلومة ف قاعدة البيانات' : 
         language === 'tamazight' || language === 'tz' ? 'ⵓⵔ ⵉⵍⵍⵉ ⵓⵏⵖⵎⵉⵙ ⴰⴷ' : 'Data unavailable') 
        : dailyNeeds.water;
        
      const food = isUnavailable(dailyNeeds.food) ? 
        (language === 'darija' || language === 'ar' ? 'ماعندناش هاد المعلومة ف قاعدة البيانات' : 
         language === 'tamazight' || language === 'tz' ? 'ⵓⵔ ⵉⵍⵍⵉ ⵓⵏⵖⵎⵉⵙ ⴰⴷ' : 'Data unavailable') 
        : dailyNeeds.food;

      if (language === 'darija' || language === 'ar') {
        fullText = `${overview.summary}. الكمية ديال الما اللي كيحتاجوها هي ${water}. و الكمية ديال العلف هي ${food}. بالنسبة للبرنامج اليومي: `;
        schedule.forEach(item => fullText += `${item.time}: ${item.action}. `);
        fullText += `نصائح: ${recommendations.costSaving}. ${recommendations.healthWarnings}.`;
      } else if (language === 'tamazight' || language === 'tz') {
        fullText = `${overview.summary}. ⴰⵎⴰⵏ ⵏ ⵡⴰⵙⵙ: ${water}. ⵓⵜⵛⵉ ⵏ ⵡⴰⵙⵙ: ${food}. ⴰⵖⴰⵡⴰⵙ ⵏ ⵡⴰⵙⵙ: `;
        schedule.forEach(item => fullText += `${item.time}: ${item.action}. `);
        fullText += `ⵉⵙⵡⵉⵏⴳⵎⵏ: ${recommendations.costSaving}. ${recommendations.healthWarnings}.`;
      } else {
        fullText = `${overview.summary}. The total daily water requirement is ${water}. The total daily feed requirement is ${food}. Moving to the schedule: `;
        schedule.forEach(item => fullText += `At ${item.time}, ${item.action}. `);
        fullText += `Recommendations: ${recommendations.costSaving}. ${recommendations.healthWarnings}.`;
      }
      
      await speakText(fullText, language);
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    // Stop any ongoing speech when component mounts or updates
    stopSpeaking();
    // Auto-play the new report
    playReportAudio();

    return () => {
      stopSpeaking();
    };
  }, [currentReport, language]);

  const handlePlayAudio = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      playReportAudio();
    }
  };

  const langInfo = LANG_LABELS[language] || LANG_LABELS.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-10"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 print:hidden" dir="ltr">
        <Button variant="ghost" size="sm" onClick={() => setView('assistant')} className="gap-2 shrink-0">
          <ArrowLeft className="w-4 h-4" /> {t.startOver}
        </Button>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-start sm:justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
            <span>{langInfo.flag}</span>
            <span>{langInfo.name}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-white"
            onClick={handlePlayAudio}
          >
            {isPlaying ? (
              <VolumeX className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            {isPlaying ? t.stop : t.listen}
          </Button>
          <Button variant="primary" size="sm" className="gap-2" onClick={() => window.print()}>
            <Download className="w-4 h-4" /> {t.savePdf}
          </Button>
        </div>
      </div>

      {/* Premium Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-10 bg-gradient-to-br from-agricultural-green-dark to-agricultural-green shadow-xl border border-white/10"
      >
        {/* Subtle background texture/pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 capitalize drop-shadow-sm">
              {isRtl ? `${t.nutritionReport} ${overview.animal}` : `${overview.animal} ${t.nutritionReport}`}
            </h1>
            <p className="text-lg text-emerald-50 leading-relaxed font-medium">
              {overview.summary}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl inline-flex flex-col items-center border border-white/20 shadow-inner">
            <span className="text-sm font-semibold text-emerald-100 uppercase tracking-widest mb-1">{t.herdSize}</span>
            <span className="text-4xl font-black text-white">{overview.size}</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        {/* Left Column: Metrics & Chart */}
        <div className="lg:col-span-1 space-y-8">
          {/* Daily Needs */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-agricultural-green" /> {t.totalDailyNeeds}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Droplets className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-700">{t.water}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-slate-900">{dailyNeeds.water}</div>
                  <div className="text-xs text-slate-500">{dailyNeeds.waterPerHead}</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Wheat className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-700">{t.feed}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-slate-900">{dailyNeeds.food}</div>
                  <div className="text-xs text-slate-500">{dailyNeeds.foodPerHead}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-2">{t.nutritionalBreakdown}</h3>
            <div className="h-64 w-full" style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionalBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {nutritionalBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {nutritionalBreakdown.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {item.name} ({item.value}%)
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Schedule */}
          <div className="glass-card rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-bold text-xl text-slate-800 mb-8 flex items-center gap-3">
              <Clock className="w-6 h-6 text-agricultural-sunset" /> {t.feedingSchedule}
            </h3>
            <div className="relative border-s-2 border-agricultural-sunset/30 ms-4 space-y-8">
              {schedule.map((item, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  key={index} 
                  className="relative ps-8 group"
                >
                  <div className="absolute -start-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-agricultural-sunset shadow-sm group-hover:scale-110 transition-transform"></div>
                  <div className="font-extrabold text-slate-900 text-lg mb-2">{item.time}</div>
                  <div className="text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 group-hover:border-agricultural-sunset/30 transition-colors">
                    {item.action}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-6 shadow-sm shadow-slate-200/50 border border-slate-100 border-s-4 border-s-emerald-500"
            >
              <h4 className="font-bold text-slate-800 mb-3 text-lg">{t.costSavings}</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{recommendations.costSaving}</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-6 shadow-sm shadow-slate-200/50 border border-slate-100 border-s-4 border-s-amber-500"
            >
              <h4 className="font-bold text-slate-800 mb-3 text-lg flex items-center gap-2">
                 {t.productivity}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{recommendations.productivity}</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-6 shadow-sm shadow-slate-200/50 border border-slate-100 border-s-4 border-s-blue-500"
            >
              <h4 className="font-bold text-slate-800 mb-3 text-lg">{t.localAlternatives}</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{recommendations.localFood}</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-6 shadow-sm shadow-slate-200/50 border border-slate-100 border-s-4 border-s-red-500"
            >
              <h4 className="font-bold text-slate-800 mb-3 text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> {t.healthWarnings}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{recommendations.healthWarnings}</p>
            </motion.div>
          </div>
          
        </div>
      </motion.div>
    </motion.div>
  );
}
