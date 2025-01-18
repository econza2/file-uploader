const express = require("express");
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");
const passport = require("passport");
const session = require("express-session");
require("./config/passport");
const sessionStore = require("./config/session");
require("dotenv").config();

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(indexRouter);

app.listen(3000, () => console.log("app listening on port 3000!"));
