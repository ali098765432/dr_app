const express = require("express");
const bodyParser = require("body-parser");
const authRouter = require('./routes/auth');
const drUsersRouter = require('./routes/dr_users');
const paUsersRouter = require('./routes/pa_users');
const ratingReviewsRouter = require('./routes/rating_reviews');
const notificationsRouter = require('./routes/notifications');
const visitsRouter = require('./routes/visits');
const earningsRouter = require('./routes/earnings');
const availabilityRouter = require('./routes/availability');
const adminLogin =require('./routes/admin');


const app = express();

// Middleware
app.use(bodyParser.json());

app.use('/auth', authRouter);
app.use('/drUsers', drUsersRouter);
app.use('/paUsers', paUsersRouter);
app.use('/reviews', ratingReviewsRouter);
app.use('/notifications', notificationsRouter);
app.use('/visits', visitsRouter);
app.use('/earnings', earningsRouter);
app.use('/availability', availabilityRouter);
app.use('/admin', adminLogin);

// PORT
const port = process.env.PORT || 3000;

// define a root route
app.get('/', (req, res) => {
    res.send("Hello Welcome to Doctor Booking App Backend");
  });

// Starting a server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});