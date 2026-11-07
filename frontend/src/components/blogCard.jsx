import { useNavigate } from 'react-router-dom'
import resolveImageUrl from '../utils/resolveImageUrl.js'
import '../styles/blogCard.css'

function BlogCard({ blog }) {
  const navigate = useNavigate()
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
            className="blog-image"
          />
        ) : (
          <div className="blog-image-placeholder" aria-hidden="true">
            <span>Blogify</span>
          </div>
        )}
      </div>

      <div className="blog-content">
        <h3>{blog.title}</h3>
        <p>{blog.body.slice(0, 100)}...</p>
        <span className="blog-card-read-more">
          Read story <span aria-hidden="true">→</span>
        </span>
      </div>

      <div className="blog-card-author">
        <img
          src={resolveImageUrl(blog.createdBy?.profileImageURL || '/images/default.png')}
          alt=""
          className="blog-card-author-image"
        />
        <div className="blog-card-author-copy">
          <span className="blog-card-author-label">Written by</span>
          <span className="blog-card-author-name">
            {blog.createdBy?.Fullname || 'Unknown author'}
          </span>
        </div>
      </div>
    </article>
  )
}

export default BlogCard