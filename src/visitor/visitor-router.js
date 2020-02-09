const express = require('express');
const visitorRouter = express.Router();
const VisitorService = require('./visitor-service');
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');



visitorRouter
  .get('/:projectId', async (req, res, next) => {
    try {
      const { projectId } = req.params;

      if(!projectId){
        return res.status(400).json({error: 'Missing Project id in request'})
      }

      //check if user has already requested to join a project

      const projectData = await VisitorService.getVisitorProjectData(
        req.app.get('db'),
        projectId
      )

      const formattedProjectData = {
        title: projectData.title,
        description: projectData.project_description,
        dateCreated: projectData.date_created,
      }

      const userData = await VisitorService.getVisitorProjectUserData(
        req.app.get('db'),
        projectId
      )

      const formattedUserData = userData.map(user => {
        return {
          name: user.full_name,
          role: user.role,
          isAdmin: user.is_admin,
        }
      })


      const eventsData = await VisitorService.getVisitorProjectEventsData(
        req.app.get('db'),
        projectId
      )

      const formattedEventsData = eventsData.map(event => {
        return {
          title: event.title,
          description: event.event_description,
          start: event.start_time,
          end: event.end_time,
          createdBy: event.created_by,
          date: event.date,
        }
      })

      const formattedVisitorData = {
        project: formattedProjectData,
        users: formattedUserData,
        events: formattedEventsData
      }



      res.status(200).json(formattedVisitorData)
    } catch(e) {
      next(e)
    }
  })

visitorRouter
.post('/:projectId', jsonBodyParser, requireAuth,  async (req, res, next) => {
  const {projectId} = req.params
  const {message} = req.body

  try {

    console.log(req.user.id, projectId, message)

    //xss message


    const request = {
      user_id: req.user.id,
      project_id: projectId,
      message,
      user_name: req.user.full_name
    }

    const newRequest = await VisitorService.insertJoinRequest(
      req.app.get('db'),
      request
    )

    console.log(newRequest)

    res.status(201).json({message: 'Join request sent'})


  } catch(e) {
    next(e)
  }
})




  module.exports = visitorRouter;