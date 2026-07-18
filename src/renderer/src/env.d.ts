import type { ZiqingApi } from '../../preload/index'

declare global {
  interface Window {
    ziqing: ZiqingApi
  }
}

export {}
