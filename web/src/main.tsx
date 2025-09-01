import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'

export const API = (import.meta.env.VITE_API_URL as string) || 'https://timecashking-api.onrender.com'

async function apiGet(path: string) {
  const token = localStorage.getItem('tck_jwt') || ''
  const res = await fetch(API.replace(/\/$/, '') + path, {
    credentials: 'include',
    headers: token ? { Authorization: 'Bearer ' + token } : undefined,
  })
  return res.json()
}

function Home() {
  const login = () => (location.href = API.replace(/\/$/, '') + '/integrations/google/auth')
  const [me, setMe] = React.useState<any>(null)
  return (
    <div style={{ padding: 24 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/categories">Categorias</Link>
        <Link to="/transactions">Transações</Link>
        <Link to="/summary">Resumo</Link>
      </nav>
      <h1>TimeCash King</h1>
      <p>API: {API}</p>
      <button onClick={login}>Login com Google</button>
      <button onClick={async () => setMe(await apiGet('/me'))} style={{ marginLeft: 8 }}>Chamar /me</button>
      <pre>{JSON.stringify(me, null, 2)}</pre>
    </div>
  )
}

function AuthCallback() {
  const [sp] = useSearchParams()
  const nav = useNavigate()
  React.useEffect(() => {
    const t = sp.get('token')
    if (t) localStorage.setItem('tck_jwt', t)
    nav('/')
  }, [])
  return <div style={{ padding: 24 }}>Autenticando...</div>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/categories" element={<Home />} />
        <Route path="/transactions" element={<Home />} />
        <Route path="/summary" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(<App />)


