// routes/auth.js
const express = require('express');

const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))

app.set("view engine", "ejs");
app.use(express.static("public"));
app.get('/', function (req, res) {
  res.render("login")
})


app.listen(3000, function () {
  console.log('app listening on port 3000!');
});