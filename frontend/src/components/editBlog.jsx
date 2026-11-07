import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import resolveImageUrl from '../utils/resolveImageUrl.js'
import '../styles/blog.css'

function EditBlog({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    axios.get(`http://localhost:3003/blog/${id}`)
      .then(({ data }) => setBlog(data.blog))
      .catch((requestError) => {
        console.error('Could not load blog:', requestError)
        setError('Could not load this blog.')
      })
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      await axios.put(
        `http://localhost:3003/blog/${id}`,
        new FormData(event.currentTarget),
        { withCredentials: true }
      )
      navigate(`/blog/${id}`, { replace: true })
    } catch (requestError) {
      console.error('Could not update blog:', requestError)
      setError(requestError.response?.data?.message ?? 'Could not update the blog.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!blog) {
    return <p role={error ? 'alert' : undefined}>{error || 'Loading blog...'}</p>
  }

  if (!user || user.id !== String(blog.createdBy?._id ?? blog.createdBy)) {
    return <p role="alert">You can only edit your own blog.</p>
  }

  return (
    <div className="blog-form">
      <h2>Edit Blog</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          defaultValue={blog.title}
          required
        />

        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          name="body"
          defaultValue={blog.body}
          required
        />

        <label htmlFor="coverImageURL">Replace Cover Image (optional)</label>
        {blog.coverImgURL && (
          <img
            src={resolveImageUrl(blog.coverImgURL)}
            alt={`Current cover for ${blog.title}`}
            width="150"
          />
        )}
        <input
          id="coverImageURL"
          type="file"
          name="coverImageURL"
          accept="image/*"
        />

        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
        <button type="button" onClick={() => navigate(`/blog/${id}`)}>
          Cancel
        </button>
      </form>
    </div>
  )
}

export default EditBlog
