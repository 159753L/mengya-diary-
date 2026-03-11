import { jsPDF } from 'jspdf';
import type { DailyRecord } from '../types';
import { WEEK_INFO } from '../data/weekInfo';

interface ExportOptions {
  babyName: string;
  dueDate: string;
  records: DailyRecord[];
}

// 生成40周回忆录PDF
export async function generateMemoryBookPDF(options: ExportOptions): Promise<void> {
  const { babyName, dueDate, records } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // 封面
  doc.setFillColor(255, 240, 245); // 浅粉色背景
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFontSize(32);
  doc.setTextColor(219, 112, 147); // 粉红色
  doc.text('萌芽日记', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(100, 100, 100);
  doc.text(`—— ${babyName} 的成长记录 ——`, pageWidth / 2, 80, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(150, 150, 150);
  doc.text(`预产期: ${dueDate}`, pageWidth / 2, 100, { align: 'center' });
  doc.text(`共记录 ${records.length} 天`, pageWidth / 2, 115, { align: 'center' });

  doc.setFontSize(12);
  doc.text('40周回忆录', pageWidth / 2, 150, { align: 'center' });

  doc.setFontSize(10);
  doc.text('—— 每一周都是爱与期待 ——', pageWidth / 2, 165, { align: 'center' });

  // 添加一页
  doc.addPage();
  yPos = margin;

  // 记录内容
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < sortedRecords.length; i++) {
    const record = sortedRecords[i];
    const weekInfo = WEEK_INFO[Math.min(record.weekNumber - 1, 39)];

    // 检查是否需要新页面
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    // 孕周标题
    doc.setFillColor(255, 240, 245);
    doc.rect(margin, yPos, pageWidth - margin * 2, 12, 'F');

    doc.setFontSize(14);
    doc.setTextColor(219, 112, 147);
    doc.text(`第 ${record.weekNumber} 周 - ${weekInfo?.fruit || ''}`, margin + 5, yPos + 8);

    yPos += 18;

    // 日期
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date(record.date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(dateStr, margin, yPos);

    yPos += 8;

    // 妈妈留言
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('妈妈说：', margin, yPos);
    yPos += 6;

    const momLines = doc.splitTextToSize(record.momMessage, pageWidth - margin * 2 - 10);
    doc.text(momLines, margin + 5, yPos);
    yPos += momLines.length * 6 + 4;

    // 爸爸留言（如果有）
    if (record.dadMessage) {
      doc.setFontSize(11);
      doc.setTextColor(100, 149, 237); // 蓝色
      doc.text('爸爸说：', margin, yPos);
      yPos += 6;

      const dadLines = doc.splitTextToSize(record.dadMessage, pageWidth - margin * 2 - 10);
      doc.text(dadLines, margin + 5, yPos);
      yPos += dadLines.length * 6;
    }

    yPos += 10;
  }

  // 最后一页 - 致谢
  doc.addPage();
  doc.setFillColor(255, 240, 245);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFontSize(20);
  doc.setTextColor(219, 112, 147);
  doc.text('感谢这段特别的旅程', pageWidth / 2, 80, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('从萌芽到绽放', pageWidth / 2, 100, { align: 'center' });
  doc.text('每一天的记录都是爱的见证', pageWidth / 2, 115, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('—— 萌芽日记 ——', pageWidth / 2, 160, { align: 'center' });

  // 保存PDF
  const fileName = `萌芽日记-${babyName}-回忆录.pdf`;
  doc.save(fileName);
}

// 生成单日打卡海报图片
export async function generateDailyPoster(options: {
  babyName: string;
  weekNumber: number;
  momMessage: string;
  dadMessage?: string;
}): Promise<string> {
  const { babyName, weekNumber, momMessage, dadMessage } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 150],
  });

  // 背景
  doc.setFillColor(255, 240, 245);
  doc.rect(0, 0, 100, 150, 'F');

  // 顶部
  doc.setFontSize(14);
  doc.setTextColor(219, 112, 147);
  doc.text(`第${weekNumber}周`, 50, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(babyName, 50, 28, { align: 'center' });

  // 分割线
  doc.setDrawColor(255, 182, 193);
  doc.line(20, 35, 80, 35);

  // 妈妈留言
  doc.setFontSize(9);
  doc.setTextColor(219, 112, 147);
  doc.text('妈妈说：', 15, 45);

  doc.setTextColor(80, 80, 80);
  const momLines = doc.splitTextToSize(momMessage, 70);
  doc.text(momLines, 15, 52);

  let yPos = 52 + momLines.length * 5 + 5;

  // 爸爸留言
  if (dadMessage) {
    doc.setTextColor(100, 149, 237);
    doc.text('爸爸说：', 15, yPos);
    yPos += 5;

    const dadLines = doc.splitTextToSize(dadMessage, 70);
    doc.text(dadLines, 15, yPos);
    yPos += dadLines.length * 5;
  }

  // 底部
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  const today = new Date().toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
  doc.text(`萌芽日记 · ${today}`, 50, 140, { align: 'center' });

  return doc.output('datauristring');
}
