
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import BlogCard from '../components/blogCard.jsx'

function Home({ user, onLogout }) {
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3003/blog', {
      withCredentials: true
    })
      .then(({ data }) => setBlogs(data.blogs))
      .catch((error) =>
        console.error('Could not load blogs:', error)
      )
  }, [])

  async function handleLogout() {
    setLogoutError('')
    setIsLoggingOut(true)

    try {
      await onLogout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Could not log out:', error)
      setLogoutError('Could not log out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <Navbar
        user={user}
        onLogout={handleLogout}
        logoutError={logoutError}
        isLoggingOut={isLoggingOut}
      />

      <main>
        <div className="blog-container">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      </main>
    </>
  )
}

export default Home
