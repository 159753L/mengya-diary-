// 40周宝宝秘密
export const BABY_SECRETS = [
  { week: 1, secret: '你还在妈妈的输卵管里，准备游向子宫这个新家～' },
  { week: 2, secret: '受精卵已经成功着床，开始了奇妙的发育旅程！' },
  { week: 3, secret: '你正式成为一个胚胎啦！心脏开始跳动～' },
  { week: 4, secret: '大脑和脊髓开始发育，你正在变成一个小人儿！' },
  { week: 5, secret: '小心脏开始跳动啦！虽然只有芝麻大小，但生命力超强～' },
  { week: 6, secret: '手臂和腿部开始形成，像小浆一样在羊水里划动～' },
  { week: 7, secret: '小鼻子出现了，开始有了脸的轮廓～' },
  { week: 8, secret: '你能在子宫里轻轻活动啦，虽然妈妈还感觉不到～' },
  { week: 9, secret: '所有器官都在努力发育，你已经是个小小胎儿了！' },
  { week: 10, secret: '手指和脚趾都长出来啦，会做可爱的小动作～' },
  { week: 11, secret: '指甲开始生长，毛发也开始出现～' },
  { week: 12, secret: '你会打哈欠了！还会做鬼脸，是不是很可爱～' },
  { week: 13, secret: '独一无二的指纹开始形成，你是世界上唯一的你！' },
  { week: 14, secret: '你会做各种表情了，挤眉弄眼样样精通～' },
  { week: 15, secret: '小耳朵发育好了，能听到外面的声音啦！' },
  { week: 16, secret: '头发和睫毛都在生长，越来越漂亮咯～' },
  { week: 17, secret: '皮肤开始变厚，不再那么透明了～' },
  { week: 18, secret: '你开始踢腿啦！妈妈可能已经感觉到胎动了～' },
  { week: 19, secret: '在练习呼吸 движения，为出生做准备～' },
  { week: 20, secret: '如果这是个女宝宝，子宫和输卵管都已经形成啦！' },
  { week: 21, secret: '眉毛和眼睑都长好了，睡觉样子好可爱～' },
  { week: 22, secret: '皮肤看起来像个小新生儿了，红润有弹性～' },
  { week: 23, secret: '听力越来越灵敏，能分辨妈妈的声音了！' },
  { week: 24, secret: '肺部开始发育，虽然还不能呼吸空气，但一切都在准备中～' },
  { week: 25, secret: '身体开始储存脂肪，看起来越来越圆润可爱～' },
  { week: 26, secret: '眼睛开始睁开，能看到羊水里的世界了！' },
  { week: 27, secret: '有了规律的睡眠周期醒着和睡觉都很有规律～' },
  { week: 28, secret: '大脑活动增加，你可能正在做美梦呢！' },
  { week: 29, secret: '活动越来越频繁，力气也越来越大～' },
  { week: 30, secret: '大脑褶皱越来越多，越来越聪明啦！' },
  { week: 31, secret: '能感受光线变化了，如果有光对着肚子，你会眨眼睛～' },
  { week: 32, secret: '皮肤变得更柔软光滑，越来越可爱～' },
  { week: 33, secret: '呼吸系统接近成熟，准备好呼吸新鲜空气了！' },
  { week: 34, secret: '指甲完全形成，出生后就可以剪指甲啦～' },
  { week: 35, secret: '继续长胖中，为出生储备能量～' },
  { week: 36, secret: '开始为出生做准备了，头部可能已经入盆～' },
  { week: 37, secret: '足月啦！随时都有可能和爸爸妈妈见面～' },
  { week: 38, secret: '肺部完全成熟，随时准备来到这个世界！' },
  { week: 39, secret: '已经是足月宝宝了，在等一个合适的时机～' },
  { week: 40, secret: '宝宝准备好与你见面了！期待已久的相遇即将发生～' },
];

// 获取本周秘密
export function getWeekSecret(week: number) {
  const secret = BABY_SECRETS.find(s => s.week === week);
  return secret || BABY_SECRETS[0];
}

// 检查是否周一（刮刮乐刷新日）
export function isMonday() {
  const today = new Date().getDay();
  return today === 1;
}
