const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const moment = require("moment");
const app = express();

app.use(
  session({
    secret: "Thisismydefaultsecret",
    resave: false,
    saveUninitialized: true,
  })
);
const isAuthenticated = (req, res, next) => {
  if (req.session.authenticated) {
    // User is authenticated, so continue to the next middleware or route handler
    next();
  } else {
    // User is not authenticated, so redirect to the login page
    res.redirect("/login");
  }
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  // "mongodb+srv://Bangthai:428jesqb9t@cluster0.dkzah.mongodb.net/userDB",
  "mongodb+srv://bangthai:428jesqb9t@cluster0.gyv4qie.mongodb.net/kscj-share",

  { useNewUrlParser: true, useUnifiedTopology: true }
);

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  secrets: String,
  createdAt: { type: Date, default: Date.now },
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  User.find({}, function (err, messages) {
    messages = messages.map((message) => ({
      ...message.toObject(),
      timeAgo: moment(message.createdAt).fromNow(),
    }));
    res.render("home", { messages });
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "adminGroupD@kscj.com" && password === "ADMINgroupD@123") {
    // Set authenticated session variable and redirect to messages page
    req.session.authenticated = true;
    res.redirect("/admin");
  } else {
    res.render("login", { error: "Invalid email or password" });
  }
});

app.get("/admin", isAuthenticated, function (req, res) {
  User.find({}, function (err, messages) {
    messages = messages.map((message) => ({
      ...message.toObject(),
      timeAgo: moment(message.createdAt).fromNow(),
    }));
    res.render("admin", { messages });
  });
});

app.post("/delete/:id", function (req, res) {
  const id = req.params.id;
  User.findByIdAndDelete(id, function (err) {
    if (err) {
      console.log(err);
      res.send("Error deleting message.");
    } else {
      res.redirect("/admin");
    }
  });
});

app.get("/submit", function (req, res) {
  res.render("submit");
});

app.post("/submit", function (req, res) {
  const newSecret = new User({
    secrets: req.body.secret,
    createdAt: new Date(),
  });
  newSecret.save((err, result) => {
    if (err) {
      console.error(err);
      res.send("An error occurred while saving the contact information");
    } else {
      res.redirect("/");
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port 3000");
});
