const express = require('express')
const router = express.Router()
const Controller = require('../controllers/controller')
const {authentication} = require('../middlewares/authentication')
const authorization = require('../middlewares/authorization')
const authorizationAdmin = require('../middlewares/auhtorizationAdmin')

router.get('/', (req,res) =>{
    res.send('Welcome!')
})
router.post('/register', Controller.register)
router.post('/login', Controller.login)
router.post('/google-sign-in', Controller.googleLogin)
router.use(authentication)

router.post('/lodgings', Controller.createLodging)
router.get('/lodgings', Controller.showLodging)
router.get('/lodgings/:id', Controller.showOneLodging)
router.delete('/lodgings/:id', authorization, Controller.deleteLodging)
router.put('/lodgings/:id', authorizationAdmin, Controller.editLodging)
router.patch('/lodgings/:id', authorizationAdmin, Controller.statusLodging)
router.get('/types', Controller.showType)
router.post('/types', Controller.createType)
router.delete('/types/:id', Controller.deleteType)
router.get('/histories', Controller.showHistory)



module.exports = router