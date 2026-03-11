import type { MoodType } from '../types';
import { MOOD_OPTIONS, DAD_QUICK_REPLIES } from '../types';

interface Question {
  type: string;
  text: string;
}

interface HeartWingsProps {
  momMessage: string;
  momMood: MoodType;
  dadMessage: string;
  onMomMessageChange: (message: string) => void;
  onMomMoodChange: (mood: MoodType) => void;
  onDadMessageChange: (message: string) => void;
  onDadSubmit?: () => void;
  showDadPanel: boolean;
  onToggleDadPanel: () => void;
  currentQuestion?: Question;
  moodResponse?: string;
}

export default function HeartWings({
  momMessage,
  momMood,
  dadMessage,
  onMomMessageChange,
  onMomMoodChange,
  onDadMessageChange,
  onDadSubmit,
  showDadPanel,
  onToggleDadPanel,
  currentQuestion,
  moodResponse,
}: HeartWingsProps) {
  const handleQuickReply = (reply: string) => {
    onDadMessageChange(reply);
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden">
      {/* 问题+AI回应头部 */}
      {(currentQuestion || moodResponse) && (
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-3 border-b border-pink-100 text-center">
          {currentQuestion && (
            <div className="mb-2">
              <span className="text-xs text-pink-500 font-medium">
                {currentQuestion.type === 'physical' && '💪 生理'}
                {currentQuestion.type === 'emotional' && '💕 情感'}
                {currentQuestion.type === 'reality' && '🌟 现实'}
              </span>
              <h2 className="text-sm font-bold text-gray-700 mt-0.5">{currentQuestion.text}</h2>
            </div>
          )}
          {moodResponse && (
            <p className="text-xs text-gray-500">💬 {moodResponse}</p>
          )}
        </div>
      )}

      <div className="flex">
        {/* 妈妈频道 - 左侧 */}
        <div className="flex-1 p-4 border-r border-pink-100 min-h-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👩</span>
            <span className="font-medium text-pink-600 text-sm">妈妈</span>
          </div>

          {/* 心情选择 */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => onMomMoodChange(option.type)}
                  className={`text-base p-1 rounded-full transition-all ${
                    momMood === option.type
                      ? 'bg-pink-100 scale-110'
                      : 'hover:bg-gray-50'
                  }`}
                  title={option.label}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 妈妈留言输入 */}
          <textarea
            value={momMessage}
            onChange={(e) => onMomMessageChange(e.target.value)}
            placeholder="想对宝宝说什么？"
            className="w-full p-2 bg-pink-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
            rows={3}
          />
        </div>

        {/* 爸爸频道 - 右侧 */}
        <div className="flex-1 p-4 min-h-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👨</span>
            <span className="font-medium text-blue-600 text-sm">爸爸</span>
          </div>

          {dadMessage ? (
            <div className="bg-blue-50 rounded-xl p-2">
              <p className="text-sm text-gray-600">{dadMessage}</p>
            </div>
          ) : (
            <div className="text-center py-2">
              <button
                onClick={onToggleDadPanel}
                className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium"
              >
                呼叫爸爸 👨
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 爸爸参与面板 */}
      {showDadPanel && (
        <div className="border-t border-pink-100 p-3 bg-blue-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-600 text-sm">快捷回复</span>
            <button
              onClick={onToggleDadPanel}
              className="text-gray-400 text-xs"
            >
              收起
            </button>
          </div>

          {/* 快捷回复选项 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {DAD_QUICK_REPLIES.slice(0, 3).map((reply) => (
              <button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                className={`px-2 py-1 rounded-full text-xs ${
                  dadMessage === reply
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-blue-600 border border-blue-200'
                }`}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* 爸爸自定义输入 */}
          <textarea
            value={dadMessage}
            onChange={(e) => onDadMessageChange(e.target.value)}
            placeholder="爸爸想说什么？"
            className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs resize-none focus:outline-none"
            rows={2}
          />

          {onDadSubmit && (
            <button
              onClick={onDadSubmit}
              disabled={!dadMessage.trim()}
              className="w-full mt-2 bg-blue-500 text-white py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              提交
            </button>
          )}
        </div>
      )}
    </div>
  );
}