const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("./db");
const passport = require("passport");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
  })
);

require("./passportSetup")(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/register", checkAuthenticated, (req, res) => {
  res.send("User is registering here.");
});

app.get("/login", checkAuthenticated, (req, res) => {
  res.send("User is loggin in here.");
});

app.get("/dashboard", checkNotAuthenticated, (req, res) => {
  res.send("User is logged in, user is on dashboard page.");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.send("User is logged out here, Bye.");
});

app.post("/register", async (req, res) => {
  console.log(req.body);

  let { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg1: "Please enter all fields." });
  }

  if (password.length < 6) {
    errors.push({ msg2: "Password must be at least six characters long." });
  }

  if (password !== password2) {
    errors.push({ msg3: "Passwords do not match." });
  }

  if (errors.length > 0) {
    // res.render('Something went wrong.');
    res.json(errors);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (error, response) => {
        if (error) {
          console.log(error);
        }
        console.log(response.rows);

        if (response.rows.length > 0) {
          return res.send("Email already registered.");
        } else {
          pool.query(
            `INSERT INTO users (name,email,password) VALUES ($1, $2, $3) RETURNING id, password`,
            [name, email, hashedPassword],
            (error, resp) => {
              if (error) {
                console.log(error);
              }

              console.log(resp.rows);
              res.redirect("/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/login",
  (req, res, next) => {
    console.log(req.body);
    next();
  },
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

function checkAuthenticated(req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  }
  return next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
