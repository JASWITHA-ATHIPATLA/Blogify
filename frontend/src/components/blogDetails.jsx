import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function BlogDetails() {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)

  useEffect(() => {
    axios.get(`http://localhost:3003/blog/${id}`, {
      withCredentials: true
    })
      .then(({ data }) => setBlog(data.blog))
      .catch(error => console.error(error))
  }, [id])

  if (!blog) return <h2>Loading...</h2>

  return (
    <div className="blog-details">
      {blog.coverImgURL && (
        <img
          src={`http://localhost:3003${blog.coverImgURL}`}
          alt={blog.title}
        />
      )}

      <h1>{blog.title}</h1>
      <p>{blog.body}</p>
    </div>
  )
}

export default BlogDetails