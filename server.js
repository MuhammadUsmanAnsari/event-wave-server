const express = require('express');
const cors = require("cors");
const connectDB = require('./config/db');
require("dotenv").config({ path: "./config/.env" });
// routes
const authRoutes = require('./routes/user');


const port = process.env.PORT || 5000;


connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use('/api/v1/auth/', authRoutes)


app.listen(port, () => console.log(`server is listening on port ${port}`))
