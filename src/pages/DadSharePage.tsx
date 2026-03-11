import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import DadShare from '../components/DadShare';
import { useEffect, useState } from 'react';

export default function DadSharePage() {
  const { babyName, weekNumber } = useParams();
  const navigate = useNavigate();
  const { saveDadMessage } = useApp();
  const [localBabyName, setLocalBabyName] = useState(babyName || '');
  const [localWeekNumber, setLocalWeekNumber] = useState(Number(weekNumber) || 1);

  // 从URL参数更新状态
  useEffect(() => {
    if (babyName) {
      setLocalBabyName(decodeURIComponent(babyName));
    }
    if (weekNumber) {
      setLocalWeekNumber(Number(weekNumber));
    }
  }, [babyName, weekNumber]);

  const handleSubmit = (message: string) => {
    // 保存爸爸留言
    saveDadMessage(message);
    // 提示保存成功
    alert('留言已传递给妈妈！💕');
    // 可以选择跳转回首页
    navigate('/');
  };

  if (!babyName) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">👶</div>
          <h1 className="text-2xl font-bold text-blue-600 mb-4">欢迎爸爸参与</h1>
          <p className="text-gray-500 mb-6">请通过妈妈分享的链接访问</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-3 rounded-full"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <DadShare
      babyName={localBabyName}
      weekNumber={localWeekNumber}
      onSubmit={handleSubmit}
    />
  );
}
