import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

// Firebase配置 - 请替换为你自己的配置
// 在 Firebase Console 创建项目后获取
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 初始化Firebase（开发阶段使用mock数据）
let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

export function initFirebase() {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } catch (error) {
      console.warn('Firebase初始化失败，将使用本地存储');
    }
  }
  return { app, db };
}

// 检查Firebase是否可用
export function isFirebaseReady(): boolean {
  return db !== null;
}

// 保存记录到Firebase
export async function saveRecordToFirebase(record: {
  id: string;
  date: string;
  weekNumber: number;
  momMessage: string;
  momMood: string;
  dadMessage?: string;
  hasDadInteraction: boolean;
  createdAt: number;
}): Promise<boolean> {
  if (!db) return false;

  try {
    await setDoc(doc(db, 'records', record.id), record);
    return true;
  } catch (error) {
    console.error('保存到Firebase失败:', error);
    return false;
  }
}

// 监听记录变化（实时同步）
export function subscribeToRecords(
  callback: (records: unknown[]) => void
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'records'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(records);
  });
}

// 爸爸发送留言
export async function sendDadMessage(
  recordId: string,
  message: string
): Promise<boolean> {
  if (!db) return false;

  try {
    await setDoc(doc(db, 'records', recordId), {
      dadMessage: message,
      hasDadInteraction: true,
      dadMessageTime: Date.now(),
      updatedAt: Date.now(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('发送爸爸留言失败:', error);
    return false;
  }
}

// 发送飞吻
export async function sendKiss(recordId: string): Promise<boolean> {
  if (!db) return false;

  try {
    await setDoc(doc(db, 'records', recordId), {
      kissSent: true,
      kissTime: Date.now(),
      updatedAt: Date.now(),
    }, { merge: true });

    // 触发手机震动
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    return true;
  } catch (error) {
    console.error('发送飞吻失败:', error);
    return false;
  }
}

// 初始化
initFirebase();
