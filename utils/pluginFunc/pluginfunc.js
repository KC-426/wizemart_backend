const axios = require('axios');
const { convertDate } = require('../Utils');

//====================== SHIPROCKET PLUGIN ======================================
// shiprocket login
const loginToShiprocket = async(useremail,password,order_details)=>{

    try {
        const data = JSON.stringify({
            "email": useremail,
            "password": password
          });
          
          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : data
          };
          
          axios(config)
          .then(async function (response) {
            console.log("SHIPROCKET LOGIN->",JSON.stringify(response.data));
            if(response?.data?.token){
              createShiprocketOrder(order_details,response?.data?.token)
            }

          })
          .catch(function (error) {
            console.log(error);
          });

    } catch (error) {
        console.log(error);
    }


}

// shiprocket create order
const createShiprocketOrder = async(orderDetails,token)=>{
  console.log("Shiprocket orderDetails--->>>>",orderDetails)
  const order_items =[]
   orderDetails?.products?.map(value=>{
    order_items?.push({ name:  value?.product_name,
    sku: value?.product_code,
    units: value?.product_quantity,
    selling_price: value?.product_sale_price
  })
   
  })
    
    const data = JSON.stringify({
        "order_id": orderDetails?.order_id,
        "order_date":convertDate(orderDetails?.createdAt),
        "billing_customer_name": orderDetails?.customer_name?.toUpperCase(),
        "billing_last_name": "",
        "billing_address": orderDetails?.shipping_address,
        "billing_city": orderDetails?.state,
        "billing_pincode": orderDetails?.pincode,
        "billing_state": orderDetails?.state,
        "billing_country": "India",
        "billing_email": orderDetails?.customer_email,
        "billing_phone": orderDetails?.customer_phone_number,
        "shipping_is_billing": true,
        "order_items": order_items,
        "payment_method": orderDetails?.payment_mode == 'online'  ? 'prepaid' : orderDetails?.payment_mode ,
        "sub_total": parseInt(orderDetails?.order_total) + parseInt(orderDetails?.delivery_charges),
        "length": 10,
        "breadth": 15,
        "height": 20,
        "weight": 0.5
});

let config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${token}`
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

}
//====================== SHIPROCKET PLUGIN ======================================

module.exports={loginToShiprocket,createShiprocketOrder}