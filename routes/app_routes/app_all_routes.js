const express = require("express")
const router = express.Router();
const App_All_Controllers = require('../../controllers/app_controllers/app_all_controller')
// const User_Controller = require("../../controllers/User_Controller");
const {App_Validator} = require('../../middlewares/adminCheckAuth')


router.get("/app/get/app/id/for/data/connection/:app_id",App_Validator,App_All_Controllers.checkWhosAppIs)//done
// router.get("/send/otp/for/app/user/to/number/:phone_number",App_Validator,User_Controller.sendOtpToNumber);
router.get("/get/all/brands",App_Validator,App_All_Controllers.showAllBrands);//not in use
router.get("/get/all/categories",App_Validator,App_All_Controllers.showAllCategories); //done
router.get("/get/home/screen/brands",App_Validator,App_All_Controllers.brandsForHomeScreen);//not in use
router.get("/get/sub/category/and/related/products",App_Validator,App_All_Controllers.brandsSubCategoryAndProducts); //done
router.get("/get/product/by/id/:product_id",App_Validator,App_All_Controllers.getProductById);//done
router.get("/get/all/brands/suggestion/for/search",App_Validator,App_All_Controllers.getAllBrands);//done
router.get("/app/get/new/arrivals/products/for/homescreen",App_Validator,App_All_Controllers.getNewArrivalProductsForHome)//done
router.get("/app/get/trending/products/for/homescreen",App_Validator,App_All_Controllers.getTrendingProductsForHome)//done
router.get("/app/get/all/home/screen/banner",App_Validator,App_All_Controllers.getAllHomeScreenbanner);//done
router.get("/app/search/for/products",App_Validator,App_All_Controllers.searchProducts);//done
router.get("/app/check/user/exists/:phone_number",App_Validator,App_All_Controllers.checkExistingUser);//done
router.get("/app/login/user/:phone_number",App_Validator,App_All_Controllers.loginUser);//done
router.get("/app/get/all/user/orders/:customer_id",App_Validator,App_All_Controllers.getAllOrdersByUserId);//done
router.get("/app/get/user/by/userid/:user_id",App_Validator,App_All_Controllers.getUserById);//done
router.get("/app/get/user/checkout/detail/by/userid/:user_id",App_Validator,App_All_Controllers.getUserCheckoutDetailById);//done
router.get("/app/get/products/new/arrivals",App_Validator,App_All_Controllers.getAllNewArrivalProducts);//done
router.get("/app/get/all/trending/products",App_Validator,App_All_Controllers.getAllTrendingProductsForHome);//done
router.get("/app/get/all/products/for/home/screen",App_Validator,App_All_Controllers.getAllProductsForHomeScreen);//done
router.get("/app/get/category/for/new/arrivals/:brand_name",App_Validator,App_All_Controllers.getBrandCategory);//not in use
router.get("/app/get/products/tags/for/filter",App_Validator,App_All_Controllers.filterForProducts)//done
router.get("/app/get/admin/details",App_Validator,App_All_Controllers.getAdminDetailsForApp)//done
router.get("/app/get/admin/privacy_policy/aboutus/term_and_condition",App_Validator,App_All_Controllers.getAdminAboutPrivacyTermAndCondition)//done
router.post("/app/create/user",App_Validator,App_All_Controllers.createUser);//done
router.post("/app/cart/checkout/products/for/cash/on/delivery",App_Validator,App_All_Controllers.cartCheckoutCod);//done
router.post("/app/cart/checkout/with/online/upi/payment",App_Validator,App_All_Controllers.createOrderWithAdiogentPay);//done
router.post("/app/send/enquiry/for/order",App_Validator,App_All_Controllers.sendMessageEnquiry);//done
router.post("/app/calulate/price/for/razorpay/payment",App_Validator,App_All_Controllers.calculatePrice);//done
router.post("/app/verify/payment/and/create/order/razorpay",App_Validator,App_All_Controllers.verifyAndCreateOrder);//done
router.patch("/app/cancel/order/by/id/:order_id",App_Validator,App_All_Controllers.cancelOrderById);//done
router.patch("/app/edit/user/profile/:user_id",App_Validator,App_All_Controllers.editUserByID);//done
router.patch("/app/edit/user/shipping/address/:user_id",App_Validator,App_All_Controllers.editUserCheckoutDetailByID);


module.exports = router;