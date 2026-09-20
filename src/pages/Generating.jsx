import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Droplets, Wheat, BrainCircuit } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { generateReportFromGroq } from '../services/aiService';

const loadingSteps = [
  { icon: <BrainCircuit className="w-8 h-8 text-agricultural-green" />, text: "AI analyzing animal profile..." },
  { icon: <Wheat className="w-8 h-8 text-agricultural-sunset" />, text: "Calculating macronutrient ratios..." },
  { icon: <Droplets className="w-8 h-8 text-blue-500" />, text: "Estimating daily hydration needs..." },
  { icon: <Sprout className="w-8 h-8 text-green-600" />, text: "Finalizing optimal feeding plan..." },
];

export default function Generating() {
  const { animalType, animalBreed, herdSize, age, location, season, budget, language, setCurrentReport, setView } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Step animation logic
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 800);

    // AI Generation logic
    const fetchReport = async () => {
      try {
        const report = await generateReportFromGroq(animalType, animalBreed, herdSize, age, location, season, budget, language);
        setCurrentReport(report);
        setView('report');
      } catch (error) {
        console.error("Failed to generate report", error);
        alert("Failed to generate report. Check console for details (did you add your Groq API key?).");
        setView('assistant'); // fallback on error
      }
    };

    fetchReport();

    return () => clearInterval(stepInterval);
  }, [animalType, animalBreed, herdSize, age, location, season, budget, language, setCurrentReport, setView]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 rounded-3xl flex flex-col items-center max-w-md w-full text-center relative overflow-hidden"
      >
        {/* Pulsing background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-agricultural-green/10 to-agricultural-sunset/10 animate-pulse rounded-3xl"></div>

        <div className="relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-agricultural-green border-r-agricultural-sunset"
            ></motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                {loadingSteps[currentStep].icon}
              </motion.div>
            </AnimatePresence>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating Report</h2>
          
          <div className="h-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-slate-500 font-medium"
              >
                {loadingSteps[currentStep].text}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
