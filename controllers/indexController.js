const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
require("../config/cloudinary");

const prisma = new PrismaClient();

const validateRegistration = [
  body("username").notEmpty().withMessage("Username cannot be empty"),
  body("password").notEmpty().withMessage("Password cannot be empty"),
  body("confirm_password")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords Must Match"),
];

function getIndexDirectory(req, res) {
  res.render("index");
}

function getRegister(req, res) {
  res.render("register");
}

const postRegisterUser = [
  validateRegistration,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("register", { errors: errors.array() });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          console.log("Error hashing password");
        } else {
          await prisma.users.create({
            data: {
              username: req.body.username,
              password: hashedPassword,
            },
          });

          res.redirect("/");
        }
      });
    }
  },
];

function getLogin(req, res) {
  res.render("login");
}

async function getLoginSuccess(req, res) {
  const folders = await prisma.folders.findMany({
    where: {
      folder_user_id: {
        equals: req.user.user_id,
      },
    },
  });

  res.render("loginSuccess", { userFolders: folders });
}

function getLoginFailure(req, res) {
  res.render("loginFailure");
}

function getUploadFile(req, res) {
  res.render("uploadFile", { folderId: req.params.folder_id });
}

function getAddFolder(req, res) {
  res.render("addFolder");
}

async function postAddFolder(req, res) {
  await prisma.folders.create({
    data: {
      folder_name: req.body.folder_name,
      folder_user_id: req.user.user_id,
    },
  });

  res.redirect("/login-success");
}

async function getRenameFolder(req, res) {
  const folderDetails = await prisma.folders.findUnique({
    where: {
      folder_id: parseInt(req.params.folder_id),
    },
  });

  res.render("renameFolder", { folderDetails: folderDetails });
}

async function postRenameFolder(req, res) {
  await prisma.folders.update({
    where: {
      folder_id: parseInt(req.params.folder_id),
    },
    data: {
      folder_name: req.body.folder_name,
    },
  });

  res.redirect("/login-success");
}

async function getFolderView(req, res) {
  const folderFiles = await prisma.files.findMany({
    where: {
      file_folder_id: parseInt(req.params.folder_id),
    },
  });

  const folderDetails = await prisma.folders.findUnique({
    where: {
      folder_id: parseInt(req.params.folder_id),
    },
  });

  res.render("folderView", {
    folderDetails: folderDetails,
    folderFiles: folderFiles,
  });
}

async function postDeleteFolder(req, res) {
  await prisma.folders.delete({
    where: {
      folder_id: parseInt(req.params.folder_id),
    },
  });

  res.redirect("/login-success");
}

async function postUploadFile(req, res) {
  const timeNow = new Date();

  const uploadResult = await cloudinary.uploader
    .upload(req.file.path)
    .catch((error) => {
      console.log(error);
    });

  console.log(uploadResult);

  await prisma.files.create({
    data: {
      file_name: req.body.file_name,
      file_size: req.file.size,
      upload_time: timeNow,
      file_folder_id: parseInt(req.params.folder_id),
      file_data: uploadResult.secure_url,
    },
  });

  res.redirect("/login-success");
}

async function getFileView(req, res) {
  const fileDetails = await prisma.files.findUnique({
    where: {
      file_id: parseInt(req.params.file_id),
    },
  });

  res.render("fileView", { fileDetails: fileDetails });
}

module.exports = {
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
};
