import { useState } from 'react';

interface KissFeedbackProps {
  kissSent: boolean;
  kissTime?: number;
  onSendKiss: () => void;
  showNotification?: boolean;
}

export default function KissFeedback({
  kissSent,
  kissTime,
  onSendKiss,
  showNotification = false,
}: KissFeedbackProps) {
  const [animating, setAnimating] = useState(false);

  // 震动反馈
  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handleSendKiss = () => {
    setAnimating(true);
    triggerVibration();
    onSendKiss();
    setTimeout(() => setAnimating(false), 1000);
  };

  // 显示飞吻通知气泡
  if (showNotification && kissSent && kissTime) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
        <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-xl">💋</span>
          <span className="text-sm font-medium">爸爸收到了飞吻！</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {!kissSent ? (
        <button
          onClick={handleSendKiss}
          disabled={animating}
          className={`flex flex-col items-center gap-1 transition-all ${
            animating ? 'scale-125' : 'hover:scale-110'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 flex items-center justify-center shadow-lg">
            <span className="text-2xl">💋</span>
          </div>
          <span className="text-xs text-gray-500">发送飞吻</span>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-2xl animate-pulse">💕</span>
          </div>
          <span className="text-xs text-pink-500">飞吻已送达</span>
          {kissTime && (
            <span className="text-xs text-gray-400">
              {new Date(kissTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}