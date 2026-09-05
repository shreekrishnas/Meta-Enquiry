import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Atmosphere from '../components/Atmosphere'

export default function AppLayout() {
  return (
    <div className="app-outer" style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
    }}>
      <Atmosphere />
      <div className="app-shell" style={{
        maxWidth: '1600px',
        width: '100%',
      }}>
        <div className="glass-panel" style={{
          height: '95vh',
          borderRadius: '2rem',
          overflow: 'hidden',
          display: 'flex',
        }}>
          <Sidebar />
          <div className="app-content" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <Topbar />
            <main className="app-main" style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem 2rem',
              background: 'transparent',
            }}>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
