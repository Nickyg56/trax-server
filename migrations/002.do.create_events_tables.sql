create table events (
  id serial primary key,
  user_id integer
    references users(id) on delete cascade not null,
  title text not null,
  event_description text not null,
  start_time timestamp,
  end_time timestamp,
  created_by text not null,
  date_created timestamptz not null default now(),
  date_modified timestamptz,
  last_modified_by text
);

create table user_events (
  id serial primary key,
  event_id integer 
    references events(id) on delete cascade not null,
  user_id integer
    references users(id) on delete cascade not null,
  is_admin boolean not null default false
);

create table unavailable_dates (
  id serial primary key,
  project_id integer 
    references projects(id) on delete cascade not null,
  date varchar not null
);

