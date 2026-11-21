
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import BlogCard from '../components/blogCard.jsx'

function Home({ user, onLogout }) {
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [blogs, setBlogs] = useState([])
  const butterflyRef = useRef(null)

  useEffect(() => {
    axios.get('/blog', {
      withCredentials: true
    })
      .then(({ data }) => setBlogs(data.blogs))
      .catch((error) =>
        console.error('Could not load blogs:', error)
      )
  }, [])

  useEffect(() => {
    const butterfly = butterflyRef.current
    const supportsHover = window.matchMedia('(pointer: fine)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!butterfly || !supportsHover || prefersReducedMotion) return

    const homePage = butterfly.closest('.home-page')
    homePage?.classList.add('home-page--butterfly-active')

    let frameId = null
    let pointerX = 0
    let pointerY = 0

    function handlePointerMove(event) {
      pointerX = event.clientX - 17
      pointerY = event.clientY - 17
      butterfly.style.opacity = '1'

      if (frameId !== null) return
      frameId = window.requestAnimationFrame(() => {
        butterfly.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`
        frameId = null
      })
    }

    function hideButterfly() {
      butterfly.style.opacity = '0'
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', hideButterfly)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', hideButterfly)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      homePage?.classList.remove('home-page--butterfly-active')
    }
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
    <div className="home-page">
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
      <div className="butterfly-cursor" aria-hidden="true" ref={butterflyRef}>
        <svg viewBox="0 0 48 48" focusable="false">
          <defs>
            <linearGradient id="butterfly-wing-gradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#7657e8" />
            </linearGradient>
          </defs>
          <path
            className="butterfly-wing butterfly-wing-left"
            d="M22 22C17 11 5 7 5 17c0 7 7 11 17 10-9 4-10 13-4 14 5 0 7-7 6-16z"
            fill="url(#butterfly-wing-gradient)"
          />
          <path
            className="butterfly-wing butterfly-wing-right"
            d="M26 22C31 11 43 7 43 17c0 7-7 11-17 10 9 4 10 13 4 14-5 0-7-7-6-16z"
            fill="url(#butterfly-wing-gradient)"
          />
          <path d="M24 20c-2 7-2 14 0 20 2-6 2-13 0-20" fill="#4934a5" />
          <path d="M23 21c-3-5-6-7-9-8m11 8c3-5 6-7 9-8" fill="none" stroke="#4934a5" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

export default Home
