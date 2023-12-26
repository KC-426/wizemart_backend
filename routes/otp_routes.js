const express = require("express")
const router = express.Router()
const Otp_Controllers = require("../controllers/Otp_controller")
const {App_Validator} = require("../middlewares/adminCheckAuth")

router.get("/send/otp/for/app/user/to/number/:phone_number",Otp_Controllers.sendOtpToNumber);
router.post("/v1/verify/adiogent/user/otp",Otp_Controllers.verifyOtpForUser);


module.exports = router