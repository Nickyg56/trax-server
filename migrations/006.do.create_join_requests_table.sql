create table join_requests (
  id serial primary key,
  project_id integer
    references projects(id) on delete cascade not null,
  message text,
  user_id integer
    references users(id) on delete cascade not null,
  user_name text
);