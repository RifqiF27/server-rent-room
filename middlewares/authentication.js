const { verifyingToken } = require("../helpers/jwt")
const { User, Customer } = require('../models')


const authentication = async (req, res, next) => {
    try {
        const { access_token } = req.headers
        if (!access_token) return res.status(401).json({ message: 'Invalid Token' })

        const decodedToken = verifyingToken(access_token)

        const user = await User.findByPk(decodedToken.id)
        if (!user) return res.status(401).json({ message: 'Invalid Token' })

        req.user = user

        next()
    } catch (err) {
        console.log("🚀 ~ file: authentication.js:20 ~ authentication ~ err:", err)
        if (err.name === 'JsonWebTokenError'){
            res.status(401).json({message: 'Invalid Token'})
        } else {
            res.status(500).json({message: 'Internal server error'})
        }
    }
}
const authenticationCustomer = async (req, res, next) => {
    try {
        const { access_token } = req.headers
        if (!access_token) return res.status(401).json({ message: 'Invalid Token' })

        const decodedToken = verifyingToken(access_token)

        const customer = await Customer.findByPk(decodedToken.id)
        if (!customer) return res.status(401).json({ message: 'Invalid Token' })

        req.customer = customer

        next()
    } catch (err) {
        console.log("🚀 ~ file: authentication.js:20 ~ authentication ~ err:", err)
        if (err.name === 'JsonWebTokenError'){
            res.status(401).json({message: 'Invalid Token'})
        } else {
            res.status(500).json({message: 'Internal server error'})
        }
    }
}

module.exports = {authentication, authenticationCustomer}