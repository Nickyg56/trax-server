const express = require('express');
const authRouter = express.Router();
const AuthService = require('./auth-service');
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');


authRouter
  .post('/login', jsonBodyParser, async (req, res, next) => {
    try {
      const {email, password} = req.body;
      const loginUser = { email, password};
      for (const [key, value] of Object.entries(loginUser))
        if(value === null) {
          return res.status(400).json({error: `Missing '${key}' in request body`})
        }

    let user = await AuthService.getUserWithEmail(req.app.get('db'), loginUser.email)
    if(!user) {
      return res.status(400).json({error: 'Incorrect email or password'})
    }
    let match = await AuthService.comparePasswords(loginUser.password, user.password)
    if(!match){
      return res.status(400).json({error: 'Incorrect email or password'})
    }
    const sub = loginUser.email;
    const payload = {user_id: user.id};
    const serializedUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      date_created: user.date_created,
      date_modified: user.date_modified,
    }

    res.send({
      user: serializedUser,
      authToken: AuthService.createJwt(sub, payload),
    });

    } catch(e){
      next(e)
    }
  })

module.exports = authRouter;