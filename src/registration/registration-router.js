const express = require('express');
const path = require('path');
const RegistrationService = require('./registration-service');

const registrationRouter = express.Router();
const jsonBodyParser = express.json();

registrationRouter 
  .post('/', jsonBodyParser, async (req, res, next) => {
    try {
      const { full_name, password, email } = req.body;

      console.log(full_name, password, email);

      for (const field of ['full_name', 'password', 'email'])
        if(!req.body[field])
        return res.status(400).json({
          error: `Missing ${field} in request body`
        });

        const passwordError = RegistrationService.validatePassword(password);

        if(passwordError)
          return res.status(400).json({ error: passwordError });

        const hasUserWithEmail = await RegistrationService.hasUserWithEmail(
          req.app.get('db'),
          email
        );

        if(hasUserWithEmail)
          return res.status(400).json({ error: 'Account with this email already exists' })

        const hashedPassword = await RegistrationService.hashPassword(password)

        const newUser = {
          full_name,
          email,
          password: hashedPassword,
        }

        const user = await RegistrationService.insertUser(
          req.app.get('db'),
          newUser
        );


        return res.status(204).end();

    } catch(error) {
      next(error);
    }
  })

  module.exports = registrationRouter;