const EventService = {
  insertEvent(db, newEvent){
    return db('events')
      .insert(newEvent)
      .returning('*')
      .then(res => res[0]);
  },
  insertUnavailableDate(db, date){
    return db('unavailable_dates')
      .insert(date)
      .returning('*')
      .then(res => res[0]);
  },
};

module.exports = EventService;