import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import Memories from './pages/Memories';
import Settings from './pages/Settings';
import Discover from './pages/Discover';
import Assistant from './pages/Assistant';
import DadSharePage from './pages/DadSharePage';
import Login from './pages/Login';
import Setup from './pages/Setup';
import AIAssistant from './components/AIAssistant';
import PushNotification from './components/PushNotification';
import { initVectorStore, isRAGConfigured } from './lib/ragService';
import { initSupabase } from './lib/supabase';

// 路由守卫 - 检查登录状态
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { userInfo } = useApp();

  useEffect(() => {
    // 检查登录状态
    const userId = localStorage.getItem('userId');
    const hasSetBaby = localStorage.getItem('hasSetBabyInfo');

    // 如果未登录，跳转到登录页
    if (!userId) {
      window.location.href = '/login';
      return;
    }

    // 如果已登录但未设置宝宝信息，跳转到设置页
    if (userId && !hasSetBaby) {
      window.location.href = '/setup';
      return;
    }

    setLoading(false);
  }, [userInfo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
        <div className="text-4xl">🌱</div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  // 初始化 Supabase
  useEffect(() => {
    initSupabase();
  }, []);

  // RAG 初始化
  useEffect(() => {
    if (isRAGConfigured()) {
      initVectorStore().then(ok => {
        if (ok) console.log('🧠 RAG向量知识库已就绪');
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/dad/:babyName/:weekNumber" element={<DadSharePage />} />

          {/* 需要登录的路由 */}
          <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
          <Route path="/checkin" element={<AuthGuard><CheckIn /></AuthGuard>} />
          <Route path="/memories" element={<AuthGuard><Memories /></AuthGuard>} />
          <Route path="/discover" element={<AuthGuard><Discover /></AuthGuard>} />
          <Route path="/assistant" element={<AuthGuard><Assistant /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />

          {/* 重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AIAssistant />
        <PushNotification />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
