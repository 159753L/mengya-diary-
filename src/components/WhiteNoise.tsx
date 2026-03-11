import { useState, useRef, useEffect } from 'react';

type SoundType = 'heartbeat' | 'ocean' | 'forest' | null;

interface SoundOption {
  type: SoundType;
  name: string;
  icon: string;
  description: string;
}

const SOUNDS: SoundOption[] = [
  { type: 'heartbeat', name: '生命律动', icon: '💓', description: '模拟子宫内低频心跳声' },
  { type: 'ocean', name: '深海摇篮', icon: '🌊', description: '羊水流动的咕噜声' },
  { type: 'forest', name: '森林细语', icon: '🌲', description: '适合冥想的白噪音' },
];

// 模拟音频（实际项目中应该使用真实的音频文件）
// 这里使用Web Audio API生成简单的音效

export default function WhiteNoise() {
  const [currentSound, setCurrentSound] = useState<SoundType>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showPanel, setShowPanel] = useState(false);
  const [isGoodNightMode, setIsGoodNightMode] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 初始化音频上下文
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  // 监听来自BottomNav的切换请求
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'toggleWhiteNoise') {
        setShowPanel(prev => !prev);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 创建不同类型的音效
  const createSound = (type: SoundType) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;

    // 停止之前的音效
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }

    // 创建新的振荡器
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.value = 0;

    switch (type) {
      case 'heartbeat':
        // 低频心跳声
        oscillator.type = 'sine';
        oscillator.frequency.value = 60;
        break;
      case 'ocean':
        // 模拟海浪的低频
        oscillator.type = 'sine';
        oscillator.frequency.value = 80;
        break;
      case 'forest':
        // 模拟森林的白噪音
        oscillator.type = 'triangle';
        oscillator.frequency.value = 200;
        break;
    }

    oscillator.start();
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    // 淡入
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 1);

    return { oscillator, gainNode };
  };

  const playSound = (type: SoundType) => {
    if (type === currentSound && isPlaying) {
      stopSound();
      return;
    }

    setCurrentSound(type);
    setIsPlaying(true);
    createSound(type);
  };

  const stopSound = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.5);
    }

    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      setIsPlaying(false);
    }, 500);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(newVolume * 0.3, audioContextRef.current.currentTime + 0.1);
    }
  };

  // 晚安模式 - 3分钟计时
  const startGoodNightMode = () => {
    setIsGoodNightMode(true);
    setCurrentSound('heartbeat');
    setIsPlaying(true);
    createSound('heartbeat');

    // 3分钟后自动停止
    setTimeout(() => {
      stopSound();
      setIsGoodNightMode(false);
    }, 3 * 60 * 1000);
  };

  return (
    <div className="fixed bottom-20 right-4 z-30">
      {/* 迷你播放器按钮 */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isPlaying ? 'bg-pink-500 animate-pulse' : 'bg-white'
        }`}
      >
        <span className="text-xl">{isPlaying ? '🔊' : '🎵'}</span>
      </button>

      {/* 播放面板 */}
      {showPanel && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-xl p-4">
          <h3 className="font-bold text-gray-700 mb-3">白噪音</h3>

          {/* 声音选择 */}
          <div className="space-y-2 mb-4">
            {SOUNDS.map((sound) => (
              <button
                key={sound.type!}
                onClick={() => playSound(sound.type)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  currentSound === sound.type && isPlaying
                    ? 'bg-pink-100 border-2 border-pink-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{sound.icon}</span>
                <div className="text-left">
                  <p className="font-medium text-gray-700">{sound.name}</p>
                  <p className="text-xs text-gray-400">{sound.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 音量控制 */}
          {isPlaying && (
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* 晚安模式 */}
          <button
            onClick={startGoodNightMode}
            className="w-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white py-3 rounded-xl font-medium"
          >
            🌙 晚安模式（3分钟）
          </button>

          {/* 关闭按钮 */}
          <button
            onClick={() => setShowPanel(false)}
            className="w-full text-gray-400 text-sm mt-3"
          >
            收起
          </button>
        </div>
      )}

      {/* 晚安模式提示 */}
      {isGoodNightMode && (
        <div className="absolute bottom-32 right-0 w-64 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl p-4 shadow-lg">
          <p className="text-center font-medium">🌙 晚安模式已开启</p>
          <p className="text-center text-sm opacity-80">3分钟后自动停止</p>
        </div>
      )}
    </div>
  );
}
