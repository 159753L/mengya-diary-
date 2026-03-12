import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { todayRecord } = useApp();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getPhaseColor = () => {
    return 'text-pink-500';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe">
      <div className="flex justify-around items-end px-2 py-3 max-w-md mx-auto">
        {/* 左一：森林 - 首页 */}
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center py-2 px-3 transition-all ${
            isActive('/') && location.pathname === '/' ? getPhaseColor() : 'text-gray-400'
          }`}
        >
          <span className="text-2xl mb-1">🌲</span>
          <span className="text-xs font-medium">森林</span>
        </button>

        {/* 左二：轨迹 - 回忆 */}
        <button
          onClick={() => navigate('/memories')}
          className={`flex flex-col items-center py-2 px-3 transition-all ${
            isActive('/memories') ? getPhaseColor() : 'text-gray-400'
          }`}
        >
          <span className="text-2xl mb-1">📖</span>
          <span className="text-xs font-medium">轨迹</span>
        </button>

        {/* 中心凸起：记心声 - 打卡 */}
        <button
          onClick={() => navigate('/checkin')}
          className={`relative -mt-4 flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
            todayRecord
              ? 'bg-gradient-to-r from-pink-400 to-rose-400'
              : 'bg-gradient-to-r from-rose-400 to-pink-400'
          }`}
        >
          <span className="text-2xl mb-0.5">💕</span>
          <span className="text-xs font-medium text-white">记心声</span>
        </button>

        {/* 右二：秘密 - 发现 */}
        <button
          onClick={() => navigate('/discover')}
          className={`flex flex-col items-center py-2 px-3 transition-all ${
            isActive('/discover') ? getPhaseColor() : 'text-gray-400'
          }`}
        >
          <span className="text-2xl mb-1">🎁</span>
          <span className="text-xs font-medium">秘密</span>
        </button>

        {/* 右一：我的 - 设置 */}
        <button
          onClick={() => navigate('/settings')}
          className={`flex flex-col items-center py-2 px-3 transition-all ${
            isActive('/settings') ? getPhaseColor() : 'text-gray-400'
          }`}
        >
          <span className="text-2xl mb-1">✨</span>
          <span className="text-xs font-medium">我的</span>
        </button>
      </div>
    </div>
  );
}