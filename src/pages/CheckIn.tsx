import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import type { MoodType } from '../types';
import { DAD_QUICK_REPLIES } from '../types';
import BottomNav from '../components/BottomNav';
import HeartWings from '../components/HeartWings';
import KissFeedback from '../components/KissFeedback';
import DoubleNarrativePoster from '../components/DoubleNarrativePoster';

export default function CheckIn() {
  const navigate = useNavigate();
  const {
    userInfo,
    phase,
    currentWeek,
    weekInfo,
    todayRecord,
    currentQuestion,
    saveTodayRecord,
    saveDadMessage,
    sendKiss,
    getMoodResponse,
  } = useApp();

  const [step, setStep] = useState(todayRecord ? 'done' : 'question');
  const [momMessage, setMomMessage] = useState(todayRecord?.momMessage || '');
  const [momMood, setMomMood] = useState<MoodType>(todayRecord?.momMood || 'happy');
  const [dadMessage, setDadMessage] = useState(todayRecord?.dadMessage || '');
  const [showDadPanel, setShowDadPanel] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleSave = () => {
    if (!momMessage.trim()) return;
    saveTodayRecord(momMessage, momMood, dadMessage || undefined);
    setStep('done');
  };

  const handleQuickReply = (reply: string) => {
    setDadMessage(reply);
  };

  if (!userInfo) {
    navigate('/');
    return null;
  }

  // 打卡完成页面
  if (step === 'done') {
    const handleDadSubmitInternal = () => {
      if (dadMessage.trim()) {
        saveDadMessage(dadMessage);
        setShowDadPanel(false);
      }
    };

    return (
      <div
        className="min-h-screen p-4 flex flex-col items-center pb-24"
        data-theme={phase === 'first' ? '' : phase === 'second' ? 'second' : 'third'}
        style={{
          background: `linear-gradient(180deg, var(--theme-bg) 0%, var(--theme-primary) 100%)`,
        }}
      >
        {/* 飞吻反馈 */}
        {todayRecord?.hasDadInteraction && (
          <KissFeedback
            kissSent={todayRecord?.kissSent || false}
            kissTime={todayRecord?.kissTime}
            onSendKiss={sendKiss}
          />
        )}

        {/* 双叙事海报 */}
        <div className="mt-4">
          <DoubleNarrativePoster
            babyName={userInfo?.babyName || ''}
            weekNumber={currentWeek}
            fruit={weekInfo.fruit}
            momMessage={todayRecord?.momMessage || momMessage || '今天也要加油！'}
            momMood={todayRecord?.momMood || momMood}
            dadMessage={todayRecord?.dadMessage || dadMessage}
            date={todayRecord?.date || new Date().toISOString()}
            onGenerate={(dataUrl) => setGeneratedImage(dataUrl)}
          />
        </div>

        {/* 保存和分享按钮 */}
        {generatedImage && (
          <div className="mt-4 w-full max-w-sm flex gap-2">
            <a
              href={generatedImage}
              download={`萌芽日记-${currentWeek}周.png`}
              className="flex-1 bg-pink-500 text-white py-3 rounded-full font-medium text-center"
            >
              保存到相册 💾
            </a>
            <button
              onClick={async () => {
                try {
                  // 检查是否支持网页分享API
                  if (navigator.share) {
                    await navigator.share({
                      title: `${userInfo?.babyName}的第${currentWeek}周`,
                      text: `记录宝宝成长的第${currentWeek}周 - 萌芽日记`,
                      url: window.location.href,
                    });
                  } else {
                    // 不支持则复制链接
                    await navigator.clipboard.writeText(window.location.href);
                    alert('链接已复制到剪贴板！');
                  }
                } catch (err) {
                  console.log('分享取消或失败');
                }
              }}
              className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-full font-medium"
            >
              分享给朋友 📤
            </button>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-4 flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={() => setShowDadPanel(true)}
            className="bg-blue-500 text-white py-3 rounded-full font-medium"
          >
            呼叫爸爸参与 👨
          </button>

          <button
            onClick={() => navigate('/')}
            className="bg-white/50 text-gray-600 py-3 rounded-full font-medium"
          >
            返回首页
          </button>
        </div>

        <BottomNav />

        {/* 爸爸参与面板 */}
        {showDadPanel && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-30" onClick={() => setShowDadPanel(false)}>
            <div className="bg-white rounded-t-3xl p-6 w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4 text-center">呼叫爸爸参与 💕</h3>

              {/* 分享链接给爸爸 */}
              <div className="mb-4 p-3 bg-green-50 rounded-xl">
                <p className="text-sm text-green-700 mb-2">📤 分享链接给爸爸</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/dad/${encodeURIComponent(userInfo?.babyName || '宝宝')}/${currentWeek}`}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-green-200 rounded-lg text-gray-600"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/dad/${encodeURIComponent(userInfo?.babyName || '宝宝')}/${currentWeek}`);
                      alert('链接已复制到剪贴板！');
                    }}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm whitespace-nowrap"
                  >
                    复制
                  </button>
                </div>
              </div>

              <div className="text-center text-gray-400 text-sm my-3">或直接留言</div>

              {/* 快捷回复 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {DAD_QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <textarea
                value={dadMessage}
                onChange={(e) => setDadMessage(e.target.value)}
                placeholder="爸爸想对宝宝说什么？"
                className="w-full p-3 border border-gray-200 rounded-xl mb-4"
                rows={3}
              />

              <button
                onClick={handleDadSubmitInternal}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
              >
                提交爸爸的留言
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 打卡流程
  return (
    <div
      className="min-h-screen flex flex-col items-center"
      data-theme={phase === 'first' ? '' : phase === 'second' ? 'second' : 'third'}
      style={{
        background: `linear-gradient(180deg, var(--theme-bg) 0%, var(--theme-primary) 100%)`,
      }}
    >
      {/* 统一容器：局部样式，仅影响记心声页面 */}
      <div className="checkin-container w-full max-w-sm px-4 pb-24 pt-8 flex flex-col items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* 心声双翼组件 - 大间距 */}
        <div className="w-full mb-12">
          <HeartWings
            momMessage={momMessage}
            momMood={momMood}
            dadMessage={dadMessage}
            onMomMessageChange={setMomMessage}
            onMomMoodChange={setMomMood}
            onDadMessageChange={setDadMessage}
            showDadPanel={showDadPanel}
            onToggleDadPanel={() => setShowDadPanel(!showDadPanel)}
            currentQuestion={currentQuestion}
            moodResponse={getMoodResponse(momMood)}
          />
        </div>

        {/* 继续按钮 - 大间距 */}
        <button
          onClick={handleSave}
          disabled={!momMessage.trim()}
          className="w-full mt-12 mb-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3 rounded-xl font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          生成今日纪念 💕
        </button>

        <BottomNav />
      </div>
    </div>
  );
}
