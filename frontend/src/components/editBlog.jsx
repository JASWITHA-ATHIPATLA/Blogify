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
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    axios.get(`/blog/${id}`)
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
        `/blog/${id}`,
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

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return
    }

    setError('')
    setIsDeleting(true)
    try {
      await axios.delete(`/blog/${id}`, { withCredentials: true })
      navigate('/home', { replace: true })
    } catch (requestError) {
      console.error('Could not delete blog:', requestError)
      setError(requestError.response?.data?.message ?? 'Could not delete the blog.')
    } finally {
      setIsDeleting(false)
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
            className="cover-image-preview"
          />
        )}
        <input
          id="coverImageURL"
          type="file"
          name="coverImageURL"
          accept="image/*"
        />

        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={isSaving || isDeleting}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
        <button
          type="button"
          className="delete-blog-button"
          onClick={handleDelete}
          disabled={isSaving || isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete blog'}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/blog/${id}`)}
          disabled={isSaving || isDeleting}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

export default EditBlog
