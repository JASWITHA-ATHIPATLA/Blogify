import '../styles/Navbar.css'

function Navbar({ user, onLogout, logoutError, isLoggingOut }) {
  return (
    <header className="site-header">
      <a className="site-brand" href="#" aria-label="Blogify home">
        blogify<span className="brand-period">.</span>
      </a>

      <nav className="site-navigation" aria-label="Main navigation">
        <a className="navigation-link" href="#">Home</a>
        <a className="navigation-link posts-link" href="/blog">Blog posts</a>
        <a className="navigation-link" href="/about">About</a>
      </nav>

      <div className="navigation-actions">
        {user?.fullName && <span className="current-user">{user.fullName}</span>}
        <a className="write-post-link" href="/write">Write a post</a>
        <button
          className="logout-button"
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
      {logoutError && <p role="alert">{logoutError}</p>}
    </header>
  )
}

export default Navbar