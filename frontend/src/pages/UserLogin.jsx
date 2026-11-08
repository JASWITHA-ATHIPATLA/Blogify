import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import '../styles/userLogin.css'

function UserLogin({onLogin}) {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    const email = event.target.email.value
    const password = event.target.password.value

    try {
      const response = await axios.post(
        '/user/login',
        {
          email: email,
          password: password
        },
        { withCredentials: true }
      )
      
      if (response.data.message === 'Login successful') {
        const { data } = await axios.get('/user/me', { withCredentials: true })
        onLogin(data.user)
        navigate('/home', { replace: true })
      }

    } catch (error) {
      setMessage(error.response?.data?.message ?? 'Could not verify your login. Please try again.')
    }
  }

  return (
    <main className="login-page">

      <form
        className="login-card"
        onSubmit={handleSubmit}
      >

        <h1>Welcome back</h1>

        <p className="login-description">
          Sign in to your account to continue.
        </p>

        <div className="login-fields">

          <label className="login-field" htmlFor="email">
            Email

            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="login-field" htmlFor="password">
            Password

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {message && <p role="alert">{message}</p>}

          <button
            className="login-submit"
            type="submit"
          >
            Sign in
          </button>

          <p className="login-description">
            Need an account?{' '}
            <Link to="/">
              Create one
            </Link>
          </p>

        </div>

      </form>

    </main>
  )
}

export default UserLogin