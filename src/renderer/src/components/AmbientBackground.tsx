import liquidBg from '../assets/liquid-bg.jpg'
import './ambient.css'

/** Full-viewport liquid glass atmosphere — Gaussian-blurred art + animated blobs */
export function AmbientBackground(): JSX.Element {
  return (
    <div className="ambient" aria-hidden>
      <div className="ambient-photo" style={{ backgroundImage: `url(${liquidBg})` }} />
      <div className="ambient-blur-plate" />
      <div className="ambient-blob b1" />
      <div className="ambient-blob b2" />
      <div className="ambient-blob b3" />
      <div className="ambient-blob b4" />
      <div className="ambient-noise" />
      <div className="ambient-vignette" />
    </div>
  )
}
