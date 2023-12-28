const crypto = require("crypto");
const Details_Schema = require('../modals/UserModals/Details')

const verifyRazerPay = async (order_id, payment_id, razorpay_signature) => {

  const findRazorpayDetail = await Details_Schema.findOne().select(
    "razorpay_is_installed razorpay_key_id razorpay_key_secret"
  );
    
  const body = order_id + "|" + payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", findRazorpayDetail.razorpay_key_secret)
    .update(body)
    .digest("hex");

    if (expectedSignature == razorpay_signature) {
        return true;
      } else {
        return false;
      }
};

module.exports = verifyRazerPay;
