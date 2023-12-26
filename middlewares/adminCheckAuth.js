const Utils = require("../utils/Utils")

// ========== admin check auth ============
const adminCheckAuth = async(req,res,next)=>{
    const token = req.cookies["jwt"]
    // console.log("req.cookies== 1")
    // console.log("req.cookies== 1",token)
    try{
        if(!token){
            return res.status(401).send("Unauthenticated")
        }
        const verifyToken = await Utils.verifying_Jwt(token,process.env.JWT_TOKEN_SECRET);
        if(!verifyToken){
            return res.status(401).send("Unauthenticated")
        }
        next();
    }
    catch(err){
        console.log(err)
        res.status(401).send("Unauthenticated")
    }
}

// ==========  user check auth ============
const usersCheckAuth = async(req,res,next)=>{
    const token = req.cookies["session_id"]
    console.log(token);
    // console.log("req.cookies== 1")
    // console.log("req.cookies== 1",token)
    try{
        if(!token){
            return res.status(401).send("Unauthenticated")
        }
        const verifyToken = await Utils.verifying_Jwt(token,process.env.JWT_TOKEN_SECRET);
        if(!verifyToken){
            return res.status(401).send("Unauthenticated")
        }
        next();
    }
    catch(err){
        console.log(err)
        res.status(401).send("Unauthenticated")
    }
}

// ============== admin frontend validator ===============
const Frontend_Validator =async (req,res,next)=>{
    console.log("validate_token ==== 1")
    const validate_token = req.headers['authorization']?.split(" ")[1];
    console.log(validate_token)
    if(!validate_token){
        return res.status(401).send({status:false,message:"Unauthenticated."})
    }
    if(validate_token !== process.env.FRONTEND_VALIDATOR){
        return res.status(401).send({status:false,message:"Unauthenticated. "})
    }
    console.log("validate_token ===== 2")
   next()

}


// ============== Client APP validator ===============
const App_Validator =async (req,res,next)=>{
    console.log("validate app _token ==== 1")
    const validate_token = req.headers['authorization']?.split(" ")[1];
    console.log("validate_token-->",validate_token)
    if(!validate_token){
        return res.status(401).send({status:false,message:"Unauthenticated."})
    }
    if(validate_token !== process.env.APP_VALIDATOR){
        return res.status(401).send({status:false,message:"Unauthenticated. "})
    }
    // console.log("validate_token ===== 2")
   next()

}



exports.adminCheckAuth = adminCheckAuth;
exports.usersCheckAuth = usersCheckAuth;
exports.Frontend_Validator = Frontend_Validator;
exports.App_Validator = App_Validator;