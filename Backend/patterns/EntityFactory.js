// Backend/patterns/EntityFactory.js
// PATTERN: Factory - creates different system entities without exposing creation logic

class DisasterReport {
  constructor(data) {
    this.user_id = data.user_id;
    this.disaster_type = data.disaster_type;
    this.description = data.description;
    this.location = data.location;
    this.status = 'Pending';
    this.created_at = new Date();
  }
}

class ResourceEntity {
  constructor(data) {
    this.ngo_user_id = data.ngo_user_id;
    this.resource_name = data.resource_name;
    this.quantity = data.quantity;
    this.unit = data.unit;
    this.status = 'Available';
    this.created_at = new Date();
  }
}

class RescueTask {
  constructor(data) {
    this.report_id = data.report_id;
    this.assigned_to = data.assigned_to;
    this.description = data.description;
    this.status = 'Assigned';
    this.created_at = new Date();
  }
}

class EntityFactory {
  static create(type, data) {
    switch (type) {
      case 'disaster':
        return new DisasterReport(data);
      case 'resource':
        return new ResourceEntity(data);
      case 'task':
        return new RescueTask(data);
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
  }
}

module.exports = EntityFactory;