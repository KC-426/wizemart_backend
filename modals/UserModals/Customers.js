const mongoose = require("mongoose")
const Customers_Schema = new mongoose.Schema(
    {
        user_id:{
            type:String,
            required:true
        },
        // firstname:{
        //     type:String,
        //     required:true,
        // },
        // lastname:{
        //     type:String,
        // },
        username:{
            type:String,
        },
        // profile:{
        //     image_name:{type:String},
        //     image_url:{type:String},
        //     path:{type:String}
        // },
        email:{
            type:String,
            // required:true,
            // unqiue:true
        },
        user_business:{
            type:String,
        //    default:'n/f'
        },
        // password:{
        //     type:String,
        //     required:true
        // },
        phone_number:{
            type:Number,
            required:true,
            unqiue:true
        },
        // user_type:{
        //     type:String,
        //     required:true
        // },
        orders:{
            type:Number,
            required:true,
            default:0
        },
        transport_detail:{
            type:String,
            // default:'n/a'
        },
        joining_date:{
            type:Date,
            required:true
        },
        // location:{
        //     type:String,
        //     required:true
        // },
        gst_number: { type: String },
        pincode: { type: Number },
        state: { type: String },
        country: { type: String },
        address: { type: String },
        shipping_address:{
            name:{type:String},
            phone_number: { type: Number },
            email: { type: String},
            pincode: { type: Number},
            state: { type: String},
            address: { type: String},
              },

    },{timestamps:true}
)

module.exports = mongoose.model("Customers",Customers_Schema)