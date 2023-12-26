const Enquiry_Schema = require("../../modals/UserModals/Enquiry")

// get all enquiries 
const getAllEnquires = async(req,res)=>{
    const limit  = req.query.limit  || 25; 
    const page  = req.query.page ; 
    let result;
    let count;
    try{
        result = await Enquiry_Schema.find({})
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1) * limit);
        console.log(result)
        count = await Enquiry_Schema.find({}).count()
        res.status(200).send({all_enquiry:result,enquiry_count:count,pages:Math.ceil(count / limit)})
        // res.status(200).send(findAll);

    }
    catch(err){
        console.log(err);
        res.status(500).send("something went wrong !!")
    }
}

// delete enquiry
const deleteEnquiry=async(req,res)=>{
   
    // console.log("body=>",req.body)
    // console.log("body=>",req.body?.length)
    try {
        if(req.body?.data?.length){
            const deleteSelected= await Enquiry_Schema.deleteMany({
                _id:{
                    $in:req.body?.data
                }
            })
            if(!deleteSelected){
                return res.status(200).send({message:"enquiry delete failed",status:false})
            }
        return res.status(200).send({message:"enquiry delete success",status:true})
 
        }
        
       
        
        res.status(200).send({message:"enquiry delete failed",status:false})

    
  
    } catch (err) {
        console.log(err)
        res.status(200).send({message:"enquiry delete failed",status:false})
    }
}


exports.getAllEnquires = getAllEnquires;
exports.deleteEnquiry = deleteEnquiry;