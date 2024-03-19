const express = require('express');
const cors = require("cors");
require("dotenv").config({ path: "./config/.env" });
// database
const connectDB = require('./config/db');
// middleware
const errorHandler = require('./middlewares/errorHandlrer');
// routes
const authRoutes = require('./routes/user');

// port
const port = process.env.PORT || 5000;


connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(async (req, res, next) => {
    const apikey = req.headers.apikey;
    if (apikey == process.env.apikey) {
        return next();
    }
    return res.status(404).json({ success: false });
});


app.use('/api/v1/auth/', authRoutes);

app.use(errorHandler);



app.listen(port, () => console.log(`server is listening on port ${port}`))
