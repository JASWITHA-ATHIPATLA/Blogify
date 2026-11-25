
const express = require('express');
const router = express.Router();
const Blog = require('../models/blog.js');
const multer = require('multer');
const path = require('path');
const fs = require('node:fs');
const authenticateToken = require('../middleware/auth.js');

// Company domain validation
const companyDomainPattern =
  /^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,63}$/i;

// Company logo URL
const companyLogoUrl = (domain) =>
  `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
    `https://${domain}`
  )}&sz=128`;

// Groq model
const groqModel = 'openai/gpt-oss-120b';


// ==========================================
// SEARCH COMPANIES
// ==========================================

router.get('/companies/search', async (req, res, next) => {
  const query =
    typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (query.length < 2) {
    return res.status(400).json({
      message: 'Enter at least 2 characters to search companies',
    });
  }

  if (query.length > 100) {
    return res.status(400).json({
      message: 'Company search is limited to 100 characters',
    });
  }

  try {
    const response = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return res.status(502).json({
        message: 'Company search is temporarily unavailable',
      });
    }

    const results = await response.json();

    const companies = Array.isArray(results)
      ? results
          .filter(
            (company) =>
              typeof company.name === 'string' &&
              typeof company.domain === 'string' &&
              companyDomainPattern.test(company.domain)
          )
          .slice(0, 10)
          .map(({ name, domain }) => ({
            name,
            domain,
            logoUrl: companyLogoUrl(domain),
          }))
      : [];

    return res.json({ companies });
  } catch (error) {
    return next(error);
  }
});


// ==========================================
// GENERATE BLOG DRAFT USING GROQ AI
// ==========================================

router.post('/generate-draft', authenticateToken, async (req, res, next) => {
  const prompt =
    typeof req.body?.prompt === 'string'
      ? req.body.prompt.trim()
      : '';

  if (!prompt || prompt.length > 1000) {
    return res.status(400).json({
      message: 'Enter a blog idea of up to 1000 characters',
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      message: 'AI drafting is not configured on the server',
    });
  }

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            {
              role: 'system',
              content: `Edit the user's notes into a clear, concise blog draft.

Return ONLY valid JSON in this format:
{
  "title": "Blog title",
  "body": "Markdown-formatted blog content"
}

Keep the user's meaning and all specific facts, names, dates, roles, and numbers. Correct grammar, spelling, capitalization, and punctuation without changing the meaning. Do not invent facts, examples, opinions, results, or experiences.

Use plain, simple English. Avoid idioms, jargon, and overly formal or fancy words. Organize only the provided information in Markdown with concise, relevant ## headings and bullets where useful. Preserve the user's details and ordering.

Do not add explanations, generic introductions, conclusions, or filler. Keep the draft short, clear, and limited to the user's input. Keep the title simple and relevant. Do not wrap the JSON in Markdown code fences.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],

          response_format: {
            type: 'json_object',
          },

          max_completion_tokens: 2048,
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        `Groq draft request failed with status ${response.status}:`,
        errorText
      );

      return res.status(502).json({
        message: 'Groq could not generate a draft. Please try again.',
      });
    }

    const result = await response.json();

    const generatedText =
      result.choices?.[0]?.message?.content;

    if (!generatedText) {
      return res.status(502).json({
        message: 'Groq returned an empty draft. Please try again.',
      });
    }

    let draft;

    try {
      draft = JSON.parse(generatedText);
    } catch (error) {
      console.error('Groq returned an invalid draft response:', error);

      return res.status(502).json({
        message: 'Groq returned an invalid draft. Please try again.',
      });
    }

    if (
      typeof draft.title !== 'string' ||
      !draft.title.trim() ||
      typeof draft.body !== 'string' ||
      !draft.body.trim()
    ) {
      return res.status(502).json({
        message: 'Groq returned an incomplete draft. Please try again.',
      });
    }

    return res.json({
      draft: {
        title: draft.title.trim(),
        body: draft.body.trim(),
      },
    });

  } catch (error) {
    return next(error);
  }
});


// ==========================================
// GET ALL BLOGS
// ==========================================

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate('createdBy', 'Fullname profileImageURL')
      .sort({ createdAt: -1 });

    return res.json({ blogs });
  } catch (error) {
    return next(error);
  }
});


// ==========================================
// GET BLOG BY ID
// ==========================================

router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('createdBy', 'Fullname profileImageURL')
      .populate('comments.user', 'Fullname profileImageURL');

    if (!blog) {
      return res.status(404).json({
        message: 'Blog not found',
      });
    }

    return res.json({ blog });
  } catch (error) {
    return res.status(400).json({
      message: 'Invalid blog ID',
    });
  }
});


// ==========================================
// DELETE BLOG
// ==========================================

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: 'Blog not found',
      });
    }

    if (String(blog.createdBy) !== String(req.auth.userId)) {
      return res.status(403).json({
        message: 'You can only delete your own blogs',
      });
    }

    await blog.deleteOne();

    return res.json({
      message: 'Blog deleted',
    });
  } catch (error) {
    return next(error);
  }
});


// ==========================================
// LIKE BLOG
// ==========================================

router.put('/:id/like', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.auth.userId } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        message: 'Blog not found',
      });
    }

    return res.json({
      likes: blog.likes,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Could not like blog',
    });
  }
});


// ==========================================
// UNLIKE BLOG
// ==========================================

router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.auth.userId } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        message: 'Blog not found',
      });
    }

    return res.json({
      likes: blog.likes,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Could not unlike blog',
    });
  }
});


// ==========================================
// ADD COMMENT
// ==========================================

router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { body } = req.body;

    if (
      typeof body !== 'string' ||
      !body.trim() ||
      body.trim().length > 2000
    ) {
      return res.status(400).json({
        message: 'Comment must be between 1 and 2000 characters',
      });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.auth.userId,
            body: body.trim(),
          },
        },
      },
      { new: true }
    ).populate('comments.user', 'Fullname profileImageURL');

    if (!blog) {
      return res.status(404).json({
        message: 'Blog not found',
      });
    }

    return res.status(201).json({
      comments: blog.comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Could not add comment',
    });
  }
});


// ==========================================
// IMAGE UPLOAD CONFIGURATION
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.auth.userId;
    const userDir = path.join(
      __dirname,
      '../uploads',
      String(userId)
    );

    fs.mkdir(userDir, { recursive: true }, (error) =>
      cb(error, userDir)
    );
  },

  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });


// ==========================================
// CREATE NEW BLOG
// ==========================================

router.post(
  '/new-blog',
  authenticateToken,
  upload.single('coverImageURL'),
  async (req, res) => {
    try {
      const userId = req.auth.userId;
      const companyDomain = req.body.companyDomain;

      const validCompanyDomain =
        typeof companyDomain === 'string' &&
        companyDomainPattern.test(companyDomain);

      if (companyDomain && !validCompanyDomain) {
        return res.status(400).json({
          message: 'Please choose a valid company',
        });
      }

      const blog = await Blog.create({
        title: req.body.title,
        body: req.body.body,
        createdBy: userId,

        coverImgURL: req.file
          ? `/uploads/${userId}/${req.file.filename}`
          : validCompanyDomain
            ? companyLogoUrl(companyDomain)
            : undefined,
      });

      return res.status(201).json({
        message: 'Blog created',
        blog,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Could not create blog',
      });
    }
  }
);


// ==========================================
// UPDATE BLOG
// ==========================================

router.put(
  '/:id',
  authenticateToken,
  upload.single('coverImageURL'),
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);

      if (!blog) {
        return res.status(404).json({
          message: 'Blog not found',
        });
      }

      if (String(blog.createdBy) !== String(req.auth.userId)) {
        return res.status(403).json({
          message: 'You can only update your own blogs',
        });
      }

      const { title, body } = req.body;

      if (
        typeof title !== 'string' ||
        !title.trim() ||
        typeof body !== 'string' ||
        !body.trim()
      ) {
        return res.status(400).json({
          message: 'Title and body are required',
        });
      }

      blog.title = title.trim();
      blog.body = body;

      if (req.file) {
        blog.coverImgURL =
          `/uploads/${req.auth.userId}/${req.file.filename}`;
      }

      await blog.save();

      return res.json({
        message: 'Blog updated',
        blog,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Could not update blog',
      });
    }
  }
);


module.exports = router;
