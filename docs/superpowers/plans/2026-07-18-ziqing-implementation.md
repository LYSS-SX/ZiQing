# ZiQing 英语口语闯关 — Implementation Plan

**Goal:** 交付可运行的 Windows 桌面完整核心版，并完成视觉与学习体验迭代。

**Architecture:** Electron 主进程负责托盘、通知、定时弹窗、麦克风权限与本地持久化；React 渲染主窗与弹题小窗；题库/单词表静态 JSON；用户进度 electron-store。

**Tech Stack:** Electron 33, React 18, TypeScript, Vite (electron-vite), electron-store, CSS（Teal Glass）

**Status:** ✅ 核心计划已完成；后续变更见 `docs/CHANGELOG.md` 与规格修订记录。

## Global Constraints

- Windows 桌面优先；中文 UI  
- 第一版本地数据，无账号  
- 弹窗仅短题（`allowPopup`）  
- 动效/巴掌可关  
- 仓库：`C:\Users\Administrator\ZiQing` · https://github.com/LYSS-SX/ZiQing  

## File Structure（现行）

```
src/main/index.ts
src/preload/index.ts
src/shared/{types,maps,scoring,defaults}.ts
src/renderer/src/
  App.tsx
  assets/{liquid-bg,pixel-world-map}.jpg
  components/AmbientBackground.*
  content/{questions,vocabulary}.json
  features/map/AdventureMap.*
  features/practice/QuestionPlayer.*
  features/effects/*
  features/onboarding/*
  features/pages/{Map,Dungeon,Practice,Vocab,Boards,Achievements,Settings,Popup}Page*
  lib/{progress,audio,speech}.ts
  styles/global.css
scripts/generate-question-bank.mjs
```

## Tasks Overview — 完成状态

| # | 任务 | 状态 |
|---|------|------|
| 1 | Scaffold Electron+Vite+React+TS | ✅ |
| 2 | 类型、地图、store、题库 | ✅（题库后扩至 ~2013） |
| 3 | 答题器 + 评分 + 礼花/巴掌/音效 | ✅ |
| 4 | Onboarding / 地图 / 副本 / 练习 / 双榜 / 成就 / 设置 | ✅ |
| 5 | 托盘、通知、弹题调度 | ✅ |
| 6 | README、构建、推送 | ✅ |
| 7 | 视觉 Teal Glass + 像素关卡地图 | ✅（迭代） |
| 8 | 语音加固 + 中文提示 + 单词表 | ✅（迭代） |
| 9 | 自由练习全库不设限 | ✅（迭代） |
| 10 | 今日副本 30 题循环挑战 | ✅（迭代） |
| 11 | portable exe 桌面分发 | ✅（迭代） |

## 迭代说明

详细 diff 级说明见 **`docs/CHANGELOG.md`**。  
产品规格现行条文见 **`docs/superpowers/specs/2026-07-18-english-speaking-adventure-design.md`**。

## 常用命令

```powershell
cd C:\Users\Administrator\ZiQing
npm install
npm run generate:bank   # 重生成题库与单词表
npm run dev             # 开发
npm run dist:portable   # 便携 exe → release/
```
