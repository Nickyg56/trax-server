

const ProjectService = {
  insertProject(db, newProject) {
    return db('projects')
      .insert(newProject)
      .returning('*')
      .then(res => res[0]);
  },
  getProjectsByProjectTitle(db, title){
    return db('projects')
      .select('*')
      .where('title', 'ilike', `${title}%`)
      .then(res => res.map(project =>  {
        return {
          id: project.id,
          title: project.title,
          description: project.project_description,
          dateCreated: project.date_created,
          dateModified: project.date_modified
        };
      }));
  },
  getProjectJoinRequestsByUserId(db, userId){
    return db('join_requests')
      .select('*')
      .where('user_id', userId);
  },
  insertUserProject(db, newUserProject) {
    return db('user_projects')
      .insert(newUserProject)
      .returning('*')
      .then(res => res[0]);
  },
  serializeNewProject(project, userProject) {
    return {
      id: project.id,
      title: project.title,
      description: project.project_description,
      dateCreated: project.date_created,
      dateModified: project.date_modified, //fix "modified typo"
      role: userProject.role,
      isAdmin: userProject.is_admin,
    };
  },
  getUserProjects(db, user_id) {
    return db
      .select(
        'projects.id',
        'projects.title',
        'projects.project_description',
        'projects.date_created',
        'user_projects.role',
        'user_projects.is_admin'
      )
      .from('user_projects')
      .join('projects', 'projects.id', 'user_projects.project_id')
      .where({ user_id });
  },
  getProjectById(db, project_id) {
    return db
      .select(
        'projects.id',
        'projects.title',
        'projects.project_description',
        'projects.date_created',
        'user_projects.role',
        'user_projects.is_admin'
      )
      .from('user_projects')
      .join('projects', 'projects.id', 'user_projects.project_id')
      .where({ project_id })
      .first();
  },
  deleteProjectById(db, project_id){
    return db('projects')
      .where('id', project_id)
      .delete();

  },
  getProjectUsersByProjectId(db, project_id){
    return db
      .select(
        'users.id',
        'users.full_name',
        'user_projects.role',
        'user_projects.is_admin'
      )
      .from('user_projects')
      .join('users', 'users.id', 'user_projects.user_id') //???
      .where({project_id});
  }
};

module.exports = ProjectService;