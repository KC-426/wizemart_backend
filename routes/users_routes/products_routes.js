const express = require("express")
const router = express.Router()
const Product_Controllers = require("../../controllers/Users_Controllers/Products_Controller")
const {usersCheckAuth, Frontend_Validator} = require("../../middlewares/adminCheckAuth")


// all products routes 
router.get("/get/all/products/count",Frontend_Validator,usersCheckAuth,Product_Controllers.getProductCount);
// router.get("/all/products",Frontend_Validator,usersCheckAuth,Product_Controllers.getAllProducts);
router.get("/all/products",Frontend_Validator,usersCheckAuth,Product_Controllers.getAllProducts);
router.get("/get/single/product/:product_id",Frontend_Validator,usersCheckAuth,Product_Controllers.getproductById);
router.get("/filter/products",Frontend_Validator,usersCheckAuth,Product_Controllers.filterProducts);
router.get("/search/in/products",Frontend_Validator,usersCheckAuth,Product_Controllers.searchProducts);
router.patch("/edit/product/:product_id",Frontend_Validator,usersCheckAuth,Product_Controllers.editProduct);
router.patch("/remove/product/image/:product_id/:product_image",Frontend_Validator,usersCheckAuth,Product_Controllers.deleteProductImage);
router.patch("/set/products/as/new/arrivals",Frontend_Validator,usersCheckAuth,Product_Controllers.setNewArrivalProducts);
router.patch("/remove/products/as/new/arrivals",Frontend_Validator,usersCheckAuth,Product_Controllers.removeNewArrivalProducts);
router.patch("/set/products/as/trending/products",Frontend_Validator,usersCheckAuth,Product_Controllers.setTrendingProducts);
router.patch("/remove/products/as/trending/products",Frontend_Validator,usersCheckAuth,Product_Controllers.removeTrendingProducts);
router.post("/add/new/product",Frontend_Validator,usersCheckAuth,Product_Controllers.createProducts);
router.patch("/delete/product",Frontend_Validator,usersCheckAuth,Product_Controllers.deleteProducts);


module.exports = router