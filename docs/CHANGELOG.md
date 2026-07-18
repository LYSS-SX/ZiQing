# ZiQing（紫青口语）变更日志

本文档记录相对「初版产品设计」之后的**已实现修改**，便于对照旧文档与当前软件行为。

仓库：https://github.com/LYSS-SX/ZiQing  
规格现行版：`docs/superpowers/specs/2026-07-18-english-speaking-adventure-design.md`

---

## [1.5.0] — 2026-07-18 — Windows 便携打包

### 新增
- `npm run dist:portable`：打包单文件 portable exe  
- 产物：`release/紫青口语 1.0.0.exe`  
- 桌面副本：`紫青口语.exe`、`ZiQing-紫青口语.exe`（约 71MB）

### 工程
- `electron-builder`：`signAndEditExecutable: false`（避免无管理员权限下 winCodeSign 符号链接失败）  
- `.npmrc` / 镜像：Electron 与 builder 二进制国内源

---

## [1.4.0] — 2026-07-18 — 今日副本 30 题循环挑战

### 变更
- 今日副本由约 8～10 题改为 **固定 30 题**  
  - 热身 5 + 主线 15 + 挑战 5 + 复仇 5  
- **答对才前进**；答错停留本关，可无限重试  
- 展示：进度百分比、本题已错次数、「重开 30 题」  
- 通关后可再开一轮  
- 旧短副本自动迁移为 30 题  

### 数据模型
- `DailyDungeonState` 增加：`clearedCount`、`wrongOnCurrent`、`restartCount`、`targetCount`  
- `DUNGEON_SIZE = 30`（`src/renderer/src/lib/progress.ts`）

### 涉及文件
- `src/renderer/src/features/pages/DungeonPage.tsx`  
- `src/renderer/src/lib/progress.ts`  
- `src/shared/types.ts`  
- `src/renderer/src/features/pages/MapPage.tsx`（文案）

---

## [1.3.0] — 2026-07-18 — 自由练习 / 中文提示 / 单词表 / 题库扩充

### 自由练习
- 取消「每批 12 题」限制  
- 取消「未解锁地图不可练」  
- 支持：全部地图、题型筛选、上一题/下一题、重新打乱、进度条  

### 中文提示
- 题目字段：`promptZh`、`sampleAnswerZh` 等  
- 答题器按钮 **「显示中文」**：题干 / 示范 / 解析  

### 单词表（新页面）
- 导航：📗 单词表  
- `vocabulary.json`：约 **418** 词（A1～B2）  
- 中英搜索、级别筛选、听发音 / 听例句  

### 题库
- 生成脚本重写：`scripts/generate-question-bank.mjs`  
- 练习题约 **2013** 道（词表全量扩展选词/听义/跟读等）  
- 命令：`npm run generate:bank`  

### 语音识别加固
- 主进程：麦克风权限、`WebSpeechAPI` 相关开关  
- `src/renderer/src/lib/speech.ts`：预检麦克风、中间结果、超时与错误中文提示  
- 降级：打字、「我已跟读/说完」  
- 跟读评分阈值放宽  

### 涉及文件（主要）
- `src/renderer/src/features/pages/PracticePage.tsx`  
- `src/renderer/src/features/pages/VocabPage.tsx`  
- `src/renderer/src/features/practice/QuestionPlayer.tsx`  
- `src/renderer/src/lib/speech.ts`  
- `src/main/index.ts`  
- `src/shared/types.ts`、`scoring.ts`  
- `src/renderer/src/content/questions.json`  
- `src/renderer/src/content/vocabulary.json`  

---

## [1.1.0] — 2026-07-18 — 视觉系统 v2（Teal Glass + 像素地图）

### 设计变更
- **弃用** 蓝紫教育风  
- 主色：**Teal / Aqua / Mint Cyan**，深墨绿蓝压暗  
- 文字：白 / 近黑（亮色主题）  
- 背景：液态图 + 强高斯模糊 + 漂浮光斑（非干净矢量渐变）  
- 界面：毛玻璃侧栏与卡片  
- 地图：像素世界底图 + **关卡路线** + 7 节点（锁 / YOU 脉冲）  

### 资源
- `src/renderer/src/assets/liquid-bg.jpg`  
- `src/renderer/src/assets/pixel-world-map.jpg`  

### 涉及文件
- `src/renderer/src/styles/global.css`  
- `src/renderer/src/components/AmbientBackground.tsx`  
- `src/renderer/src/features/map/AdventureMap.tsx`  
- `src/shared/maps.ts`（节点坐标与配色）  

---

## [1.0.0] — 2026-07-18 — 完整核心版首次落地

### 已实现（对照初版规格）
- Electron + React + TypeScript 工程  
- 新手引导定级  
- 七大地图成长与 XP 解锁  
- 今日副本（初版短结构，后被 1.4 取代）  
- 自由练习（初版有上限，后被 1.3 放开）  
- 混合题型与本地评分  
- 待翻盘 / 荣誉墙 / 复仇墙  
- 礼花 / 巴掌 / 程序化音效  
- 托盘 + 系统通知 + 置顶弹题窗  
- 成就与成长速览  
- 设置：弹题、动效、主题、导出/重置  
- 本地 `electron-store` 持久化  

### 技术栈
Electron 33 · React 18 · Vite · electron-vite · electron-store  

---

## 初版规格未做 / 明确延后

- 账号与云同步  
- 付费会员  
- 服务端 AI band 分  
- 官方雅思/托福真题版权内容  
- 移动端  
- 正式代码签名与自定义品牌图标（可选后续）  

---

## 文档索引

| 文档 | 说明 |
|------|------|
| `docs/superpowers/specs/2026-07-18-english-speaking-adventure-design.md` | 产品设计规格（已更新为现行真相） |
| `docs/superpowers/plans/2026-07-18-ziqing-implementation.md` | 实现计划与阶段完成状态 |
| `README.md` | 使用、开发、打包说明 |
| `docs/CHANGELOG.md` | 本文：修改记录 |
