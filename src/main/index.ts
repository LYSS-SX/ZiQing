import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
  nativeImage,
  screen,
  session,
  systemPreferences
} from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { createDefaultAppData } from '../shared/defaults'
import type { AppData, UserSettings } from '../shared/types'

const store = new Store<AppData>({
  name: 'ziqing-data',
  defaults: createDefaultAppData()
})

let mainWindow: BrowserWindow | null = null
let popupWindow: BrowserWindow | null = null
let tray: Tray | null = null
let popupTimer: NodeJS.Timeout | null = null
let snoozeUntil = 0

const isDev = !app.isPackaged

// Help Chromium speech + media features on Windows
app.commandLine.appendSwitch('enable-features', 'WebSpeechAPI,WebSpeechRecognition')
app.commandLine.appendSwitch('enable-speech-dispatcher')

function setupMediaPermissions(): void {
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    const allow = [
      'media',
      'mediaKeySystem',
      'notifications',
      'clipboard-sanitized-write',
      'accessibility-events'
    ]
    callback(allow.includes(permission))
  })
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => {
    return permission === 'media' || permission === 'notifications'
  })
}

function getData(): AppData {
  const data = store.store
  if (!data.profile) {
    const fresh = createDefaultAppData()
    store.store = fresh
    return fresh
  }
  return data as AppData
}

function setData(data: AppData): void {
  store.store = data
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: '紫青口语 · 闯关宇宙',
    backgroundColor: '#042f2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createPopupWindow(): void {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.focus()
    return
  }

  const display = screen.getPrimaryDisplay().workArea
  const width = 420
  const height = 560
  popupWindow = new BrowserWindow({
    width,
    height,
    x: display.x + display.width - width - 24,
    y: display.y + 24,
    show: false,
    frame: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    title: '紫青 · 随机挑战',
    backgroundColor: '#042f2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  popupWindow.on('closed', () => {
    popupWindow = null
  })

  const hash = '#/popup'
  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    popupWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}${hash}`)
  } else {
    popupWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/popup' })
  }

  popupWindow.once('ready-to-show', () => {
    popupWindow?.show()
    popupWindow?.focus()
  })
}

function createTray(): void {
  const image = nativeImage.createEmpty()
  // 16x16 simple tray icon via data URL fallback
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHklEQVQ4T2NkYGD4z0ABYBzVMKoBBgPDfwYGBgYGBgYGAH0mAf9kV8mYAAAAAElFTkSuQmCC'
  )
  tray = new Tray(icon.isEmpty() ? image : icon)
  tray.setToolTip('紫青口语')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主界面',
      click: () => {
        if (!mainWindow) createMainWindow()
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    {
      label: '立刻来一题',
      click: () => triggerPopup(true)
    },
    {
      label: '暂停弹题',
      type: 'checkbox',
      checked: !getData().profile.settings.popupEnabled,
      click: (item) => {
        const data = getData()
        data.profile.settings.popupEnabled = !item.checked
        setData(data)
        schedulePopup()
        mainWindow?.webContents.send('data:changed')
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    if (!mainWindow) createMainWindow()
    mainWindow?.show()
  })
}

function parseHHMM(s: string): number {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}

function inQuietHours(settings: UserSettings): boolean {
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  for (const q of settings.quietHours) {
    const start = parseHHMM(q.start)
    const end = parseHHMM(q.end)
    if (start <= end) {
      if (mins >= start && mins < end) return true
    } else {
      // overnight
      if (mins >= start || mins < end) return true
    }
  }
  return false
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function canPopup(force = false): boolean {
  if (Date.now() < snoozeUntil) return false
  const data = getData()
  const s = data.profile.settings
  if (!force && !s.popupEnabled) return false
  if (!force && inQuietHours(s)) return false
  if (data.profile.popupCountDate !== todayKey()) {
    data.profile.popupCountDate = todayKey()
    data.profile.popupCountToday = 0
    setData(data)
  }
  if (!force && data.profile.popupCountToday >= s.popupDailyLimit) return false
  return true
}

function triggerPopup(force = false): void {
  if (!canPopup(force)) return
  const data = getData()
  if (data.profile.popupCountDate !== todayKey()) {
    data.profile.popupCountDate = todayKey()
    data.profile.popupCountToday = 0
  }
  data.profile.popupCountToday += 1
  setData(data)

  if (Notification.isSupported()) {
    const n = new Notification({
      title: '紫青口语 · 来挑战啦',
      body: '咿呀村到雅思塔，随手练一题！点击打开。'
    })
    n.on('click', () => createPopupWindow())
    n.show()
  }
  createPopupWindow()
  schedulePopup()
}

function schedulePopup(): void {
  if (popupTimer) clearTimeout(popupTimer)
  const s = getData().profile.settings
  if (!s.popupEnabled) return
  const min = Math.max(1, s.popupMinMinutes)
  const max = Math.max(min, s.popupMaxMinutes)
  const minutes = min + Math.random() * (max - min)
  // In dev, allow slightly faster feel but still respect settings
  const ms = minutes * 60 * 1000
  popupTimer = setTimeout(() => {
    triggerPopup(false)
  }, ms)
}

function registerIpc(): void {
  ipcMain.handle('data:get', () => getData())
  ipcMain.handle('data:set', (_e, data: AppData) => {
    setData(data)
    schedulePopup()
    return true
  })
  ipcMain.handle('popup:open', () => {
    createPopupWindow()
    return true
  })
  ipcMain.handle('popup:close', () => {
    if (popupWindow && !popupWindow.isDestroyed()) popupWindow.close()
    return true
  })
  ipcMain.handle('popup:snooze', (_e, minutes?: number) => {
    const m = minutes ?? getData().profile.settings.snoozeMinutes
    snoozeUntil = Date.now() + m * 60 * 1000
    if (popupWindow && !popupWindow.isDestroyed()) popupWindow.close()
    return true
  })
  ipcMain.handle('popup:test', () => {
    triggerPopup(true)
    return true
  })
  ipcMain.handle('app:getPath', () => app.getPath('userData'))
}

app.whenReady().then(async () => {
  setupMediaPermissions()
  // Windows: prompt for mic if possible (no-op if unsupported)
  try {
    if (process.platform === 'win32' && systemPreferences.getMediaAccessStatus) {
      const status = systemPreferences.getMediaAccessStatus('microphone')
      if (status !== 'granted' && systemPreferences.askForMediaAccess) {
        await systemPreferences.askForMediaAccess('microphone')
      }
    }
  } catch {
    /* ignore */
  }

  registerIpc()
  createMainWindow()
  createTray()
  schedulePopup()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  // keep tray alive on Windows
  if (process.platform === 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (popupTimer) clearTimeout(popupTimer)
  tray?.destroy()
})
