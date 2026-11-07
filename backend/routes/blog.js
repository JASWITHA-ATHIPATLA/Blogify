const express = require('express');
const router = express.Router();
const Blog=require('../models/blog.js');
const multer=require('multer');
const path=require('path');
const fs = require('node:fs')
const authenticateToken = require('../middleware/auth.js')
const companyDomainPattern = /^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,63}$/i

router.get('/companies/search', async (req, res, next) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''

  if (query.length < 2) {
    return res.status(400).json({ message: 'Enter at least 2 characters to search companies' })
  }

  if (query.length > 100) {
    return res.status(400).json({ message: 'Company search is limited to 100 characters' })
  }

  try {
    const response = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`
    )

    if (!response.ok) {
      return res.status(502).json({ message: 'Company search is temporarily unavailable' })
    }

    const results = await response.json()
    const companies = Array.isArray(results)
      ? results
          .filter((company) =>
            typeof company.name === 'string' && companyDomainPattern.test(company.domain)
          )
          .slice(0, 10)
          .map(({ name, domain }) => ({
            name,
            domain,
            logoUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
          }))
      : []

    return res.json({ companies })
  } catch (error) {
    return next(error)
  }
})

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate('createdBy', 'Fullname profileImageURL')
      .sort({ createdAt: -1 })
    return res.json({ blogs })
  } catch (error) {
    return next(error)
  }
})
router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate('createdBy', 'Fullname profileImageURL')
    .populate('comments.user', 'Fullname profileImageURL')

  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' })
  }

  res.json({ blog })
})

router.put('/:id/like', authenticateToken, async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.auth.userId } },
    { new: true }
  )

  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' })
  }

  return res.json({ likes: blog.likes })
})

router.delete('/:id/like', authenticateToken, async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.auth.userId } },
    { new: true }
  )

  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' })
  }

  return res.json({ likes: blog.likes })
})

router.post('/:id/comments', authenticateToken, async (req, res) => {
  const { body } = req.body
  if (typeof body !== 'string' || !body.trim() || body.trim().length > 2000) {
    return res.status(400).json({ message: 'Comment must be between 1 and 2000 characters' })
  }

  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { user: req.auth.userId, body: body.trim() } } },
    { new: true }
  ).populate('comments.user', 'Fullname profileImageURL')

  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' })
  }

  return res.status(201).json({ comments: blog.comments })
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  const userId = req.auth.userId
  const userDir = path.join(__dirname, '../uploads', String(userId))
  fs.mkdir(userDir, { recursive: true }, (error) => cb(error, userDir))
},
  filename: function (req, file, cb) {
   const fileName=`${Date.now()}-${file.originalname}`
   cb(null,fileName);
  },
});
const upload = multer({ storage: storage });

router.post(
  '/new-blog',
  authenticateToken,
  upload.single('coverImageURL'),
  async (req, res) => {
    const userId = req.auth.userId
    const companyDomain = req.body.companyDomain
    const validCompanyDomain = typeof companyDomain === 'string' &&
      companyDomainPattern.test(companyDomain)

    if (companyDomain && !validCompanyDomain) {
      return res.status(400).json({ message: 'Please choose a valid company' })
    }

    const blog = await Blog.create({
      title: req.body.title,
      body: req.body.body,
      createdBy: userId,
      coverImgURL: req.file
        ? `/uploads/${userId}/${req.file.filename}`
        : validCompanyDomain
          ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(companyDomain)}&sz=128`
          : undefined,
    })

    return res.status(201).json({ message: 'Blog created', blog })
  }
)

router.put(
  '/:id',
  authenticateToken,
  upload.single('coverImageURL'),
  async (req, res) => {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    if (String(blog.createdBy) !== String(req.auth.userId)) {
      return res.status(403).json({ message: 'You can only update your own blogs' })
    }

    const { title, body } = req.body
    if (typeof title !== 'string' || !title.trim() ||
        typeof body !== 'string' || !body.trim()) {
      return res.status(400).json({ message: 'Title and body are required' })
    }

    blog.title = title.trim()
    blog.body = body
    if (req.file) {
      blog.coverImgURL = `/uploads/${req.auth.userId}/${req.file.filename}`
    }

    await blog.save()
    return res.json({ message: 'Blog updated', blog })
  }
)

module.exports=router;