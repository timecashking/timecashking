import React from 'react'
import { createRoot } from 'react-dom/client'

const API = (import.meta.env.VITE_API_URL as string) || 'https://timecashking-api.onrender.com'

function App() {
  const login = () => {
    location.href = API.replace(/\/$/, '') + '/integrations/google/auth'
  }
  const [me, setMe] = React.useState<any>(null)
  const fetchMe = async () => {
    const token = localStorage.getItem('tck_jwt') || ''
    const res = await fetch(API.replace(/\/$/, '') + '/me', {
      credentials: 'include',
      headers: token ? { Authorization: 'Bearer ' + token } : undefined,
    })
    setMe(await res.json())
  }
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>TimeCash King</h1>
      <p>API: {API}</p>
      <button onClick={login}>Login com Google</button>
      <button onClick={fetchMe} style={{ marginLeft: 8 }}>Chamar /me</button>
      <pre>{JSON.stringify(me, null, 2)}</pre>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)


