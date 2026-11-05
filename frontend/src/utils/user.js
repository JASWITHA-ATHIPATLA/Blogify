  import axios from 'axios'
  async function handleLogout(setIsAuthenticated) {
    await axios.post(
      'http://localhost:3003/user/logout',
      {},
      { withCredentials: true }
    )
    setIsAuthenticated(false)
  }


export default handleLogout;