const { sendEmail } = require("../middleware/sendEmail");
const Post = require("../models/Post");
const User = require("../models/User");

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "sample_id",
        url: "sample_url",
      },
    });
    const token = await user.generateToken();
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res.status(200).cookie("token", token, options).json({
      success: true,
      message: "Login Successfull",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//user login

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isPasswordMatched = await user.matchPassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const token = await user.generateToken();
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res.status(200).cookie("token", token, options).json({
      success: true,
      message: "Login Successfull",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// logout user
exports.logoutUser = async (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "Logout Successfull",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//followe Users
exports.followUsers = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const logedInUser = await User.findById(req.user._id);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (logedInUser.following.includes(userToFollow._id)) {
      const indexFollowing = logedInUser.following.indexOf(userToFollow._id);
      logedInUser.following.splice(indexFollowing, 1);
      const indexFollowers = userToFollow.followers.indexOf(logedInUser._id);
      userToFollow.followers.splice(indexFollowers, 1);
      await logedInUser.save();
      await userToFollow.save();
      return res.status(200).json({
        success: true,
        message: "Unfollowed user successfully",
      });
    } else {
      logedInUser.following.push(userToFollow._id);
      userToFollow.followers.push(logedInUser._id);
      await logedInUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: "Followed user successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//update Password
exports.updatePassword = async (req, res) => {
  try {
    if (!req.body.oldPassword && !req.body.newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please enter old and new password",
      });
    }
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordMatched = await user.matchPassword(req.body.oldPassword);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password",
      });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//update Profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.name = req.body.name;
    user.email = req.body.email;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//Delete my profile
exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const userId = user._id;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //Logout after deletingprofile
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    //remove all post of users
    await User.findByIdAndDelete(req.user._id);
    for (let i = 0; i < posts.length; i++) {
      await Post.findByIdAndDelete(posts[i]);
    }
    //Removing User from Followers following
    const followers = user.followers;
    const following = user.following;
    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]);
      const index = follower.following.indexOf(userId);
      follower.following.splice(index, 1);
      await follower.save();
    }

    for (let i = 0; i < following.length; i++) {
      const follow = await User.findById(following[i]);
      const index = follow.followers.indexOf(userId);
      follow.followers.splice(index, 1);
      await follow.save();
    }
    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get my Profile

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");
    res.status(200).json({
      success: true,
      message: "User found",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("posts");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User found",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get all users

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "Users found",
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//forget password
exports.forgetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const resetPasswordToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetPasswordToken}`;
    const message = `
    <h1>You have requested a password reset</h1>
    <p>Please go to this link to reset your password</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        text: message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
