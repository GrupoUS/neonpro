"use client"

import { useState } from "react"
import theme from "../styles/theme"

export default function LoginForm() {
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value
    if (!email || !password) {
      setError("Please enter both email and password.")
    } else {
      setError("")
      // Handle login logic here
      alert(`Logging in with ${email}`)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          border: 1px solid ${theme.colors.border};
          border-radius: 8px;
          background: ${theme.colors.background};
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
          text-align: center;
          margin-top: 0;
          margin-bottom: 24px;
          color: ${theme.colors.text};
        }
        .input-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid ${theme.colors.border};
          border-radius: 4px;
          font-size: 16px;
          font-family: ${theme.fontFamily.sansSerif};
        }
        input:focus {
          outline: none;
          border-color: ${theme.colors.primary};
          box-shadow: 0 0 0 2px ${theme.colors.primary}33;
        }
        button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 4px;
          background-color: ${theme.colors.primary};
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        button:hover {
          background-color: ${theme.colors.primaryHover};
        }
        .error-message {
          color: ${theme.colors.error};
          font-size: 14px;
          margin-bottom: 16px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
