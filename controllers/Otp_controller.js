const msg91 = require('msg91').default;

msg91.initialize({authKey: process.env.MSG_AUTH_KEY});

//========= SEND OTP TO NUMBER ========
const sendOtpToNumber = async(req,res)=>{
    const {phone_number} = req.params;
    try {
        if(!phone_number) return res.status(404).send({status:false,message:'unauthenticated!!'})
        let otp = msg91.getOTP(process.env.MSG_TEMPLATE_ID);
        // Send OTP
        console.log("otp===>",otp)
       const otpSuccess= await otp.send(phone_number);
        // const otpSuccess =  await Utils.sendOtp(phone_number)
        console.log("otpSuccess=>",otpSuccess)
        res.status(200).send({status:true,message:'otp sent!!'})

        
    } catch (error) {
        console.log(error)
        res.status(500).send("Something went wrong")
    }
}

//========= VERIFY OTP FOR USER ========
const verifyOtpForUser = async(req,res)=>{
    // const {phone_number} = req.body;
    console.log("req.body---->",req.body)
    try {
        if(!req.body.phone_number) return res.status(404).send({status:false,message:'unauthenticated!!'})
        if(!req.body.otp) return res.status(404).send({status:false,message:'unauthenticated!!'})

        let otp = msg91.getOTP(process.env.MSG_TEMPLATE_ID);
        // console.log("otyVerify BEFORE==>")
        let result = await otp.verify(req.body.phone_number,parseInt(req.body.otp));
        // console.log("otyVerify AFTER==>",result)
        if(result?.message === 'OTP verified success' ){
            console.log("verified success")
            return  res.status(200).send({status:true,message:'otp verified!!'})
        }
        res.status(203).send({status:false,message:'otp not verified!!'})

        
    } catch (error) {
        console.log(error)
        res.status(203).send({status:false,message:'otp not verified!!'})
    }
}

exports.sendOtpToNumber = sendOtpToNumber;
exports.verifyOtpForUser = verifyOtpForUser;