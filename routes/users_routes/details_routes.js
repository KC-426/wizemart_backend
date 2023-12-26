const express = require("express")
const router = express.Router()
const Details_Controllers = require("../../controllers/Users_Controllers/Details_Controller")

const {usersCheckAuth,Frontend_Validator,} = require("../../middlewares/adminCheckAuth")



// admin user routes
router.get("/admin/get/alluser",Details_Controllers.getAllUser);
router.get("/admin/get/user",Frontend_Validator,Details_Controllers.getUserById);
router.get("/admin/get/dashboard/details/for/admin/user",Frontend_Validator,usersCheckAuth,Details_Controllers.getdashboardDetails);
router.get("/admin/get/dashboard/new/order/count/sidebar/admin/user",Frontend_Validator,usersCheckAuth,Details_Controllers.getNewOrderCountSideBar);
router.get("/admin/get/dashboard/active/user/graph/details/for/admin/user",Frontend_Validator,usersCheckAuth,Details_Controllers.getActiveUsersGraphDetail);
router.get("/admin/get/dashboard/total/sales/over/time/graph/details/for/admin/user",Frontend_Validator,usersCheckAuth,Details_Controllers.getTotalSalesGraphDetails);
router.get("/admin/get/users/about/phone/details/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getAboutPhoneDetails);
router.get("/admin/get/users/social/media/links/details/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getSocialMediaDetails);
router.get("/admin/get/users/invoice/details/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getInvoiceDetails);
router.get("/admin/get/users/app/signing/details/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getAppSigningDetails);
router.get("/admin/get/deliverycharges/and/paymentsdetails/by/id/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getAdminDeliveryAndPaymentDetails)
router.get("/admin/get/all/custom/sizes/and/weight/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getAllCustomSizeAndWeight)
router.post("/admin/create/newuser",Details_Controllers.createUser);
router.post("/admin/login",Frontend_Validator,Details_Controllers.loginUser);
router.post("/admin/add/custom/size/for/product/upload/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.addCustomSize);
router.post("/admin/add/custom/weights/for/product/upload/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.addCustomWeight);
router.delete("/admin/logout",Details_Controllers.logoutUser);
router.patch("/admin/edit/:admin_id",Details_Controllers.editAdminByID);
router.patch("/admin/edit/deliverycharges/and/paymentsdetails/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.editAdminDeliveryAndPaymentDetails);
router.patch("/admin/edit/invoice/details/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.editAdminInvoiceDetails);
router.patch("/admin/edit/about/phone/details/for/app/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.editAdminAboutPhoneDetails);
router.patch("/admin/edit/social/media/links/details/for/app/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.editAdminSocialMediaDetails);
router.patch("/admin/edit/app/signing/details/for/app/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.editAdminAppSigningDetails);

//========== SEND NOTIFICATION TO APP USER ======
router.post("/admin/send/push/notification/to/app/user/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.sendPushNotification);
//========== SEND NOTIFICATION TO APP USER ======

//========= ADIOGENT PAY ================
router.get("/admin/get/adiogent/pay/detail/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getAdiogentPayDetail)
router.post("/admin/active/and/deactive/adiogent/pay/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.activateAndDeactiveAdiogentPay)
router.patch("/admin/add/payments/adiogent/pay/detail/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.updateAdiogentpayDetail)
//========= ADIOGENT PAY ================

// plugin routes
router.get("/admin/get/all/plugins/details/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getAllPluginsDetails)
// shiprocket 
router.get("/admin/get/plugin/shiprocket/detail/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getShiprocketDetail)
router.post("/admin/plugin/shiprocket/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.activateAndDeactiveShiprocket)
router.patch("/admin/add/plugin/shiprocket/details/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.updateShiprocketDetail)
// razorpay 
router.get("/admin/get/plugin/razorpay/detail/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.getRazorpayDetail)
router.post("/admin/plugin/razorpay/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.activateAndDeactiveRazorpay)
router.patch("/admin/add/plugin/razorpay/details/:app_id",Frontend_Validator,usersCheckAuth,Details_Controllers.updateRazorpayDetail)


//get details about the app

router.get('/admin/get/about/app', Details_Controllers.getAboutApp)
// plugin routes
module.exports = router