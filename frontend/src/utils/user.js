  import axios from 'axios'
  async function handleLogout(setIsAuthenticated) {
    await axios.post(
      '/user/logout',
      {},
      { withCredentials: true }
    )
    setIsAuthenticated(false)
  }


export default handleLogout;