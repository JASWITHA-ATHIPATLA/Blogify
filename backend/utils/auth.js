const JWT = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

function generateToken(user) {
    const payload = {
        userId: user._id,
        fullName: user.Fullname,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };
    const token = JWT.sign(payload, secret, { expiresIn: '3d' });
    return token;
}
function validateToken(token) {

    const payload = JWT.verify(token, secret);
    return payload;
}

module.exports={
    generateToken,
    validateToken
}