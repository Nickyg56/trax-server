const config = require('../config');

const VisitorService = {


  getVisitorProjectData(db, projectId) {
    return db('projects')
      .select('*')
      .where('projects.id', projectId)
      .first();
  },
  getVisitorProjectUserData(db, projectId) {
    return db.select(
      'users.id',
      'users.full_name',
      'user_projects.role',
      'user_projects.is_admin'
    )
      .from('user_projects')
      .join('users', 'users.id', 'user_projects.user_id')
      .where('user_projects.project_id', projectId);
  },
  getVisitorProjectEventsData(db, projectId){
    return db
      .select('*')
      .from('events')
      .where('events.project_id', projectId);
  }

};

module.exports = VisitorService;