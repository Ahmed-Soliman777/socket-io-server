const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
    const token = req.headers['token']


    if (!token) {
        return res.status(400).json({ message: 'invalid token' })
    }

    try {

        const payload = jwt.verify(token, process.env.JWT_secret)

        req.user = payload

        return next()

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


module.exports = { authenticate }   