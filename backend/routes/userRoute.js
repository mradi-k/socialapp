const express = require("express");
const {
  registerUser,
  loginUser,
  followUsers,
  logoutUser,
  updatePassword,
  updateProfile,
  deleteProfile,
  getMyProfile,
  getUserProfile,
  getAllUsers,
  forgetPassword,
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logoutUser);

router.route("/follow/:id").get(isAuthenticated, followUsers);

router.route("/update/password").put(isAuthenticated, updatePassword);

router.route("/update/profile").put(isAuthenticated, updateProfile);

router.route("/deleteprofile").delete(isAuthenticated, deleteProfile);

router.route("/me").get(isAuthenticated, getMyProfile);

router.route("/user/:id").get(isAuthenticated, getUserProfile);
router.route("/users").get(isAuthenticated, getAllUsers);
router.route("/forgot/password").post(isAuthenticated, forgetPassword);
module.exports = router;
