const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const passportJWT = require("passport-jwt");
const passport = require("passport");

require("dotenv").config();

const dataService = require("./data-service");
const userService = require("./user-service");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: process.env.JWT_SECRET,
};

const strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log("payload received", jwt_payload);

  if (jwt_payload) {
    next(null, {
      _id: jwt_payload._id,
      userName: jwt_payload.userName,
      fullName: jwt_payload.fullName,
      role: jwt_payload.role,
    });
  } else {
    next(null, false);
  }
});

const app = express();
app.use(express.json());

passport.use(strategy);
app.use(passport.initialize());

app.use(cors());

app.get(
  "/api/vehicles",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    dataService
      .getAllVehicles()
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  },
);

app.post("/api/register", (req, res) => {
  userService
    .registerUser(req.body)
    .then((msg) => {
      res.json({ message: msg });
    })
    .catch((msg) => {
      res.status(422).json({ message: msg });
    });
});

app.post("/api/login", (req, res) => {
  userService
    .checkUser(req.body)
    .then((user) => {
      const payload = {
        _id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        role: user.role,
      };

      const token = jwt.sign(payload, jwtOptions.secretOrKey);

      res.json({ message: "Login successful", token });
    })
    .catch((msg) => {
      res.status(422).json({ message: msg });
    });
});

userService
  .connect()
  .then(() => {
    const HTTP_PORT = process.env.PORT || 8080;

    app.listen(HTTP_PORT, () => {
      console.log("API listening on: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log("Unable to start the server: " + err);
    process.exit();
  });
