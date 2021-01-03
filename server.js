const express = require("express");
const bcrypt = require("bcryptjs");
// const { pool } = require("./db");
const passport = require("passport");
const session = require("express-session");
const { User } = require("./User");
const db = require("./db");
const sequelizeStore = require("connect-session-sequelize")(session.Store);

const app = express();

const SESSION_LIFETIME = 1000 * 60 * 60;
const NODE_ENV = "development";

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const sessionStore = new sequelizeStore({ db, expiration: 1000 * 60 });

app.use(
  session({
    name: "rupakdey",
    secret: process.env.secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: SESSION_LIFETIME,
      sameSite: true,
      secure: NODE_ENV === "production",
    },
  })
);

sessionStore.sync();

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
  res.send("User is logging in here.");
});

app.get("/dashboard", checkNotAuthenticated, async (req, res) => {
  console.log("dashboard", sessionStore);
  res.send("User is logged in, user is on dashboard page.");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.send("User is logged out here, Bye.");
});

app.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;

  if (password !== password2) {
    return res.json({ msg: "Passwords did not match." });
  } else {
    try {
      const existingUser = await User.findOne({
        where: { email: email },
      });

      if (existingUser) {
        return res.json({ msg: "Email already exists." });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          name,
          email,
          password: hashedPassword,
        });

        return res.json(user);
      }
    } catch (error) {
      console.log(error);
      return res.json(error);
    }
  }
});

// app.post("/register", async (req, res) => {
//   console.log(req.body);

//   let { name, email, password, password2 } = req.body;
//   let errors = [];

//   if (!name || !email || !password || !password2) {
//     errors.push({ msg1: "Please enter all fields." });
//   }

//   if (password.length < 6) {
//     errors.push({ msg2: "Password must be at least six characters long." });
//   }

//   if (password !== password2) {
//     errors.push({ msg3: "Passwords do not match." });
//   }

//   if (errors.length > 0) {
//     // res.render('Something went wrong.');
//     res.json(errors);
//   } else {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     pool.query(
//       `SELECT * FROM users WHERE email = $1`,
//       [email],
//       (error, response) => {
//         if (error) {
//           console.log(error);
//         }
//         console.log(response.rows);

//         if (response.rows.length > 0) {
//           return res.send("Email already registered.");
//         } else {
//           pool.query(
//             `INSERT INTO users (name,email,password) VALUES ($1, $2, $3) RETURNING id, password`,
//             [name, email, hashedPassword],
//             (error, resp) => {
//               if (error) {
//                 console.log(error);
//               }

//               console.log(resp.rows);
//               res.redirect("/login");
//             }
//           );
//         }
//       }
//     );
//   }
// });

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

function checkAuthenticated(req, res, next) {
  console.log("Session is: ", req.session);
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
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
