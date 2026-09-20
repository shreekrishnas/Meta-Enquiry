import { useTheme } from '../contexts/ThemeContext'

export default function Atmosphere() {
  const { theme } = useTheme()

  if (theme === 'dark') return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F8FAFC 100%)',
      pointerEvents: 'none',
    }} />
  )
}
