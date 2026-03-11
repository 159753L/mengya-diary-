import { useState } from 'react';
import { DAD_QUICK_REPLIES } from '../types';

interface DadShareProps {
  babyName: string;
  weekNumber: number;
  onSubmit: (message: string) => void;
}

export default function DadShare({ babyName, weekNumber, onSubmit }: DadShareProps) {
  const [message, setMessage] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
  };

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message);
    }
  };

  const shareUrl = `${window.location.origin}/dad/${encodeURIComponent(babyName)}/${weekNumber}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👶</div>
          <h1 className="text-2xl font-bold text-blue-600 mb-2">
            {babyName} 正在等你说话
          </h1>
          <p className="text-gray-500">第 {weekNumber} 周的成长，等爸爸参与～</p>
        </div>

        {/* 爸爸留言卡片 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <h2 className="font-bold text-gray-700 mb-4">爸爸想对宝宝说什么？</h2>

          {/* 快捷回复 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DAD_QUICK_REPLIES.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  message === reply
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* 输入框 */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="或者写下想说的话..."
            className="w-full p-4 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
            rows={4}
          />

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-4 rounded-xl font-semibold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            传递给妈妈 💕
          </button>
        </div>

        {/* 分享选项 */}
        <div className="text-center">
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-blue-500 text-sm"
          >
            {showQR ? '隐藏' : ''} 分享给爸爸
          </button>

          {showQR && (
            <div className="mt-4 bg-white p-4 rounded-xl inline-block">
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400 text-xs">二维码</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{shareUrl}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
