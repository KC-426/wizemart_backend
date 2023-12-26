const express = require("express")
const app = express()
require("dotenv").config()
const cookieparser = require("cookie-parser")
const morgan = require("morgan")
const cors = require("cors")
const mongoose = require("mongoose")
const port  = process.env.PORT || 5000;
const BASE_URL = ["http://localhost:3000",]    //   https://demo.blackhatcode.in


// ========= Dashboard Routes ===========
const Details_Routes = require("./routes/users_routes/details_routes")
const Banners_Routes = require("./routes/users_routes/banners_routes")
const Category_Routes = require("./routes/users_routes/category_routes")
const Enquiry_Routes = require("./routes/users_routes/enquiry_routes")
const Orders_Routes = require("./routes/users_routes/order_routes")
const Customers_Routes = require("./routes/users_routes/customers_routes")
const Products_Routes = require("./routes/users_routes/products_routes")
const Otp_Routes = require("./routes/otp_routes")
// ========= Dashboard Routes ===========

// ========= App Routes ===========
const App_All_Routes = require("./routes/app_routes/app_all_routes");
// ========= App Routes ===========

// ========= Web Routes ===========
const Web_Banners_Routes = require("./routes/web_routes/banners_routes");
const Web_Brands_Routes = require("./routes/web_routes/brands_routes");
const Web_Category_Routes = require("./routes/web_routes/category_routes");
const Web_Orders_Routes = require("./routes/web_routes/order_routes");
const Web_Products_Routes = require("./routes/web_routes/products_routes");
const Web_Users_Routes = require("./routes/web_routes/user_routes");
const Web_Webbanner_Routes = require("./routes/web_routes/Webbanner_routes");
const Web_Wholesale_Enquiry_Routes = require("./routes/web_routes/wholesale_enquiry_routes");
// ========= Web Routes ===========

// app.use(cors({
//     origin:BASE_URL,
//     credentials:true
// }))
app.use(cors({
    origin:true,
    credentials:true
}))

app.use(cookieparser())
app.use(express.json())
app.use(morgan("dev"))
// app.use(express.urlencoded({extended: false}));


// ============ DASHBOARD ROUTES ===========
app.use("/api",Details_Routes)
app.use("/api",Banners_Routes)
app.use("/api",Category_Routes)
app.use("/api",Enquiry_Routes)
app.use("/api",Orders_Routes)
app.use("/api",Customers_Routes)
app.use("/api",Products_Routes)
app.use("/api",Otp_Routes)
// ============ DASHBOARD ROUTES ===========

// ============ APP ROUTES ===========
app.use("/api",App_All_Routes)
// ============ APP ROUTES ===========

// =========== WEB ROUTES ============
app.use("/api/website/front",Web_Banners_Routes)
app.use("/api/website/front",Web_Brands_Routes)
app.use("/api/website/front",Web_Category_Routes)
app.use("/api/website/front",Web_Orders_Routes)
app.use("/api/website/front",Web_Products_Routes)
app.use("/api/website/front",Web_Users_Routes)
app.use("/api/website/front",Web_Webbanner_Routes)
app.use("/api/website/front",Web_Wholesale_Enquiry_Routes)
// =========== WEB ROUTES ============



app.use("/",(req,res)=>{
    console.log("Working ")
    res.send("Not Found!!")
})

app.listen(port,()=>{
    console.log("Server is Listen on ",port)
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("Mongodb connected !!")
    })
    .catch((err)=>{console.log(err,"Not connected to Mongodb !!")})

})
