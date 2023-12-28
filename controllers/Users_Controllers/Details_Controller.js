const Utils = require("../../utils/Utils");
const axios = require("axios");
const Details_Schema = require("../../modals/UserModals/Details");
const Orders_Schema = require("../../modals/UserModals/Orders");
const Customers_Schema = require("../../modals/UserModals/Customers");

// creating new user
const createUser = async (req, res) => {
  const { name, email, password, user_type } = req.body;
  try {
    const findUser = await Details_Schema.findOne({ email: email });
    if (findUser) {
      return res.send("User Already Exists !!");
    }
    const hashedPassword = await Utils.Hashing_Password(password);
    const create = new Details_Schema({
      name: name?.toLowerCase(),
      email: email,
      phone_number: req.body?.phone_number,
      password: hashedPassword,
      user_type: user_type?.toLowerCase(),
      plan: req.body?.plan?.toLowerCase(),
      app_link: req.body?.app_link,
      whatsapp_link: req.body?.whatsapp_link,
      product_limit: req.body?.product_limit,
      banner_limit: req.body?.banner_limit,
      delivery_charges: req.body?.delivery_charges,
      cash_on_delivery: req.body?.cash_on_delivery,
      razorpay_key_id: req.body?.razorpay_key_id,
      razorpay_key_secret: req.body?.razorpay_key_secret,
      term_and_condition: req.body?.term_and_condition,
      privacy_policy: req.body?.privacy_policy,
      aboutus: req.body?.aboutus,
    });
    const result = await create.save();
    res
      .status(200)
      .send({ result: result, message: "created user successfully !!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("email,password", email, password);
  try {
    const findUser = await Details_Schema.findOne({ email: email });
    if (!findUser) {
      return res.send({
        status: "fail",
        message: "Invalid email or password !!",
      });
    }
    let isValidPassword = false;
    if (findUser) {
      try {
        isValidPassword = await Utils.compare_Password(
          password,
          findUser.password
        );
      } catch (err) {
        console.log(err);
        res.send("Something went wrong !!");
      }
      if (!isValidPassword) {
        return res.send({
          status: false,
          message: "Invalid email or password !!",
        });
      }
      if (isValidPassword) {
        const token = await Utils.create_Jwt(
          { id: findUser._id, user_type: findUser.user_type },
          process.env.JWT_TOKEN_SECRET
        );

        //10 * 365 * 24 * 60 * 60 * 1000 === 315360000000, or 10 years in milliseconds
        let expiryDate = new Date(Number(new Date()) + 315360000000);
        res.cookie("session_id", token, {
          httpOnly: true,
          // maxAge: 24 * 60 * 60 * 1000, //1 hrs
          maxAge: expiryDate,
          sameSite: "none",
          secure: true,
        });
        return res
          .status(200)
          .send({ status: true, message: "Logged in Success !!" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// logout user
const logoutUser = async (req, res) => {
  res.cookie("session_id", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.status(200).send("Logout Success !!");
};

//getting all users
const getAllUser = async (req, res) => {
  try {
    const alluser = await Details_Schema.find({}, "-password");
    res.status(200).json(alluser);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// get user by id (who's logged in)
const getUserById = async (req, res) => {
  try {
    const cookie = req.cookies["session_id"];
    if (!cookie) {
      return res.send({ status: false, message: "Unauthenticated !!" });
    }
    const verifyJwt = await Utils.verifying_Jwt(
      cookie,
      process.env.JWT_TOKEN_SECRET
    );
    if (!verifyJwt) {
      return res.send({ status: false, message: "Unauthenticated !!" });
    }

    // const stopUsageForRenew = await Details_Schema.findById(verifyJwt.id).select("plan_details")
    // console.log("stopUsageForRenew=>>",stopUsageForRenew)

    const findUser = await Details_Schema.findById(
      verifyJwt.id,
      "-password -delivery_charges -cash_on_delivery -razorpay_key_id -razorpay_key_secret"
    );
    if (!findUser) {
      return res.send({ status: false, message: "Unauthenticated !!" });
    }
    res.status(200).send({ status: true, result: findUser });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: false, message: "Unauthenticated !!" });
  }
};

// edit admin by id
const editAdminByID = async (req, res) => {
  const adminId = req.params.admin_id;
  try {
    if (!adminId) {
      return res.send("please provide a admin id");
    }
    if (req.body.password) {
      const hashedNewPassword = await Utils.Hashing_Password(req.body.password);
      const find = await Details_Schema.findByIdAndUpdate(adminId, {
        password: hashedNewPassword,
      });
      if (!find) {
        return res.send("admin not found");
      }
      return res.status(200).send("Password Updated success");
    }
    const findUser = await Details_Schema.findByIdAndUpdate(adminId, {
      $set: req.body,
    });
    if (!findUser) {
      return res.send("admin not found");
    }
    res.status(200).send("admin updated successfully !!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// edit admin delivery and payments details by id
const editAdminDeliveryAndPaymentDetails = async (req, res) => {
  const appId = req.params.app_id;
  console.log(req.body);
  try {
    if (!appId) {
      return res.send({ status: false, message: "please provide a admin id" });
    }
    const findUser = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      { $set: req.body }
    );
    if (!findUser) {
      return res.send({ status: false, message: "admin not found" });
    }
    res
      .status(200)
      .send({ status: true, message: "admin updated successfully !!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};
// edit admin by id
const getAdminDeliveryAndPaymentDetails = async (req, res) => {
  const appid = req.params.app_id;
  console.log("admin_id", appid);
  try {
    if (!appid) {
      return res.send({ status: false, message: "please provide a app id" });
    }
    const findUser = await Details_Schema.findOne({ app_id: appid }).select(
      "delivery_charges cash_on_delivery razorpay_key_id razorpay_key_secret"
    );
    console.log("findUser", findUser);
    res.status(200).send({ status: true, data: findUser });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// edit inovice details
const editAdminInvoiceDetails = async (req, res) => {
  const appId = req.params.app_id;
  console.log(req.body);
  try {
    if (!appId) {
      return res.send({ status: false, message: "not found" });
    }
    const invoiceDetail = {
      company_name: req.body?.company_name?.toLowerCase(),
      company_address: req.body?.company_address?.toLowerCase(),
      company_zipcode: req.body?.company_zipcode?.toLowerCase(),
      company_state: req.body?.company_state?.toLowerCase(),
      company_phone_number: req.body?.company_phone_number,
    };
    const findUser = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      { $set: { invoice_details: invoiceDetail } }
    );
    if (!findUser) {
      return res
        .status(404)
        .send({ status: false, message: "admin not found" });
    }
    res
      .status(200)
      .send({
        status: true,
        message: "invocie details updated successfully !!",
      });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// get invoice details
const getInvoiceDetails = async (req, res) => {
  const appId = req.params?.app_id;
  try {
    if (!appId) {
      return res.send({ status: false, message: "not found" });
    }
    const findDetails = await Details_Schema.findOne({ app_id: appId }).select(
      "invoice_details"
    );
    if (!findDetails)
      return res.status(404).send({ status: false, message: "not found" });
    res
      .status(200)
      .send({ status: true, details: findDetails, message: "success!!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// social media linking for app
const editAdminSocialMediaDetails = async (req, res) => {
  const appId = req.params.app_id;
  console.log(req.body);
  try {
    if (!appId) {
      return res.send({ status: false, message: "not found" });
    }
    const findUser = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      {
        $set: {
          whatsapp_link: req.body?.whatsapp_link?.trim(),
          facebook_link: req.body?.facebook_link?.trim(),
          instagram_link: req.body?.instagram_link?.trim(),
          linkedin_link: req.body?.linkedin_link?.trim(),
          twitter_link: req.body?.twitter_link?.trim(),
          telegram_link: req.body?.telegram_link?.trim(),
          youtube_link: req.body?.youtube_link?.trim(),
        },
      }
    );
    if (!findUser) {
      return res
        .status(404)
        .send({ status: false, message: "admin not found" });
    }
    res
      .status(200)
      .send({
        status: true,
        message: "social media links updated successfully !!",
      });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// get Social Media Details
const getSocialMediaDetails = async (req, res) => {
  const appId = req.params?.app_id;
  try {
    if (!appId) {
      return res.send({ status: false, message: "not found" });
    }
    const findDetails = await Details_Schema.findOne({ app_id: appId }).select(
      "whatsapp_link facebook_link instagram_link linkedin_link twitter_link telegram_link youtube_link"
    );
    if (!findDetails)
      return res.status(404).send({ status: false, message: "not found" });
    res
      .status(200)
      .send({ status: true, details: findDetails, message: "success!!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// edit about phone details
const editAdminAboutPhoneDetails = async (req, res) => {
  const appId = req.params.app_id;
  console.log('start', req.body);
  try {
    if (!appId) {
      return res.send({ status: false, message: "not found" });
    }
    const findUser = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      {
        $set: {
          aboutus: req.body?.aboutus?.toLowerCase()?.trim(),
          privacy_policy: req.body?.privacy_policy?.toLowerCase()?.trim(),
          term_and_condition: req.body?.term_and_condition
            ?.toLowerCase()
            ?.trim(),
          email: req.body?.email?.toLowerCase()?.trim(),
          phone_number: req.body?.phone_number,
          app_link: req.body?.app_link?.trim(),
          whatsapp_link: req.body?.whatsapp_link?.trim(),
        },
      }
    );
    if (!findUser) {
      return res
        .status(404)
        .send({ status: false, message: "admin not found" });
    }
    res
      .status(200)
      .send({ status: true, message: "about phone updated successfully !!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// get  About Phone Details
const getAboutPhoneDetails = async (req, res) => {
  const appId = req.params?.app_id;
  try {
    if (!appId) {
      return res.send({ status: false, message: "not found" });
    }
    const findDetails = await Details_Schema.findOne({ app_id: appId }).select(
      "phone_number app_link whatsapp_link aboutus term_and_condition privacy_policy email"
    );
    if (!findDetails)
      return res.status(404).send({ status: false, message: "not found" });
    res
      .status(200)
      .send({ status: true, details: findDetails, message: "success!!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// edit AppSigning details
const editAdminAppSigningDetails = async (req, res) => {
  const appId = req.params.app_id;
  console.log(req.body);
  try {
    if (!appId) {
      return res.send({ status: false, message: "not found" });
    }
    const findUser = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      { $set: { app_signing: req.body } }
    );
    if (!findUser) {
      return res
        .status(404)
        .send({ status: false, message: "admin not found" });
    }

    res
      .status(200)
      .send({ status: true, message: "app signing updated successfully !!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// get  About App Signing details
const getAppSigningDetails = async (req, res) => {
  const appId = req.params?.app_id;
  try {
    if (!appId) {
      return res.send({ status: false, message: "not found" });
    }
    const findDetails = await Details_Schema.findOne({ app_id: appId }).select(
      "app_signing"
    );
    if (!findDetails)
      return res.status(404).send({ status: false, message: "not found" });
    res
      .status(200)
      .send({ status: true, details: findDetails, message: "success!!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// get New Order Count For Left Side bar
const getNewOrderCountSideBar = async (req, res) => {
  try {
    const endDate = await Utils.getDateXDaysAgo(1);
    const cuurentDate = await Utils.getDateXDaysAgo(0);
    // seconds * minutes * hours * milliseconds = 1 day
    // const dayTime = 60 * 60 * 24 * 1000;
    // let increaseEndDateByOne = new Date(endDate);
    const getNewOrder = await Orders_Schema.find({
      //query today up to tonight
      createdAt: {
        $gt: new Date(endDate),
        $lt: new Date(cuurentDate),
      },
    }).count();
    // console.log("getNewOrder==>",getNewOrder,"endDate-->",endDate,"cuurentDate-->",cuurentDate);
    res
      .status(200)
      .send({
        status: true,
        new_order_count: getNewOrder,
        message: "success!!",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// get details for frontend dashboard
const getdashboardDetails = async (req, res) => {
  try {
    // get all customers count
    const getCustomerCount = await Customers_Schema.find({}).count();
    // get total orders count
    const getTotalOrderCount = await Orders_Schema.find({}).count();
    //===== get total sales with delivery charges ======
    const getTotalOrderSale = await Orders_Schema.aggregate([
      {
        $group: {
          _id: null,
          total_sales: { $sum: { $toInt: "$order_total" } },
        },
      },
    ]);
    const getTotalOrderDeliveryCharge = await Orders_Schema.aggregate([
      {
        $group: {
          _id: null,
          total_sales: { $sum: "$delivery_charges" },
        },
      },
    ]);

    const getTotalSales =
      getTotalOrderSale[0]?.total_sales +
      getTotalOrderDeliveryCharge[0]?.total_sales;
    //===== get total sales with delivery charges ======
    const endDate = await Utils.getDateXDaysAgo(1);
    const cuurentDate = await Utils.getDateXDaysAgo(0);
    // seconds * minutes * hours * milliseconds = 1 day
    // const dayTime = 60 * 60 * 24 * 1000;
    // let increaseEndDateByOne = new Date(endDate);
    const getNewOrder = await Orders_Schema.find({
      //query today up to tonight
      createdAt: {
        $gt: new Date(endDate),
        $lt: new Date(cuurentDate),
      },
    }).count();
    // console.log("getTotalSales==>",getTotalOrderSale , "wahashdaskdh==>",getTotalOrderDeliveryCharge);
    // console.log("getTotalSales==>",getTotalOrderSale , "wahashdaskdh==>",getTotalOrderDeliveryCharge);
    // console.log("getNewOrder==>",getNewOrder,"endDate-->",endDate,"cuurentDate-->",cuurentDate);
    res
      .status(200)
      .send({
        status: true,
        customers_count: getCustomerCount,
        new_order_count: getNewOrder,
        total_orders_count: getTotalOrderCount,
        total_sales: getTotalSales,
        message: "success!!",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// get dashboard active user graph details
const getActiveUsersGraphDetail = async (req, res) => {
  try {
    // get weakly active user detail
    const endDate = await Utils.getDateXDaysAgo(7);
    const curentDate = await Utils.getDateXDaysAgo(0); // "2022-06-17"
    // console.log("date----->",date)
    // const getActiveUsers = await Customers_Schema.aggregate([{$group:{_id: {joining_date:{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }}}}])
    const getActiveUsers = await Customers_Schema.aggregate([
      // { $match: { $or: [ { joining_date: { $gt: new Date(endDate), $lt: new Date(curentDate) } }, ] } },
      { $group: { _id: "$joining_date", count: { $sum: 1 } } },
      {
        $match: { _id: { $gt: new Date(endDate), $lt: new Date(curentDate) } },
      },
      { $sort: { _id: 1 } },
    ]);
    // console.log("getActiveUsers=>>>>>>>>",getActiveUsers)
    res
      .status(200)
      .send({
        status: true,
        active_users: getActiveUsers,
        message: "success!!",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// get dashboard graph sales over time
const getTotalSalesGraphDetails = async (req, res) => {
  const { date_from, date_to } = req.query;
  let result;
  let count;
  try {
    // get weakly active user detail
    const endDate = await Utils.getDateXDaysAgo(7);
    const curentDate = await Utils.getDateXDaysAgo(0); // "2022-06-17"
    result = await Orders_Schema.aggregate([
      {
        $match: {
          createdAt: {
            $lte: curentDate,
            $gte: endDate,
          },
        },
      },
      { $project: { createdAt: 1, order_total: 1, delivery_charges: 1 } },
      { $sort: { createdAt: 1 } },
    ]);
    // count = await Orders_Schema.aggregate([{
    //             $match:{
    //             createdAt:{
    //                 $lte:Utils.convertDate(increaseEndDateByOne),
    //                 $gte:Utils.convertDate(date_from)
    //             }
    //         },
    //     },{$count:'order_count'}],)
    // console.log("RESULT NEW----",result)
    res
      .status(200)
      .send({ status: 200, total_sale: result, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// get all custom sizes and weights
const getAllCustomSizeAndWeight = async (req, res) => {
  const appId = req.params?.app_id;
  console.log(appId);
  try {
    // if(!appId) return res.status(404).send({status:false,message:'unauthenticated!!'})
    // const findUser = await Details_Schema.findOne({app_id:appId})
    const findUser = await Details_Schema.findOne({ user_type: "admin" });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findAll = await Details_Schema.findOne({ user_type: "admin" }).select(
      "custom_size custom_weight"
    );
    res
      .status(200)
      .send({
        status: true,
        custom_size_and_weight: findAll,
        message: "success!!",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

//  add Custom sizes for product upload
const addCustomSize = async (req, res) => {
  const appId = req.params?.app_id;
  // console.log(req.body,appId)
  try {
    // if(!appId) return res.status(404).send({status:false,message:'unauthenticated!!'})
    // const findUser = await Details_Schema.findOne({app_id:appId})
    const findUser = await Details_Schema.findOne({ user_type: "admin" });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const updateSize = await Details_Schema.findOneAndUpdate(
      { user_type: "admin" },
      {
        $push: { custom_size: req.body?.size },
      }
    );
    // const updateSize = await Details_Schema.findOneAndUpdate({app_id:appId},
    //         {
    //             $push:{custom_size:req.body?.size}
    //         }
    //     )
    res.status(200).send({ status: true, message: "size add success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};
//  add Custom sizes for product upload
const addCustomWeight = async (req, res) => {
  const appId = req.params?.app_id;
  console.log(req.body, appId);
  try {
    // if(!appId) return res.status(404).send({status:false,message:'unauthenticated!!'})
    // const findUser = await Details_Schema.findOne({app_id:appId})
    const findUser = await Details_Schema.findOne({ user_type: "admin" });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const updateWeight = await Details_Schema.findOneAndUpdate(
      { user_type: "admin" },
      {
        $push: { custom_weight: req.body?.weight },
      }
    );
    // const updateWeight = await Details_Schema.findOneAndUpdate({app_id:appId},
    //         {
    //             $push:{custom_weight:req.body?.weight}
    //         }
    //     )
    res.status(200).send({ status: true, message: "size add success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// Send PUSH NOTIFICATION to app user
const sendPushNotification = async (req, res) => {
  const { notification_title, notification_message } = req?.body;
  const { app_id } = req?.params;
  console.log("req?.body;", req?.body);
  try {
    if (!app_id)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    if (!notification_title || !notification_message)
      return res
        .status(203)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: app_id });
    if (!findUser)
      return res
        .status(203)
        .send({ status: false, message: "unauthenticated!!" });
    let config = {
      method: "post",
      url: "https://fcm.googleapis.com/fcm/send",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "key=AAAAC3NuVPo:APA91bFdnTUWPoQYIhco-Cq_6FIa9V5WgnUgFL4Ev9SsPn4OKOUeefCG40oycuf85G_ZVFMoWfyJbQP84AxbLdjZlbdis-gnH0hYE2LNAeZcABAUTwkTjpEgEx-bptpj1aY0qprALiZj",
      },
      data: {
        data: {},
        to: `/topics/${app_id}`,
        notification: {
          title: notification_title,
          body: notification_message,
        },
      },
    };

    await axios(config)
      .then((res) => {
        console.log("success=>", res);
      })
      .catch((err) => {
        console.log("error=>", err);
      });

    res.status(200).send({ status: true, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send(strings.SomethingWentWrong);
  }
};

// -=----------- Plugins controllers -------------------

// get all plugins details
const getAllPluginsDetails = async (req, res) => {
  const appId = req.params.app_id;
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findAll = await Details_Schema.findOne({ app_id: appId }).select(
      "shiprocket_plugin razorpay_is_installed razorpay_key_secret razorpay_key_id "
    );
    res
      .status(200)
      .send({ status: true, all_plugins: findAll, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// activate shiprocket plugin
const activateAndDeactiveShiprocket = async (req, res) => {
  const appId = req.params.app_id;
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const updateDetail = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      {
        $set: {
          shiprocket_plugin: req.body?.plugin_detail,
        },
      }
    );
    res.status(200).send({ status: true, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// get shiprocket plugin details
const getShiprocketDetail = async (req, res) => {
  const appId = req.params.app_id;
  console.log("findUser", appId);
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    console.log("findUser", findUser);
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findAll = await Details_Schema.findOne({ app_id: appId }).select(
      "shiprocket_plugin"
    );
    res
      .status(200)
      .send({ status: true, plugin_details: findAll, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// edit shiprocket plugin details
const updateShiprocketDetail = async (req, res) => {
  const appId = req.params.app_id;
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const updateDetail = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      {
        $set: {
          shiprocket_plugin: req.body?.plugin_detail,
        },
      }
    );
    res.status(200).send({ status: true, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// activate razorpay plugin
const activateAndDeactiveRazorpay = async (req, res) => {
  const appId = req.params.app_id;
  console.log("req.body, RAZORPAY", req.body);
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const updateDetail = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      {
        $set: {
          razorpay_is_installed: req.body?.razorpay_is_installed,
          razorpay_key_id: req.body?.razorpay_key_id,
          razorpay_key_secret: req.body?.razorpay_key_secret,
          adiogent_pay: { is_installed: false },
        },
      }
    );
    res.status(200).send({ status: true, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// get razorpay plugin details
const getRazorpayDetail = async (req, res) => {
  const appId = req.params.app_id;
  console.log("findUser", appId);
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    console.log("findUser", findUser);
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });

        
    const findAll = await Details_Schema.findOne({ app_id: appId }).select(
      "razorpay_is_installed razorpay_key_id razorpay_key_secret"
    );
    res
      .status(200)
      .send({ status: true, plugin_details: findAll, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// edit razorpay plugin details
const updateRazorpayDetail = async (req, res) => {
  const appId = req.params.app_id;
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const updateDetail = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      {
        $set: {
          razorpay_key_id: req.body?.razorpay_key_id,
          razorpay_key_secret: req.body?.razorpay_key_secret,
        },
      }
    );
    res.status(200).send({ status: true, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// ------------ Plugins controllers -------------------

// =================== ADIOOGENT PAY =====================

// activate Adiogent pay
const activateAndDeactiveAdiogentPay = async (req, res) => {
  const appId = req.params.app_id;
  console.log("req.body?.adiogentpay_detail,", req.body?.adiogentpay_detail);
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const updateDetail = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      {
        $set: {
          adiogent_pay: req.body?.adiogentpay_detail,
          razorpay_is_installed: false,
        },
      }
    );
    res.status(200).send({ status: true, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// get adiogent pay details
const getAdiogentPayDetail = async (req, res) => {
  const appId = req.params.app_id;
  console.log("findUser", appId);
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    console.log("findUser", findUser);
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findAll = await Details_Schema.findOne({ app_id: appId }).select(
      "adiogent_pay"
    );
    res
      .status(200)
      .send({
        status: true,
        adiogent_pay_detail: findAll,
        message: "success!!",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

// edit adiogent pay details
const updateAdiogentpayDetail = async (req, res) => {
  const appId = req.params.app_id;
  try {
    if (!appId)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const findUser = await Details_Schema.findOne({ app_id: appId });
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "unauthenticated!!" });
    const updateDetail = await Details_Schema.findOneAndUpdate(
      { app_id: appId },
      {
        $set: {
          adiogent_pay: req.body?.adiogentpay_detail,
          razorpay_is_installed: false,
        },
      }
    );
    res.status(200).send({ status: true, message: "success!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};
// =================== ADIOOGENT PAY =====================

//=================== ABOUT THE APP=======================

const getAboutApp = async (req, res) => {
    // const appId = req?.params?.appId;
    try {
    //   if (!appId) {
    //     return res.send({ status: false, message: "no id found" });
    //   }
  
      const findApp = await Details_Schema.find().select(
        "phone_number app_link aboutus term_and_condition privacy_policy email"
      );
  
      if (!findApp) {
        return res
          .status(404)
          .send({ status: false, message: "No details found !!" });
      }
  
      res
        .status(200)
        .send({ status: true, details: findApp[0], message: "success!!" });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error !!");
    }
  };
  

exports.getAllUser = getAllUser;
exports.getUserById = getUserById;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
exports.createUser = createUser;
exports.editAdminByID = editAdminByID;
exports.editAdminDeliveryAndPaymentDetails = editAdminDeliveryAndPaymentDetails;
exports.getAdminDeliveryAndPaymentDetails = getAdminDeliveryAndPaymentDetails;
exports.editAdminInvoiceDetails = editAdminInvoiceDetails;
exports.editAdminSocialMediaDetails = editAdminSocialMediaDetails;
exports.getSocialMediaDetails = getSocialMediaDetails;
exports.editAdminAboutPhoneDetails = editAdminAboutPhoneDetails;
exports.getAboutPhoneDetails = getAboutPhoneDetails;
exports.getInvoiceDetails = getInvoiceDetails;
exports.editAdminAppSigningDetails = editAdminAppSigningDetails;
exports.getAppSigningDetails = getAppSigningDetails;
exports.getdashboardDetails = getdashboardDetails;
exports.getNewOrderCountSideBar = getNewOrderCountSideBar;
exports.getActiveUsersGraphDetail = getActiveUsersGraphDetail;
exports.getTotalSalesGraphDetails = getTotalSalesGraphDetails;
exports.addCustomSize = addCustomSize;
exports.addCustomWeight = addCustomWeight;
exports.getAllCustomSizeAndWeight = getAllCustomSizeAndWeight;
exports.sendPushNotification = sendPushNotification;

// adiogent pay
exports.getAdiogentPayDetail = getAdiogentPayDetail;
exports.updateAdiogentpayDetail = updateAdiogentpayDetail;
exports.activateAndDeactiveAdiogentPay = activateAndDeactiveAdiogentPay;

// plugins
exports.getAllPluginsDetails = getAllPluginsDetails;
// shiprocket plugin
exports.activateAndDeactiveShiprocket = activateAndDeactiveShiprocket;
exports.getShiprocketDetail = getShiprocketDetail;
exports.updateShiprocketDetail = updateShiprocketDetail;
// razorpay plugin
exports.activateAndDeactiveRazorpay = activateAndDeactiveRazorpay;
exports.getRazorpayDetail = getRazorpayDetail;
exports.updateRazorpayDetail = updateRazorpayDetail;
// get about the app
exports.getAboutApp = getAboutApp;
