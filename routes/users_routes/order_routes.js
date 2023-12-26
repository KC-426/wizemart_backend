const express = require("express")
const router = express.Router();
const Order_Controllers = require("../../controllers/Users_Controllers/Order_Controller")

const {usersCheckAuth,Frontend_Validator,} = require("../../middlewares/adminCheckAuth")



router.post('/create/new/order',Frontend_Validator,usersCheckAuth,Order_Controllers.createNewOrder);
router.get("/get/all/orders/",Frontend_Validator,usersCheckAuth,Order_Controllers.getAllOrders);
router.get("/search/in/orders",Frontend_Validator,usersCheckAuth,Order_Controllers.searchInOrders);
router.get("/filter/by/orders",Frontend_Validator,usersCheckAuth,Order_Controllers.filterForOrders);
router.get("/get/order/by/id/:order_id",Frontend_Validator,usersCheckAuth,Order_Controllers.getOrderById);
router.patch("/change/order/status/:order_id",Frontend_Validator,usersCheckAuth,Order_Controllers.updateOrders);
router.patch("/delete/order/by/id",Frontend_Validator,usersCheckAuth,Order_Controllers.deleteOrders);

// Payment Done
router.post("/payment_done", Order_Controllers.paymentDone)
router.post('/make_product_order', Order_Controllers.makePaymentOrder)

module.exports = router