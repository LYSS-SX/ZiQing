# ZiQing（紫青）· 英语口语闯关宇宙

从幼儿园到雅思托福的 **Windows 桌面口语学习应用**。  
游戏化地图成长 + 今日副本 + 随机弹窗短练 + 荣誉墙/复仇墙 + 礼花/巴掌动效。

## 功能

- **冒险地图**：咿呀村 → 单词小镇 → 对话山谷 → 校园港 → 考场前线 → 托福城 → 雅思塔  
- **今日副本**：热身 / 主线 / 挑战 / 复仇  
- **混合题型**：选词、填空、排序、情景对话、跟读、短说、话题卡  
- **待翻盘 / 荣誉墙 / 复仇墙**：次数驱动绿/红强度  
- **系统托盘随机弹题**：通知 + 置顶小窗（可设间隔、静音时段、每日上限）  
- **商业化反馈**：答对礼花与音效；答错巴掌冲击（强度可关）  

## 技术栈

Electron + React + TypeScript + Vite（electron-vite）+ electron-store

## 开发

```powershell
cd C:\Users\Administrator\ZiQing
npm install
npm run generate:bank
npm run dev
```

## 打包

```powershell
npm run dist
```

产物在 `release/`。

## 文档

- [产品设计规格](docs/superpowers/specs/2026-07-18-english-speaking-adventure-design.md)
- [实现计划](docs/superpowers/plans/2026-07-18-ziqing-implementation.md)

## 仓库

https://github.com/LYSS-SX/ZiQing
