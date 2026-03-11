import { useState, useEffect } from 'react';

export default function PushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // 检查是否支持通知
    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) {
      alert('您的浏览器不支持推送通知');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // 可以触发一个测试通知
        new Notification('🌱 萌芽日记', {
          body: '推送通知已开启！以后会及时提醒你打卡和产检哦～',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('请求通知权限失败:', error);
    }
  };

  const testNotification = () => {
    if (permission !== 'granted') {
      alert('请先开启通知权限');
      return;
    }

    new Notification('🌱 萌芽日记', {
      body: '测试通知：记得今天也要记录和宝宝的美好时光哦！',
      icon: '/favicon.ico',
      tag: 'test'
    });
  };

  // 不显示在UI上，只在设置页面提供入口
  return null;
}

// 导出通知函数供其他地方使用
export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico'
    });
  }
};

// 检查权限状态
export const getNotificationPermission = () => {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
};
