import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { FilterProvider } from './contexts/FilterContext'

const Login        = lazy(() => import('./pages/Login'))
const VisaoAguia   = lazy(() => import('./pages/VisaoAguia'))
const Performance  = lazy(() => import('./pages/Performance'))
const Conteudo     = lazy(() => import('./pages/Conteudo'))
const Audiencia    = lazy(() => import('./pages/Audiencia'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))
const Placeholder  = lazy(() => import('./pages/Placeholder'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-primary animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FilterProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<VisaoAguia />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/conteudo" element={<Conteudo />} />
                <Route path="/audiencia" element={<Audiencia />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
        </FilterProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
