import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import resolveImageUrl from '../utils/resolveImageUrl.js'
import '../styles/blogCard.css'

function BlogDetails({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [actionError, setActionError] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)

  useEffect(() => {
    axios.get(`/blog/${id}`, {
      withCredentials: true
    })
      .then(({ data }) => setBlog(data.blog))
      .catch(error => console.error(error))
  }, [id])

  if (!blog) return <h2>Loading...</h2>

  const liked = Boolean(user && blog.likes?.some((like) => String(like) === user.id))

  async function handleLike() {
    if (!user) {
      navigate('/login')
      return
    }

    setActionError('')
    setIsLiking(true)
    try {
      const request = liked
        ? axios.delete(`/blog/${id}/like`, { withCredentials: true })
        : axios.put(`/blog/${id}/like`, {}, { withCredentials: true })
      const { data } = await request
      setBlog((currentBlog) => ({ ...currentBlog, likes: data.likes }))
    } catch (error) {
      console.error('Could not update like:', error)
      setActionError(error.response?.data?.message ?? 'Could not update your like.')
    } finally {
      setIsLiking(false)
    }
  }

  async function handleComment(event) {
    event.preventDefault()
    setActionError('')
    setIsCommenting(true)
    try {
      const { data } = await axios.post(
        `/blog/${id}/comments`,
        { body: commentText },
        { withCredentials: true }
      )
      setBlog((currentBlog) => ({ ...currentBlog, comments: data.comments }))
      setCommentText('')
    } catch (error) {
      console.error('Could not post comment:', error)
      setActionError(error.response?.data?.message ?? 'Could not post your comment.')
    } finally {
      setIsCommenting(false)
    }
  }

  return (
    <div className="blog-details">
      {blog.coverImgURL && (
        <img
          src={resolveImageUrl(blog.coverImgURL)}
          alt={blog.title}
        />
      )}

      <h1>{blog.title}</h1>
      <p>{blog.body}</p>
      <div className="blog-author">
        <img
          src={resolveImageUrl(blog.createdBy?.profileImageURL || '/images/default.png')}
          alt=""
          className="blog-author-image"
        />
        <span>{blog.createdBy?.Fullname || 'Unknown author'}</span>
      </div>
      {user?.id === String(blog.createdBy?._id ?? blog.createdBy) && (
        <button
          type="button"
          className="blog-edit-button"
          onClick={() => navigate(`/blog/${id}/edit`)}
        >
          Edit blog
        </button>
      )}

      <section className="blog-comments" aria-label="Likes and comments">
        <div className="blog-comments-heading">
          <h2>Comments <span>{blog.comments?.length ?? 0}</span></h2>
          <button
            type="button"
            className={`blog-like-button${liked ? ' is-liked' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
            aria-pressed={liked}
            aria-label={liked ? 'Unlike this post' : 'Like this post'}
          >
            <span className="like-heart" aria-hidden="true">
              {liked ? '♥' : '♡'}
            </span>
            <span>{blog.likes?.length ?? 0}</span>
          </button>
        </div>

        {user ? (
          <form className="comment-form" onSubmit={handleComment}>
            <label htmlFor="comment-text">Join the conversation</label>
            <textarea
              id="comment-text"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Share your thoughts..."
              maxLength={2000}
              required
            />
            <button type="submit" disabled={isCommenting || !commentText.trim()}>
              {isCommenting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p>
            <button type="button" className="text-button" onClick={() => navigate('/login')}>
              Sign in
            </button>{' '}
            to like or comment.
          </p>
        )}

        {actionError && <p className="feedback-error" role="alert">{actionError}</p>}

        <div className="comment-list">
          {blog.comments?.map((comment) => (
            <article className="comment-item" key={comment._id}>
              <div className="comment-author">
                <img
                  src={resolveImageUrl(comment.user?.profileImageURL || '/images/default.png')}
                  alt=""
                  className="comment-author-image"
                />
                <strong>{comment.user?.Fullname || 'Unknown user'}</strong>
                {comment.createdAt && (
                  <time dateTime={comment.createdAt}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </time>
                )}
              </div>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default BlogDetails