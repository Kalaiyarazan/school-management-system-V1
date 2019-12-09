const express = require("express");

const StudentRouter = express.Router();

StudentRouter.route("/login").get((req, res) => {
  res.render("login-form", {
    role: "student"
  });
});

module.exports = StudentRouter;
