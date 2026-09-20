import React from 'react';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Generating from './pages/Generating';
import Report from './pages/Report';
import VoiceChat from './pages/VoiceChat';
import useAppStore from './store/useAppStore';

function App() {
  const currentView = useAppStore((state) => state.currentView);

  return (
    <AppLayout>
      {currentView === 'home' && <Home />}
      {currentView === 'assistant' && <Dashboard />}
      {currentView === 'generating' && <Generating />}
      {currentView === 'report' && <Report />}
      {currentView === 'voicechat' && <VoiceChat />}
    </AppLayout>
  );
}

export default App;