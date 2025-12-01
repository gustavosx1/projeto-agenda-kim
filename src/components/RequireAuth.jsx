import React, { useEffect, useState } from 'react'
import { supabase } from '../database/supabase'
import { useNavigate, Link } from 'react-router-dom'
import LoadingSpinner from './LoadingSpinner'

export default function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        const {
          data: { user: u },
        } = await supabase.auth.getUser()
        if (!mounted) return
        setUser(u)
      } catch (err) {
        console.error('auth check error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [])

  if (loading) return <LoadingSpinner />
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h3>Você precisa estar logado para acessar esta página</h3>
        <p>
          Faça login para continuar. <Link to="/login">Ir para início</Link>
        </p>
      </div>
    )
  }

  return children
}
