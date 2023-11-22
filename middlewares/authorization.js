const { Lodging } = require('../models')

const authorization = async (req, res, next) => {
    try {
        // console.log(req.user);
        const lodging = await Lodging.findOne({ where: { id: req.params.id } })
        // console.log(lodging);
        if(!lodging) throw { name: 'NotFound'
                // return res.status(404).json({message: 'lodging not found'})
            } 
        if (req.user.role !== 'Admin') {
            if (lodging.authorId !== req.user.id) throw {name: "Forbidden"}
        }
       next()

    } catch (err) {
        console.log("🚀 ~ file: authorization.js:17 ~ authorization ~ err:", err)
        next(err)
    }
}
module.exports = authorization