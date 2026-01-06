import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signIn, signUp } from "../services/authService"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: "", password: "", passwordConfirm: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isSignUp) {
        // Validar cadastro
        if (form.password !== form.passwordConfirm) {
          throw new Error("As senhas não coincidem")
        }
        if (form.password.length < 6) {
          throw new Error("A senha deve ter no mínimo 6 caracteres")
        }
        
        await signUp(form.email, form.password)
        setForm({ email: "", password: "", passwordConfirm: "" })
        alert("Cadastro realizado! Verifique seu email para confirmar.")
        setIsSignUp(false)
      } else {
        // Login
        await signIn(form.email, form.password)
        navigate("/calendar")
      }
    } catch (err) {
      console.error("Erro:", err)
      setError(err.message || "Erro ao processar solicitação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isSignUp ? "Criar Conta" : "Entrar"}</h2>

        {error && <div className="auth-error">{error}</div>}

        {/* Email */}
        <div className="auth-field">
          <label htmlFor="email">E-mail</label>
          <div className="auth-input-wrapper">
            <Mail size={18} className="auth-input-icon" />
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="auth-field">
          <label htmlFor="password">Senha</label>
          <div className="auth-input-wrapper">
            <Lock size={18} className="auth-input-icon" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Password Confirm (only for signup) */}
        {isSignUp && (
          <div className="auth-field">
            <label htmlFor="passwordConfirm">Confirmar Senha</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="passwordConfirm"
                type={showPassword ? "text" : "password"}
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading ? (
            isSignUp ? "Criando conta..." : "Entrando..."
          ) : (
            isSignUp ? "Criar Conta" : "Entrar"
          )}
        </button>
      {/* Toggle between Login and Signup 
        <div className="auth-toggle">
          <span>
            {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}
          </span>
          <button
            type="button"
            className="auth-toggle-btn"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setForm({ email: "", password: "", passwordConfirm: "" })
              setError("")
            }}
            disabled={loading}
          >
            {isSignUp ? "Entrar" : "Cadastrar"}
          </button>
        </div> */}
      </form>
    </div>
  )
}
