CREATE TABLE users (
  id serial primary key,
  full_name text not null,
  password text not null,
  email text not null unique,
  date_created timestamptz not null default now(),
  date_modified timestamptz
);

create table projects (
  id serial primary key,
  title text not null,
  project_description text not null,
  date_created timestamptz not null default now(),
  date_modified timestamptz
);

create table user_projects (
  id serial primary key,
  project_id integer 
    references projects(id) on delete cascade not null,
  user_id integer
    references users(id) on delete cascade not null,
  is_admin boolean not null default false,
  role text not null
);