const Banners_Schema = require("../../modals/UserModals/Banners")
const Details_Schema = require("../../modals/UserModals/Details")
const Enquiry_Schema = require("../../modals/UserModals/Enquiry")
const Customers_Schema = require("../../modals/UserModals/Customers")
const Orders_Schema = require("../../modals/UserModals/Orders")
const Products_Schema = require("../../modals/UserModals/Products")
const Category_Schema = require("../../modals/UserModals/Category")
const Utils = require("../../utils/Utils");
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const order_status = require("../../utils/configs/order_status")
const generateOrderId = require('order-id')('key');
const {loginToShiprocket,createShiprocketOrder} =require("../../utils/pluginFunc/pluginfunc")


//========== CHECK WHO'S APP IS?( SWITCH DATABASE FOR USERS ) ==========
const checkWhosAppIs=async(req,res)=>{
    const app_id = req.params?.app_id
    console.log("app_id===>>>>",app_id)

}

//========== CHECK WHO'S APP IS?( SWITCH DATABASE FOR USERS ) ==========



// all brands screen api
const showAllBrands = async(req,res)=>{
    try{
        const allBrands = await Category_Schema.aggregate([
            {$group:{_id:"$main_category_name",categories:{$push:{category_id:"$_id",brandName:"$category_name",brandImage:"$category_image"}}}}
            
        ]).sort({_id:1})
        console.log(allBrands)
        res.status(200).send(allBrands)

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")

    }
}

// all categories screen api
const showAllCategories = async(req,res)=>{
    try{
        const allCategories = await Category_Schema.aggregate([
            {$group:{_id:"$main_category_name",main_category_image:{$addToSet:{image:"$main_category_image"}}}}
        ]).sort({_id:1})
        console.log("allCategories=======>>>>>",allCategories)
        res.status(200).send(allCategories)

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")

    }
}


// brands for home screen 
const brandsForHomeScreen = async(req,res)=>{
    try{
        const allBrandsForHomeScreen = await Category_Schema.aggregate([
            {$group:{_id:"$main_category_name",brands:{$push:{category_id:"$_id",brandName:"$category_name",brandImage:"$category_image"}}}},
            {$project:{_id:1,brands:{$slice:["$brands",7]},}}
        ]).sort({_id:1})
        console.log(allBrandsForHomeScreen)
        res.status(200).send(allBrandsForHomeScreen)


    }
    catch(err){
        console.log(err);
        res.status(500).send("Something went wrong !!")
    }
}

// get all brands for search suggestions
const getAllBrands = async(req,res)=>{
    const main_category = req?.query?.main_category;
    console.log("main_category",main_category)
    try{
        if(main_category){
            const allBrands = await Category_Schema.find({main_category_name:main_category}).select("category_name")
            console.log("allBrands",allBrands)
            return res.status(200).send(allBrands)
        }
        const allBrands = await Category_Schema.aggregate([
            {$group:{_id:"$main_category_name"}}
        ]).sort({_id:1})
        res.status(200).send(allBrands)

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wroog !!")
    }

}

// get brands sub category & related products
const brandsSubCategoryAndProducts = async(req,res)=>{
    const brandId = req.query.brand_id;
    const brandName = req.query.brand_name;
    try{
        const findBrandSubcategory = await Category_Schema.find({_id:brandId}).sort({createdAt:-1}).slice({subcategory:7}).limit(7);
        console.log(findBrandSubcategory)
        const findProducts = await Products_Schema.find({product_category:brandName})
        .sort({createdAt:-1})
        .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_code product_sale_price product_regular_price ")
        .limit(10);
        console.log("PRODUCTS=>",findProducts);
        if(findProducts?.length <= 15 ){
            const findMoreProducts = await Products_Schema.find({}).select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_sale_price product_regular_price product_description product_code");
        }
        res.status(200).send({subcategory:findBrandSubcategory,products:findProducts});

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}

// get product by id
const getProductById = async(req,res)=>{
    const productId = req.params.product_id;
    try{
        if(!productId){
            return res.status(404).send({status:false,message:"product not found !!"})
        }
        
        const findProduct = await Products_Schema.findById(productId).select("product_id size color weight is_variant_true variant_option available_variants product_name product_images trending_product new_arrival product_main_category product_category product_subcategory product_variant product_sale_price product_regular_price product_description product_code cartoon_total_products");
        if(!findProduct){
            return res.status(404).send({status:false,message:"product not found !!"});
        }
        res.status(200).send(findProduct)


    }
    catch(err){
        console.log(err)
        res.status(500).send("Somwthing went wrong !!")
    }
}

// search in products api
const searchProducts = async(req,res)=>{
    const search = req.query.search_by?.trim();
    const searchBySubCategory = req.query.subcategory;
    const searchByCategory = req.query.category;
    const searchByBrandCategory = req.query.brand_category?.trim();
    const productTag = req.query.product_tag?.toLowerCase();
    const limit  = req.query.limit  || 20; 
    const page  = req.query.page || 1; 
    console.log("REQUEST->",req.query)
    let result;
    let count;
    try{
        if(!search && !searchBySubCategory && !searchByCategory && !searchByBrandCategory ){
            res.status(404).send({status:false,message:'not found !!'});
            return;
        }
    // =========== SEARCH BY TEXT INPUT AND SELECTED PRODUCT TAG =========== 
    if(search?.length && productTag){
        const searchRegex = Utils.createRegex(search);
        result = await Products_Schema.find({product_name:{$regex:searchRegex},product_tag:productTag})
        .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page -1 )* limit)
        count = await Products_Schema.find({product_name:{$regex:searchRegex},product_tag:productTag}).count();

       if(!result.length > 0 ){
        result = await Products_Schema.find({product_code:{$regex:searchRegex},product_tag:productTag})
        .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Products_Schema.find({product_code:{$regex:searchRegex},product_tag:productTag}).count();

       }
    //    console.log("Result normal search=>",result)
       return res.status(200).send({result,pages:Math.ceil(count / limit) });
       }
    // =========== SEARCH BY TEXT INPUT AND SELECTED PRODUCT TAG =========== 


     // ========== SEARCH BY SUB CATEGORY AND SELECTED PRODUCT TAG ===========
       if(searchBySubCategory && productTag){
        const searchBySubCategoryObj = JSON.parse(searchBySubCategory)
        // console.log('NEW OBJ',searchBySubCategoryObj)
        // const searchBySubCategoryRegex = Utils.createRegex(searchBySubCategoryObj?.sub_category);
        result = await Products_Schema.find({product_main_category:searchBySubCategoryObj.main_category,
            product_category:searchBySubCategoryObj.category,
            product_subcategory:searchBySubCategoryObj.sub_category,
            product_tag:productTag
        })
        .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
       console.log("Result Sub category=>",result)
        count = await Products_Schema.find({
            product_main_category:searchBySubCategoryObj.main_category,
            product_category:searchBySubCategoryObj.category,
            product_subcategory:searchBySubCategoryObj.sub_category,
            product_tag:productTag
        }).count();
        console.log("count",count)
        return res.status(200).send({result,pages: Math.ceil(count / limit) });
       }
     // ========== SEARCH BY SUB CATEGORY AND SELECTED PRODUCT TAG ===========

   // ========== SEARCH BY CATEGORY AND SELECTED PRODUCT TAG ==========
   if(searchByCategory && productTag){
    console.log("MAIN CATEGORY and productTag SEARCH")
    const searchByCategoryRegex = Utils.createRegex(searchByCategory);
    result = await Products_Schema.find({product_main_category:{$regex:searchByCategoryRegex},product_tag:productTag})
    .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
    .sort({createdAt:-1})
    .limit(limit)
    .skip((page - 1) * limit);
//    console.log("Result Category=>",result)
    count = await Products_Schema.find({product_main_category:searchByCategory,product_tag:productTag}).count();
    // console.log("Count -> category=",count)
    return res.status(200).send({result,pages:Math.ceil(count / limit)});
   }
   // ========== SEARCH BY CATEGORY AND SELECTED PRODUCT TAG ==========


   //==========  SEARCH BY BRAND CATEGORY AND SELECTED PRODUCT TAG ==========
   if(searchByBrandCategory && productTag){
    console.log("CATEGORY and productTag SEARCH ")
    const searchByBrandCategoryRegex = Utils.createRegex(searchByBrandCategory);
    result = await Products_Schema.find({product_category:{$regex:searchByBrandCategoryRegex},product_tag:productTag})
    .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
    .sort({createdAt:-1})
    .limit(limit)
    .skip((page - 1) * limit);
    count = await Products_Schema.find({product_category:searchByBrandCategory,product_tag:productTag}).count();
    return res.status(200).send({result,pages:Math.ceil(count / limit)});
   }
   //==========  SEARCH BY BRAND CATEGORY AND SELECTED PRODUCT TAG ==========




    //  SEARCH BY TEXT INPUT  
       if(search?.length){
        const searchRegex = Utils.createRegex(search);
        result = await Products_Schema.find({product_name:{$regex:searchRegex}})
        .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page -1 )* limit)
        count = await Products_Schema.find({product_name:{$regex:searchRegex}}).count();

       if(!result.length > 0 ){
        result = await Products_Schema.find({product_code:{$regex:searchRegex}})
        .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Products_Schema.find({product_code:{$regex:searchRegex}}).count();

       }
    //    console.log("Result normal search=>",result)
       return res.status(200).send({result,pages:Math.ceil(count / limit) });
       }
    //  SEARCH BY SUB CATEGORY  
       if(searchBySubCategory){
        const searchBySubCategoryObj = JSON.parse(searchBySubCategory)
        // console.log("SUB CATEGORY SEARCH--->",'parent',searchBySubCategory?.main_category,"cat",searchBySubCategory?.category,searchBySubCategory?.sub_category)
        // console.log('NEW',JSON.parse(searchBySubCategory))
        console.log('NEW OBJ',searchBySubCategoryObj)
        const searchBySubCategoryRegex = Utils.createRegex(searchBySubCategoryObj?.sub_category);
        result = await Products_Schema.find({product_main_category:searchBySubCategoryObj.main_category,
            product_category:searchBySubCategoryObj.category,
            product_subcategory:searchBySubCategoryObj.sub_category})
        .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
       console.log("Result Sub category=>",result)
        count = await Products_Schema.find({
            product_main_category:searchBySubCategoryObj.main_category,
            product_category:searchBySubCategoryObj.category,
            product_subcategory:searchBySubCategoryObj.sub_category}).count();
        console.log("count",count)
        return res.status(200).send({result,pages: Math.ceil(count / limit) });
       }
    //  SEARCH BY CATEGORY  
       if(searchByCategory){
        console.log("MAIN CATEGORY SEARCH")
        const searchByCategoryRegex = Utils.createRegex(searchByCategory);
        result = await Products_Schema.find({product_main_category:{$regex:searchByCategoryRegex}})
        .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
    //    console.log("Result Category=>",result)
        count = await Products_Schema.find({product_main_category:searchByCategory}).count();
        // console.log("Count -> category=",count)
        return res.status(200).send({result,pages:Math.ceil(count / limit)});
       }
       //  SEARCH BY BRAND CATEGORY  
       if(searchByBrandCategory){
        console.log("CATEGORY SEARCH")
        const searchByBrandCategoryRegex = Utils.createRegex(searchByBrandCategory);
        result = await Products_Schema.find({product_category:{$regex:searchByBrandCategoryRegex}})
        .select("product_id product_name new_arrival product_images product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
    //    console.log("Result Category=>",result)
        count = await Products_Schema.find({product_category:searchByBrandCategory}).count();
        // console.log("Count -> category=",count)
        return res.status(200).send({result,pages:Math.ceil(count / limit)});
       }
       
    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !!")
    }
}

// FILTER FOR SEARCH PRODUCTS
const filterForProducts = async(req,res)=>{
    try{
        const getAllProductTags = await Products_Schema.aggregate([
            {$group:{_id:"$product_tag"}}
        ]).sort({_id:1})
        res.status(200).send(getAllProductTags);
    }
    catch(err){
        console.log(err);
        res.status(500).send("Something went wrong !!")
    }
}

// GET NEW ARRIVALS PRODUCTS
// const getNewArrivalProducts = async(req,res)=>{
//     const searchForNewArrival = req.query.category;
//     const brandCategory = req.query.brand_category;
//     const limit  = req.query.limit  || 10; 
//     const page  = req.query.page || 1; 
//     // console.log(searchForNewArrival)
//     let result;
//     let count;
//     try{
//     //  SEARCH FOR NEW ARRIVALS  
//         const searchRegex = Utils.createRegex(searchForNewArrival);
//         const searchRegexBrandCategory = Utils.createRegex(brandCategory);

//         if(searchForNewArrival?.length && brandCategory != undefined){
//             result = await Products_Schema.find({product_main_category:{$regex:searchRegex},product_category:{$regex:searchRegexBrandCategory},new_arrival:true})
//             .select("product_id product_name product_images new_arrival product_main_category product_category product_subcategory product_variant product_sale_price product_regular_price product_description product_code")
//             .sort({updatedAt:-1})
//             .limit(limit)
//             .skip((page - 1) * limit);
//         //    console.log("Result Category=>",result)
//             count = await Products_Schema.find({product_main_category:searchForNewArrival,product_category:{$regex:searchRegexBrandCategory},new_arrival:true}).count();
//             // console.log("Count -> category=",count)
//            return res.status(200).send({result,pages:Math.ceil(count / limit)});
         
//         }else{
//         result = await Products_Schema.find({product_main_category:{$regex:searchRegex},new_arrival:true})
//         .select("product_id product_name product_images new_arrival product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
//         .sort({updatedAt:-1})
//         .limit(limit)
//         .skip((page - 1) * limit);
//     //    console.log("Result Category=>",result)
//         count = await Products_Schema.find({product_main_category:searchForNewArrival,new_arrival:true}).count();
//         // console.log("Count -> category=",count)
//         res.status(200).send({result,pages:Math.ceil(count / limit)});
//         }
       
//     }
//     catch(err){
//         console.log(err)
//         res.status(500).send("something went wrong !!")
//     }
// }

// get category for new arrivals filter
const getBrandCategory=async(req,res)=>{
    const brandName = req.params.brand_name;
    try{
        if(!brandName)return res.status(404).send({status:false,message:'not found brands !!'});
        const findBrand = await Category_Schema.find({main_category_name:brandName}).select(" category_name ");
        if(!findBrand) return res.status(404).send({status:false,message:'not found brands !!'});
        res.status(200).send({status:true,result:findBrand,message:'success !!'});

    }
    catch(err){

    }
}


// ======================= USER AUTHENTICATION FLOW ==========================
// check user is exists or not
const checkExistingUser = async(req,res)=>{
    const phoneNumber = req.params.phone_number;
    try{
        if(!phoneNumber){
            return res.status(404).send({status:false,message:'user not found !!'})
        }
        const findUser = await Customers_Schema.findOne({phone_number:parseInt(phoneNumber)});
        // for sign up 
        if(!findUser){
            // ===== checking users limit ======
            console.log("LOGGED OUTER")
            // ===== checking users limit ======

            return res.status(200).send({user_exists:false,message:'user not found !!'});
        }
        // for sign in
        res.status(200).send({user_exists:true,user_id:findUser.user_id,message:'user found success !!'})
    }
    catch(err){
        console.log(err)
        res.state(500).send("Something went wrong !!")
    }
}

// creating new user 
const createUser = async(req,res)=>{
 const  {phone_number,username,user_id} = req.body;
 const convertPhone = phone_number.split(' ')
 const phoneNumber = convertPhone[1]
    try{
        const findUserPhone = await Customers_Schema.findOne({phone_number:parseInt(phoneNumber)});
        console.log("findUserPhone==>",findUserPhone);
        const curDate = new Date()
        let userJoiningDate = new Date(curDate).toJSON()?.slice(0, 10);
        if(findUserPhone){
            return res.status(401).send("User Already Exists !!");
        }
        const getUserId = uuidv4();
        // console.log(getUserId);
        const create = new Customers_Schema({
            user_id:getUserId,
            username:username?.toLowerCase(),
            phone_number:parseInt(phoneNumber),
            
            joining_date:userJoiningDate,
        }) 
        const result = await create.save();
        const findUser = await Customers_Schema.findOne({phone_number:parseInt(phoneNumber)}).select('user_id username phone_number ')
        if(!findUser){
            return res.status(404).send("unauthenticated !!")
        }
        res.status(200).send({status:true,user:findUser,message:"created user success !!"})

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong")
    }
}
const loginUser = async(req,res)=>{
    const {phone_number} = req.params;
    const convertPhone = phone_number.split(' ')
    const phoneNumber = convertPhone[1]
    console.log(phoneNumber,phone_number , convertPhone)
    try{
        if(!phoneNumber){
            return res.status(404).send("unauthenticated !!")
        }
        const findUser = await Customers_Schema.findOne({phone_number:parseInt(phoneNumber)}).select('user_id username phone_number ')
        if(!findUser){
            return res.status(404).send("unauthenticated !!")
        }
         res.status(200).send({status:true,user:findUser})
    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !!")
    }
}

// ======================== USER AUTHENTICATION FLOW ====================

// get user by user id
const getUserById = async(req,res)=>{
    const userId = req.params.user_id;
    try{
        if(!userId) return res.status(404).send({status:false,message:'not found user !!'})
        const findUser  = await Customers_Schema.findOne({user_id:userId});
        if(!findUser) return res.status(404).send({status:false,message:'not found user !!'})
        res.status(200).send({status:true,message:'success',user:findUser});
    }
    catch(err){
        console.log(err);
        res.status(500).send("something went wrong !!")
    }
}
// get user by user id
const getUserCheckoutDetailById = async(req,res)=>{
    const userId = req.params.user_id;
    try{
        if(!userId) return res.status(404).send({status:false,message:'not found user !!'})
        const findUser  = await Customers_Schema.findOne({user_id:userId}).select("shipping_address");
        if(!findUser) return res.status(404).send({status:false,message:'not found user !!'})
        res.status(200).send({status:true,message:'success',user:findUser});
    }
    catch(err){
        console.log(err);
        res.status(500).send("something went wrong !!")
    }
}

// edit users by id
const editUserByID = async(req,res)=>{
    const userId=req.params.user_id;
    console.log("USER ID=>",userId,"REQUEST BODY",req.body);
    try{
        if(!userId){
            return res.send("please provide a user id")
        }
        const findUser = await Customers_Schema.findOneAndUpdate({_id:userId},
            {$set:{
                username:req.body.username,
                gst_number:req.body?.gst_number,
                pincode:parseInt(req.body?.pincode),
                phone_number:parseInt(req.body?.customer_phone_number),
                transport_detail:req.body?.transport_detail,
                state:req.body?.state,
                address:req.body.address?.toLowerCase(),
                user_business:req.body?.customer_business,
                email:req.body?.email?.toLowerCase(),}
            
            })
        console.log(findUser,findUser)
        if(!findUser){
            return res.send("user not found")
        }
        res.status(200).send({status:true,
            user:{
              _id: findUser._id,
               user_id:findUser.user_id,
               username:findUser.username,
               phone_number:findUser.phone_number,
            },
            message:"user updated successfully !!"})


    }catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}

// edit users by id
const editUserCheckoutDetailByID = async(req,res)=>{
    const userId=req.params.user_id;
    console.log("USER ID=>",userId,"REQUEST BODY",req.body);
    try{
        if(!userId){
            return res.send("please provide a user id")
        }
        const findUser = await Customers_Schema.findOneAndUpdate({_id:userId},
            {$set:{shipping_address:{
                name:req.body.username,
                pincode:parseInt(req.body?.pincode),
                phone_number:parseInt(req.body?.customer_phone_number),
                state:req.body?.state,
                address:req.body.address?.toLowerCase(),
                email:req.body?.email?.toLowerCase(),}}
            
            })
        console.log(findUser,findUser)
        if(!findUser){
            return res.send("user not found")
        }
        res.status(200).send({status:true,
            user:{
              _id: findUser._id,
               user_id:findUser.user_id,
               username:findUser.username,
               phone_number:findUser.phone_number,
            },
            message:"user shipping address updated successfully !!"})


    }catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}


// get all orders 
const getAllOrdersByUserId = async(req,res)=>{
    const { customer_id } = req.params;
    const limit  = req.query.limit  || 10; 
    const page  = req.query.page || 1; 
    console.log(customer_id,"CUSTOMER ID")
    // const phoneNumber = parseInt(phone_number);
    let result;
    let count;
    try{
        if(!customer_id){
            return res.status(404).send("orders not found !!");
        }
        const findOrders = await Orders_Schema.find({customer_id:customer_id})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Orders_Schema.find({customer_id:customer_id}).count()
        res.status(200).send({all_orders:findOrders,order_status:order_status,pages:Math.ceil(count / limit)});
        
    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}

// get all banners
const getAllHomeScreenbanner = async(req,res)=>{
    try{
        const findAll = await Banners_Schema.find({}).select("image_url selected_category").sort({createdAt:-1});
        res.status(200).send(findAll);
    }
    catch(err){
        console.log(err);
        res.status(500).send("something went wrong !!")
    }
}

// cancel order by order id
const cancelOrderById = async(req,res)=>{
    const orderId = req.params.order_id;
    console.log("orderId",orderId);
    try{
        if(!orderId){
            return res.status(404).send({status:false,message:'not found !!'});
        }
        const findOrder = await Orders_Schema.findByIdAndUpdate(orderId,{$set:{order_status:'cancelled'}});
        if(!findOrder){
            return res.status(404).send({status:false,message:'not found !!'});
        }
        res.status(200).send({status:true,message:'order cancelled success !!'});

    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !! ")
    }
}

// send message for order enquiry
const sendMessageEnquiry = async(req,res)=>{
    console.log(req.body);
    try{
        const create = new Enquiry_Schema({
            order_id:req.body?.order_id,
            user_id:req.body?.user_id,
            username:req.body.username,
            message:req.body.message,
            phone_number:req.body.phone_number,
        })
        const result = await create.save();
        res.status(200).send({status:true,message:'you message has been received !!'});

    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !!");
    }
}

// get trending products for home screen api
const getTrendingProductsForHome = async(req,res)=>{
    try{
        const getproduct = await Products_Schema.find({trending_product:true})
        .select("product_id product_name product_images trending_product product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .limit(10)
        console.log(getproduct);
        res.status(200).send(getproduct);
    }catch(err){
        console.log(err);
        res.status(500).send("something went wrong !!")

    }
}

// get 10 New arrivals products for home screen api
const getNewArrivalProductsForHome = async(req,res)=>{
    try{
        const getproduct = await Products_Schema.find({new_arrival:true})
        .select("product_id product_name product_images new_arrival product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .limit(10)
        console.log(getproduct);
        res.status(200).send(getproduct);
    }catch(err){
        console.log(err);
        res.status(500).send("something went wrong !!")

    }
}

// GET ALL NEW ARRIVALS PRODUCTS
const getAllNewArrivalProducts = async(req,res)=>{
    const limit  = req.query.limit  || 10; 
    const page  = req.query.page || 1; 
    // console.log(searchForNewArrival)
    let result;
    let count;
    try{
        result = await Products_Schema.find({new_arrival:true}) 
        .select("product_id product_name product_images new_arrival product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({updatedAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        console.log(result);
        count = await Products_Schema.find({new_arrival:true}).count();
            // console.log("Count -> category=",count)
        res.status(200).send({result,pages:Math.ceil(count / limit)});       
    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !!")
    }
}


// GET ALL NEW ARRIVALS PRODUCTS
const getAllTrendingProductsForHome = async(req,res)=>{
    const limit  = req.query.limit  || 10; 
    const page  = req.query.page || 1; 
    // console.log(searchForNewArrival)
    let result;
    let count;
    try{
        result = await Products_Schema.find({trending_product:true})
        .select("product_id product_name product_images trending_product product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({updatedAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        console.log(result);
        count = await Products_Schema.find({trending_product:true}).count();
            // console.log("Count -> category=",count)
        res.status(200).send({result,pages:Math.ceil(count / limit)});       
    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !!")
    }
}



// GET ALL PRODUCTS FOR HOME SCREEN
const getAllProductsForHomeScreen = async(req,res)=>{
    const limit  = req.query.limit  || 20; 
    const page  = req.query.page || 1; 
    // console.log(searchForNewArrival)
    let result;
    let count;
    try{
        result = await Products_Schema.find({}) 
        .select("product_id product_name product_images new_arrival product_main_category product_category product_subcategory product_variant product_description product_sale_price product_regular_price product_code")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        console.log(result);
        count = await Products_Schema.find({}).count();
            // console.log("Count -> category=",count)
        res.status(200).send({result,pages:Math.ceil(count / limit)});       
    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !!")
    }
}

// === send admins details to app  ====
const getAdminDetailsForApp=async(req,res)=>{
    try{
        const getDetail = await Details_Schema.findOne({user_type:'admin'}).select("app_link whatsapp_link facebook_link instagram_link linkedin_link twitter_link telegram_link youtube_link delivery_charges cash_on_delivery name phone_number email razorpay_is_installed razorpay_key_id adiogent_pay")
        res.status(200).send({status:true,response:getDetail})

    }
    catch(err){
        console.log("something went wrong !!")
    }
}


// Cart Checkout 
const cartCheckoutCod = async(req,res)=>{
    console.log("WHOLE BODY",req.body)
    try{
        const getOrderId =  "#"+generateOrderId.generate(); //ordersCustomId 
        // console.log(getOrderId);
        const getAdminDetail = await Details_Schema.findOne({user_type:'admin'})
        const create = new Orders_Schema({
            order_id:getOrderId,
            customer_phone_number:parseInt(req.body.customer_phone_number),
            customer_id:req.body.customer_id,
            customer_name:req.body.customer_name?.toLowerCase(),
            customer_email:req.body.customer_email?.toLowerCase(),
            order_status:"pending",
            products:req.body.products,
            shipping_address:req.body.shipping_address,
            state:req.body?.state,
            pincode:parseInt(req.body?.pincode),
            customer_gst:req.body?.customer_gst,
            customer_business:req.body?.customer_business,
            transport_detail:req.body?.transport_detail,
            payment_mode:'cash on delivery',
            delivery_charges:getAdminDetail?.delivery_charges,
            order_total:req.body.order_total,
        });
        const result = await create.save();
         //==== shiprocket plugin ===
         if(getAdminDetail?.shiprocket_plugin?.is_installed == true && 
            getAdminDetail?.shiprocket_plugin?.user_email?.length && 
            getAdminDetail?.shiprocket_plugin?.user_password?.length){

             await loginToShiprocket(getAdminDetail?.shiprocket_plugin?.user_email,getAdminDetail?.shiprocket_plugin?.user_password,result)
           
            }


        res.status(200).send({status:true,message:'order created successfully !!'})
    }
    catch(err){
        console.log(err);
        res.status(500).send("Something went wrong !!");
    }
}


// calculate price for razorpay
const calculatePrice = async(req,res)=>{
    const frontendProducts = req.body
    const adminId = req.query.admin_id;
    console.log(req.body)
    try{
        const getAdminDetail = await Details_Schema.findOne({user_type:'admin'})
        let total = 0
        for(let i=0;i<frontendProducts?.length;i++){
            const findProduct = await Products_Schema.findOne({_id:frontendProducts[i]._id})
            total = total + findProduct?.product_sale_price * frontendProducts[i]?.product_quantity
        }
        let options ={
            amount : (total + getAdminDetail?.delivery_charges)  * 100,
            currency: "INR",
            }
            let razorpayInstance = new Razorpay({
                key_id: getAdminDetail?.razorpay_key_id,
                key_secret: getAdminDetail?.razorpay_key_secret,
              });
            // let razorpayInstance = new Razorpay({
            //     key_id: process.env.RAZORPAY_KEY_ID,
            //     key_secret: process.env.RAZORPAY_KEY_SECRET,
            //   });
            
            
        let response = await razorpayInstance.orders.create(options)
        res.status(200).send({status:true,response:response,razorpay_key_id:getAdminDetail?.razorpay_key_id})

    }
    catch(err){
        res.status(500).send("something went wrong !!")
    }
}

// ONLINE PAYMNET RAZORPAY verify payment and create order 
const verifyAndCreateOrder = async(req,res)=>{
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature} = req.body;
    const adminId = req.query.admin_id;
    console.log("WHOLE BODY",req.body)
    try{
        const order_id =  "order-"+generateOrderId.generate(); //ordersCustomId 
        const getAdminDetail = await Details_Schema.findOne({user_type:'admin'})
        const shasum = crypto.createHmac("sha256",getAdminDetail?.razorpay_key_secret);
        // const shasum = crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedHex = shasum.digest('hex');
        if(generatedHex != razorpay_signature ){
            return res.status(404).send({status:false,message:'transaction is not legit!'})
        }
        if(generatedHex == razorpay_signature){
            console.log("VERIFIED SUCCESS")
            const getOrderId =  "#"+generateOrderId.generate(); //ordersCustomId 
            console.log(getOrderId);
            const create = new Orders_Schema({
                order_id:getOrderId,
                razorpay_payment_id:razorpay_payment_id,
                razorpay_order_id:razorpay_order_id,
                customer_phone_number:parseInt(req.body.customer_phone_number),
                customer_id:req.body.customer_id,
                customer_name:req.body.customer_name?.toLowerCase(),
                customer_email:req.body.customer_email?.toLowerCase(),
                order_status:"pending",
                products:req.body.products,
                payment_mode:'online',
                delivery_charges:getAdminDetail?.delivery_charges,
                order_total:req.body.order_total,
                shipping_address:req.body.shipping_address,
                state:req.body?.state,
                pincode:parseInt(req.body?.pincode),
                customer_gst:req.body?.customer_gst,
                customer_business:req.body?.customer_business,
                transport_detail:req.body?.transport_detail,
            });
            const result = await create.save();
            //==== shiprocket plugin ===
            if(getAdminDetail?.shiprocket_plugin?.is_installed == true && 
                getAdminDetail?.shiprocket_plugin?.user_email?.length && 
                getAdminDetail?.shiprocket_plugin?.user_password?.length){

                    await loginToShiprocket(getAdminDetail?.shiprocket_plugin?.user_email,getAdminDetail?.shiprocket_plugin?.user_password,result)
                }

    
           return res.status(200).send({status:true,message:'order created successfully !!'})
        }
    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !!")
    }
}

// ADIOGENT PAY ONLINE PAYMENT
const createOrderWithAdiogentPay = async(req,res)=>{
    console.log("WHOLE BODY",req.body)
    try{
        const getOrderId =  "#"+generateOrderId.generate(); //ordersCustomId 
        // console.log(getOrderId);
        const getAdminDetail = await Details_Schema.findOne({user_type:'admin'})
        const create = new Orders_Schema({
            order_id:getOrderId,
            customer_phone_number:parseInt(req.body.customer_phone_number),
            customer_id:req.body.customer_id,
            customer_name:req.body.customer_name?.toLowerCase(),
            customer_email:req.body.customer_email?.toLowerCase(),
            order_status:"pending",
            products:req.body.products,
            shipping_address:req.body.shipping_address,
            state:req.body?.state,
            pincode:parseInt(req.body?.pincode),
            customer_gst:req.body?.customer_gst,
            customer_business:req.body?.customer_business,
            transport_detail:req.body?.transport_detail,
            payment_mode:'upi',
            delivery_charges:getAdminDetail?.delivery_charges,
            order_total:req.body.order_total,
        });
        const result = await create.save();
         //==== shiprocket plugin ===
         if(getAdminDetail?.shiprocket_plugin?.is_installed == true && 
            getAdminDetail?.shiprocket_plugin?.user_email?.length && 
            getAdminDetail?.shiprocket_plugin?.user_password?.length){

             await loginToShiprocket(getAdminDetail?.shiprocket_plugin?.user_email,getAdminDetail?.shiprocket_plugin?.user_password,result)
           
            }


        res.status(200).send({status:true,message:'order created successfully !!'})
    }
    catch(err){
        console.log(err);
        res.status(500).send("Something went wrong !!");
    }
}

 
// ABOUT US ADMIN
const getAdminAboutPrivacyTermAndCondition = async(req,res)=>{
    try{
        const getDetail = await Details_Schema.find({user_type:'admin'}).select("aboutus privacy_policy term_and_condition")
        res.status(200).send(getDetail)

    }
    catch(err){
        console.log(err)
        res.status(500).send("something went wrong !!")
    }
}



exports.showAllBrands = showAllBrands;
exports.brandsForHomeScreen = brandsForHomeScreen;
exports.getAllBrands = getAllBrands;
exports.brandsSubCategoryAndProducts = brandsSubCategoryAndProducts;
exports.getProductById = getProductById;
exports.searchProducts = searchProducts;
exports.cartCheckoutCod = cartCheckoutCod;
exports.checkExistingUser = checkExistingUser;
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.getAllOrdersByUserId = getAllOrdersByUserId;
exports.getAllHomeScreenbanner = getAllHomeScreenbanner;
exports.cancelOrderById = cancelOrderById;
exports.sendMessageEnquiry = sendMessageEnquiry;
exports.editUserByID = editUserByID;
exports.editUserCheckoutDetailByID = editUserCheckoutDetailByID;
exports.getUserById = getUserById;
exports.getUserCheckoutDetailById = getUserCheckoutDetailById;
// exports.getNewArrivalProducts = getNewArrivalProducts;
exports.getBrandCategory = getBrandCategory;
exports.filterForProducts = filterForProducts;
exports.showAllCategories = showAllCategories;
exports.getTrendingProductsForHome = getTrendingProductsForHome;
exports.getNewArrivalProductsForHome = getNewArrivalProductsForHome;
exports.getAllNewArrivalProducts = getAllNewArrivalProducts;
exports.getAllTrendingProductsForHome = getAllTrendingProductsForHome;
exports.getAllProductsForHomeScreen = getAllProductsForHomeScreen;
exports.calculatePrice = calculatePrice;
exports.verifyAndCreateOrder = verifyAndCreateOrder;
exports.createOrderWithAdiogentPay = createOrderWithAdiogentPay;
exports.getAdminDetailsForApp = getAdminDetailsForApp;
exports.getAdminAboutPrivacyTermAndCondition = getAdminAboutPrivacyTermAndCondition;



exports.checkWhosAppIs = checkWhosAppIs;
