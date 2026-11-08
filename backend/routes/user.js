const { User, verifyPassword } = require('../models/user.js');
const express = require('express');
const { generateToken } = require('../utils/auth.js');
const authenticateToken = require('../middleware/auth.js');

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';
const authCookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
}

router.get('/me', authenticateToken, (req, res) => {
    return res.status(200).json({
        user: {
            id: req.auth.userId,
            fullName: req.auth.fullName,
            email: req.auth.email,
            profileImageURL: req.auth.profileImageURL,
            role: req.auth.role,
        },
    })
})

router.post('/logout', (req, res) => {
    res.clearCookie('token', authCookieOptions)
    return res.status(200).json({ message: 'Logged out successfully' })
})

router.post('/signup', async (req, res, next) => {
    const { fullName, email, password } = req.body;
    const user = new User({
        Fullname: fullName,
        email,
        password,
    })

    try {
        await user.save()
        return res.status(201).json({ message: 'Account created' })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email is already registered' })
        }

        return next(error)
    }
})
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })

    if (!user || !user.salt || !user.password || !verifyPassword(password, user.salt, user.password)) {
        return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user)
    res.cookie('token', token, {
        ...authCookieOptions,
        maxAge: 3 * 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({ message: 'Login successful' })
})

module.exports = router;
