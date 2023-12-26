const Customers_Schema = require("../../modals/UserModals/Customers")
const Utils = require("../../utils/Utils");
const { v4: uuidv4 } = require('uuid');



// creating new user 
const createUser = async(req,res)=>{
    const {firstname,gst_number,pincode,state,country,username,lastname,profile,phone_number,address,location,email,password,user_type} = req.body;
    try{
        const findUserPhone = await Customers_Schema.findOne({phone_number:phone_number});
        if(findUserPhone){
            return res.send("User Already Exists !!");
        }
        const findUser = await Customers_Schema.findOne({email:email})
        if(findUser){
            return res.send("User Already Exists !!")
        }
        // creating user id
        // const getUserCount = await Customers_Schema.find({}).count();
        // const getUserId = "user00"+(getUserCount+1);
        const getUserId = uuidv4();
        console.log(getUserId);
        const curDate = new Date()
        let userJoiningDate = new Date(curDate).toJSON()?.slice(0, 10);
    // const currentDate = new Date().toUTCString()
        // const hashedPassword = await Utils.Hashing_Password(password)
        const create = new Customers_Schema({
            user_id:getUserId,
            // firstname:firstname?.toLowerCase(),
            // lastname:lastname?.toLowerCase(),
            username:username?.toLowerCase(),
            // profile:profile,
            phone_number:phone_number,
            email:email,
            joining_date:userJoiningDate,
            pincode:pincode,
            gst_number:gst_number,
            state:state?.toLowerCase(),
            country:country?.toLowerCase(),
            // password:hashedPassword,
            address:address,
            // user_type:user_type?.toLowerCase()
        }) 
        const result = await create.save();
        res.status(200).send({result:result,message:"created user successfully !!"})

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong")
    }
}


// Login user with email or phone number
const loginUser = async(req,res)=>{
    const {email,phone_number,password} = req.body;
    try{
        let findUserPhone;
       const findUserEmail = await Customers_Schema.findOne({email:email})
       if(!findUserEmail){
         findUserPhone = await Customers_Schema.findOne({phone_number:phone_number})
        if(!findUserPhone){
            return res.send("Invalid Username or password !!")
           }
       }
      
       let isValidPassword=false;
       if(findUserEmail){
        try{
            isValidPassword = await Utils.compare_Password(password,findUserEmail.password)
        }catch(err){
            console.log(err)
            res.send("Something went wrong !!")
        }
        if(!isValidPassword){
            return res.send("Invalid Username or password !!")
        }
        if(isValidPassword){
            const token = await Utils.create_Jwt(
                {id:findUserEmail._id,user_type:findUserEmail.user_type},
                process.env.JWT_TOKEN_SECRET
                )
            res.cookie("jwt",token,
            {
                httpOnly:true,
                maxAge: 24 * 60 * 60 * 1000, //5 hrs
            }
            )
            return res.status(200).send("Logged in Success !!")
        }
       }
       if(findUserPhone){
        try{
            isValidPassword = await Utils.compare_Password(password,findUserPhone.password)
        }catch(err){
            console.log(err)
            res.send("Something went wrong !!")
        }
        if(!isValidPassword){
            return res.send("Invalid Username or password !!")
        }
        if(isValidPassword){
            const token = await Utils.create_Jwt(
                {id:findUserPhone._id,user_type:findUserPhone.user_type},
                process.env.JWT_TOKEN_SECRET
                )
            res.cookie("jwt",token,
            {
                httpOnly:true,
                maxAge: 24 * 60 * 60 * 1000, //5 hrs
            }
            )
            return res.status(200).send("Logged in Success !!")
        }
       }
    }catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")

    }
}

// logout user
const logoutUser = async(req,res)=>{
    res.cookie("jwt","",{maxAge:0})
    res.status(200).send("Logout Success !!")
}


// GETTING ALL USERS / FILTER FOR USER / SEARCH IN USER
const getAllUser = async(req,res)=>{
    const {by_status,date_from,date_to,recentDays} = req.query
    const searchValue = req.query.search
    const searchRegex = Utils.createRegex(searchValue);
    const limit  = req.query.limit  || 25; 
    const page  = req.query.page ; 
    let result;
    let getAllUserCount;
    try{
//  =========== search for user ==========
        if(searchValue){
            result = await Customers_Schema.find({username:{$regex:searchRegex}})
            .sort({createdAt:-1})
            .limit(limit)
            .skip((page - 1) * limit);
            getAllUserCount = await Customers_Schema.find({username:{$regex:searchRegex}}).count();
            if(!result.length > 0){
                result = await Customers_Schema.find({email:{$regex:searchRegex}})
                .sort({createdAt:-1})
                .limit(limit)
                .skip((page - 1) * limit);
                getAllUserCount = await Customers_Schema.find({email:{$regex:searchRegex}}).count();
            }

        const numberField = parseInt(searchValue)
        // console.log(numberField)
        if (numberField) {
                console.log("numberField" ,numberField)
                result =  await Customers_Schema.find({phone_number:numberField})
                .sort({createdAt:-1})
                .limit(limit)
                .skip((page - 1) * limit);
                console.log(result)
                getAllUserCount = await Customers_Schema.find({phone_number:numberField}).count();
                return res.status(200).json({alluser:result,user_count:getAllUserCount,pages:Math.ceil(getAllUserCount / limit),})

            }

        return res.status(200).json({alluser:result,user_count:getAllUserCount,pages:Math.ceil(getAllUserCount / limit),})

        }
//  =========== search for user ==========


// ===== filter for user ========
         // console.log("date====",Utils.convertDate(date_from),"-----",Utils.convertDate(date_to))
         const endDate = new Date(`${date_to}`);
         // seconds * minutes * hours * milliseconds = 1 day 
         const dayTime = 60 * 60 * 24 * 1000;
         let increaseEndDateByOne = new Date(endDate.getTime() + dayTime);
         // console.log("INCREASED DATE",increaseEndDateByOne)
 
 
                 // filter users by todays date and by their status 
                 let user_status;
         if(date_from && date_to && by_status ){ 
             if(by_status!= 'all'){
                  user_status = by_status == 'verified' ? true : false
                 result = await Customers_Schema.aggregate([{
                     $match:{
                     verified:user_status,
                     createdAt:{
                         $lte:Utils.convertDate(increaseEndDateByOne),
                         $gte:Utils.convertDate(date_from)
                     }
                 },
                },{$project:{password:0}},{$sort:{createdAt:-1}}, {$skip: (page - 1) * limit },
                {$limit: limit } ],)
               getAllUserCount =  await Customers_Schema.aggregate([{
                $match:{
                verified:user_status,
                createdAt:{
                    $lte:Utils.convertDate(increaseEndDateByOne),
                    $gte:Utils.convertDate(date_from)
                    }
                },
                },{$project:{password:0},},{$count:'user_count'}],)
                console.log("getAllUserCount",getAllUserCount)
                return res.status(200).json({alluser:result,user_count:getAllUserCount[0]?.user_count,pages:Math.ceil(getAllUserCount[0]?.user_count / limit),})

             }
         }
             else{
                 result = await Customers_Schema.find({verified:user_status},'-password').sort({createdAt:-1})
                 // return res.status(200).send(result)
 
             }
 
 
         if(date_from && date_to){
             result = await Customers_Schema.aggregate([{
                                 $match:{
                                 createdAt:{
                                     $lte:Utils.convertDate(increaseEndDateByOne),
                                     $gte:Utils.convertDate(date_from)
                                 }
                             },
                         },{$project:{password:0}},{$sort:{createdAt:-1}}, {$skip: (page - 1) * limit },
                         {$limit: limit } ],)
                         getAllUserCount = await Customers_Schema.aggregate([{
                            $match:{
                            createdAt:{
                                $lte:Utils.convertDate(increaseEndDateByOne),
                                $gte:Utils.convertDate(date_from)
                            }
                        },
                    },{$project:{password:0}},{$count:'user_count'}],)
                    // console.log("getAllUserCount----------",getAllUserCount)
                    // console.log("getAllUserCount----------",getAllUserCount[0])
                     return res.status(200).json({alluser:result,user_count:getAllUserCount[0]?.user_count,pages:Math.ceil(getAllUserCount[0]?.user_count / limit),})

              }
              if(by_status !="all" ){
                 let user_status = by_status === 'verified' ? true : false
                 result = await Customers_Schema.find({verified:user_status},'-password')
                 .sort({createdAt:-1})
                 .limit(limit)
                 .skip((page - 1) * limit);
                 getAllUserCount = await Customers_Schema.find({verified:user_status}).count();
                console.log("getAllUserCount",getAllUserCount)

                 return res.status(200).json({alluser:result,user_count:getAllUserCount,pages:Math.ceil(getAllUserCount / limit),})

             }
// ===== filter for user ========
     
        //===== all users ======
        result = await Customers_Schema.find({})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        getAllUserCount = await Customers_Schema.find({}).count();
        console.log("getAllUserCount",getAllUserCount)

        res.status(200).json({alluser:result,user_count:getAllUserCount,pages:Math.ceil(getAllUserCount / limit),})
        //===== all users ======

    }catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}


// get user by id (who's logged in)
const getUserById = async (req,res)=>{
    const cookie = req.cookies['jwt']
    try{
        if(!cookie){
            return res.send("Unauthenticated !!")
        }
        const verifyJwt = await Utils.verifying_Jwt(cookie,process.env.JWT_TOKEN_SECRET)
        if(!verifyJwt){
            return res.send("Unauthenticated !!")
        }
        const findUser = await Customers_Schema.findById(verifyJwt.id ,"-password")
        if(!findUser){
            return res.send("Unauthenticated !!")
        }
        res.status(200).send(findUser);
    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}

// get user by id
const getUser = async(req,res)=>{
    const userId = req.params.user_id;
    try{
        if(!userId)return res.status(404).send({status:false,message:'user not found !!'})
        const findUser = await Customers_Schema.findById(userId);
        if(!findUser)return res.status(404).send({status:false,message:'user not found !!'})
        res.status(200).send(findUser);

    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !!")
    }
}


// edit users by id
const editUserByID = async(req,res)=>{
    const userId=req.params.user_id;
    try{
        if(!userId){
            return res.send("please provide a user id")
        }
        if(req.body.password){
            const hashedNewPassword = await Utils.Hashing_Password(req.body.password)
            const find = await Customers_Schema.findByIdAndUpdate(userId,{password:hashedNewPassword})
            if(!find){
                return res.send("User not found")
            }
            return res.status(200).send("Password Updated success")
        }
        const findUser = await Customers_Schema.findByIdAndUpdate(userId,{$set:req.body})
        if(!findUser){
            return res.send("user not found")
        }
        res.status(200).send("user updated successfully !!")


    }catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}


// search in users
const searchInUsers = async(req,res)=>{
    const searchValue = req.query.search
    const searchRegex = Utils.createRegex(searchValue);
    let result;
    // console.log("SEARCH===",searchValue)
    try{
     
        // result = await Customers_Schema.find({user_id:{$regex:searchRegex}})
        
        // if(!result.length > 0){
            result = await Customers_Schema.find({username:{$regex:searchRegex}}).sort({createdAt:-1})
            if(!result.length > 0){
                result = await Customers_Schema.find({email:{$regex:searchRegex}}).sort({createdAt:-1})
            }
        // }
        const numberField = parseInt(searchValue)
        // console.log(numberField)
        if (numberField) {
                console.log("numberField" ,numberField)
                result =  await Customers_Schema.find({ 
                    phone_number:numberField
                 }).sort({createdAt:-1})
                 console.log(result)
                 return res.status(200).send(result);
            }

        res.status(200).send(result)
        

    }catch(err){
        console.log(err)
        res.status(500).send("Something went wrong")
    }
}

// API FOR  FILTER IS USERS 
const filterForUsers=async(req,res)=>{
    const {by_status,date_from,date_to,recentDays} = req.query
    let result;
    console.log("by_status,date_from,date_to,recentDays",by_status,date_from,date_to,recentDays)
    try{
        // console.log("date====",Utils.convertDate(date_from),"-----",Utils.convertDate(date_to))
        const endDate = new Date(`${date_to}`);
        // seconds * minutes * hours * milliseconds = 1 day 
        const dayTime = 60 * 60 * 24 * 1000;
        let increaseEndDateByOne = new Date(endDate.getTime() + dayTime);
        // console.log("INCREASED DATE",increaseEndDateByOne)


                // filter users by todays date and by their status 
                let user_status;
        if(date_from && date_to && by_status ){ 
            if(by_status!= 'all'){
                 user_status = by_status == 'verified' ? true : false
                result = await Customers_Schema.aggregate([{
                    $match:{
                    verified:user_status,
                    createdAt:{
                        $lte:Utils.convertDate(increaseEndDateByOne),
                        $gte:Utils.convertDate(date_from)
                    }
                },
            },{$project:{password:0}}],).sort({createdAt:-1})
            return res.status(200).send(result)
            }
        }
            else{
                result = await Customers_Schema.find({verified:user_status},'-password').sort({createdAt:-1})
                // return res.status(200).send(result)

            }


        if(date_from && date_to){
            result = await Customers_Schema.aggregate([{
                                $match:{
                                createdAt:{
                                    $lte:Utils.convertDate(increaseEndDateByOne),
                                    $gte:Utils.convertDate(date_from)
                                }
                            },
                        },{$project:{password:0}}],).sort({createdAt:-1})
                    console.log("RESULT NEW----",result)
                    return res.status(200).send(result)
             }
             if(by_status !="all" ){
                let user_status = by_status === 'verified' ? true : false
                result = await Customers_Schema.find({verified:user_status},'-password').sort({createdAt:-1})
                return res.status(200).send(result)
            }
    

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}


// delete Users
const deleteUsers=async(req,res)=>{
   
    // console.log("body=>",req.body)
    // console.log("body=>",req.body?.length)
    try {
        if(req.body?.data?.length){
            const deleteSelected= await Customers_Schema.deleteMany({
                _id:{
                    $in:req.body?.data
                }
            })
            if(!deleteSelected){
                return res.status(200).send({message:"image not deleted",status:false})
            }
        return res.status(200).send({message:"image delete success",status:true})
        } 
        res.status(200).send({message:"image not deleted",status:false})

    
  
    } catch (err) {
        console.log(err)
        res.status(500).send({message:"image not deleted",status:false})
    }
}

const getAllUsersCountForPlanUpgrade=async(req,res)=>{
    try {
       const getAllUserCount = await Customers_Schema.find({}).count();
        console.log("getAllUserCount",getAllUserCount)
        res.status(200).send({status:true,count:getAllUserCount})
    } catch (error) {
        console.log(error)
        res.status(500).send('something went wrong!!')
    }
}


exports.getAllUser=getAllUser;
exports.getUserById=getUserById;
exports.createUser=createUser;
exports.loginUser=loginUser;
exports.logoutUser=logoutUser;
exports.editUserByID=editUserByID;
exports.searchInUsers = searchInUsers;
exports.filterForUsers = filterForUsers;
exports.deleteUsers = deleteUsers;
exports.getUser = getUser;
exports.getAllUsersCountForPlanUpgrade=getAllUsersCountForPlanUpgrade;