const Products_Schema = require("../../modals/UserModals/Products")
const Details_Schema = require("../../modals/UserModals/Details")
const Category_Schema = require("../../modals/UserModals/Category")
const product_status = require("../../utils/configs/product_status")
const Utils =require("../../utils/Utils")
// const Adiogent_Usage = require("../../utils/configs/adiogent_usage");

// create new product 
const createProducts = async(req,res)=>{
    try{
        // const checkExisting = await Products_Schema.findOne({product_code:req.body.product_code})
        // if(checkExisting.length > 0 ){
        //     console.log("PRODUCT CHECK")
        //     return res.status(203).send({status:false,product_code_match:true,message:'product code already exists !!'})

        // }
        // check user products  limit
        const getProductsCount = await Products_Schema.find({}).count();

        const checkLimit = await Details_Schema.findOne({user_type:'admin'}).select('product_limit')
        console.log("checkLimit===>",checkLimit?.product_limit, "getProductsCount===>",getProductsCount)
        if(checkLimit?.product_limit < getProductsCount){
            return res.status(404).send({status:false,message:'you reached product limit!!'})
        }


        console.log("prod_00"+(getProductsCount+1))
        const productCustomId = "prod_00"+(getProductsCount+1)
        const create = new Products_Schema({
            product_id:productCustomId,
            product_name:req.body.product_name?.toLowerCase(),
            product_slug:req.body.product_name?.toLowerCase(),
            product_code:req.body.product_code,
            product_regular_price:req.body.product_regular_price,
            product_sale_price:req.body.product_sale_price,
            quantity:req.body.product_quantity,
            original_quantity:req.body.product_quantity,
            product_images:req.body.product_images,
            product_main_category:req.body.product_main_category?.toLowerCase(),
            product_main_category_slug:req.body.product_main_category?.toLowerCase(),
            product_category:req.body.product_category?.toLowerCase(),
            product_category_slug:req.body.product_category?.toLowerCase(),
            product_subcategory:req.body.product_subcategory?.toLowerCase(),
            product_subcategory_slug:req.body.product_subcategory?.toLowerCase(),
            new_arrival:req.body?.new_arrival,
            cartoon_total_products:req.body?.cartoon_total_products,
            // color:req.body?.color,
            // size:req.body?.size,
            // weight:req?.body?.weight,
            product_tag:req.body?.product_tag?.toLowerCase(),
            product_description:req.body.product_description?.toLowerCase(),
            // product_variant:req.body.product_variant?.toLowerCase(),
            is_variant_true:req.body?.is_variant_true,
            variant_option:req.body?.variant_option,
            available_variants:req.body?.available_variants,


            
        })
        const result = await create.save();
        // res.status(200).send(result)
        res.status(200).send({status:true,message:'product created successfully !'})

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}

// get product count 
const getProductCount = async(req,res)=>{
    try{
        const productCount = await Products_Schema.find({}).count();
        res.status(200).send({status:true,product_count:productCount})
    }
    catch(err){
        console.log(err);
        res.status(500).send("something went wrong !!")
    }
}

// get all products 
const getAllProducts = async(req,res)=>{
    const {by_status,by_type,date_from,date_to,by_category,by_product_status} = req.query;
    const searchValue = req.query.search;
    const searchRegex = Utils.createRegex(searchValue);
    const limit  = req.query.limit  || 25; 
    const page  = req.query.page; 
    let count;
    let result;
    try{
        // result = await Products_Schema.find({})
        // count = await Products_Schema.find({}).count()
        // return res.status(200).send({allProducts:result,count:count});
        // category list for filter
        let categoryForFilter = await Category_Schema.aggregate([
            {$group:{_id:"$main_category_name"}}
        ]).sort({_id:1})
        // category list for filter
            //   ====== for filter category list ======
    //   ====== for filter category list ======

// ============ SEARCH FOR PRODUCTS ============
if(searchValue){
    result = await Products_Schema.find({product_name:{$regex:searchRegex}})
    .sort({createdAt:-1})
    .limit(limit)
    .skip((page - 1) * limit);
    count = await Products_Schema.find({product_name:{$regex:searchRegex}}).count();
    if(!result.length > 0){
        result = await Products_Schema.find({product_code:{$regex:searchRegex}})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Products_Schema.find({product_code:{$regex:searchRegex}}).count();
    }
    return res.status(200).send({allProducts:result,pages:Math.ceil(count / limit),getProductsCount:count});

}
// ============ SEARCH FOR PRODUCTS ============

// ========= FILTER FOR PRODUCTS =========
const endDate = new Date(`${date_to}`);
// seconds * minutes * hours * milliseconds = 1 day 
const dayTime = 60 * 60 * 24 * 1000;
let increaseEndDateByOne = new Date(endDate.getTime() + dayTime);
// console.log("INCREASED DATE",increaseEndDateByOne)


        // filter users by todays date and by their status 
if(date_from && date_to && by_category ){ 
    if(by_category!= 'all'){
        result = await Products_Schema.aggregate([{
            $match:{
            product_main_category:by_category,
            createdAt:{
                $lte:Utils.convertDate(increaseEndDateByOne),
                $gte:Utils.convertDate(date_from)
            }
        },
    },{$sort:{createdAt:-1}}, {$skip: (page - 1) * limit },
    {$limit: limit } ],)
    count =  await Products_Schema.aggregate([{
        product_main_category:by_category,
        createdAt:{
            $lte:Utils.convertDate(increaseEndDateByOne),
            $gte:Utils.convertDate(date_from)
        }
    },{$count:'product_count'}],)
        console.log("products count-",count)
       return res.status(200).send({allProducts:result,pages:Math.ceil(count[0]?.product_count / limit),getProductsCount:count[0]?.product_count,getAllProductStatus:product_status,categoryForFilter:categoryForFilter});
    }
}
    else{
        result = await Products_Schema.find({product_main_category:by_category}).sort({createdAt:-1})
        // return res.status(200).send(result)

    }


if(date_from && date_to){
    result = await Products_Schema.aggregate([{
                        $match:{
                        createdAt:{
                            $lte:Utils.convertDate(increaseEndDateByOne),
                            $gte:Utils.convertDate(date_from)
                        }
                    },
                },{$sort:{createdAt:-1}}, {$skip: (page - 1) * limit },
                {$limit: limit } ],)
            console.log("RESULT NEW----",result)
            count = await Products_Schema.aggregate([{
                $match:{
                createdAt:{
                    $lte:Utils.convertDate(increaseEndDateByOne),
                    $gte:Utils.convertDate(date_from)
                }
            },
        },{$count:'product_count'}],)
            return res.status(200).send({allProducts:result,pages:Math.ceil(count[0]?.product_count / limit),getProductsCount:count[0]?.product_count,getAllProductStatus:product_status,categoryForFilter:categoryForFilter});
     }
   
    if(by_category != 'all'){
        result = await Products_Schema.find({product_main_category:by_category})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Products_Schema.find({product_main_category:by_category}).count();

        return  res.status(200).send({allProducts:result,pages:Math.ceil(count / limit),getProductsCount:count,getAllProductStatus:product_status,categoryForFilter:categoryForFilter});

    }
    if(by_product_status != 'all'){
        console.log(by_product_status)
        result = await Products_Schema.find({product_status:by_product_status})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Products_Schema.find({product_status:by_product_status}).count();
        return  res.status(200).send({allProducts:result,pages:Math.ceil(count / limit),getProductsCount:count,getAllProductStatus:product_status,categoryForFilter:categoryForFilter});

    }
    if(by_type != 'all'){
        console.log(by_type)
      if(by_type == 'new_arrivals' ){
        result = await Products_Schema.find({new_arrival:true})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Products_Schema.find({new_arrival:true}).count();
        return  res.status(200).send({allProducts:result,pages:Math.ceil(count / limit),getProductsCount:count,getAllProductStatus:product_status,categoryForFilter:categoryForFilter});
      }
      if(by_type == 'trending' ){
        result = await Products_Schema.find({trending_product:true})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Products_Schema.find({trending_product:true}).count();
        return  res.status(200).send({allProducts:result,pages:Math.ceil(count / limit),getProductsCount:count,getAllProductStatus:product_status,categoryForFilter:categoryForFilter});
      }

    }

// ========= FILTER FOR PRODUCTS =========


        result = await Products_Schema.find({})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Products_Schema.find({}).count();
        res.status(200).send({allProducts:result,pages:Math.ceil(count / limit),getProductsCount:count,getAllProductStatus:product_status,categoryForFilter:categoryForFilter});

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong product !!")
    }
}

// get product by id
const getproductById = async(req,res)=>{
    const productId = req.params.product_id;
    try{
        if(!productId){
            return res.status(404).send({status:false,message:'product not found !!'})
        }
        const findProductById = await Products_Schema.findById(productId);
        if(!findProductById){
            return res.status(404).send({status:false,message:'product not found !!'})
        }
        res.status(200).send(findProductById)


    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}

// edit products 
const editProduct = async(req,res)=>{
    const productId = req.params.product_id;
    console.log("productId=>" , productId);
    console.log(req.body)
    try{
        if(!productId){
            return res.status(404).send("Not Found !!")
        }
        const updateProduct = await Products_Schema.findByIdAndUpdate(productId,{$set:req.body})
        if(!updateProduct){
            return res.status(404).send("product not found !!")
        }
        res.status(200).send(updateProduct)

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}


// SEARCH IN PRODUCTS 
const searchProducts = async(req,res)=>{
    const searchValue = req.query.search;
    const searchRegex = Utils.createRegex(searchValue);
    const limit  = req.query.limit  || 25; 
    const page  = req.query.page != 0 ? req.query.page : 1; 
    let result;
    let count;
    try{
        result = await Products_Schema.find({product_name:{$regex:searchRegex}})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        count = await Products_Schema.find({product_name:{$regex:searchRegex}}).count();
        if(!result.length > 0){
            result = await Products_Schema.find({product_code:{$regex:searchRegex}})
            .sort({createdAt:-1})
            .limit(limit)
            .skip((page - 1) * limit);
            count = await Products_Schema.find({product_code:{$regex:searchRegex}}).count();
        }
        // res.status(200).send(result)
        res.status(200).send({result:result,pages:Math.ceil(count / limit),count:count})


    }
    catch(err){
        console.log(err);
        res.status(500).send("Something went wrong !!")
    }
}

// Filter for products table
const filterProducts = async(req,res)=>{
    const {by_status,date_from,date_to,by_category,by_product_status} = req.query
    let result;
    // console.log("by_status,date_from,date_to",by_status,date_from,date_to)
    try{
        const endDate = new Date(`${date_to}`);
        // seconds * minutes * hours * milliseconds = 1 day 
        const dayTime = 60 * 60 * 24 * 1000;
        let increaseEndDateByOne = new Date(endDate.getTime() + dayTime);
        // console.log("INCREASED DATE",increaseEndDateByOne)


                // filter users by todays date and by their status 
                let user_status;
        if(date_from && date_to && by_category ){ 
            if(by_category!= 'all'){
                result = await Products_Schema.aggregate([{
                    $match:{
                    product_main_category:by_category,
                    createdAt:{
                        $lte:Utils.convertDate(increaseEndDateByOne),
                        $gte:Utils.convertDate(date_from)
                    }
                },
            },],).sort({createdAt:-1})
            return res.status(200).send(result)
            }
        }
            else{
                result = await Products_Schema.find({product_main_category:by_category}).sort({createdAt:-1})
                // return res.status(200).send(result)

            }


        if(date_from && date_to){
            result = await Products_Schema.aggregate([{
                                $match:{
                                createdAt:{
                                    $lte:Utils.convertDate(increaseEndDateByOne),
                                    $gte:Utils.convertDate(date_from)
                                }
                            },
                        }],).sort({createdAt:-1})
                    console.log("RESULT NEW----",result)
                    return res.status(200).send(result)
             }
           
            if(by_category != 'all'){
                result = await Products_Schema.find({product_main_category:by_category}).sort({createdAt:-1})
                return res.status(200).send(result)
            }
            if(by_product_status != 'all'){
                console.log(by_product_status)
                result = await Products_Schema.find({product_status:by_product_status}).sort({createdAt:-1})
                return res.status(200).send(result)
            }


    }catch(err){
        console.log(err)
        res.status(200).send("Somthing went wrong !!")
    }
}


// delete products
const deleteProducts=async(req,res)=>{
   
    // console.log("body=>",req.body)
    // console.log("body=>",req.body?.length)
    try {
        if(req.body?.data?.length){
            const findImagesToDelete= await Products_Schema.find({
                _id:{
                    $in:req.body?.data
                }
            }).select('product_images')
            const deleteSelected= await Products_Schema.deleteMany({
                _id:{
                    $in:req.body?.data
                }
            })
            if(!deleteSelected){
                return res.status(200).send({message:"product delete failed",status:false})
            }
    
        console.log("deleteSelected==>>>>",deleteSelected)
        console.log("findImagesToDelete==>>>>",findImagesToDelete)
        return res.status(200).send({message:"product delete success",image_need_to_delete:findImagesToDelete,status:true})
 
        }
        
       
        
        res.status(200).send({message:"product delete failed",status:false})

    
  
    } catch (err) {
        console.log(err)
        res.status(200).send({message:"product delete failed",status:false})
    }
}

//  delete product image
const deleteProductImage=async(req,res)=>{
    const productId = req.params.product_id;
    const productImageName =req.params.product_image;
    console.log("request=>",productId,productImageName)
    try{
        if(!productId){
            return res.status(404).send({status:false,message:'product not found !!'})
        }
        const findProduct = await Products_Schema.findById(productId).select('product_images');
        console.log(findProduct);
        let result = findProduct;
        console.log("result=>",result)
        const filteredProductsImages = await result?.product_images?.filter((value,index)=>value.image_name !== productImageName)
        console.log("result----->",result);
        const updateProductImage = await Products_Schema.findByIdAndUpdate(productId,{$set:{product_images:filteredProductsImages}});
        console.log("updated products=>",updateProductImage);
        res.status(200).send({status:true,message:'product image deleted successfully !!'})

    }
    catch(err){
        console.log(err)
        res.status(200).send({status:false,message:'image delete failed !!'})
    }
}

// set  new arrivals products
const setNewArrivalProducts=async(req,res)=>{
   
    // console.log("body=>",req.body)
    // console.log("body=>",req.body?.data)
    try {
        if(req.body?.data?.length){
            const updateSelected= await Products_Schema.updateMany(
                { _id: { $in: req.body.data } },    
                {$set:{new_arrival:true}},
                {multi:true}
                )
            if(!updateSelected){
                return res.status(200).send({message:"product set as new arrival failed",status:false})
            }
        return res.status(200).send({message:"product set as new arrival success",status:true})
        }
        res.status(200).send({message:"product set as new arrival failed",status:false})
    } catch (err) {
        console.log(err)
        res.status(200).send({message:"product set as new arrival failed",status:false})
    }
}

// Remove new arrivals products
const removeNewArrivalProducts=async(req,res)=>{
   
    // console.log("body=>",req.body)
    // console.log("body=>",req.body?.data)
    try {
        if(req.body?.data?.length){
            const updateSelected= await Products_Schema.updateMany(
                { _id: { $in: req.body.data } },    
                {$set:{new_arrival:false}},
                {multi:true}
                )
            if(!updateSelected){
                return res.status(200).send({message:"product remove as new arrival failed",status:false})
            }
        return res.status(200).send({message:"product remove as new arrival success",status:true})
        }
        res.status(200).send({message:"product remove as new arrival failed",status:false})
    } catch (err) {
        console.log(err)
        res.status(200).send({message:"product remove as new arrival failed",status:false})
    }
}

// set trending products
const setTrendingProducts=async(req,res)=>{
    try {
        if(req.body?.data?.length){
            const updateSelected= await Products_Schema.updateMany(
                { _id: { $in: req.body.data } },    
                {$set:{trending_product:true}},
                {multi:true}
                )
            if(!updateSelected){
                return res.status(200).send({message:"product set as trending product failed",status:false})
            }
        return res.status(200).send({message:"product set as trending product success",status:true})
        }
        res.status(200).send({message:"product set as trending product failed",status:false})
    } catch (err) {
        console.log(err)
        res.status(200).send({message:"product set as trending product failed",status:false})
    }
}

// Remove trending products
const removeTrendingProducts=async(req,res)=>{
    try {
        if(req.body?.data?.length){
            const updateSelected= await Products_Schema.updateMany(
                { _id: { $in: req.body.data } },    
                {$set:{trending_product:false}},
                {multi:true}
                )
            if(!updateSelected){
                return res.status(200).send({message:"product remove as trending product failed",status:false})
            }
        return res.status(200).send({message:"product remove as trending product success",status:true})
        }
        res.status(200).send({message:"product remove as trending product failed",status:false})
    } catch (err) {
        console.log(err)
        res.status(200).send({message:"product remove as trending product failed",status:false})
    }
}



exports.createProducts = createProducts;
exports.getProductCount = getProductCount;
exports.getAllProducts = getAllProducts;
exports.getproductById = getproductById;
exports.editProduct = editProduct;
exports.deleteProducts = deleteProducts;
exports.searchProducts = searchProducts;
exports.filterProducts = filterProducts;
exports.deleteProductImage = deleteProductImage;
exports.setNewArrivalProducts = setNewArrivalProducts;
exports.removeNewArrivalProducts = removeNewArrivalProducts;
exports.setTrendingProducts = setTrendingProducts;
exports.removeTrendingProducts = removeTrendingProducts;