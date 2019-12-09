const express = require("express");
const { compareHash } = require("../utils/hash");
const {
  teacherTokenGenerator,
  teacherTokenValidator
} = require("../utils/teacherTokenManager");

//Models Import
// const { Admin } = require("../models/Admins");
// const { Course } = require("../models/Courses");
// const { Subject } = require("../models/Subjects");
// const { Student } = require("../models/Students");
const { Teacher } = require("../models/Teachers");
const { Mark } = require("../models/Marks");

const teacherRouter = express.Router();

teacherRouter
  .route("/login")
  .get((req, res) => {
    res.render("login-form", {
      role: "teacher"
    });
  })

  .post((req, res) => {
    const { email, password } = req.body;
    Teacher.findOne({
      where: {
        email
      }
    }).then(teacherInstance => {
      if (teacherInstance) {
        const teacher = teacherInstance.get();
        const {
          id = "",
          email: emailFromDB = "",
          fullName = "",
          password: passwordFromDB = ""
        } = teacher;
        compareHash(password, passwordFromDB)
          .then(isSuccess => {
            if (isSuccess) {
              const jwtToken = teacherTokenGenerator({
                id,
                email: emailFromDB,
                fullName
              });
              res.cookie("jwt", jwtToken, { httpOnly: true });
              res.status(200).redirect("/teacher");
            } else {
              res.status(400).send("No teacher found");
            }
          })
          .catch(error => {
            console.error(error);
            res.status(500).send("Internal Server Error");
          });
      } else {
        res.status(400).send("No teacher found");
      }
    });
    console.log(email, password);
  });

teacherRouter
  .route("/")
  .get((req, res) => {
    const { jwt = "" } = req.cookies;
    const teacher = teacherTokenValidator(jwt);
    if (teacher) {
      Mark.findAll().then(markInstance => {
        const marks = markInstance.map(instance => instance.get());
        // const marks = Mark.findAll().then(markInstance => {const marks = markInstance.map(instance => instance.get());
        res.render("teacher-home", {
          marks
        });
      });
    } else {
      res.redirect("/teacher/login");
    }
  })
  .post((req, res) => {
    const {
      course = {},
      studentId = {},
      exam = {},
      tamil = {},
      english = {},
      maths = {}
    } = req.body;
    const markData = {
      course,
      studentId,
      exam,
      tamil,
      english,
      maths
    };

    Mark.create(markData)
      .then(result => {
        console.log(result.get());
        res.redirect("/teacher");
      })
      .catch(console.error);
  });

teacherRouter.route("/profile").get((req, res) => {
  const { jwt = "" } = req.cookies;
  const teacher = teacherTokenValidator(jwt);
  console.log(req.headers);
  if (teacher) {
    Teacher.findAll().then(teacherInstance => {
      const teachers = teacherInstance.map(instance => instance.get());
      res.render("teacher-profile", {
        teachers
      });
    });
  } else {
    res.redirect("/teacher/login");
  }
});

teacherRouter.route("/signout").get((req, res) => {
  const { jwt = "" } = req.cookies;
  const teacher = teacherTokenValidator(jwt);

  if (teacher) {
    res.clearCookie("jwt");
    res.redirect("/");
  }
});
module.exports = teacherRouter;
