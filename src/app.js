require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const registrationRouter = require('./registration/registration-router');
const authRouter = require('./auth/auth-router');
const projectsRouter = require('./projects/projects-router');
const eventsRouter = require('./events/events-router');
const visitorRouter = require('./visitor/visitor-router');

const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/register', registrationRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/visitor', visitorRouter);


// eslint-disable-next-line no-unused-vars
app.use(function errorHandler(error, req, res, next){
  let response;
  if (NODE_ENV === 'production'){
    response = {error: {message: 'servor error'} };
  } else {
    console.error(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;



