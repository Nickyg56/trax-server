const EventService = {
  insertEvent(db, newEvent) {
    return db('events')
      .insert(newEvent)
      .returning('*')
      .then(res => res[0]);
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
};

module.exports = EventService;