const express = require("express")
const router = express.Router()
const Brands_Controller = require("../../controllers/web_controllers/Brands_Controller");

router.get("/brands/get/all/brands", Brands_Controller.getAllBrands);
router.post("/brands/create/category",Brands_Controller.createCategory);
router.post("/brands/create/maincategory",Brands_Controller.createMainCategory);
router.get("/brands/get/all/category",Brands_Controller.getAllCategory);
router.get("/brands/get/category/for/addproduct",Brands_Controller.getCategoryByMainCategory);
router.patch("/brands/update/all/main/category",Brands_Controller.updateMainCategory);
router.patch("/brands/edit/category/:category_id",Brands_Controller.editCategory);
router.get("/brands/get/category/:category_id",Brands_Controller.getCategorysById);
router.get("/brands/search/in/category",Brands_Controller.searchInCategory);
router.get("/brands/filter/category",Brands_Controller.filterForCategory);
router.get("/brands/get/addproduct/maincategory",Brands_Controller.mainCategoryForProduct);
router.patch("/brands/delete/main/category/image",Brands_Controller.deleteImage);
router.delete("/brands/delete/category/",Brands_Controller.deleteCategory);

module.exports = router;