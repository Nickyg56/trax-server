const express = require('express');
const projectsRouter = express.Router();
const ProjectService = require('./project-service');

const jsonBodyParser = express.json();

const { requireAuth } = require('../middleware/jwt-auth');


projectsRouter
  .post('/', jsonBodyParser, requireAuth, async (req, res, next) => {
    try {

      const { title, description, role } = req.body;

      //xss scrub title and description

      if (!role) {
        return res.status(400).json({ error: 'Missing role in request body' })
      }

      const userProject = {
        title,
        project_description: description,
      }

      for (const [key, value] of Object.entries(userProject))
        if (value === null) {
          return res.status(400).json({ error: `Missing '${key}' in request body` })
        }

      const newProject = await ProjectService.insertProject(req.app.get('db'), userProject)

      const newUserProject = await ProjectService.insertUserProject(
        req.app.get('db'),
        {
          project_id: newProject.id,
          user_id: req.user.id,
          is_admin: true,
          role: role,
        });

      return res.status(201).json(ProjectService.serializeNewProject(newProject, newUserProject));
    } catch (e) {
      next(e)
    }
  })
  .get('/', requireAuth, async (req, res, next) => {

    try {
      const userProjects = await ProjectService.getUserProjects(req.app.get('db'), req.user.id)

      res.status(200).json(userProjects);

    } catch (e) {
      next(e)
    }
  })

projectsRouter
  .get('/search', requireAuth, async (req, res, next) => {
    try {
      console.log('search endpoint REACHED');
      const { query } = req.query

      console.log(typeof query)

      let projects = await ProjectService.getProjectsByProjectTitle(
        req.app.get('db'),
        query
      )

      console.log(projects)

      req.app.get('io').emit('project search active', (projects))
      res.status(200).end()
    } catch(e) {
      next(e)
    }
  })


  projectsRouter
    .post('/requests/accept', requireAuth, jsonBodyParser, async (req, res, next) => {

      try {
        const {role, userId, projectId} = req.body

        console.log(role, userId, projectId)

        await ProjectService.insertUserProject(
          req.app.get('db'),
          {
            project_id: projectId,
            user_id: userId,
            is_admin: false,
            role,
          }
        )

        res.status(201).json({message: 'request accepted'})
      } catch(e){
        next(e)
      }
    })

    projectsRouter
      .delete('/requests/reject/:requestId', requireAuth, async (req, res, next) => {
        try {
          const {requestId} = req.params;


          if(!requestId){
            res.status(400).json({error: 'Missing request id'})
          }

          await ProjectService.deleteJoinRequest(
            req.app.get('db'),
            requestId
          )

          res.status(204).end()
        }
        catch(e) {
          next(e)
        }
      })



  projectsRouter
    .get('/requests', requireAuth, async (req, res, next) => {
        //need to get all projects in which req.user.id is an admin 
        //then need to search for join_requests from those projects and send them in the response

      try {

        const adminProjects = await ProjectService.getUserProjectsWhereUserAdmin(
          req.app.get('db'),
          req.user.id
        )

        const projectRequests = []

        for (let i = 0; i < adminProjects.length; i ++){
          let requests = await ProjectService.getProjectJoinRequestsByProjectId(
                req.app.get('db'),
                adminProjects[i].id
             )
              if(requests.length > 0){
                projectRequests.push([adminProjects[i].title, requests])
              }
        }

        res.status(200).json(projectRequests)

      } catch(e) {
        next(e)
      }
    })

  projectsRouter
    .get('/requests/user/:userId', requireAuth, async (req, res, next) => {
      //this endpoint can be used to see which requests you have sent out as a user
      //Get join requests by user id
      //user id in params
      //validates by comparing the id to the req.user.id from auth middleware
      const { userId } = req.params;

      console.log( typeof userId)

      if((parseInt(userId)) !== req.user.id){
        res.status(404).json({error: 'unauthorized request'})
      }

      try {

        const requests = await ProjectService.getProjectJoinRequestsByUserId(
          req.app.get('db'),
          userId
        )


        res.status(200).json(requests)
      } catch(e){
        next(e)
      }
    })

projectsRouter
  .get('/:projectId', requireAuth, async (req, res, next) => {
    try {
      const {projectId} = req.params;
      if(!projectId)
      res.status(400).json({ error: 'Missing project id in request body'})
      const currProject = await ProjectService.getProjectById(req.app.get('db'), projectId)
      const resUsers = await ProjectService.getProjectUsersByProjectId(req.app.get('db'), projectId)
      
      const users = resUsers.map(user => {
        return {
          id: user.id,
          fullName: user.full_name,
          isAdmin: user.is_admin,
          role: user.role
        }
      })

      res.status(200).json({
        project: {
          id: currProject.id,
          title: currProject.title,
          description: currProject.project_description,
          isAdmin: currProject.is_admin,
          role: currProject.role,
          dateCreated: currProject.date_created

        },
        users
      })

    } catch(e) {
      next(e)
    }
  })

  projectsRouter
    .delete('/:projectId', requireAuth, async (req, res, next) => {
      try {
        const {projectId} = req.params

        console.log('Delete reached', projectId)

        await ProjectService.deleteProjectById(
          req.app.get('db'),
          projectId
        )


        res.status(202).end()
      } catch(e) {
        next(e)
      }
    })

module.exports = projectsRouter;