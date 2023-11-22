
const authorizationAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') throw {name: "Forbidden"}
       next()

    } catch (err) {
        console.log("🚀 ~ file: authorizationAdmin.js:17 ~ authorizationAdmin ~ err:", err)
        next(err)
    }
}
module.exports = authorizationAdmin