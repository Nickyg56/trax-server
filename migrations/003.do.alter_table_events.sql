alter table events 
  add column project_id integer
    references projects(id) on delete cascade not null;