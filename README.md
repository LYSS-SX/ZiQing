# ZiQing（紫青）· 英语口语闯关宇宙

从幼儿园到雅思托福的 **Windows 桌面口语学习应用**。  
游戏化像素地图 + 30 题今日副本循环挑战 + 全库自由练习 + 单词表 + 随机弹窗 + 礼花/巴掌反馈。

**仓库：** https://github.com/LYSS-SX/ZiQing  

---

## 功能一览（现行 v1.5）

| 模块 | 说明 |
|------|------|
| 冒险地图 | 像素世界图 + 关卡路线节点（咿呀村 → … → 雅思塔） |
| 今日副本 | **30 题**；**答对才前进**；答错原地循环；可重开 |
| 自由练习 | **全库**、**不锁地图**、按地图/题型筛选 |
| 单词表 | ~418 基础词，中英搜索，听发音 |
| 中文提示 | 答题页「显示中文」 |
| 待翻盘 / 荣誉墙 / 复仇墙 | 对错次数与颜色强度 |
| 托盘弹题 | 通知 + 置顶小窗 |
| 动效 | 礼花 / 巴掌 / 音效（可关） |
| 视觉 | Teal · Mint 毛玻璃 + 液态模糊背景 |

---

## 快速启动（用户）

桌面双击（若已打包复制）：

- `紫青口语.exe`
- 或 `ZiQing-紫青口语.exe`

也可运行：

`C:\Users\Administrator\ZiQing\release\紫青口语 1.0.0.exe`

> Windows 可能提示未知发布者 → 选择「仍要运行」。  
> 语音跟读建议：**联网** + 系统允许麦克风。

---

## 开发

```powershell
cd C:\Users\Administrator\ZiQing
npm install
npm run generate:bank
npm run dev
```

## 打包便携版

```powershell
npm run dist:portable
```

产物在 `release/`。复制到桌面即可分发。

---

## 文档（请以这些为准）

| 文档 | 内容 |
|------|------|
| [产品设计规格（现行）](docs/superpowers/specs/2026-07-18-english-speaking-adventure-design.md) | 完整产品规则、数据模型、架构 |
| [变更日志 CHANGELOG](docs/CHANGELOG.md) | **所有修改相对初版的记录** |
| [实现计划](docs/superpowers/plans/2026-07-18-ziqing-implementation.md) | 阶段任务与完成状态 |

---

## 技术栈

Electron 33 · React 18 · TypeScript · Vite (electron-vite) · electron-store · electron-builder  

---

## 题库维护

```powershell
npm run generate:bank
```

生成：

- `src/renderer/src/content/questions.json`（练习题）  
- `src/renderer/src/content/vocabulary.json`（单词表）  

---

## 版本

当前文档对齐版本：**1.5.0**（便携打包 + 30 题副本 + Teal 视觉 + 单词表等）。  
详见 [CHANGELOG](docs/CHANGELOG.md)。
