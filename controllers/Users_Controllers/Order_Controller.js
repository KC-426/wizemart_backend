const Orders_Schema = require("../../modals/UserModals/Orders");
const Customers_Schema = require("../../modals/UserModals/Customers");
const Products_Schema = require("../../modals/UserModals/Products");
const Utils = require("../../utils/Utils");
const order_status = require("../../utils/configs/order_status");
const { v4: uuidv4 } = require("uuid");
const generateOrderId = require("order-id")("key");
const verifyRazerPay = require("../../utils/razorPay");
const Razorpay = require("razorpay");
// create new order
const createNewOrder = async (req, res) => {
  console.log(req.body.products);
  try {
    // console.log("order_00"+(getOrdersCount+1))
    // const ordersCustomId = "order_00"+(getOrdersCount+1)
    // const getOrderId = uuidv4();
    const getOrderId = "order-" + generateOrderId.generate();

    console.log(getOrderId);
    const create = new Orders_Schema({
      order_id: getOrderId,
      customer_phone_number: req.body.customer_phone_number,
      customer_id: req.body.customer_id,
      customer_name: req.body.customer_name?.toLowerCase(),
      customer_email: req.body.customer_email?.toLowerCase(),
      order_status: "pending",
      products: req.body.products,
      shipping_address: req.body.shipping_address,
      state: req.body?.state,
      pincode: req.body?.pincode,
      customer_gst: req.body?.customer_gst,
      customer_business: req.body?.customer_business,
    });
    const result = await create.save();
    res.status(200).send({
      status: true,
      message: "order created successfully !!",
      result: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// get all orders
const getAllOrders = async (req, res) => {
  const { by_status, date_from, date_to, recentDays } = req.query;
  const searchValue = req.query.search;
  const searchRegex = Utils.createRegex(searchValue);
  const limit = req.query.limit || 25;
  const page = req.query.page;
  let result;
  let count;
  try {
    // ========== FILTER BY ORDER STATUS / FILTER BY RECENT ORDERS =============
    // console.log("date====",Utils.convertDate(date_from),"-----",Utils.convertDate(date_to))
    const endDate = new Date(`${date_to}`);
    // seconds * minutes * hours * milliseconds = 1 day
    const dayTime = 60 * 60 * 24 * 1000;
    let increaseEndDateByOne = new Date(endDate.getTime() + dayTime);
    // console.log("INCREASED DATE",increaseEndDateByOne)

    // filter orders by todays date and by their status

    if (date_from && date_to && by_status) {
      if (by_status != "all") {
        //  user_status = by_status == 'verified' ? true : false
        result = await Orders_Schema.aggregate([
          {
            $match: {
              order_status: by_status,
              createdAt: {
                $lte: Utils.convertDate(increaseEndDateByOne),
                $gte: Utils.convertDate(date_from),
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ]);
        count = await Orders_Schema.aggregate([
          {
            $match: {
              order_status: by_status,
              createdAt: {
                $lte: Utils.convertDate(increaseEndDateByOne),
                $gte: Utils.convertDate(date_from),
              },
            },
          },
          { $count: "order_count" },
        ]);
        // console.log("RESULT NEW----",result)
        return res.status(200).send({
          allOrders: result,
          pages: Math.ceil(count[0]?.order_count / limit),
          ordersCount: count[0]?.order_count,
          order_status: order_status,
        });
      }
    } else {
      result = await Orders_Schema.find({ order_status: by_status }).sort({
        createdAt: -1,
      });
      // return res.status(200).send(result)
    }

    if (date_from && date_to) {
      result = await Orders_Schema.aggregate([
        {
          $match: {
            createdAt: {
              $lte: Utils.convertDate(increaseEndDateByOne),
              $gte: Utils.convertDate(date_from),
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]);
      count = await Orders_Schema.aggregate([
        {
          $match: {
            createdAt: {
              $lte: Utils.convertDate(increaseEndDateByOne),
              $gte: Utils.convertDate(date_from),
            },
          },
        },
        { $count: "order_count" },
      ]);
      // console.log("RESULT NEW----",result)
      return res.status(200).send({
        allOrders: result,
        pages: Math.ceil(count[0]?.order_count / limit),
        ordersCount: count[0]?.order_count,
        order_status: order_status,
      });
    }
    if (by_status != "all") {
      // let user_status = by_status === 'verified' ? true : false
      result = await Orders_Schema.find({ order_status: by_status })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);
      count = await Orders_Schema.find({ order_status: by_status }).count();
      // console.log("RESULT NEW----",result)

      return res.status(200).send({
        allOrders: result,
        pages: Math.ceil(count / limit),
        ordersCount: count,
        order_status: order_status,
      });
    }

    // ========== FILTER BY ORDER STATUS / FILTER BY RECENT ORDERS =============

    // ========= SEARCH IN ORDERS ========
    if (searchValue) {
      result = await Orders_Schema.find({ order_id: { $regex: searchRegex } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);
      count = await Orders_Schema.find({
        order_id: { $regex: searchRegex },
      }).count();

      if (!result.length > 0) {
        result = await Orders_Schema.find({
          customer_name: { $regex: searchRegex },
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip((page - 1) * limit);
        count = await Orders_Schema.find({
          customer_name: { $regex: searchRegex },
        }).count();
      }
      const numberField = parseInt(searchValue);
      // console.log(numberField)
      if (numberField) {
        // console.log(numberField)
        result = await Orders_Schema.find({
          customer_phone_number: numberField,
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip((page - 1) * limit);
        count = await Orders_Schema.find({
          customer_phone_number: numberField,
        }).count();

        return res.status(200).send({
          allOrders: result,
          pages: Math.ceil(count / limit),
          ordersCount: count,
          order_status: order_status,
        });
      }
      return res.status(200).send({
        allOrders: result,
        pages: Math.ceil(count / limit),
        ordersCount: count,
        order_status: order_status,
      });
    }
    // ========= SEARCH IN ORDERS ========

    // ======= ALL ORDERS ===========
    result = await Orders_Schema.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    count = await Orders_Schema.find({}).count();
    res.status(200).send({
      allOrders: result,
      pages: Math.ceil(count / limit),
      ordersCount: count,
      order_status: order_status,
    });
    // ======= ALL ORDERS ===========
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

// GET ORDER BY ID
const getOrderById = async (req, res) => {
  const orderId = req.params.order_id;
  try {
    if (!orderId) {
      return res
        .status(404)
        .send({ status: 404, message: "order not found !!" });
    }
    const findOrder = await Orders_Schema.findById(orderId);
    if (!findOrder) {
      return res
        .status(404)
        .send({ status: 404, message: "order not found !!" });
    }
    res
      .status(200)
      .send({ status: true, result: findOrder, order_status: order_status });
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

// CHNAGE ORDER STATUS
const updateOrders = async (req, res) => {
  const orderId = req.params.order_id;
  try {
    if (!orderId) {
      return res
        .status(404)
        .send({ status: false, message: "order updation failed !!" });
    }
    const updateOrder = await Orders_Schema.findByIdAndUpdate(orderId, {
      $set: req.body,
    });
    res.status(200).send({ status: true, message: "order updated success !!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

// DELETE ORDER's
const deleteOrders = async (req, res) => {
  // console.log(req.body)
  try {
    if (req.body?.data?.length) {
      const deleteSelected = await Orders_Schema.deleteMany({
        _id: {
          $in: req.body?.data,
        },
      });
      // console.log('deleteSelected->',deleteSelected)
      if (!deleteSelected) {
        return res
          .status(200)
          .send({ message: "order delete failed", status: false });
      }
      return res
        .status(200)
        .send({ message: "order delete success", status: true });
    }

    res.status(200).send({ message: "order delete failed", status: false });
  } catch (err) {
    console.log(err);
    res.status(200).send({ message: "order delete failed", status: false });
  }
};

// search in orders table
const searchInOrders = async (req, res) => {
  const searchValue = req.query.search;
  const searchRegex = Utils.createRegex(searchValue);
  let result;
  // console.log("SEARCH===",searchValue)
  try {
    result = await Orders_Schema.find({
      order_id: { $regex: searchRegex },
    }).sort({ createdAt: -1 });
    if (!result.length > 0) {
      result = await Orders_Schema.find({
        customer_name: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }
    const numberField = parseInt(searchValue);
    // console.log(numberField)
    if (numberField) {
      // console.log(numberField)
      result = await Orders_Schema.find({
        customer_phone_number: numberField,
      }).sort({ createdAt: -1 });
      return res.status(200).send(result);
    }
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

// FILTERS FOR ORDERS
const filterForOrders = async (req, res) => {
  const { by_status, date_from, date_to, recentDays } = req.query;
  let result;
  console.log(
    "by_status,date_from,date_to,recentDays",
    by_status,
    date_from,
    date_to,
    recentDays
  );
  try {
    // console.log("date====",Utils.convertDate(date_from),"-----",Utils.convertDate(date_to))
    const endDate = new Date(`${date_to}`);
    // seconds * minutes * hours * milliseconds = 1 day
    const dayTime = 60 * 60 * 24 * 1000;
    let increaseEndDateByOne = new Date(endDate.getTime() + dayTime);
    // console.log("INCREASED DATE",increaseEndDateByOne)

    // filter orders by todays date and by their status
    let user_status;
    if (date_from && date_to && by_status) {
      if (by_status != "all") {
        //  user_status = by_status == 'verified' ? true : false
        result = await Orders_Schema.aggregate([
          {
            $match: {
              order_status: by_status,
              createdAt: {
                $lte: Utils.convertDate(increaseEndDateByOne),
                $gte: Utils.convertDate(date_from),
              },
            },
          },
        ]).sort({ createdAt: -1 });
        console.log("RESULT NEW----", result);

        return res.status(200).send(result);
      }
    } else {
      result = await Orders_Schema.find({ order_status: by_status }).sort({
        createdAt: -1,
      });
      // return res.status(200).send(result)
    }

    if (date_from && date_to) {
      result = await Orders_Schema.aggregate([
        {
          $match: {
            createdAt: {
              $lte: Utils.convertDate(increaseEndDateByOne),
              $gte: Utils.convertDate(date_from),
            },
          },
        },
      ]).sort({ createdAt: -1 });
      console.log("RESULT NEW----", result);
      return res.status(200).send(result);
    }
    if (by_status != "all") {
      // let user_status = by_status === 'verified' ? true : false
      result = await Orders_Schema.find({ order_status: by_status }).sort({
        createdAt: -1,
      });
      console.log("RESULT NEW----", result);

      return res.status(200).send(result);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

//Payment done by razorpay

const makePaymentOrder = async (req, res) => {
  try {
    const { order_total, customer, product } = req.body;
    // console.log("start data", product, customer, order_total);
    const isCustomer = await Customers_Schema.findOne({
      user_id: customer.user.user_id,
    });
    if (!isCustomer) {
      res.status(400).json({ message: "No Customer found !!" });
    }

    let isProductHere = false;

    for (let prod of product) {
      const isProduct = await Products_Schema.findOne({
        productID: prod.productID,
      });

      if (!isProduct) {
        return (isProductHere = true);
      }
    }

    if (isProductHere) {
      res.status(400).json({ message: "No product found !!" });
    }

    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    let order;
    let totalAmount = order_total.replace("₹", "");
    // console.log('total ====', Number(totalAmount) * 100);
    var options = {
      amount: Number(Number(totalAmount) * 100),
      currency: "INR",
    };

    order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      message: "Rezorpay successful !!",
      order,
      amount: Number(totalAmount) * 100,
    });
  } catch (err) {
    console.log(err);
  }
};

const paymentDone = async (req, res) => {
  try {
    const {
      order_id,
      payment_id,
      razorpay_signature,
      currentUser,
      product,
      order_total,
    } = req.body;

    console.log(
      "id================> ",
      // currentUser,
      product
    );

    if (!order_id || !payment_id || !razorpay_signature) {
      return res.status(500).json({ message: "something went wrong !!" });
    }

    const isVerify = await verifyRazerPay(
      order_id,
      payment_id,
      razorpay_signature
    );

    console.log("isVerify => ", isVerify);

    if (isVerify) {
      let isCustomer = await Customers_Schema.findById(currentUser.user._id);

      let productArr = [];
      for (let prod of product) {
        let isProduct = await Products_Schema.findOne({
          product_id: prod.id,
        });
        if (isProduct) {
          productArr.push(isProduct);
        } else {
          return res.status(404).json({
            message: "no product found!! ",
          });
        }
      }

      console.log("line 506", isCustomer, productArr);

      // isCustomer.product = [...isCustomer.product, ...productArr]

      await isCustomer.save();

      let productData = [];
      for (let [ind, cartProducts] of productArr.entries()) {
        productData.push(
          {
            product_id: cartProducts.product_id,
            product_code:cartProducts.product_code,
            product_name:cartProducts.product_name,
            product_main_category:cartProducts.product_main_category,
            product_category:cartProducts.product_category,
            product_subcategory:cartProducts.product_subcategory,
            product_variant: cartProducts.product_variant,
            product_quantity: product[ind].cartQuantity,
            product_regular_price:cartProducts.product_regular_price,
            product_sale_price:cartProducts.product_sale_price,
            product_images: cartProducts.product_images,
        }
        )
      }

      const getOrderId = "order-" + generateOrderId.generate();
      const successPaymentHistory = await Orders_Schema.create({
        order_id: getOrderId,
        customer_id: isCustomer.user_id,
        customer_name: isCustomer.username,
        customer_phone_number: isCustomer.phone_number,
        customer_email:isCustomer.email,
        transport_detail: isCustomer.transport_detail,
        payment_mode: 'Razorpay payment',
        razorpay_payment_id: payment_id,
        razorpay_order_id: order_id,
        order_total: order_total,
        products: productData,
        state: isCustomer.state,
        pincode: isCustomer.pincode        
    });

      console.log("line 524", successPaymentHistory);

      return res
        .status(200)
        .json({ success: true, message: "Payment successful!" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createNewOrder = createNewOrder;
exports.getAllOrders = getAllOrders;
exports.searchInOrders = searchInOrders;
exports.filterForOrders = filterForOrders;
exports.getOrderById = getOrderById;
exports.updateOrders = updateOrders;
exports.deleteOrders = deleteOrders;
exports.paymentDone = paymentDone;
exports.makePaymentOrder = makePaymentOrder;
