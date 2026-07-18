import type { ZiqingApi } from '../../preload/index'

declare global {
  interface Window {
    ziqing: ZiqingApi
  }
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

export {}
