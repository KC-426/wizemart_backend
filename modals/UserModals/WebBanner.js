const mongoose = require("mongoose")
const Webbanners_Schema = new mongoose.Schema(
    {
        image_name:{type:String},
        image_url:{type:String},
        path:{type:String},

    },{timestamps:true}
)

module.exports = mongoose.model("Webbanners",Webbanners_Schema)