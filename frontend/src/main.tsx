import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

async function init() {
  const authData = localStorage.getItem('auth');
  if (!authData) {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'manager@transitops.com',
        password: 'password123',
        role: 'FLEET_MANAGER'
      });
      localStorage.setItem('auth', JSON.stringify({ token: res.data.data.token }));
    } catch (e) {
      console.error('Auto login failed', e);
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </StrictMode>,
  )
}

init();
