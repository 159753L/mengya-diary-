import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { searchAnswer, CATEGORIES, getQuestionsByCategory, KNOWLEDGE_BASE } from '../data/knowledge';
import BottomNav from '../components/BottomNav';

export default function Assistant() {
  const navigate = useNavigate();
  const { phase, userInfo } = useApp();
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<{ question: string; answer: string; category: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryQuestions, setShowCategoryQuestions] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const result = searchAnswer(query);
    if (result) {
      setAnswer({
        question: result.question,
        answer: result.answer,
        category: result.category,
      });
    } else {
      setAnswer({
        question: query,
        answer: '抱歉，我暂时没有相关知识储备。关于孕期的问题，建议咨询医生或专业人士获取更准确的指导。',
        category: 'unknown',
      });
    }
    setQuery('');
    setSelectedCategory(null);
    setShowCategoryQuestions(false);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryQuestions(true);
    setAnswer(null);
  };

  const handleQuestionClick = (question: string) => {
    setQuery(question);
    const result = searchAnswer(question);
    if (result) {
      setAnswer({
        question: result.question,
        answer: result.answer,
        category: result.category,
      });
    }
    setShowCategoryQuestions(false);
  };

  if (!userInfo) {
    navigate('/');
    return null;
  }

  const categoryQuestions = selectedCategory ? getQuestionsByCategory(selectedCategory) : [];
  const categoryInfo = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div
      className="min-h-screen p-4 pb-20"
      data-theme={phase === 'first' ? '' : phase === 'second' ? 'second' : 'third'}
      style={{
        background: `linear-gradient(180deg, var(--theme-bg) 0%, var(--theme-primary) 100%)`,
      }}
    >
      {/* 标题 */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-700">🤖 智能小助手</h1>
        <p className="text-gray-500 text-sm">有问题尽管问我吧</p>
      </div>

      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索孕期问题..."
            className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 focus:border-pink-400 focus:outline-none shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
          >
            🔍
          </button>
        </div>
      </form>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`px-3 py-1 rounded-full text-sm ${selectedCategory === cat.id ? 'bg-pink-500 text-white' : 'bg-white text-gray-600'}`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* 分类问题列表 */}
      {showCategoryQuestions && categoryQuestions.length > 0 && (
        <div className="bg-white/80 rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-gray-700 mb-3">
            {categoryInfo?.icon} {categoryInfo?.name}常见问题
          </h3>
          <div className="space-y-2">
            {categoryQuestions.slice(0, 5).map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(item.question)}
                className="w-full text-left p-2 text-sm text-gray-600 hover:bg-pink-50 rounded-xl transition-colors"
              >
                {item.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI回答区域 */}
      {answer && (
        <div className="bg-white/90 rounded-2xl p-4 mb-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">问题：</p>
              <p className="font-medium text-gray-700 mb-3">{answer.question}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{answer.answer}</p>
            </div>
          </div>
        </div>
      )}

      {/* 常见问题推荐 */}
      {!answer && !showCategoryQuestions && (
        <div className="bg-white/80 rounded-2xl p-4">
          <h3 className="font-bold text-gray-700 mb-3">💡 热门问题</h3>
          <div className="space-y-2">
            {KNOWLEDGE_BASE.slice(0, 6).map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(item.question)}
                className="w-full text-left p-2 text-sm text-gray-600 hover:bg-pink-50 rounded-xl transition-colors"
              >
                {item.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className="mt-4 text-center pb-20">
        <p className="text-xs text-gray-400">
          💡 温馨提示：如有特殊情况，请咨询医生
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
