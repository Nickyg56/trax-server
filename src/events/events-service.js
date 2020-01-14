const moment = require('moment');

const EventService = {
  insertEvent(db, newEvent) {
    return db('events')
      .insert(newEvent)
      .returning('*')
      .then(res => res[0]);
  },
  insertUserEvent(db, event_id, user_id, is_admin) {
    return db('user_events')
      .insert({ event_id, user_id, is_admin })
      .returning('*')
      .then(res => res[0]);
  },
  insertUserEvents(db, eventId, userArr, creatorId) {
    for (let i = 0; i < userArr.length; i++) {
      let isAdmin = false;
      if (creatorId === userArr[i].id || userArr[i].is_admin) {
        isAdmin = true;
      }
      this.insertUserEvent(db, eventId, userArr[i].id, isAdmin);
    }
  },

  getEventsByMonth(db, project_id, searchString) {
    return db('events')
      .select('*')
      .where('events.project_id', project_id)
      .andWhere('date', 'like', `${searchString}%`);
  },
  getEventsByProjectId(db, project_id) {
    return db('events')
      .select('*')
      .where('events.project_id', project_id);
  },
  getEventsByUserId(db, user_id) {
    //use this for events sidebar
    return db
      .select(
        'events.id',
        'events.title',
        'events.event_description',
        'events.start_time',
        'events.end_time',
        'events.date',
        'events.created_by',
        'events.date_modified',
        'events.last_modified_by',
        'events.project_id',
        'events.user_id AS creator_id',
        'user_events.is_admin'
      )
      .from('user_events')
      .join('events', 'events.id', 'user_events.event_id')
      .where('user_events.user_id', user_id);
  },
  insertUnavailableDate(db, date) {
    return db('unavailable_dates')
      .insert(date)
      .returning('*')
      .then(res => res[0]);
  },
  getUnavailableDays(db, project_id, searchString) {
    //searchString format 'YYYY-MM'
    return db('unavailable_dates')
      .select('unavailable_dates.date')
      .where({ project_id })
      .andWhere('date', 'like', `${searchString}%`)
      .then(dates => {
        return dates.map(date => parseInt(date.date.slice(8, 10)));
      });
  },
  formatEvents(events, filter = false){
    
    let formattedEvents = events.map(event => {
      return {
        id: event.id,
        title: event.title,
        description: event.event_description,
        start: event.start_time,
        end: event.end_time,
        createdBy: event.created_by,
        dateCreated: event.date_created,
        dateModified: event.date_modified,
        lastModifiedBy: event.last_modified_by,
        projectId: event.project_id,
      };
    });
    if(filter){
      formattedEvents = this.filterEventsBeforeCurrentDate(formattedEvents);
    }
    return formattedEvents;
  },
  filterEventsBeforeCurrentDate(events){
    const today = moment().format().slice(0, 10);
    const todayNum = parseInt(today.split('-').reduce((a, b) => a + b));
    //compares date of event to the current date
    const newEvents = events.filter(event => 
      parseInt(event.start.toISOString().slice(0, 10).split('-').reduce((a, b) => a + b)) >= todayNum
    );
    return newEvents;
  },
};

module.exports = EventService;