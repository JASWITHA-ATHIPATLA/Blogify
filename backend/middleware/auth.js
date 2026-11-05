const { validateToken } = require('../utils/auth.js')

function authenticateToken(req, res, next) {
    const tokenCookie = req.cookies?.token

    if (!tokenCookie) {
        return res.status(401).json({ message: 'Authentication required' })
    }
    try {
        req.auth = validateToken(tokenCookie)
        return next()
    } catch (error) {
        if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
            return res.status(401).json({ message: 'Invalid or expired token' })
        }

        return next(error)
    }
}

module.exports = authenticateToken
