import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Conversations from './pages/Conversations'
import ConversationDetail from './pages/ConversationDetail'
import POCReviews from './pages/POCReviews'
import KnowledgeBase from './pages/KnowledgeBase'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import SuperAdmin from './pages/SuperAdmin'
import TenantOnboarding from './pages/TenantOnboarding'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/onboarding" element={<TenantOnboarding />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/conversations/:id" element={<ConversationDetail />} />
              <Route path="/poc-reviews" element={<POCReviews />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<SuperAdmin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
