import type { Question } from '../types';

// 三维问题库
export const QUESTIONS: { physical: Question[]; emotional: Question[]; reality: Question[] } = {
  physical: [
    { type: 'physical', text: '今天宝宝有在你肚子里"敲门"（胎动）吗？' },
    { type: 'physical', text: '今天身体有什么特别的感觉吗？' },
    { type: 'physical', text: '今天的孕吐反应怎么样？' },
    { type: 'physical', text: '今天睡眠质量如何？' },
    { type: 'physical', text: '今天的食欲怎么样？' },
    { type: 'physical', text: '身体有哪里不舒服吗？' },
    { type: 'physical', text: '今天感觉到累吗？' },
  ],
  emotional: [
    { type: 'emotional', text: '你今天想象中，小名长得更像谁一点？' },
    { type: 'emotional', text: '今天给宝宝取了什么小名吗？' },
    { type: 'emotional', text: '你今天心情怎么样？' },
    { type: 'emotional', text: '想象一下宝宝出生的样子，你有什么感受？' },
    { type: 'emotional', text: '今天有什么事情让你特别感动？' },
    { type: 'emotional', text: '你对宝宝的到来有什么期待？' },
    { type: 'emotional', text: '今天有没有想起宝宝的时候？' },
  ],
  reality: [
    { type: 'reality', text: '今天为了迎接小名，你做了哪件有仪式感的小事？' },
    { type: 'reality', text: '今天给宝宝准备什么东西了吗？' },
    { type: 'reality', text: '今天做了什么对宝宝好的事情？' },
    { type: 'reality', text: '今天有跟宝宝说话吗？' },
    { type: 'reality', text: '今天吃了什么想让宝宝也尝尝的？' },
    { type: 'reality', text: '今天有什么想对宝宝说的？' },
    { type: 'reality', text: '今天产检有什么新的发现吗？' },
  ],
};

// 心情回应
export const MOOD_RESPONSES: Record<string, Record<string, string>> = {
  happy: {
    first: '宝宝感受到了你的快乐！这份开心是最棒的营养剂～',
    second: '开心的妈妈，宝宝也能感受到！这可是最好的胎教哦～',
    third: '你开心，宝宝也开心！保持这份好心情，等待与宝宝见面吧～',
  },
  tired: {
    first: '我知道你很累，准妈妈辛苦了。今天如果觉得运动有负担，没关系，躺着休息也是一种保护自己和宝宝的方式。',
    second: '孕中期虽然精力回升，但还是会感到疲惫。给自己充充电吧，你和宝宝都值得被温柔以待～',
    third: '孕晚期确实会很辛苦，但每一次疲惫都是宝宝成长的证明。加油，马上就要见面了！',
  },
  anxious: {
    first: '初期有点担心是正常的深呼吸一口气，告诉自己：我在努力，宝宝也在努力！',
    second: '焦虑是很多准妈妈都会有的情绪。试着把担心写下来，或者和宝宝说说话～',
    third: '马上要和宝宝见面了，紧张是正常的。相信自己，你一定是个好妈妈！',
  },
  expectant: {
    first: '期待是最美好的礼物！宝宝在肚子里也在期待着与你的第一次见面呢～',
    second: '每一天的期待都在积累，这种感觉真的很美好。宝宝一定感受得到！',
    third: '倒计时开始啦！宝宝也在努力准备好来到你身边～',
  },
  moved: {
    first: '被感动的妈妈，宝宝也在感受着这份温暖～',
    second: '孕期是最容易被感动的时期。这份柔软的情感，是你和宝宝独特的连接～',
    third: '眼泪也是爱的一种表达。宝宝会记得妈妈为他流的每一滴眼泪～',
  },
};
