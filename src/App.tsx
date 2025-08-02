import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthPage } from '@/components/auth/AuthPage'
import { Dashboard } from '@/pages/Dashboard'
import { NewBudget } from '@/pages/NewBudget'
import { PublicBudget } from '@/pages/PublicBudget'
import { Billing } from '@/pages/Billing'
import { Clients } from '@/pages/Clients'

const queryClient = new QueryClient()

function AuthenticatedApp() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/budgets/new" element={<NewBudget />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/budget/:publicUuid" element={<PublicBudget />} />
      
      {/* Protected routes */}
      {user ? (
        <Route path="/*" element={<AuthenticatedApp />} />
      ) : (
        <Route path="*" element={<AuthPage />} />
      )}
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}

export default App