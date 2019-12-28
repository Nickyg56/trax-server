const express = require('express');
const eventsRouter = express.Router();
const EventService = require('./events-service');

const jsonBodyParser = express.json();

const { requireAuth } = require('../middleware/jwt-auth');

eventsRouter
  .post('/:projectId', requireAuth, jsonBodyParser, async (req, res, next) => {
    try {
      const { title, description, startTime, endTime, day, month, year } = req.body;
      const { projectId } = req.params;
      //when an event is posted: Validate/Scrub event info.
      // Insert user_event for each member of the project. 

      const startDateObj = new Date(`${month} ${day}, ${year} ${startTime}:00`);
      const endDateObj = new Date(`${month} ${day}, ${year} ${endTime}:00`);

      
      const userEvent = {
        title,
        event_description: description,
        start_time: startDateObj,
        end_time: endDateObj,
      }

      for (const [key, value] of Object.entries(userEvent)){
        if(!value) return res.status(400).json({error: `Missing ${key} in request body`})
      }

      userEvent.created_by = req.user.full_name;
      userEvent.user_id = req.user.id;
      userEvent.project_id = parseInt(projectId);

      //insert user_event for each member if the project

      newEvent = await EventService.insertEvent(
        req.app.get('db'),
        userEvent
      )

      res.status(201).json(newEvent)


     
    } catch(e){
      next(e)
    }
  });

  eventsRouter
    .post('/:projectId/unavailable', jsonBodyParser, requireAuth,  async (req, res, next) => {
      try {
        const { date } = req.body;
        const { projectId } = req.params;

        if(!date){
          return res.status(400).json({error: 'Missing Date in request body'})
        }

        if(!projectId){
          return res.status(400).json({error: 'Missing project id in request body'})
        }

        const unavailableDate = {
          project_id: projectId,
          date,
          marked_by: req.user.full_name,
        }

        const newDate = await EventService.insertUnavailableDate(req.app.get('db'), unavailableDate)

        const dayNum = newDate.date.slice(8, 10)

        res.status(201).json(dayNum)
      } catch(e){
        next(e)
      }
    })

    eventsRouter
      .get('/unavailable/:projectId/:year/:month', requireAuth, jsonBodyParser, async (req, res, next) => {
        try {
          const {projectId, year, month} = req.params;

          console.log(projectId, year, month)
          //this is where you left off, sending dummy data for now but front end is sending in 
          // this information correctly. Now I need to write an event-service method to get all of the days 
          //from the db.

          res.status(200).json([2 ,5 ,26]);


        } catch(e) {
          next(e)
        }
      })

  module.exports = eventsRouter;