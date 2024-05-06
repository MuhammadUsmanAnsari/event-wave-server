const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
require("dotenv").config({ path: "./config/.env" });
// database
const connectDB = require('./config/db');
// middleware
const errorHandler = require('./middlewares/errorHandlrer');
// cron jobs
var cron = require('node-cron');
const CheckEventStatus = require('./crobJob/Event');
// routes
const authRoutes = require('./routes/user');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const guestsRoutes = require('./routes/guestsRoutes');
const detailsRoutes = require('./routes/detailsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const contactRoutes = require('./routes/contactRoutes');
const blogRoutes = require('./routes/blogRoutes');

// port
const port = process.env.PORT || 5000;


connectDB();
const app = express();
app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: '5mb' }));
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.static("public"));


app.use(async (req, res, next) => {
    const apikey = req.headers.apikey;
    if (apikey == process.env.apikey) {
        return next();
    }
    return res.status(404).json({ success: false });
});

// node cron
cron.schedule('*/2 * * * *', CheckEventStatus);


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/event', eventRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/guests', guestsRoutes);
app.use('/api/v1/details', detailsRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/blog', blogRoutes);

app.use('/', (req, res) => {
    res.status(200).json({ msg: "helloo" })
});

app.use(errorHandler);



app.listen(port, () => console.log(`server is listening on port ${port}`))
