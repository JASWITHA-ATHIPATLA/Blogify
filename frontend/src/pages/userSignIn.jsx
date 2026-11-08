import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import '../styles/userLogin.css'
import { useNavigate } from 'react-router-dom'


function UserSignIn() {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
const navigate = useNavigate();
  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await axios.post('/user/signup', {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
      })

      if(response.data.message){
          navigate('/login')
      } 
      form.reset()
      
    } catch (error) {
      setMessage(error.response?.data?.message ?? 'Could not create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="login-description">Enter your details to get started.</p>

        <div className="login-fields">
          <label className="login-field" htmlFor="fullName">
            Full name
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </label>

          <label className="login-field" htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="login-field" htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </label>

          {message && <p role="status">{message}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
          <p className="login-description">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </form>
    </main>
  )
}

export default UserSignIn