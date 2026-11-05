const express = require('express');
const router = express.Router();
const Blog=require('../models/blog.js');
const multer=require('multer');
const path=require('path');
const fs = require('node:fs')
const authenticateToken = require('../middleware/auth.js')

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 })
    return res.json({ blogs })
  } catch (error) {
    return next(error)
  }
})
router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id)

  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' })
  }

  res.json({ blog })
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

    const blog = await Blog.create({
      title: req.body.title,
      body: req.body.body,
      createdBy: userId,
      coverImgURL: req.file
        ? `/uploads/${userId}/${req.file.filename}`
        : undefined,
    })

    return res.status(201).json({ message: 'Blog created', blog })
  }
)

module.exports=router;