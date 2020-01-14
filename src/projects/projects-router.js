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
      const {query} = req.query

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