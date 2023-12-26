const crypto = require("crypto");

const verifyRazerPay = async (order_id, payment_id, razorpay_signature) => {
    
  const body = order_id + "|" + payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(body)
    .digest("hex");

    if (expectedSignature == razorpay_signature) {
        return true;
      } else {
        return false;
      }
};

module.exports = verifyRazerPay;
