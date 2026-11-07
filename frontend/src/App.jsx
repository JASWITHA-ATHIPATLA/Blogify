import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Usersignin from './pages/userSignIn.jsx'
import Home from './pages/home.jsx'
import Login from './pages/UserLogin.jsx'
import handleLogout from './utils/user.js'
import Blog from './components/blog.jsx'
import BlogDetails from './components/blogDetails.jsx'
import EditBlog from './components/editBlog.jsx'
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:3003/user/me', { withCredentials: true })
      .then(({ data }) => {
        setUser(data.user)
        setIsAuthenticated(true)
      })
      .catch((error) => {
        if (error.response?.status !== 401) {
          console.error('Could not verify the current session:', error)
        }
        setUser(null)
        setIsAuthenticated(false)
      })
      .finally(() => setIsCheckingAuth(false))
  }, [])

  if (isCheckingAuth) {
    return <p>Checking your session...</p>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Usersignin />}
        />
        <Route
          path="/login"
          element={
           <Login onLogin={(authenticatedUser) => {
             setUser(authenticatedUser)
             setIsAuthenticated(true)
           }} />
          }
        />
        <Route
          path="/blog"
          element={
           <Blog/>
          }
        />
        <Route path="/blog/:id" element={<BlogDetails user={user} />} />
        <Route path="/blog/:id/edit" element={<EditBlog user={user} />} />
        <Route
          path="/home"
          element={
            isAuthenticated
              ? <Home
                  user={user}
                  onLogout={async () => {
                    await handleLogout(setIsAuthenticated)
                    setUser(null)
                  }}
                />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
