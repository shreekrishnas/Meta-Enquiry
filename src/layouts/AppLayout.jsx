import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AppLayout() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: 'var(--surface-base)',
      overflow: 'hidden',
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <Topbar />
        <main className="app-main" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          background: 'var(--surface-base)',
        }}>
          <div style={{ maxWidth: '1200px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
