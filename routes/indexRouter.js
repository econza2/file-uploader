const { Router } = require("express");
const passport = require("passport");
const {
  getIndexDirectory,
  getRegister,
  postRegisterUser,
  getLogin,
  getLoginFailure,
  getLoginSuccess,
  getUploadFile,
  getAddFolder,
  postAddFolder,
  getRenameFolder,
  postRenameFolder,
  getFolderView,
  postDeleteFolder,
  postUploadFile,
  getFileView,
} = require("../controllers/indexController");

const isAuth = require("../controllers/authMiddleware");
require("dotenv").config();
const multer = require("multer");
const upload = multer({ dest: process.env.STORAGE_DESTINATION });

const indexRouter = Router();

indexRouter.get("/", getIndexDirectory);
indexRouter.get("/register", getRegister);
indexRouter.post("/register", postRegisterUser);
indexRouter.get("/login", getLogin);
indexRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/login-success",
    failureRedirect: "/login-failure",
  })
);
indexRouter.get("/login-success", isAuth, getLoginSuccess);
indexRouter.get("/login-failure", getLoginFailure);
indexRouter.get("/:folder_id/upload-file", getUploadFile);
indexRouter.get("/add-folder", getAddFolder);
indexRouter.post("/add-folder", postAddFolder);
indexRouter.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
indexRouter.get("/:folder_id/rename-folder", getRenameFolder);
indexRouter.post("/:folder_id/rename-folder", postRenameFolder);
indexRouter.get("/:folder_id/view-folder", getFolderView);
indexRouter.post("/:folder_id/delete-folder", postDeleteFolder);
indexRouter.post(
  "/:folder_id/upload-file",
  upload.single("file_data"),
  postUploadFile
);
indexRouter.get("/:file_id/view-file", getFileView);

module.exports = indexRouter;
