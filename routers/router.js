const express = require("express");
const {
 
  login,
  registration,fetchUsers_Except_Logined_User,
  searchUser,upload,uploadFile,fetchFile, sendmail
} = require("../controllers/controller");
const router = express.Router();


router.route("/login").post(login);
// router.route("/register").post(upload,register);
router.route("/fetchFilteremoloyee").post(fetchUsers_Except_Logined_User);
router.route("/search/:name").post(searchUser);
router.route("/register").post(upload, registration);
router.route("/upload").post(upload,uploadFile);
router.route("/fetchFile").get(fetchFile);
router.route("/send-email").post(sendmail);
// router.route("/registration").post(upload, registration);
// router.route("/signin").post(signin);
// router.route("/changepassword").post(changepassword);

// router.route("/online-users").post(storeOnlineUsers);
// router.route("/uploadFile").post(upload, uploadFile);
// router.route("/fetchFile").post(fetchFile);

module.exports = { router };
