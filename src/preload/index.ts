import { contextBridge, ipcRenderer } from 'electron'
import type { AppData } from '../shared/types'

const api = {
  getData: (): Promise<AppData> => ipcRenderer.invoke('data:get'),
  setData: (data: AppData): Promise<boolean> => ipcRenderer.invoke('data:set', data),
  openPopup: (): Promise<boolean> => ipcRenderer.invoke('popup:open'),
  closePopup: (): Promise<boolean> => ipcRenderer.invoke('popup:close'),
  snoozePopup: (minutes?: number): Promise<boolean> => ipcRenderer.invoke('popup:snooze', minutes),
  testPopup: (): Promise<boolean> => ipcRenderer.invoke('popup:test'),
  getUserDataPath: (): Promise<string> => ipcRenderer.invoke('app:getPath'),
  onDataChanged: (cb: () => void): (() => void) => {
    const listener = (): void => cb()
    ipcRenderer.on('data:changed', listener)
    return () => ipcRenderer.removeListener('data:changed', listener)
  }
}

contextBridge.exposeInMainWorld('ziqing', api)

export type ZiqingApi = typeof api
