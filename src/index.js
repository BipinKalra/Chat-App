const express = require("express")
const path = require("path")
// const hbs = require("hbs")

const app = express()
const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, "../public")

// app.set("view engine", "hbs")
app.use(express.static(publicPath))

app.listen(port, () => {
  console.log("Server is up on port - " + port)
})