import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiGet, apiPost, normAmount } from './api'

export const API = (import.meta.env.VITE_API_URL as string) || 'https://timecashking-api.onrender.com'

// using helpers from api.ts

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
        <Route path="/categories" element={<Categories />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(<App />)

function Section({ title, children }: { title: string, children: any }) {
  return <div style={{ marginTop: 16 }}>
    <h2>{title}</h2>
    {children}
  </div>
}

function Categories() {
  const [list, setList] = React.useState<any[]>([])
  const [name, setName] = React.useState('')
  const [id, setId] = React.useState('')
  const [newName, setNewName] = React.useState('')
  const load = async () => setList(await apiGet('/categories'))
  const create = async () => { await apiPost('/categories', { name }); setName(''); load() }
  const rename = async () => { await apiPost('/categories/' + id, { name: newName }).catch(async () => await fetch(API+'/categories/'+id,{method:'PATCH'})); load() }
  const remove = async () => { await fetch(API+'/categories/'+id,{ method:'DELETE', credentials:'include'}); load() }
  React.useEffect(() => { load() }, [])
  return <Section title="Categorias">
    <div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome" />
      <button onClick={create}>Criar</button>
      <button onClick={load}>Listar</button>
    </div>
    <div style={{ marginTop: 8 }}>
      <input value={id} onChange={e=>setId(e.target.value)} placeholder="ID" />
      <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Novo nome" />
      <button onClick={rename}>Renomear</button>
      <button onClick={remove}>Excluir</button>
    </div>
    <pre>{JSON.stringify(list,null,2)}</pre>
  </Section>
}

function Transactions() {
  const [type, setType] = React.useState('INCOME')
  const [amount, setAmount] = React.useState('')
  const [desc, setDesc] = React.useState('')
  const [items, setItems] = React.useState<any[]>([])
  const create = async () => { await apiPost('/transactions', { type, amount: normAmount(amount), description: desc }); setAmount(''); setDesc(''); load() }
  const load = async () => setItems(await apiGet('/transactions'))
  React.useEffect(()=>{ load() },[])
  return <Section title="Transações">
    <div>
      <select value={type} onChange={e=>setType(e.target.value)}>
        <option value="INCOME">Receita</option>
        <option value="EXPENSE">Despesa</option>
      </select>
      <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Valor" />
      <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descrição" />
      <button onClick={create}>Criar</button>
      <button onClick={load}>Listar</button>
    </div>
    <pre>{JSON.stringify(items,null,2)}</pre>
  </Section>
}

function Summary() {
  const [data, setData] = React.useState<any>(null)
  const load = async () => setData(await apiGet('/summary'))
  React.useEffect(()=>{ load() },[])
  return <Section title="Resumo">
    <button onClick={load}>Atualizar</button>
    <pre>{JSON.stringify(data,null,2)}</pre>
  </Section>
}


