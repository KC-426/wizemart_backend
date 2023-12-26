const express = require("express")
const router = express.Router()
const Category_Controller = require("../../controllers/Users_Controllers/Category_Controller");
const {usersCheckAuth,Frontend_Validator,} = require("../../middlewares/adminCheckAuth")



router.post("/create/category",Frontend_Validator,usersCheckAuth,Category_Controller.createCategory);
router.post("/create/maincategory",Frontend_Validator,usersCheckAuth,Category_Controller.createMainCategory);
router.get("/get/all/category",Frontend_Validator,usersCheckAuth,Category_Controller.getAllCategory);
router.get("/get/category/for/addproduct",Frontend_Validator,usersCheckAuth,Category_Controller.getCategoryByMainCategory);
router.patch("/update/all/main/category",Frontend_Validator,usersCheckAuth,Category_Controller.updateMainCategory);
router.patch("/edit/category/:category_id",Frontend_Validator,usersCheckAuth,Category_Controller.editCategory);
router.get("/get/category/:category_id",Frontend_Validator,usersCheckAuth,Category_Controller.getCategorysById);
router.get("/search/in/category",Frontend_Validator,usersCheckAuth,Category_Controller.searchInCategory);
router.get("/filter/category",Frontend_Validator,usersCheckAuth,Category_Controller.filterForCategory);
router.get("/get/addproduct/maincategory",Frontend_Validator,usersCheckAuth,Category_Controller.mainCategoryForProduct);
router.patch("/delete/main/category/image",Frontend_Validator,usersCheckAuth,Category_Controller.deleteImage);
router.patch("/delete/category/",Frontend_Validator,usersCheckAuth,Category_Controller.deleteCategory);



module.exports = router;