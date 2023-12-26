const express = require("express")
const router = express.Router()
const Category_Controller = require("../../controllers/web_controllers/Category_Controller");

router.get("/get/all/brands", Category_Controller.getAllBrands);
router.get("/get/all/categories", Category_Controller.getAllBrands);
router.post("/create/category",Category_Controller.createCategory);
router.post("/create/maincategory",Category_Controller.createMainCategory);
router.get("/get/all/category",Category_Controller.getAllCategory);
router.get("/get/category/for/addproduct",Category_Controller.getCategoryByMainCategory);
router.patch("/update/all/main/category",Category_Controller.updateMainCategory);
router.patch("/edit/category/:category_id",Category_Controller.editCategory);
router.get("/get/category/:category_id",Category_Controller.getCategorysById);
router.get("/search/in/category",Category_Controller.searchInCategory);
router.get("/filter/category",Category_Controller.filterForCategory);
router.get("/get/addproduct/maincategory",Category_Controller.mainCategoryForProduct);
router.patch("/delete/main/category/image",Category_Controller.deleteImage);
router.delete("/delete/category/",Category_Controller.deleteCategory);



module.exports = router;