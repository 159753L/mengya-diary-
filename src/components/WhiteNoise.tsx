import { useState, useRef, useEffect, useCallback } from 'react';

type SoundType = 'heartbeat' | 'ocean' | 'forest' | 'lullaby' | null;

interface SoundOption {
  type: SoundType;
  name: string;
  icon: string;
  description: string;
}

const SOUNDS: SoundOption[] = [
  { type: 'heartbeat', name: '生命律动', icon: '💓', description: '舒缓的低频心跳声' },
  { type: 'ocean', name: '深海摇篮', icon: '🌊', description: '柔和的海浪声' },
  { type: 'forest', name: '森林细语', icon: '🌲', description: '轻柔的风声鸟鸣' },
  { type: 'lullaby', name: '安心摇篮曲', icon: '🎵', description: '舒缓的钢琴旋律' },
];

// 生成粉红噪音（比白噪音更柔和）
function createPinkNoise(ctx: AudioContext): AudioBufferSourceNode {
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    output[i] *= 0.11;
    b6 = white * 0.115926;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  return noise;
}

// 生成柔和的雨声/海浪声
function createOceanSound(ctx: AudioContext, gainNode: GainNode) {
  const noise = createPinkNoise(ctx);

  // 低通滤波，让声音更柔和
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 400;

  // 添加LFO调制，让声音有起伏
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1; // 10秒一个周期
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(lowpass.frequency);

  noise.connect(lowpass);
  lowpass.connect(gainNode);

  noise.start();
  lfo.start();

  return { noise, lfo };
}

// 生成心跳声
function createHeartbeatSound(ctx: AudioContext, gainNode: GainNode) {
  // 模拟心跳：咚-哒
  const playBeat = () => {
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 60;
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(gainNode);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // 第二声
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 50;
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    gain2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.15);
    gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    osc2.connect(gain2);
    gain2.connect(gainNode);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.3);
  };

  const intervalId = setInterval(playBeat, 1000); // 每秒一次心跳
  playBeat(); // 立即播放一次

  return { stop: () => clearInterval(intervalId) };
}

// 生成森林风声
function createForestSound(ctx: AudioContext, gainNode: GainNode) {
  const noise = createPinkNoise(ctx);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 800;

  // 随机调制
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.2;
  lfoGain.gain.value = 300;
  lfo.connect(lfoGain);
  lfoGain.connect(lowpass.frequency);

  noise.connect(lowpass);
  lowpass.connect(gainNode);

  noise.start();
  lfo.start();

  return { noise, lfo };
}

// 生成简单的摇篮曲旋律
function createLullabySound(ctx: AudioContext, gainNode: GainNode) {
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.15;
  masterGain.connect(gainNode);

  // 简单的旋律音符
  const melody = [
    { note: 261.63, duration: 0.5 }, // C4
    { note: 293.66, duration: 0.5 }, // D4
    { note: 329.63, duration: 0.5 }, // E4
    { note: 293.66, duration: 0.5 }, // D4
    { note: 261.63, duration: 1 },   // C4
    { note: 0, duration: 0.5 },      // 休息
    { note: 329.63, duration: 0.5 }, // E4
    { note: 349.23, duration: 0.5 }, // F4
    { note: 392.00, duration: 1 },   // G4
    { note: 349.23, duration: 0.5 }, // F4
    { note: 329.63, duration: 0.5 }, // E4
    { note: 293.66, duration: 1 },   // D4
    { note: 261.63, duration: 1 },   // C4
  ];

  let currentTime = ctx.currentTime;

  const playNote = (freq: number, duration: number) => {
    if (freq === 0) return;

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    // 添加一点颤音
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.type = 'sine';
    vibrato.frequency.value = 5;
    vibratoGain.gain.value = 3;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    noteGain.gain.setValueAtTime(0, currentTime);
    noteGain.gain.linearRampToValueAtTime(0.3, currentTime + 0.1);
    noteGain.gain.linearRampToValueAtTime(0.2, currentTime + duration - 0.1);
    noteGain.gain.linearRampToValueAtTime(0, currentTime + duration);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(currentTime);
    osc.stop(currentTime + duration);
    vibrato.start(currentTime);
    vibrato.stop(currentTime + duration);
  };

  const playMelody = () => {
    currentTime = ctx.currentTime;
    melody.forEach(({ note, duration }) => {
      playNote(note, duration);
      currentTime += duration;
    });
  };

  playMelody();
  const intervalId = setInterval(playMelody, 6000); // 每6秒重复

  return { stop: () => clearInterval(intervalId) };
}

export default function WhiteNoise() {
  const [currentSound, setCurrentSound] = useState<SoundType>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showPanel, setShowPanel] = useState(false);
  const [isGoodNightMode, setIsGoodNightMode] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const soundNodesRef = useRef<{ stop?: () => void; noise?: AudioBufferSourceNode; lfo?: OscillatorNode } | null>(null);

  // 清理音效
  const cleanup = useCallback(() => {
    if (soundNodesRef.current) {
      if (soundNodesRef.current.stop) {
        soundNodesRef.current.stop();
      }
      if (soundNodesRef.current.noise) {
        try {
          soundNodesRef.current.noise.stop();
        } catch (e) {}
      }
      if (soundNodesRef.current.lfo) {
        try {
          soundNodesRef.current.lfo.stop();
        } catch (e) {}
      }
      soundNodesRef.current = null;
    }
  }, []);

  // 初始化音频
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;

    if (!gainNodeRef.current) {
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.connect(ctx.destination);
      gainNodeRef.current.gain.value = 0;
    }

    return { ctx, gainNode: gainNodeRef.current };
  }, []);

  // 播放音效
  const playSound = useCallback((type: SoundType) => {
    cleanup();

    if (type === currentSound && isPlaying) {
      setIsPlaying(false);
      return;
    }

    const { ctx, gainNode } = initAudio();

    // 淡入
    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.5);

    let nodes: { stop?: () => void; noise?: AudioBufferSourceNode; lfo?: OscillatorNode } | null = null;

    switch (type) {
      case 'ocean':
        nodes = createOceanSound(ctx, gainNode);
        break;
      case 'heartbeat':
        nodes = createHeartbeatSound(ctx, gainNode);
        break;
      case 'forest':
        nodes = createForestSound(ctx, gainNode);
        break;
      case 'lullaby':
        nodes = createLullabySound(ctx, gainNode);
        break;
    }

    soundNodesRef.current = nodes;
    setCurrentSound(type);
    setIsPlaying(true);
  }, [currentSound, isPlaying, volume, initAudio, cleanup]);

  // 停止音效
  const stopSound = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      gainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime);
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    }

    setTimeout(() => {
      cleanup();
      setIsPlaying(false);
    }, 500);
  }, [cleanup]);

  // 音量变化
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current && isPlaying) {
      const ctx = audioContextRef.current;
      gainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime);
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.1);
    }
  }, [volume, isPlaying]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 晚安模式
  const startGoodNightMode = () => {
    setIsGoodNightMode(true);
    playSound('lullaby');

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
          <h3 className="font-bold text-gray-700 mb-3">舒缓音乐</h3>

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
                onChange={(e) => setVolume(parseFloat(e.target.value))}
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
