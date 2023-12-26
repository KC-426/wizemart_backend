const express = require("express")
const router = express.Router();
const Enquiry_Controllers = require("../../controllers/Users_Controllers/Enquiry_Cotroller")

const {usersCheckAuth,Frontend_Validator,} = require("../../middlewares/adminCheckAuth")


router.get("/get/all/order/enquiries",Frontend_Validator,usersCheckAuth,Enquiry_Controllers.getAllEnquires);
router.patch("/delete/enquires",Frontend_Validator,usersCheckAuth,Enquiry_Controllers.deleteEnquiry);

module.exports = router