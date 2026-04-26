// Backend/patterns/NotificationObserver.js
// PATTERN: Observer - inserts real notifications into DB when emergency is reported

const pool = require('../config/db');

class EmergencySubject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notify(emergencyData) {
    this.observers.forEach(observer => observer.update(emergencyData));
  }
}

// Observer - inserts actual notification into DB
const RescueWorkerObserver = {
  name: 'RescueWorkerObserver',
  async update(data) {
    await pool.execute(
      `INSERT INTO Notification (title, message, datetime_sent, is_active, created_by) 
       VALUES (?, ?, NOW(), 1, ?)`,
      [
        `New ${data.disaster_type} Emergency!`,
        `Emergency reported at ${data.location_desc}. Status: ${data.status}. Rescue workers required immediately.`,
        data.user_id || null   // ← change this line
      ]
    );
    console.log(`[Observer] Notification inserted into DB for emergency at ${data.location_desc}`);
  }
};

const emergencySubject = new EmergencySubject();
emergencySubject.subscribe(RescueWorkerObserver);

module.exports = { emergencySubject };