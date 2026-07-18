# ZiQing 英语口语闯关 — Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** 交付可运行的 Windows 桌面完整核心版：地图成长、今日副本、混合答题、礼花/巴掌动效、待翻盘/荣誉墙/复仇墙、托盘随机弹题。

**Architecture:** Electron 主进程负责托盘、通知、定时弹窗与本地持久化；React 渲染主窗与弹题小窗；题库静态 JSON；用户进度 electron-store。

**Tech Stack:** Electron, React 18, TypeScript, Vite, electron-store, CSS（自研主题，无强制 UI 库）

## Global Constraints

- Windows 桌面优先；中文 UI
- 第一版本地数据，无账号
- 弹窗仅短题（allowPopup）
- 动效/巴掌可关
- 仓库路径：`C:\Users\Administrator\ZiQing`

## File Structure

```
package.json
electron.vite.config.ts
electron/main.ts
electron/preload.ts
src/main.tsx
src/App.tsx
src/styles/global.css
src/shared/types.ts
src/shared/maps.ts
src/shared/scoring.ts
src/shared/store.ts          # renderer-side API over preload
src/content/questions.json   # bundled bank
src/features/effects/*
src/features/practice/*
src/features/pages/*
src/features/onboarding/*
```

## Tasks Overview

1. Scaffold Electron+Vite+React+TS，可 `npm run dev` 开窗  
2. 类型、地图常量、本地 store、题库（≥280 单元）  
3. 答题器 + 评分 + 礼花/巴掌/音效  
4. 页面：Onboarding、地图、今日副本、自由练习、待翻盘、双榜、成就、设置  
5. 主进程：托盘、通知、弹题调度、弹题窗  
6. README、构建脚本、提交推送  

## Execution

Inline in session; commit when major milestones land.
