import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signIn } from "../services/authService"

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", senha: "" })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(form.email, form.senha)
      navigate("/")
    } catch (err) {
      console.error("Erro ao logar:", err)
      alert("Erro ao tentar logar: " + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="agenda-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>

      <div className="form-field">
        <label htmlFor="senha">Senha</label>
        <input id="senha" type="password" name="senha" value={form.senha} onChange={handleChange} required />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </form>
  )
}
