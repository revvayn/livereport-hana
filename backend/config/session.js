const session = require("express-session");

module.exports = session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET || "bbp-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true kalau https
    sameSite: "lax",
  },
});
