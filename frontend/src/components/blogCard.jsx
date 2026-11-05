import { useNavigate } from 'react-router-dom'
import '../styles/blogCard.css'

function BlogCard({ blog }) {
  const navigate = useNavigate()

  return (
    <article
      className="blog-card"
      onClick={() => navigate(`/blog/${blog._id}`)}
    >
      {blog.coverImgURL && (
        <img
          src={`http://localhost:3003${blog.coverImgURL}`}
          alt={blog.title}
          className="blog-image"
        />
      )}

      <div className="blog-content">
        <h3>{blog.title}</h3>
        <p>{blog.body.slice(0, 100)}...</p>
        <span>Read More →</span>
      </div>
    </article>
  )
}

export default BlogCard