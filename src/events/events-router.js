const express = require('express');
const eventsRouter = express.Router();
const EventService = require('./events-service');
const ProjectService = require('../projects/project-service');
const moment = require('moment');

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
  
      //this should be project event
      const userEvent = {
        title,
        event_description: description,
        start_time: startDateObj,
        end_time: endDateObj,
      }

      for (const [key, value] of Object.entries(userEvent)){
        if(!value) return res.status(400).json({error: `Missing ${key} in request body`})
      }

      userEvent.date = startDateObj.toISOString().slice(0 , 10);
      userEvent.created_by = req.user.full_name;
      userEvent.user_id = req.user.id;
      userEvent.project_id = parseInt(projectId);

      

      //creates the new event
      newEvent = await EventService.insertEvent(
        req.app.get('db'),
        userEvent
      )

      //gets all users for this project 
      const projectUsers = await ProjectService.getProjectUsersByProjectId(
        req.app.get('db'),
        projectId
      )

      //inserts a user_event for each member if the project
      const userEvents = await EventService.insertUserEvents(
        req.app.get('db'),
        newEvent.id,
        projectUsers,
        req.user.id
      )

      res.status(201).json(newEvent)
     
    } catch(e){
      next(e)
    }
  });

  eventsRouter
    .get('/user_events/:userId', requireAuth, async (req, res, next) => {
      const { userId } = req.params;
      if(!userId){
        return res.status(400).json({error: 'Missing user_id in request'})
      }
      try {

        const events = await EventService.getEventsByUserId(
          req.app.get('db'),
          userId
        )

        if(!events){
          res.status(204).end()
        }

        



        
        const formattedEvents = EventService.formatEvents(events, true);

        res.status(200).json(formattedEvents);
      } catch(e) {
        next(e)
      }
    });

  eventsRouter
    .get('/:projectId', requireAuth, jsonBodyParser, async (req, res, next) => {
      try {
        const {projectId} = req.params;

        const events = await EventService.getEventsByProjectId(req.app.get('db') , projectId)
        
        if(!events){
          res.status(204).end()
        }

        
        const formattedEvents = EventService.formatEvents(events, true);

        // const dateFilteredEvents = EventService.filterEventsBeforeCurrentDate(formattedEvents);

        res.status(201).json(formattedEvents);
      } catch(e){
        next(e)
      }
    })

  eventsRouter  
    .get('/calender/:projectId', requireAuth, jsonBodyParser, async (req, res, next) => {
      try {
        const { projectId } = req.params;
        const { month, year} = req.query;

        let formattedMonth = parseInt(month)
        if(formattedMonth < 10){
          formattedMonth = `0${formattedMonth}`;
        }
        const searchString = `${year}-${formattedMonth}`;


        const events = await EventService.getEventsByMonth(
          req.app.get('db'), 
          projectId,
          searchString)


        res.status(200).send(events);
      } catch(e) {
        next(e);
      }
    })

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
          //validate

          //format month for uniform search
          let newMonth = month;
          if(parseInt(newMonth) < 10){
            newMonth = '0' + month;
          }

          const searchString = `${year}-${newMonth}`;

          const daysUnavailable = await EventService.getUnavailableDays(req.app.get('db'), projectId, searchString)
          

          res.status(200).json(daysUnavailable);


        } catch(e) {
          next(e)
        }
      })

  module.exports = eventsRouter;