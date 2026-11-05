
import React, { useState } from "react";
import "../styles/blog.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);

  const handleImage = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    const form = e.target;
  const formData = new FormData(form); 

  try {
    // Modern Axios shortcut for multipart/form-data
    const response = await axios.post(
      'http://localhost:3003/blog/new-blog',
      formData,
      { withCredentials: true }
    );
    await  alert("Blog created successfully!");
    navigate('/home', { replace: true });
  } catch (error) {
    console.error('Upload failed:', error);
    alert(error.response?.data?.message ?? "Could not create the blog.");
  }
  };

  return (
    <div className="blog-form">
      <h2>Create Blog</h2>

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          placeholder="Enter blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Body</label>
        <textarea
          placeholder="Write your blog..."
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />

        <label>Cover Image</label>
        <input
          type="file"
          name="coverImageURL"
          accept="image/*"
          onChange={handleImage}
        />

        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            width="150"
          />
        )}
        <button type="submit">Create Blog</button>
      </form>
    </div>
  );
}

export default CreateBlog;
