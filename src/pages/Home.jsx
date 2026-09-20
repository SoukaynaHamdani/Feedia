import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, CloudOff, PiggyBank, FileText, MousePointer2, BrainCircuit, ClipboardCheck } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import farmBackground from './resources/farmgreen.png';

import feediaLogo from './resources/feedia_logo.png';

const HERO_CONTENT = [
  {
    id: 'fr',
    dir: 'ltr',
    title1: 'Nourrissez mieux,',
    title2: 'Élevez mieux.',
    subtitle: 'Dites-nous simplement quel animal vous avez et où vous vivez, et notre IA vous proposera un programme quotidien précis d’alimentation et d’eau, basé sur la science agricole et conçu pour réduire les coûts.',
    btnPrimary: 'Lancer l’assistant IA',
    btnSecondary: 'Voir un exemple de rapport',
    btnVoiceChat: 'Assistant vocal'
  },
  {
    id: 'en',
    dir: 'ltr',
    title1: 'Feed Smarter,',
    title2: 'Farm Better.',
    subtitle: 'Just tell us what animals you have and where you live, and our AI will give you an exact, cost-saving daily feeding and watering schedule based on expert agricultural science.',
    btnPrimary: 'Launch AI Assistant',
    btnSecondary: 'View Example Report',
    btnVoiceChat: 'Voice Assistant'
  },
  {
    id: 'ar',
    dir: 'rtl',
    title1: 'علّف بذكاء،',
    title2: 'ربّي أحسن.',
    subtitle: 'قل لينا شنو عندك ديال البهائم، والذكاء الاصطناعي غادي يعطيك خطة يومية دقيقة وموفرة للفلوس ديال العلف والماء مبنية على علم الفلاحة.',
    btnPrimary: 'ابدأ المساعد الذكي',
    btnSecondary: 'شوف مثال تقرير',
    btnVoiceChat: 'المساعد الصوتي'
  },
  {
    id: 'tz',
    dir: 'ltr',
    title1: 'ⵙⵙⵛⵜⴰ ⵙ ⵓⵏⴳⴰⵍ,',
    title2: 'ⴽⵔⵣ ⵓⴳⴰⵔ.',
    subtitle: 'ⵉⵏⵉ ⴰⵏⵖ ⵎⴰⵏ ⵉⵎⵓⴷⴰⵔ ⵖⵓⵔⴽ, ⴰⵎⵙⵉⵡⵙ ⵏⵏⵖ ⴰⴷ ⴰⴽ ⵢⴼⴽ ⴰⵖⴰⵡⴰⵙ ⵏ ⵓⵙⵙⵛⵜⴰ ⵉⵙⵏⵉⴷⵏ ⵅⴼ ⵜⵓⵙⵙⵏⴰ ⵏ ⵜⴼⵍⵍⴰⵃⵜ.',
    btnPrimary: 'ⵙⴽⵔ ⴰⵎⵙⵉⵡⵙ',
    btnSecondary: 'ⵥⵕ ⴰⵎⴷⵢⴰ',
    btnVoiceChat: 'ⴰⵎⵙⵉⵡⵙ ⴰⵎⵙⵍⵉ'
  }
];

export default function Home() {
  const setView = useAppStore((state) => state.setView);
  const setCurrentReport = useAppStore((state) => state.setCurrentReport);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [isExpanded, setIsExpanded] = useState(false);
  const [topCardIndex, setTopCardIndex] = useState(0);
  const [currentLangIndex, setCurrentLangIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLangIndex((prev) => (prev + 1) % HERO_CONTENT.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleViewExample = () => {
    setCurrentReport({
      overview: { animal: 'Sheep', size: 50, summary: 'Example 8-week concrete nutrition plan for 50 sheep based on local Moroccan semi-arid climate data.' },
      dailyNeeds: { water: '400 Liters', food: '75 Kg', waterPerHead: '8 L/head', foodPerHead: '1.5 kg/head' },
      nutritionalBreakdown: [
        { name: 'Alfalfa Hay', value: 50 },
        { name: 'Barley Grain', value: 30 },
        { name: 'Protein Mix', value: 15 },
        { name: 'Minerals', value: 5 }
      ],
      schedule: [
        { time: '07:00 AM', action: 'Morning feeding: Provide 35kg of alfalfa hay. Ensure water troughs are clean and filled.' },
        { time: '10:00 AM', action: 'Grazing: Allow the sheep to graze outside in available pastures.' },
        { time: '01:00 PM', action: 'Rest: Bring sheep indoors or to shaded areas during peak heat.' },
        { time: '04:00 PM', action: 'Evening feeding: Provide 40kg mix of barley and protein concentrate. Refill water.' }
      ],
      recommendations: {
        costSaving: 'Substitute 20% of commercial feed with local agricultural by-products like olive cake or citrus pulp.',
        productivity: 'Ensure 24/7 access to clean water to maximize digestion and milk/meat yield.',
        localFood: 'Use locally sourced barley instead of imported corn.',
        healthWarnings: 'Monitor for bloat when introducing fresh spring pastures rapidly.'
      }
    });
    setView('report');
  };

  const getCardAnimation = (index) => {
    const pos = (index - topCardIndex + 3) % 3;
    if (!isExpanded) {
      // Stacked
      return {
        x: (pos - 1) * 35,
        y: 0,
        rotate: pos === 0 ? 0 : (pos === 1 ? -6 : 6),
        scale: 1 - (pos * 0.05),
        zIndex: 30 - pos * 10,
        opacity: 1,
      };
    } else {
      // Expanded
      if (isMobile) {
        return {
          x: 0,
          y: (index - 1) * 320,
          rotate: 0,
          scale: 1,
          zIndex: 30 - pos * 10,
          opacity: 1,
        };
      } else {
        return {
          x: (index - 1) * 340,
          y: 0,
          rotate: 0,
          scale: 1,
          zIndex: 30 - pos * 10,
          opacity: 1,
        };
      }
    }
  };

  return (
    <div className="w-full bg-[#f4f7ed]">
      {/* Full-bleed Hero Section */}
      <section
        className="relative w-full py-40 px-4 sm:px-6 flex flex-col items-center justify-center mb-20 overflow-hidden"
        style={{
          backgroundImage: `url(${farmBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Navigation Bar (Hidden on Mobile, replaced by Bottom Nav) */}
        <nav className="absolute top-0 left-0 w-full z-20 px-6 py-8 hidden md:flex items-center justify-center max-w-7xl mx-auto left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-10 bg-white/20 backdrop-blur-xl px-8 py-3 rounded-full border border-white/30 shadow-2xl">
            <a href="#" onClick={() => setView('home')} className="text-slate-900 font-bold text-sm tracking-widest uppercase hover:text-agricultural-green transition-all hover:scale-110">Home</a>
            <a href="#" onClick={() => setView('assistant')} className="text-slate-900 font-bold text-sm tracking-widest uppercase hover:text-agricultural-green transition-all hover:scale-110">Feed by AI</a>
            <a href="#" onClick={() => setView('voicechat')} className="text-slate-900 font-bold text-sm tracking-widest uppercase hover:text-agricultural-green transition-all hover:scale-110">Voice Chat</a>
            <a href="#" onClick={handleViewExample} className="text-slate-900 font-bold text-sm tracking-widest uppercase hover:text-agricultural-green transition-all hover:scale-110">Example</a>
          </div>
        </nav>

        {/* Semi-transparent overlays to ensure text contrast */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-agricultural-wheat/30"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl mx-auto w-full flex flex-col items-center"
        >
          {/* Logo & Localized Glow Badge */}
          <div className="mb-8 flex flex-col items-center">
            <img
              src={feediaLogo}
              alt="Feedia Logo"
              className="h-32 md:h-48 mx-auto drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-300 mb-6"
            />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-agricultural-green/15 text-agricultural-green border border-agricultural-green/20 text-xs md:text-sm font-black tracking-wider uppercase backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agricultural-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-agricultural-green"></span>
              </span>
              {currentLangIndex === 0 && "Morocco's AI Livestock Hub"}
              {currentLangIndex === 1 && "محرك التغذية الذكي للمغرب"}
              {currentLangIndex === 2 && "ⴰⵙⵎⴳⴰⵍ ⵏ ⵓⵙⵙⵛⵜⴰ ⵉ ⵍⵎⵖⵔⵉⴱ"}
            </div>
          </div>

          {/* Text Container with Carousel (Fully relative to prevent overlap) */}
          <div className="w-full flex flex-col items-center justify-start min-h-[320px] sm:min-h-[220px] md:min-h-[260px] relative">
            <motion.div
              key={currentLangIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full flex flex-col items-center text-center"
            >
              <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-6 md:mb-8 tracking-tight drop-shadow-xl leading-tight">
                {HERO_CONTENT[currentLangIndex].title1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-agricultural-green via-emerald-600 to-teal-500 font-extrabold">
                  {HERO_CONTENT[currentLangIndex].title2}
                </span>
              </h1>
              <p
                className="text-lg md:text-2xl text-slate-800 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm px-4"
                dir={HERO_CONTENT[currentLangIndex].dir}
              >
                {HERO_CONTENT[currentLangIndex].subtitle}
              </p>
            </motion.div>
          </div>

          {/* Static Buttons (Highly Stylized, Lift Transform, and Glow Shadow) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-10 relative z-20" dir={HERO_CONTENT[currentLangIndex].dir}>
            <Button size="lg" onClick={() => setView('assistant')} className="group text-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 shadow-2xl px-8 border border-white/20 w-full sm:w-auto transition-all duration-300 transform hover:-translate-y-0.5">
              {HERO_CONTENT[currentLangIndex].btnPrimary}
              <ArrowRight className={`w-5 h-5 transition-transform ${HERO_CONTENT[currentLangIndex].dir === 'rtl' ? 'mr-2 rotate-180 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'}`} />
            </Button>
            <Button size="lg" onClick={() => {
              const currentId = HERO_CONTENT[currentLangIndex].id;
              if (currentId === 'ar') setLanguage('darija');
              else if (currentId === 'tz') setLanguage('tamazight');
              else if (currentId === 'fr') setLanguage('fr');
              else setLanguage('en');
              setView('voicechat');
            }} className="group text-lg bg-teal-600 hover:bg-teal-700 shadow-teal-500/25 hover:shadow-teal-500/40 shadow-2xl px-8 border border-white/20 w-full sm:w-auto transition-all duration-300 transform hover:-translate-y-0.5 text-white">
              <span className={`transition-transform ${HERO_CONTENT[currentLangIndex].dir === 'rtl' ? 'ml-2 group-hover:rotate-12' : 'mr-2 group-hover:rotate-12'}`}>🎙️</span>
              {HERO_CONTENT[currentLangIndex].btnVoiceChat}
            </Button>
            <Button variant="outline" size="lg" onClick={handleViewExample} className="text-lg px-8 bg-white/95 backdrop-blur-md border-2 border-slate-300 hover:border-agricultural-green hover:bg-white shadow-xl w-full sm:w-auto transition-all duration-300 transform hover:-translate-y-0.5">
              {HERO_CONTENT[currentLangIndex].btnSecondary}
            </Button>
          </div>
        </motion.div>
      </section>

      <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto space-y-20 px-4 sm:px-6 pb-20">

        {/* How it Works */}
        <section className="w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600">Get a professional nutrition plan in three simple steps.</p>
          </div>

          <div
            className="relative w-full max-w-5xl mx-auto flex items-center justify-center cursor-pointer transition-all duration-500 ease-out"
            style={{ height: isExpanded && isMobile ? '850px' : '400px' }}
            onClick={() => {
              if (isExpanded) {
                setTopCardIndex((prev) => (prev + 1) % 3);
              }
              setIsExpanded(!isExpanded);
            }}
          >
            {[
              { step: 'Step 1', title: 'Select Animal', desc: 'Choose your livestock type and enter the number of animals in your herd.', icon: <MousePointer2 />, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30' },
              { step: 'Step 2', title: 'AI Analysis', desc: 'Our veterinary-trained AI instantly calculates macronutrient and water needs.', icon: <BrainCircuit />, color: 'from-purple-500 to-fuchsia-400', shadow: 'shadow-purple-500/30' },
              { step: 'Step 3', title: 'Get Report', desc: 'Receive an actionable plan with feeding schedules and cost-saving tips.', icon: <ClipboardCheck />, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/30' }
            ].map((item, i) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={getCardAnimation(i)}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                key={item.step}
                className="absolute w-[280px] sm:w-[320px] p-8 rounded-[2.5rem] text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-shadow duration-300 border border-white/80 bg-white/95 backdrop-blur-sm overflow-hidden group"
              >
                {/* Decorative Watermark Icon */}
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] text-slate-900 pointer-events-none transform group-hover:scale-110 transition-transform duration-500">
                  {React.cloneElement(item.icon, { className: "w-56 h-56" })}
                </div>

                {/* Step Badge */}
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-sm font-bold mb-6 tracking-wide uppercase">
                  {item.step}
                </div>

                {/* Icon Box */}
                <div className={`w-20 h-20 bg-gradient-to-br ${item.color} text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl ${item.shadow} relative overflow-hidden transform group-hover:-translate-y-1 transition-transform duration-300`}>
                  <div className="absolute inset-0 bg-white/20 translate-y-[-50%] rotate-45 transform origin-top-left"></div>
                  {React.cloneElement(item.icon, { className: "w-10 h-10 relative z-10" })}
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Value Propositions */}
        <section className="w-full glass-card p-10 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-white to-agricultural-green/5 border-agricultural-green/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Why Farmers Trust Feedia</h2>
              <p className="text-lg text-slate-600 mb-8">
                Built for rural environments, our platform focuses on simplicity, accessibility, and real-world agricultural efficiency.
              </p>
              <ul className="space-y-6">
                {[
                  { icon: <PiggyBank className="w-6 h-6 text-emerald-600" />, title: 'Reduce Feed Waste', desc: 'Optimize portions to stop overfeeding and save money.' },
                  { icon: <CloudOff className="w-6 h-6 text-blue-600" />, title: 'Offline Ready', desc: 'Access saved reports anywhere, even without internet.' },
                  { icon: <Activity className="w-6 h-6 text-red-600" />, title: 'Health First', desc: 'Prevent deficiencies before they impact productivity.' }
                ].map((feature, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0 h-min">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{feature.title}</h4>
                      <p className="text-slate-600">{feature.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              {/* Visual representation of the report card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-agricultural-green to-agricultural-sunset blur-3xl opacity-20 rounded-full"></div>
              <div className="relative bg-white/90 backdrop-blur-sm border border-slate-200 p-8 rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <FileText className="w-10 h-10 text-agricultural-green" />
                  <div>
                    <div className="font-bold text-xl text-slate-800">Cow Nutrition Plan</div>
                    <div className="text-sm text-slate-500">Generated instantly</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-3 bg-slate-100 rounded-full w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                  <div className="h-3 bg-slate-100 rounded-full w-5/6"></div>
                  <div className="flex gap-2 mt-6">
                    <div className="h-8 bg-emerald-100 rounded-lg w-1/3"></div>
                    <div className="h-8 bg-amber-100 rounded-lg w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
