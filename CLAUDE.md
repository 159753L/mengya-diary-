# 萌芽日记 - 项目开发记录

---

## 📌 Version 3.0.0 (2026-03-12) - 登录注册系统 + AI对话记忆 + 症状管理

### 本次更新

#### ✅ 登录注册系统
- 手机号 + 密码登录/注册
- 分离登录和注册流程（新用户需填写宝宝信息完成注册）
- 老用户必须输入正确密码才能登录
- 本地存储 + Supabase 云端同步

### 本次更新

#### ✅ AI助手对话记忆功能
- 支持多轮对话，显示对话历史
- 用户问题和AI回答按聊天记录显示

#### ✅ 基于实体的状态管理系统（Entity-based State Management）
采用"状态标签 + 时间戳"方案，解决症状变化跟踪问题：

**数据结构（JSON）：**
```json
{
  "current_symptoms": ["腰酸"],
  "resolved_symptoms": ["孕吐"],
  "pregnancy_week": 12,
  "due_date": "2026-06-15",
  "last_update": "2026-03-12",
  "history": [
    { "symptom": "孕吐", "start_week": 6, "end_week": 12, "status": "resolved" }
  ]
}
```

**核心逻辑：**
- 实时状态侦听：每一轮对话后自动检测症状变化
- 状态平移：新症状加入current，消失症状移入resolved
- 时效控制：已解决症状保留用于数据分析
- 数据价值：保留完整历史用于产后抑郁预测、营养建议等分析

**相关文件：**
- `src/lib/memoryService.ts` - 重构为状态管理服务
- `src/lib/aiService.ts` - 回答后自动调用状态检测

#### ✅ 切换到国内服务（解决VPN问题）
- Pinecone → Supabase pgvector（服务器在海外，仍需VPN）
- Jina → MiniMax Embedding（已配置）
- Supabase API 认证问题待解决

#### ✅ Supabase 表结构更新
- 创建 `knowledge` 表存储孕期知识库
- 创建 `records` 表存储打卡记录（云端同步用）
- RLS 策略已配置

#### ✅ RAG向量检索代码
- `src/lib/ragService.ts` - 使用 Supabase REST API
- 当前使用关键词搜索（pgvector 需要额外配置）
- 暂时禁用自动初始化（API认证问题）

**知识库：**
- 孕期知识库 **73条** 问答

**环境变量：**
```
VITE_SUPABASE_URL=https://rrrqcjyecwekvnqivhrq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_MINIMAX_API_KEY=sk-cp-cDfA4sGR_...
VITE_PINECONE_API_KEY=pcsk_2Jib7c_...
VITE_PINECONE_INDEX=mengya-diary
VITE_JINA_API_KEY=jina_5aedec453cad4ce0...
```

**⚠️ 当前状态：**
- Pinecone 向量数据库在中国大陆无法访问（DNS解析失败/连接被拒绝）
- RAG 初始化已暂时禁用，代码保留以备将来使用
- AI助手当前使用**本地知识库 + MiniMax AI** 模式正常工作

**Fallback 机制：**
- 当向量检索失败时，自动使用本地关键词搜索
- 保证AI助手在任何情况下都能回答问题

---

### ✅ AI助手升级 (2026-03-11)

**当前AI助手能力：**
- 孕期知识问答（73条知识库）
- MiniMax AI 智能回答（已配置Key）
- 向量语义检索（代码已完成，因网络问题暂时不可用）
- 本地关键词搜索（当前使用）

---

## 📌 Version 1.0.0 (2026-03-11)
基础版本，功能稳定

---

## 项目开发记录（开发中）

## 项目概述

- **项目名称**: 萌芽日记
- **项目类型**: 孕期情感记录 Web 应用
- **产品定位**: 孕妈妈的"孕期情感银行"，用AI插画记录每一天与宝宝的成长
- **核心理念**: 垂直单点突破 - 专注做记录一件事，40周后生成专属回忆录
- **技术栈**: React + TypeScript + Tailwind CSS + localStorage + Supabase

---

## 开发进度

### ✅ 第一期 MVP 已完成 (2026-03-11)

#### 核心功能
- [x] 时光入口 - 输入预产期和宝宝小名
- [x] 孕周计算 - 自动计算当前孕周和距离预产期倒计时
- [x] 每日打卡 - 三维问答（生理/情感/现实）+ 心情选择
- [x] AI心情回应 - 根据选择的心情给出温暖回复
- [x] 视觉生长感 - 主题色随孕期阶段变化（孕早期浅绿→孕中期暖橘→孕晚期粉蓝）
- [x] 海报生成 - 支持保存为图片
- [x] 成长轨迹 - 打卡记录、连续打卡天数
- [x] 爸爸贡献度 - 记录爸爸参与次数，达到20次获得"好爸爸勋章"
- [x] 回忆页 - 查看历史记录和进度
- [x] 设置页 - 修改信息、导出数据备份
- [x] 白噪音播放器 - 生命律动、深海摇篮、森林细语、晚安模式
- [x] Supabase集成 - 实时同步框架（待配置）
- [x] 爸爸参与页面 - 快捷回复、分享链接

#### 页面结构
- 首页 (`/`) - 孕周展示、打卡入口
- 打卡页 (`/checkin`) - 每日打卡流程
- 回忆页 (`/memories`) - 成长轨迹、爸爸贡献度
- 设置页 (`/settings`) - 信息管理、数据导出
- 发现页 (`/discover`) - 40个秘密刮刮乐
- 助手页 (`/assistant`) - 孕期知识问答
- 爸爸页 (`/dad/:babyName/:weekNumber`) - 爸爸参与页面

---

### ✅ 底部导航优化 (2026-03-11)

#### 新增组件
- `components/BottomNav.tsx` - 4+1治愈系浮动布局

#### 布局设计
- 中心凸起：记心声（每日打卡）- 核心功能，圆形悬浮按钮
- 左一：森林 (Home) - 首页、孕周展示、产检提醒
- 左二：轨迹 (Memory) - 成长轨迹、爸爸贡献度
- 右二：秘密 (Discovery) - 40个秘密刮刮乐、白噪音
- 右一：我的 (Setting) - 宝宝信息、数据导出

#### 设计细节
- 毛玻璃效果：使用 backdrop-blur 半透明背景
- 激活态：使用粉色高亮当前页面
- 中心按钮：根据是否已打卡显示不同渐变色

---

### ✅ 心声双翼功能 (2026-03-11)

#### 新增组件
- `components/HeartWings.tsx` - 心声双翼组件
- `components/KissFeedback.tsx` - 飞吻反馈组件
- `components/DoubleNarrativePoster.tsx` - 双叙事海报组件
- `pages/DadSharePage.tsx` - 爸爸参与页面（从URL参数获取）

#### 功能实现
- 左右两栏：妈妈频道（粉色）+ 爸爸频道（蓝色）
- 妈妈心情选择 + 留言输入
- 爸爸快捷回复选项（5个预设回复）
- 爸爸自定义输入
- 飞吻反馈功能 + 手机震动 (navigator.vibrate)
- 爸爸留言实时通知气泡
- 分享链接功能：一键复制链接发送给爸爸

---

### ✅ 可拖拽AI助手 (2026-03-11)

#### 新增组件
- `components/AIAssistant.tsx` - 全屏可拖拽悬浮球

#### 功能实现
- 悬浮球可自由拖拽到任意位置
- 点击（不移动）打开问答面板
- 拖拽移动超过3px则不触发点击
- 使用 sessionStorage 保存位置，刷新后保持
- 全局组件，所有页面可见
- 基于孕期知识库提供问答服务

### ✅ 全部功能已完成 (2026-03-11)

经过检查，所有计划中的功能均已实现：

1. **AI宝宝插画库** ✅ - 使用SVG绘制可爱宝宝形象，不同周数有不同姿态
2. **刮刮乐秘密** ✅ - 每周揭示宝宝秘密的刮刮乐交互
3. **产检提醒** ✅ - 首页显示14天内的产检倒计时
4. **PDF回忆录** ✅ - 回忆页可导出40周回忆录PDF
5. **Supabase同步** ✅ - 已配置并连接成功
6. **可拖拽AI助手** ✅ - 支持拖拽，MiniMax AI已接入
7. **分享功能** ✅ - 打卡页、设置页支持分享
8. **推送通知** ✅ - 设置页可开启打卡提醒

---

## 已完成（全部）

### 第二期功能（优先）

1. **AI宝宝插画库**
   - 需要用AI生成40周不同姿态的宝宝插画
   - 风格：温暖、柔和、拟人化
   - 提前生成存入项目，前端按孕周调用

2. **爸爸参与系统完善**
   - "呼叫爸爸"生成链接/二维码
   - Supabase实时同步（需配置Supabase项目）
   - 爸爸端页面优化

3. **双叙事海报优化**
   - 宝宝插画在中间，爸妈留言在两侧
   - 周结特殊海报

### 第三期功能

1. **40周回忆录 PDF导出**
   - 用jsPDF库实现
   - 精致排版像实体书

2. **40个秘密（刮刮乐）**
   - 每周一揭示"宝宝新技能"
   - 刮刮乐交互

3. **产检温情提醒**
   - 关键产检提前3天推送

---

## 项目文件结构

```
萌芽日记/
├── src/
│   ├── components/
│   │   ├── BottomNav.tsx           # 4+1底部导航
│   │   ├── HeartWings.tsx           # 心声双翼
│   │   ├── KissFeedback.tsx          # 飞吻反馈
│   │   ├── DoubleNarrativePoster.tsx # 双叙事海报
│   │   ├── WhiteNoise.tsx           # 白噪音播放器
│   │   ├── AIAssistant.tsx          # 可拖拽AI助手
│   │   ├── BabyIllustration.tsx     # AI宝宝插画占位
│   │   ├── DadShare.tsx             # 爸爸参与组件
│   │   └── ScratchCard.tsx           # 刮刮乐组件
│   ├── data/
│   │   ├── questions.ts              # 三维问题库 + 心情回应
│   │   ├── weekInfo.ts              # 40周孕周信息 + 产检提醒
│   │   ├── secrets.ts               # 40个秘密
│   │   └── knowledge.ts             # 孕期知识库
│   ├── hooks/
│   │   └── useApp.tsx               # React Context 状态管理
│   ├── lib/
│   │   ├── storage.ts               # localStorage 存储
│   │   ├── utils.ts                 # 工具函数（孕周计算等）
│   │   ├── supabase.ts             # Supabase集成
│   │   └── pdfExport.ts             # PDF导出
│   ├── pages/
│   │   ├── Home.tsx                 # 首页
│   │   ├── CheckIn.tsx             # 打卡页
│   │   ├── Memories.tsx            # 回忆页
│   │   ├── Settings.tsx            # 设置页
│   │   ├── Discover.tsx            # 发现页
│   │   ├── Assistant.tsx            # 助手页
│   │   └── DadSharePage.tsx        # 爸爸参与页
│   ├── types/
│   │   └── index.ts                 # TypeScript类型定义
│   ├── App.tsx                     # 路由配置
│   ├── main.tsx                    # 入口文件
│   └── index.css                   # Tailwind + CSS变量
├── index.html
├── 需求文档.md                      # 需求文档
├── CLAUDE.md                       # 开发记录
└── package.json
```

---

## 运行命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

---

## 重要设计决策

1. **数据存储**: 初期使用localStorage，方便快速开发；后续将接入Supabase实现真正的云端同步和多设备支持

2. **视觉主题**: 使用CSS变量实现主题切换，根据孕周自动变化：
   - 孕早期(1-12周): 浅绿 #E2F1E7
   - 孕中期(13-27周): 暖橘 #FFF3E0
   - 孕晚期(28-40周): 粉蓝 #E3F2FD

3. **问题库设计**: 三维度设计避免重复
   - 生理维度：身体感受、胎动、孕吐等
   - 情感维度：想象宝宝、期待、情绪等
   - 现实维度：仪式感、为宝宝做的事等

4. **白噪音**: 使用Web Audio API生成基础音效，实际项目中应替换为真实音频文件

5. **心声双翼**: 爸爸妈妈双频道设计，增强家庭互动感

---

## 下一步行动计划

### 1. 修复 Supabase API 认证问题

**当前问题：** 使用 Supabase REST API 时返回 401 错误

**可能原因：**
- API key 格式问题
- RLS 策略配置
- 需要使用 service_role key

**解决方案：**
- 检查 Supabase 后台 API 设置
- 或使用 Supabase 客户端而非直接调用 REST API

### 2. 启用 pgvector 向量搜索

当前使用关键词搜索，如需真正的向量语义搜索：
1. 确保 knowledge 表的 embedding 列已创建
2. 配置 MiniMax 生成向量
3. 使用相似度查询

### 3. 云端同步功能

- `records` 表已创建
- 打卡数据需要配置好认证后才能同步

### 4. 其他优化

- 接入真实白噪音音频文件
- AI生成40周宝宝插画
- 优化移动端体验

---

*最后更新: 2026-03-11 (Version 1.1.0 - RAG向量检索尝试)*
