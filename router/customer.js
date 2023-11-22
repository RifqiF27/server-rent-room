const express = require("express");
const router = express.Router();
const Controller = require("../controllers/customerController");
const { authenticationCustomer } = require("../middlewares/authentication");

router.post("/register", Controller.register);
router.post("/login", Controller.login);
// router.post("/google-sign-in", Controller.googleLogin);
router.get("/lodgings", Controller.showLodgingPagination);
router.get("/lodgings/:id", Controller.detailLodgings);
router.use(authenticationCustomer)
router.get("/bookmarks", Controller.showBookmark);
router.post("/bookmarks/:id", Controller.postBookmark);

module.exports = router;
