import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { exportMemoryPoster } from '../lib/imageExport';
import BottomNav from '../components/BottomNav';
import BabyIllustration from '../components/BabyIllustration';

export default function Memories() {
  const [exporting, setExporting] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { userInfo, phase, allRecords, dadContributionCount, currentWeek } = useApp();

  // 连续打卡天数
  const getStreak = () => {
    if (allRecords.length === 0) return 0;
    let streak = 0;
    const sorted = [...allRecords].sort((a, b) => b.date.localeCompare(a.date));

    for (let i = 0; i < sorted.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const dateStr = expectedDate.toISOString().split('T')[0];

      if (sorted.find(r => r.date === dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // 爸爸贡献度
  const dadMedal = dadContributionCount >= 20;

  // 导出回忆录海报
  const handleExportPoster = async () => {
    if (!userInfo || allRecords.length === 0) return;

    setExporting(true);
    try {
      await exportMemoryPoster('memory-poster', userInfo.babyName, currentWeek);
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!userInfo) {
    navigate('/');
    return null;
  }

  return (
    <div
      className="min-h-screen p-6 pb-20"
      data-theme={phase === 'first' ? '' : phase === 'second' ? 'second' : 'third'}
      style={{
        background: `linear-gradient(180deg, var(--theme-bg) 0%, var(--theme-primary) 100%)`,
      }}
    >
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-700">📖 回忆</h1>
        <p className="text-gray-500">{userInfo.babyName}的成长轨迹</p>
      </div>

      {/* 进度卡片 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md mb-4 max-w-sm mx-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">孕周进度</span>
          <span className="text-pink-500 font-bold">第 {currentWeek} 周</span>
        </div>

        {/* 进度条 */}
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-500"
            style={{ width: `${(currentWeek / 40) * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">已记录 {allRecords.length} 天</span>
          <span className="text-gray-400">还剩 {40 - currentWeek} 周</span>
        </div>
      </div>

      {/* 连续打卡 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md mb-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">连续打卡</p>
            <p className="text-3xl font-bold text-pink-500">{getStreak()} 天 🔥</p>
          </div>
          <div className="text-4xl">💕</div>
        </div>
      </div>

      {/* 爸爸贡献度 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md mb-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">爸爸参与次数</p>
            <p className="text-3xl font-bold text-blue-500">{dadContributionCount} 次</p>
          </div>
          <div className="text-4xl">{dadMedal ? '🏆' : '👨'}</div>
        </div>

        {dadMedal && (
          <div className="mt-4 bg-yellow-50 rounded-xl p-3 text-center">
            <p className="text-yellow-600 font-medium">🎉 好爸爸勋章获得者！</p>
          </div>
        )}

        {!dadMedal && (
          <p className="mt-4 text-gray-400 text-sm">
            再参与 {20 - dadContributionCount} 次获得"好爸爸勋章"
          </p>
        )}
      </div>

      {/* 40周回忆录预告 */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 shadow-md mb-4 max-w-sm mx-auto">
        <div className="flex items-center gap-4">
          <div className="text-4xl">📚</div>
          <div>
            <p className="font-bold text-gray-700">40周回忆录</p>
            <p className="text-gray-500 text-sm">宝宝正在努力为你编织回忆录...</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
            style={{ width: `${(currentWeek / 40) * 100}%` }}
          />
        </div>
        {/* 导出按钮 */}
        {allRecords.length > 0 && (
          <button
            onClick={handleExportPoster}
            disabled={exporting}
            className="w-full mt-4 bg-pink-500 text-white py-2 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {exporting ? '生成中...' : '📥 导出精美海报'}
          </button>
        )}

        {/* 预览海报按钮 */}
        {allRecords.length > 0 && (
          <button
            onClick={() => setShowPoster(true)}
            className="w-full mt-2 bg-purple-100 text-purple-600 py-2 rounded-xl text-sm font-medium"
          >
            👀 预览海报
          </button>
        )}
      </div>

      {/* 打卡记录列表 */}
      {allRecords.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md max-w-sm mx-auto">
          <h3 className="font-bold text-gray-700 mb-4">最近记录</h3>
          <div className="space-y-3">
            {[...allRecords]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((record) => (
                <div key={record.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl">
                    {record.hasDadInteraction ? '💑' : '💕'}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm line-clamp-2">{record.momMessage}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(record.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <BottomNav />

      {/* 海报预览弹窗 */}
      {showPoster && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto">
            {/* 海报内容 */}
            <div id="memory-poster" ref={posterRef} className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="text-center">
                {/* 宝宝插画 */}
                <div className="mb-4 flex justify-center">
                  <BabyIllustration weekNumber={currentWeek} size="medium" />
                </div>

                {/* 标题 */}
                <h2 className="text-2xl font-bold text-pink-600 mb-2">
                  {userInfo?.babyName}的成长记录
                </h2>
                <p className="text-gray-500 mb-4">第 {currentWeek} 周</p>

                {/* 统计数据 */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-2xl font-bold text-pink-500">{allRecords.length}</p>
                    <p className="text-xs text-gray-400">打卡天数</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-2xl font-bold text-orange-500">{getStreak()}</p>
                    <p className="text-xs text-gray-400">连续天数</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-2xl font-bold text-blue-500">{dadContributionCount}</p>
                    <p className="text-xs text-gray-400">爸爸参与</p>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>孕周进度</span>
                    <span>{currentWeek}/40周</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                      style={{ width: `${(currentWeek / 40) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 日期 */}
                <p className="text-gray-400 text-sm">
                  {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowPoster(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium"
              >
                关闭
              </button>
              <button
                onClick={handleExportPoster}
                disabled={exporting}
                className="flex-1 py-3 rounded-xl bg-pink-500 text-white font-medium disabled:opacity-50"
              >
                {exporting ? '保存中...' : '💾 保存到相册'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
