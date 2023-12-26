const express = require("express")
const router = express.Router()
const Customer_Controllers = require("../../controllers/Users_Controllers/Customers_Controller")

const {usersCheckAuth,Frontend_Validator,} = require("../../middlewares/adminCheckAuth")



// users all routes
router.get("/user/get/alluser",Frontend_Validator,usersCheckAuth,Customer_Controllers.getAllUser);
router.get("/user/get/user",Frontend_Validator,usersCheckAuth,Customer_Controllers.getUserById);
router.get("/user/get/:user_id",Frontend_Validator,usersCheckAuth,Customer_Controllers.getUser);
router.get("/search/in/user",Frontend_Validator,usersCheckAuth,Customer_Controllers.searchInUsers);
router.get("/filter/users",Frontend_Validator,usersCheckAuth,Customer_Controllers.filterForUsers);
router.get("/get/users/count/for/plan/upgrade",Frontend_Validator,usersCheckAuth,Customer_Controllers.getAllUsersCountForPlanUpgrade);
router.post("/user/create/newuser",Frontend_Validator,Customer_Controllers.createUser);
router.post("/user/login",Customer_Controllers.loginUser);
router.post("/user/logout",Customer_Controllers.logoutUser);
router.patch("/user/edit/:user_id",Frontend_Validator,usersCheckAuth,Customer_Controllers.editUserByID);
router.patch("/delete/users",Frontend_Validator,usersCheckAuth,Customer_Controllers.deleteUsers);

module.exports = router