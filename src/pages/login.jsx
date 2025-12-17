import LoginForm from "../components/loginForm"
import logo from "../assets/logo.svg"

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src={logo} alt="Logo Agenda Bianca" className="login-logo" />
          <h1>Agenda Bianca</h1>
          <p className="login-subtitle">Organize seus compromissos e agendas</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  )
}
