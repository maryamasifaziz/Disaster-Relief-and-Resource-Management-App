// Backend/patterns/AllocationStrategy.js
// PATTERN: Strategy - different resource allocation strategies based on priority or availability

// Strategy 1 - Allocate by availability (resources with most quantity first)
class AvailabilityStrategy {
  allocate(resources) {
    console.log('[Strategy] Allocating resources by availability...');
    return resources
      .filter(r => r.resource_availability_status === 'Available')
      .sort((a, b) => b.resource_quantity - a.resource_quantity);
  }
}

// Strategy 2 - Allocate by priority (food and medicine first)
class PriorityStrategy {
  allocate(resources) {
    console.log('[Strategy] Allocating resources by priority...');
    const priorityOrder = ['Medicine', 'Food', 'Water', 'Clothing', 'Shelter'];
    return resources
      .filter(r => r.resource_availability_status === 'Available')
      .sort((a, b) => {
        const aPriority = priorityOrder.indexOf(a.resource_type);
        const bPriority = priorityOrder.indexOf(b.resource_type);
        const aIndex = aPriority === -1 ? 999 : aPriority;
        const bIndex = bPriority === -1 ? 999 : bPriority;
        return aIndex - bIndex;
      });
  }
}

// Context class - uses whichever strategy is set
class ResourceAllocator {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
    console.log(`[Strategy] Switched to: ${strategy.constructor.name}`);
  }

  allocate(resources) {
    return this.strategy.allocate(resources);
  }
}

module.exports = { ResourceAllocator, AvailabilityStrategy, PriorityStrategy };