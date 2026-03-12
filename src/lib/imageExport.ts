// 导出精美的图片海报
import { toPng } from 'html-to-image';

// 40周回忆录海报导出
export async function exportMemoryPoster(
  elementId: string,
  babyName: string,
  weekNumber: number
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('找不到要导出的元素');
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#fff0f5', // 浅粉色背景
    });

    // 创建下载链接
    const link = document.createElement('a');
    link.download = `${babyName}_回忆录_第${weekNumber}周.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('导出海报失败:', error);
    throw error;
  }
}

// 每日打卡海报导出
export async function exportDailyPoster(
  elementId: string,
  babyName: string,
  date: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('找不到要导出的元素');
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#fff0f5',
    });

    const link = document.createElement('a');
    link.download = `${babyName}_打卡_${date}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('导出海报失败:', error);
    throw error;
  }
}
