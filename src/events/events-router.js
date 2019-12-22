const express = require('express');
const eventsRouter = express.Router();

const jsonBodyParser = express.json();

const { requireAuth } = require('../middleware/jwt-auth');

eventsRouter
  .post('/:projectId', requireAuth, jsonBodyParser, async (req, res, next) => {
    try {
      const { title, description, startTime, endTime } = req.body;
      //when an event is posted: Validate/Scrub event info.
      // Insert user_event for each member of the projects. 

      const userEvent = {
        title,
        event_description: description,
        start_time: startTime,
        end_time: endTime,
      }

      for (const [key, value] of Object.entries(userEvent)){
        if(!value) return res.status(400).json({error: `Missing ${key} in request body`})
      }


      res.status(201).json(userEvent)


     
    } catch(e){
      next(e)
    }
  })

  module.exports = eventsRouter;