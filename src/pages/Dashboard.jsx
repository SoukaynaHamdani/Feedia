import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Info, AlertCircle, Globe } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { Button } from '../components/ui/Button';

const animals = [
  { id: 'cow', name: 'Cow', icon: '🐄' },
  { id: 'sheep', name: 'Sheep', icon: '🐑' },
  { id: 'goat', name: 'Goat', icon: '🐐' },
  { id: 'chicken', name: 'Chicken', icon: '🐔' },
  { id: 'camel', name: 'Camel', icon: '🐪' },
];

const languages = [
  { id: 'fr', name: 'Français', flag: '🇫🇷' },
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'darija', name: 'الدارجة', flag: '🇲🇦' },
  { id: 'tamazight', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'ⵣ' },
];

const UI_TEXT = {
  fr: {
    title1: "Nourrissez avec ",
    title2: "l'IA.",
    subtitle: "Obtenez des recommandations nutritionnelles pilotées par l'IA, des programmes d'alimentation précis et des conseils pour réduire les coûts de votre élevage en quelques secondes.",
    animalQ: "Quel type d'animal souhaitez-vous nourrir ?",
    herdQ: "Combien d'animaux composent le troupeau ?",
    herdPlaceholder: "ex. 50",
    advanced: "Paramètres avancés de l'élevage (optionnel)",
    breed: "Race / type précis",
    breedPlaceholder: "ex. Sardi, Holstein, etc.",
    age: "Âge / stade de vie",
    agePlaceholder: "ex. 6 mois, adulte, en lactation",
    location: "Localisation / environnement",
    locationPlaceholder: "ex. montagnes de l'Atlas, semi-aride",
    season: "Saison",
    budget: "Budget (currency)",
    budgetPlaceholder: "ex. 15000",
    winter: "Hiver", spring: "Printemps", summer: "Été", autumn: "Automne",
    generate: "Générer le rapport IA",
    info: "Notre IA utilise les dernières connaissances vétérinaires pour calculer des ratios alimentaires et des besoins en eau adaptés strictement à l'espèce et au nombre d'animaux."
  },
  en: {
    title1: "Feed by ",
    title2: "AI.",
    subtitle: "Get AI-powered nutritional recommendations, tailored feeding schedules, and cost-saving tips for your livestock in seconds.",
    animalQ: "What type of animal are you feeding?",
    herdQ: "How many animals are in the herd?",
    herdPlaceholder: "e.g. 50",
    advanced: "Advanced Livestock Parameters (Optional)",
    breed: "Breed / Specific Type",
    breedPlaceholder: "e.g. Sardi, Holstein, etc.",
    age: "Age / Life Stage",
    agePlaceholder: "e.g. 6 months, adult, lactating",
    location: "Location / Environment",
    locationPlaceholder: "e.g. Atlas Mountains, semi-arid",
    season: "Season",
    budget: "Budget (DH)",
    budgetPlaceholder: "e.g. 15000",
    winter: "Winter", spring: "Spring", summer: "Summer", autumn: "Autumn",
    generate: "Generate AI Report",
    info: "Our AI uses the latest veterinary insights to calculate optimal food ratios and water requirements based strictly on species and herd size."
  },
  darija: {
    title1: "العلف بـ ",
    title2: "الذكاء الاصطناعي.",
    subtitle: "احصل على نصائح غذائية بالذكاء الاصطناعي، برنامج علف مخصص، ونصائح باش توفر الفلوس للبهائم ديالك فثواني.",
    animalQ: "شنو نوع البهائم اللي كتعلف؟",
    herdQ: "شحال العدد ديال البهائم اللي عندك؟",
    herdPlaceholder: "مثلا 50",
    advanced: "معلومات إضافية (اختياري)",
    breed: "السلالة / النوع",
    breedPlaceholder: "مثلا: الصردي، هولشتاين",
    age: "العمر / المرحلة",
    agePlaceholder: "مثلا 6 شهور، بالغ، كترضع",
    location: "المكان / البيئة",
    locationPlaceholder: "مثلا جبال الأطلس",
    season: "الفصل",
    budget: "الميزانية (العملة)",
    budgetPlaceholder: "مثلا 15000",
    winter: "الشتا", spring: "الربيع", summer: "الصيف", autumn: "الخريف",
    generate: "صايب التقرير",
    info: "الذكاء الاصطناعي ديالنا كيستعمل أحدث المعلومات البيطرية باش يحسب أحسن كميات ديال العلف والما على حساب النوع والعدد."
  },
  tamazight: {
    title1: "ⵓⵜⵛⵉ ⵙ ",
    title2: "ⵓⵙⵎⴳⴰⵍ.",
    subtitle: "ⴰⵎⵥ ⵉⵙⵡⵉⵏⴳⵎⵏ ⵏ ⵓⵜⵛⵉ ⵙ ⵓⵙⵎⴳⴰⵍ, ⴰⵖⴰⵡⴰⵙ ⵏ ⵓⵙⵙⵛⵜⴰ, ⴷ ⵉⵙⵡⵉⵏⴳⵎⵏ ⵏ ⵓⴼⴰⵔⵙ ⵉ ⵉⵎⵓⴷⴰⵔ ⵏⵏⴽ ⴳ ⵜⵉⵙⵉⵏⵜ.",
    animalQ: "ⵎⴰⵏ ⴰⵏⴰⵡ ⵏ ⵉⵎⵓⴷⴰⵔ ⴰⵢ ⵜⵙⵙⵛⵜⴰⴷ?",
    herdQ: "ⵎⵏⵛⴽ ⵏ ⵉⵎⵓⴷⴰⵔ ⴰⵢ ⵖⵓⵔⴽ?",
    herdPlaceholder: "ⴰⵎⴷⵢⴰ 50",
    advanced: "ⵉⵏⵖⵎⵉⵙⵏ ⵢⴰⴹⵏ (ⴰⵙⵜⴰⵢ)",
    breed: "ⵜⴰⵡⵙⵉⵜ / ⴰⵏⴰⵡ",
    breedPlaceholder: "ⴰⵎⴷⵢⴰ: ⵚⵔⴷⵉ",
    age: "ⴰⵡⵜⴰⵢ / ⴰⴽⵓⴷ",
    agePlaceholder: "ⴰⵎⴷⵢⴰ 6 ⵉⵢⵢⵉⵔⵏ",
    location: "ⴰⴷⵖⴰⵔ / ⵜⴰⵡⵏⵏⴰⴹⵜ",
    locationPlaceholder: "ⴰⵎⴷⵢⴰ ⵉⴷⵔⴰⵔⵏ ⵏ ⵡⴰⵟⵍⴰⵙ",
    season: "ⴰⵙⴳⴳⵯⴰⵙ",
    budget: "ⵜⴰⵎⵙⴰⵙⵜ (ⴷⵔⵀⵎ)",
    budgetPlaceholder: "ⴰⵎⴷⵢⴰ 15000",
    winter: "ⵜⴰⴳⵔⵙⵜ", spring: "ⵜⴰⴼⵙⵓⵜ", summer: "ⴰⵏⴱⴷⵓ", autumn: "ⴰⵎⵡⴰⵏ",
    generate: "ⵙⴽⵔ ⴰⵏⵇⵇⵉⵙ",
    info: "ⴰⵎⵙⵉⵡⵙ ⵏⵏⵖ ⴰⵔ ⵉⵙⵅⴷⴷⴰⵎ ⵜⵓⵙⵙⵏⴰ ⵜⴰⵎⴰⵢⵏⵓⵜ ⵏ ⵜⴼⵍⵍⴰⵃⵜ ⴰⴼⴰⴷ ⴰⴷ ⵉⵃⵙⴱ ⵓⵜⵛⵉ ⴷ ⵡⴰⵎⴰⵏ ⵉⵅⵚⵚⴰⵏ."
  }
};

export default function Dashboard() {
  const { animalType, setAnimalType, herdSize, setHerdSize, setView, language, setLanguage } = useAppStore();
  const [error, setError] = useState('');
  
  const t = UI_TEXT[language] || UI_TEXT.en;
  const isRtl = language === 'darija';

  const handleGenerate = () => {
    if (!animalType) {
      setError('Please select an animal type.');
      return;
    }
    if (!herdSize || herdSize <= 0) {
      setError('Please enter a valid number of animals.');
      return;
    }
    setError('');
    setView('generating');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6 w-full max-w-3xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          {t.title1} <span className="text-agricultural-green">{t.title2}</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          {t.subtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full glass-card rounded-3xl p-6 md:p-10"
      >
        {/* Language Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-agricultural-sunset" />
            Choose your language / اختار اللغة ديالك / ⵙⵜⵉ ⵜⵓⵜⵍⴰⵢⵜ
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all text-base font-medium ${language === lang.id
                    ? 'border-agricultural-sunset bg-agricultural-sunset/10 shadow-md text-agricultural-sunset-dark'
                    : 'border-slate-200 hover:border-agricultural-sunset/50 hover:bg-slate-50 text-slate-600'
                  }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Animal Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            {t.animalQ}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {animals.map((animal) => (
              <button
                key={animal.id}
                onClick={() => setAnimalType(animal.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${animalType === animal.id
                    ? 'border-agricultural-green bg-agricultural-green/10 shadow-md'
                    : 'border-slate-200 hover:border-agricultural-green/50 hover:bg-slate-50'
                  }`}
              >
                <span className="text-3xl mb-2 block">{animal.icon}</span>
                <span className={`font-medium ${animalType === animal.id ? 'text-agricultural-green-dark' : 'text-slate-600'}`}>
                  {animal.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Herd Size */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            {t.herdQ}
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={herdSize}
              onChange={(e) => setHerdSize(e.target.value)}
              placeholder={t.herdPlaceholder}
              className="w-full text-xl px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-agricultural-green focus:ring-4 focus:ring-agricultural-green/20 transition-all"
            />
          </div>
        </div>

        {/* Advanced Parameters */}
        <div className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             {t.advanced}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t.breed}</label>
              <input
                type="text"
                value={useAppStore(state => state.animalBreed)}
                onChange={(e) => useAppStore.getState().setAnimalBreed(e.target.value)}
                placeholder={t.breedPlaceholder}
                className="w-full text-base px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-agricultural-green transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{t.age}</label>
              <input
                type="text"
                value={useAppStore(state => state.age)}
                onChange={(e) => useAppStore.getState().setAge(e.target.value)}
                placeholder={t.agePlaceholder}
                className="w-full text-base px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-agricultural-green transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{t.location}</label>
              <input
                type="text"
                value={useAppStore(state => state.location)}
                onChange={(e) => useAppStore.getState().setLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="w-full text-base px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-agricultural-green transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{t.season}</label>
              <select
                value={useAppStore(state => state.season)}
                onChange={(e) => useAppStore.getState().setSeason(e.target.value)}
                className="w-full text-base px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-agricultural-green transition-all"
              >
                <option value="winter">{t.winter}</option>
                <option value="spring">{t.spring}</option>
                <option value="summer">{t.summer}</option>
                <option value="autumn">{t.autumn}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{t.budget}</label>
              <input
                type="number"
                value={useAppStore(state => state.budget)}
                onChange={(e) => useAppStore.getState().setBudget(e.target.value)}
                placeholder={t.budgetPlaceholder}
                className="w-full text-base px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-agricultural-green transition-all"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <Button size="lg" onClick={handleGenerate} className="group text-lg shadow-emerald-500/20 shadow-xl">
          {t.generate}
          <ArrowRight className={`w-5 h-5 transition-transform ${isRtl ? 'mr-2 rotate-180 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'}`} />
        </Button>

        <div className="mt-6 flex items-start gap-2 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <Info className="w-5 h-5 shrink-0 text-agricultural-sunset" />
          <p>
            {t.info}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
