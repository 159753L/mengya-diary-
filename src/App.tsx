import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './hooks/useApp';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import Memories from './pages/Memories';
import Settings from './pages/Settings';
import Discover from './pages/Discover';
import Assistant from './pages/Assistant';
import WhiteNoise from './components/WhiteNoise';
import DadSharePage from './pages/DadSharePage';
import AIAssistant from './components/AIAssistant';
import PushNotification from './components/PushNotification';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dad/:babyName/:weekNumber" element={<DadSharePage />} />
        </Routes>
        <WhiteNoise />
        <AIAssistant />
        <PushNotification />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
