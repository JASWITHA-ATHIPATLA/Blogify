import { useNavigate } from 'react-router-dom'
import resolveImageUrl from '../utils/resolveImageUrl.js'
import '../styles/blogCard.css'

function BlogCard({ blog }) {
  const navigate = useNavigate()
  const isCompanyLogo = blog.coverImgURL?.includes('/s2/favicons')
  const openBlog = () => navigate(`/blog/${blog._id}`)

  return (
    <article
      className="blog-card"
      role="link"
      tabIndex={0}
      aria-label={`Read ${blog.title}`}
      onClick={openBlog}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openBlog()
        }
      }}
    >
      <div className="blog-card-visual">
        {blog.coverImgURL ? (
          <img
            src={resolveImageUrl(blog.coverImgURL)}
            alt={blog.title}
            className={`blog-image${isCompanyLogo ? ' blog-image--logo' : ''}`}
          />
        ) : (
          <div className="blog-image-placeholder" aria-hidden="true">
            <svg viewBox="0 0 48 48" focusable="false">
              <rect x="7" y="9" width="34" height="30" rx="5" fill="#c65cda" />
              <circle cx="18" cy="20" r="3" fill="#f3d9fb" />
              <path d="m11 34 9-9 6 6 5-5 7 8H11Z" fill="#f3d9fb" />
            </svg>
          </div>
        )}
      </div>

      <div className="blog-content">
        <h3>{blog.title}</h3>
        <p>{blog.body.slice(0, 100)}...</p>
      </div>
    </article>
  )
}

export default BlogCard