const express = require("express")
const router = express.Router();
const Banner_Controller = require("../../controllers/Users_Controllers/Banners_Controller");
const {usersCheckAuth,Frontend_Validator,} = require("../../middlewares/adminCheckAuth")


router.get("/get/all/banners",Frontend_Validator,usersCheckAuth,Banner_Controller.getAllbanners);
router.post('/add/new/banner',Frontend_Validator,usersCheckAuth,Banner_Controller.addNewBanner);
router.patch("/change/banner/by/id/:banner_id",Frontend_Validator,usersCheckAuth,Banner_Controller.changeBanner);
router.patch("/link/banner/to/category/by/id/:banner_id",Frontend_Validator,usersCheckAuth,Banner_Controller.updateBannerLinkCategory);
router.patch("/delete/banner/by/id/:banner_id",Frontend_Validator,usersCheckAuth,Banner_Controller.deleteBanner);

module.exports = router