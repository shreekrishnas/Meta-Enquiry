import { useTheme } from '../contexts/ThemeContext'

export default function Atmosphere() {
  const { theme } = useTheme()

  const background = theme === 'dark'
    ? `
        radial-gradient(circle at 20% 20%, #1e1b4b 0%, transparent 40%),
        radial-gradient(circle at 80% 10%, #3b0764 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, #0f172a 0%, transparent 100%),
        radial-gradient(circle at 10% 80%, #064e3b 0%, transparent 40%),
        radial-gradient(circle at 90% 90%, #1c1917 0%, transparent 40%)
      `
    : `
        radial-gradient(circle at 20% 20%, #e0e7ff 0%, transparent 40%),
        radial-gradient(circle at 80% 10%, #fae8ff 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, #f1f5f9 0%, transparent 100%),
        radial-gradient(circle at 10% 80%, #dcfce7 0%, transparent 40%),
        radial-gradient(circle at 90% 90%, #fef9c3 0%, transparent 40%)
      `

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        filter: 'blur(80px)',
        background,
      }}
    />
  )
}
