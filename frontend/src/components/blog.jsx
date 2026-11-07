
import { useEffect, useState } from "react";
import "../styles/blog.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [coverSource, setCoverSource] = useState("device");
  const [companyQuery, setCompanyQuery] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyDomain, setSelectedCompanyDomain] = useState("");
  const [isSearchingCompanies, setIsSearchingCompanies] = useState(false);
  const [hasSearchedCompanies, setHasSearchedCompanies] = useState(false);
  const [companySearchError, setCompanySearchError] = useState("");

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  const handleImage = (e) => {
    setImage(e.target.files[0]);
  };

  const searchCompanies = async () => {
    const query = companyQuery.trim();
    if (query.length < 2) {
      setCompanySearchError("Enter at least 2 characters to search.");
      return;
    }

    setCompanySearchError("");
    setIsSearchingCompanies(true);
    try {
      const { data } = await axios.get('http://localhost:3003/blog/companies/search', {
        params: { q: query },
        withCredentials: true,
      });
      setCompanies(data.companies);
      setSelectedCompanyDomain("");
      setHasSearchedCompanies(true);
    } catch (error) {
      console.error('Company search failed:', error);
      setCompanySearchError(error.response?.data?.message ?? 'Could not search companies.');
      setCompanies([]);
      setHasSearchedCompanies(false);
    } finally {
      setIsSearchingCompanies(false);
    }
  };

  const selectedCompany = companies.find(
    (company) => company.domain === selectedCompanyDomain
  );

  const handleSubmit =async (e) => {
    e.preventDefault();
    const form = e.target;
  const formData = new FormData(form); 

  try {
    // Modern Axios shortcut for multipart/form-data
    await axios.post(
      'http://localhost:3003/blog/new-blog',
      formData,
      { withCredentials: true }
    );
    alert("Blog created successfully!");
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

        <label>Cover image</label>
        <div className="cover-source-options" role="group" aria-label="Choose cover image source">
          <button
            type="button"
            className={coverSource === "device" ? "is-selected" : ""}
            onClick={() => {
              setCoverSource("device");
              setSelectedCompanyDomain("");
            }}
          >
            Upload from device
          </button>
          <button
            type="button"
            className={coverSource === "company" ? "is-selected" : ""}
            onClick={() => {
              setImage(null);
              setCoverSource("company");
            }}
          >
            Choose a company
          </button>
        </div>

        {coverSource === "device" ? (
          <>
            <label htmlFor="coverImageURL">Select an image</label>
            <input
              id="coverImageURL"
              type="file"
              name="coverImageURL"
              accept="image/*"
              onChange={handleImage}
            />
            {image && (
              <img
                src={imagePreview}
                alt="Cover image preview"
                className="cover-image-preview"
              />
            )}
          </>
        ) : (
          <>
            <label htmlFor="companySearch">Search for a company</label>
            <div className="company-search">
              <input
                id="companySearch"
                type="search"
                value={companyQuery}
                disabled={isSearchingCompanies}
                onChange={(event) => {
                  setCompanyQuery(event.target.value);
                  setSelectedCompanyDomain("");
                  setCompanies([]);
                  setHasSearchedCompanies(false);
                  setCompanySearchError("");
                }}
                placeholder="Type a company name"
              />
              <button
                type="button"
                onClick={searchCompanies}
                disabled={isSearchingCompanies}
              >
                {isSearchingCompanies ? "Searching..." : "Search"}
              </button>
            </div>
            {companySearchError && <p role="alert">{companySearchError}</p>}
            {companies.length > 0 && (
              <>
                <label htmlFor="companyDomain">Choose a company</label>
                <select
                  id="companyDomain"
                  name="companyDomain"
                  value={selectedCompanyDomain}
                  onChange={(event) => setSelectedCompanyDomain(event.target.value)}
                  required
                >
                  <option value="">Choose a company</option>
                  {companies.map((company) => (
                    <option key={company.domain} value={company.domain}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </>
            )}
            {hasSearchedCompanies && companies.length === 0 && (
                <p>No companies found. Try a different name.</p>
              )}
            {selectedCompany && (
              <img
                src={selectedCompany.logoUrl}
                alt={`${selectedCompany.name} logo preview`}
                className="cover-image-preview"
              />
            )}
          </>
        )}
        <button type="submit">Create Blog</button>
      </form>
    </div>
  );
}

export default CreateBlog;
