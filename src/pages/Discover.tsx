import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import ScratchCard from '../components/ScratchCard';
import { getWeekSecret, isMonday } from '../data/secrets';
import BottomNav from '../components/BottomNav';

export default function Discover() {
  const navigate = useNavigate();
  const { userInfo, phase, currentWeek } = useApp();
  const [revealed, setRevealed] = useState(false);

  if (!userInfo) {
    navigate('/');
    return null;
  }

  const secret = getWeekSecret(currentWeek);

  return (
    <div
      className="min-h-screen p-6 pb-20"
      data-theme={phase === 'first' ? '' : phase === 'second' ? 'second' : 'third'}
      style={{
        background: `linear-gradient(180deg, var(--theme-bg) 0%, var(--theme-primary) 100%)`,
      }}
    >
      {/* 标题 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">🎁 发现</h1>
        <p className="text-gray-500">每周一个宝宝小秘密</p>
      </div>

      {/* 刮刮乐卡片 */}
      <div className="mb-6">
        <ScratchCard
          secret={secret.secret}
          week={currentWeek}
          onReveal={() => setRevealed(true)}
        />
      </div>

      {/* 温馨提示 */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 max-w-sm mx-auto">
        <p className="text-sm text-gray-500 text-center">
          {isMonday() ? '📅 今天是周一，快看看本周宝宝有什么新变化！' : '💡 每周一解锁新秘密，记得来看哦～'}
        </p>
      </div>

      {/* 宝宝成长百科 */}
      <div className="mt-6 max-w-sm mx-auto">
        <h3 className="font-bold text-gray-700 mb-3">📚 宝宝成长百科</h3>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-sm text-gray-600">
            已解锁 {revealed ? currentWeek : currentWeek - 1} 个秘密
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from({ length: Math.min(currentWeek, 40) }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < (revealed ? currentWeek : currentWeek - 1)
                    ? 'bg-pink-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
