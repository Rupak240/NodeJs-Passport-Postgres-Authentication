const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
// const { pool } = require("./db");
const { User } = require("./User");

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    console.log(email, password);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({ msg: "User not found." });
    }

    bcrypt.compare(password, user.password, (error, isMatch) => {
      if (error) {
        console.log(error);
      }

      if (isMatch) {
        return done(null, user);
      } else {
        resizeBy.json("msg: 'Password was incorrect.");
        return done(null, false);
      }
    });

    // pool.query(
    //   `SELECT * FROM users WHERE email = $1`,
    //   [email],
    //   (error, result) => {
    //     if (error) {
    //       console.log(error);
    //     }

    //     if (result.rows.length > 0) {
    //       console.log(result.rows);
    //       const user = result.rows[0];

    //       bcrypt.compare(password, user.password, (error, isMatch) => {
    //         if (error) {
    //           console.log(error);
    //         }
    //         if (isMatch) {
    //           // User match found.
    //           return done(null, user);
    //         } else {
    //           // NO User
    //           console.log("Password was incorrect!");
    //           return done(null, false);
    //         }
    //       });
    //     }
    //   }
    // );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    const user = await User.findOne({ where: { id } });
    return done(null, user);

    // pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, results) => {
    //   if (err) {
    //     return done(err);
    //   }
    //   console.log(`ID is ${results.rows[0].id}`);
    //   return done(null, results.rows[0]);
    // });
  });
}

module.exports = initialize;
