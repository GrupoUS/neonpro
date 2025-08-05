/**
 * CRM Business Logic Utilities
 * Pure functions for Customer Relationship Management operations
 * Created: January 24, 2025
 */
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLeadScore = calculateLeadScore;
exports.categorizeLeadPriority = categorizeLeadPriority;
exports.determineCustomerLifecycle = determineCustomerLifecycle;
exports.calculateDaysSinceLastVisit = calculateDaysSinceLastVisit;
exports.predictChurnRisk = predictChurnRisk;
exports.calculateCustomerLifetimeValue = calculateCustomerLifetimeValue;
exports.calculateAverageAppointmentValue = calculateAverageAppointmentValue;
exports.rankCustomersByValue = rankCustomersByValue;
exports.determineNextFollowUpDate = determineNextFollowUpDate;
exports.generateFollowUpMessage = generateFollowUpMessage;
exports.segmentCustomers = segmentCustomers;
exports.calculateRetentionRate = calculateRetentionRate;
// ============================================================================
// Lead Scoring Functions
// ============================================================================
/**
 * Calculate lead score for a customer based on engagement, value, frequency, and recency
 * @param customer - Customer data
 * @param appointments - Customer's appointment history
 * @returns LeadScore object with detailed scoring
 */
function calculateLeadScore(customer, appointments) {
  if (appointments === void 0) {
    appointments = [];
  }
  if (!customer || !customer.id) {
    throw new Error("Invalid customer data provided");
  }
  var now = Date.now();
  var registrationDate = Date.parse(customer.registrationDate);
  var lastVisitDate = customer.lastVisitDate ? Date.parse(customer.lastVisitDate) : null;
  // Calculate scoring factors (0-25 points each, total 100)
  // 1. Engagement Score (based on satisfaction, communication preference, notes)
  var engagementScore = 0;
  if (customer.satisfactionRating) {
    engagementScore += (customer.satisfactionRating / 5) * 15; // 0-15 points
  }
  if (customer.notes && customer.notes.length > 50) {
    engagementScore += 5; // Detailed notes indicate engagement
  }
  if (customer.communicationPreference === "whatsapp") {
    engagementScore += 3; // More engaged customers prefer instant messaging
  }
  if (customer.tags.length > 0) {
    engagementScore += Math.min(customer.tags.length * 2, 7); // Up to 7 points for tags
  }
  engagementScore = Math.min(engagementScore, 25);
  // 2. Value Score (based on total spent and average appointment value)
  var valueScore = 0;
  if (customer.totalSpent > 0) {
    // Scale: 0-500 = 0-15 points, 500-2000 = 15-20 points, >2000 = 20-25 points
    if (customer.totalSpent <= 500) {
      valueScore = (customer.totalSpent / 500) * 15;
    } else if (customer.totalSpent <= 2000) {
      valueScore = 15 + ((customer.totalSpent - 500) / 1500) * 5;
    } else {
      valueScore = 25;
    }
  }
  valueScore = Math.min(valueScore, 25);
  // 3. Frequency Score (based on appointment count and frequency)
  var frequencyScore = 0;
  if (customer.appointmentCount > 0) {
    var daysSinceRegistration = Math.max(1, (now - registrationDate) / (1000 * 60 * 60 * 24));
    var appointmentFrequency = customer.appointmentCount / (daysSinceRegistration / 30); // per month
    // Scale: 0-0.5 appointments/month = 0-10 points, 0.5-2 = 10-20 points, >2 = 20-25 points
    if (appointmentFrequency <= 0.5) {
      frequencyScore = appointmentFrequency * 20;
    } else if (appointmentFrequency <= 2) {
      frequencyScore = 10 + ((appointmentFrequency - 0.5) / 1.5) * 10;
    } else {
      frequencyScore = 25;
    }
  }
  frequencyScore = Math.min(frequencyScore, 25);
  // 4. Recency Score (based on last visit date)
  var recencyScore = 0;
  if (lastVisitDate) {
    var daysSinceLastVisit = (now - lastVisitDate) / (1000 * 60 * 60 * 24);
    // Scale: 0-30 days = 25 points, 30-90 days = 20-10 points, >90 days = 10-0 points
    if (daysSinceLastVisit <= 30) {
      recencyScore = 25;
    } else if (daysSinceLastVisit <= 90) {
      recencyScore = 25 - ((daysSinceLastVisit - 30) / 60) * 15;
    } else if (daysSinceLastVisit <= 180) {
      recencyScore = 10 - ((daysSinceLastVisit - 90) / 90) * 10;
    } else {
      recencyScore = 0;
    }
  } else {
    // No visits yet, give some points for being new
    var daysSinceRegistration = (now - registrationDate) / (1000 * 60 * 60 * 24);
    if (daysSinceRegistration <= 7) {
      recencyScore = 15; // New customer, potential
    } else if (daysSinceRegistration <= 30) {
      recencyScore = 10;
    } else {
      recencyScore = 5;
    }
  }
  recencyScore = Math.min(recencyScore, 25);
  var totalScore = Math.round(engagementScore + valueScore + frequencyScore + recencyScore);
  return {
    customerId: customer.id,
    score: Math.min(100, Math.max(0, totalScore)),
    factors: {
      engagement: Math.round(engagementScore),
      value: Math.round(valueScore),
      frequency: Math.round(frequencyScore),
      recency: Math.round(recencyScore),
    },
    priority: categorizeLeadPriority(totalScore),
    lastCalculated: new Date().toISOString(),
  };
}
/**
 * Categorize lead priority based on score
 * @param score - Lead score (0-100)
 * @returns Priority category
 */
function categorizeLeadPriority(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
// ============================================================================
// Customer Lifecycle Functions
// ============================================================================
/**
 * Determine customer lifecycle stage
 * @param customer - Customer data
 * @returns Lifecycle stage
 */
function determineCustomerLifecycle(customer) {
  if (!customer) {
    throw new Error("Customer data is required");
  }
  var now = Date.now();
  var registrationDate = Date.parse(customer.registrationDate);
  var daysSinceRegistration = (now - registrationDate) / (1000 * 60 * 60 * 24);
  // If customer is marked as churned, return churned
  if (customer.status === "churned") {
    return "churned";
  }
  // If registered within last 30 days and has 0-2 appointments, consider new
  if (daysSinceRegistration <= 30 && customer.appointmentCount <= 2) {
    return "new";
  }
  // If no last visit date and registered more than 30 days ago, likely churned
  if (!customer.lastVisitDate && daysSinceRegistration > 30) {
    return "churned";
  }
  if (customer.lastVisitDate) {
    var daysSinceLastVisit = calculateDaysSinceLastVisit(customer.lastVisitDate);
    // Active: visited within last 60 days
    if (daysSinceLastVisit <= 60) {
      return "active";
    }
    // At-risk: visited 60-120 days ago
    if (daysSinceLastVisit <= 120) {
      return "at-risk";
    }
    // Churned: no visit for more than 120 days
    return "churned";
  }
  return "new";
}
/**
 * Calculate days since last visit
 * @param lastVisitDate - ISO date string of last visit
 * @returns Number of days since last visit
 */
function calculateDaysSinceLastVisit(lastVisitDate) {
  if (!lastVisitDate) {
    throw new Error("Last visit date is required");
  }
  var now = Date.now();
  var lastVisit = Date.parse(lastVisitDate);
  if (isNaN(lastVisit)) {
    throw new Error("Invalid date format for last visit date");
  }
  return Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
}
/**
 * Predict churn risk percentage
 * @param customer - Customer data
 * @returns Churn risk percentage (0-100)
 */
function predictChurnRisk(customer) {
  if (!customer) {
    throw new Error("Customer data is required");
  }
  var riskScore = 0;
  var now = Date.now();
  // Factor 1: Days since last visit (40% weight)
  if (customer.lastVisitDate) {
    var daysSinceLastVisit = calculateDaysSinceLastVisit(customer.lastVisitDate);
    if (daysSinceLastVisit > 120) {
      riskScore += 40;
    } else if (daysSinceLastVisit > 90) {
      riskScore += 30;
    } else if (daysSinceLastVisit > 60) {
      riskScore += 20;
    } else if (daysSinceLastVisit > 30) {
      riskScore += 10;
    }
  } else {
    // No visits at all
    var registrationDate_1 = Date.parse(customer.registrationDate);
    var daysSinceRegistration_1 = (now - registrationDate_1) / (1000 * 60 * 60 * 24);
    if (daysSinceRegistration_1 > 30) {
      riskScore += 35;
    }
  }
  // Factor 2: Appointment frequency (25% weight)
  var registrationDate = Date.parse(customer.registrationDate);
  var daysSinceRegistration = Math.max(1, (now - registrationDate) / (1000 * 60 * 60 * 24));
  var appointmentFrequency = customer.appointmentCount / (daysSinceRegistration / 30);
  if (appointmentFrequency < 0.25) {
    riskScore += 25;
  } else if (appointmentFrequency < 0.5) {
    riskScore += 15;
  } else if (appointmentFrequency < 1) {
    riskScore += 5;
  }
  // Factor 3: Satisfaction rating (20% weight)
  if (customer.satisfactionRating) {
    if (customer.satisfactionRating <= 2) {
      riskScore += 20;
    } else if (customer.satisfactionRating <= 3) {
      riskScore += 10;
    } else if (customer.satisfactionRating <= 4) {
      riskScore += 5;
    }
  }
  // Factor 4: Total spent vs time (15% weight)
  var averageMonthlySpend = customer.totalSpent / (daysSinceRegistration / 30);
  if (averageMonthlySpend < 50) {
    riskScore += 15;
  } else if (averageMonthlySpend < 100) {
    riskScore += 10;
  } else if (averageMonthlySpend < 200) {
    riskScore += 5;
  }
  return Math.min(100, Math.max(0, riskScore));
}
// ============================================================================
// Customer Value Functions
// ============================================================================
/**
 * Calculate customer lifetime value based on appointment history
 * @param appointments - Array of customer appointments
 * @returns Customer lifetime value
 */
function calculateCustomerLifetimeValue(appointments) {
  if (!appointments || appointments.length === 0) {
    return 0;
  }
  // Only count completed appointments
  var completedAppointments = appointments.filter((apt) => apt.status === "completed");
  if (completedAppointments.length === 0) {
    return 0;
  }
  // Sum all completed appointment costs
  var totalValue = completedAppointments.reduce((sum, apt) => sum + (apt.cost || 0), 0);
  return Math.round(totalValue * 100) / 100; // Round to 2 decimal places
}
/**
 * Calculate average appointment value
 * @param appointments - Array of customer appointments
 * @returns Average appointment value
 */
function calculateAverageAppointmentValue(appointments) {
  if (!appointments || appointments.length === 0) {
    return 0;
  }
  var completedAppointments = appointments.filter((apt) => apt.status === "completed");
  if (completedAppointments.length === 0) {
    return 0;
  }
  var totalValue = completedAppointments.reduce((sum, apt) => sum + (apt.cost || 0), 0);
  var averageValue = totalValue / completedAppointments.length;
  return Math.round(averageValue * 100) / 100; // Round to 2 decimal places
}
/**
 * Rank customers by total value (descending)
 * @param customers - Array of customers
 * @returns Customers sorted by total spent (highest first)
 */
function rankCustomersByValue(customers) {
  if (!customers || customers.length === 0) {
    return [];
  }
  return __spreadArray([], customers, true).sort(
    (a, b) => (b.totalSpent || 0) - (a.totalSpent || 0),
  );
}
// ============================================================================
// Follow-up Management Functions
// ============================================================================
/**
 * Determine next follow-up date based on customer type and last contact
 * @param lastContactDate - ISO date string of last contact
 * @param customerType - Type of customer ('new', 'active', 'at-risk', 'churned')
 * @returns ISO date string for next follow-up
 */
function determineNextFollowUpDate(lastContactDate, customerType) {
  if (!lastContactDate) {
    throw new Error("Last contact date is required");
  }
  var lastContact = Date.parse(lastContactDate);
  if (isNaN(lastContact)) {
    throw new Error("Invalid date format for last contact date");
  }
  var daysToAdd = 30; // Default
  switch (customerType) {
    case "new":
      daysToAdd = 7; // Follow up new customers weekly
      break;
    case "active":
      daysToAdd = 30; // Follow up active customers monthly
      break;
    case "at-risk":
      daysToAdd = 14; // Follow up at-risk customers bi-weekly
      break;
    case "churned":
      daysToAdd = 90; // Follow up churned customers quarterly
      break;
    default:
      daysToAdd = 30;
  }
  var followUpDate = new Date(lastContact + daysToAdd * 24 * 60 * 60 * 1000);
  return followUpDate.toISOString();
}
/**
 * Generate follow-up message based on customer and context
 * @param customer - Customer data
 * @param context - Context for the follow-up ('appointment', 'satisfaction', 'retention')
 * @returns Follow-up message string
 */
function generateFollowUpMessage(customer, context) {
  if (!customer || !customer.name) {
    throw new Error("Customer data with name is required");
  }
  var firstName = customer.name.split(" ")[0];
  switch (context) {
    case "appointment":
      return "Hi ".concat(
        firstName,
        "! Hope you're doing well. It's been a while since your last visit. Would you like to schedule your next appointment?",
      );
    case "satisfaction":
      return "Hi ".concat(
        firstName,
        "! We'd love to hear about your recent experience with us. Your feedback helps us improve our services.",
      );
    case "retention":
      return "Hi ".concat(
        firstName,
        "! We miss you! As a valued client, we'd like to offer you a special discount on your next visit. Contact us to schedule!",
      );
    case "birthday":
      return "Happy Birthday ".concat(
        firstName,
        "! \uD83C\uDF89 We hope you have a wonderful day. Treat yourself to one of our services - contact us for a special birthday offer!",
      );
    default:
      return "Hi ".concat(
        firstName,
        "! Just checking in to see how you're doing. Let us know if there's anything we can help you with!",
      );
  }
}
// ============================================================================
// Analytics and Segmentation Functions
// ============================================================================
/**
 * Segment customers based on criteria
 * @param customers - Array of customers
 * @param criteria - Segmentation criteria
 * @returns Array of customer segments
 */
function segmentCustomers(customers, criteria) {
  if (!customers || customers.length === 0) {
    return [];
  }
  var segments = [];
  // High Value Customers
  if (criteria.minTotalSpent) {
    var highValueCustomers = customers.filter((c) => c.totalSpent >= criteria.minTotalSpent);
    if (highValueCustomers.length > 0) {
      segments.push({
        name: "High Value Customers",
        customers: highValueCustomers,
        criteria: "Total spent >= $".concat(criteria.minTotalSpent),
        size: highValueCustomers.length,
      });
    }
  }
  // Frequent Customers
  if (criteria.minAppointments) {
    var frequentCustomers = customers.filter((c) => c.appointmentCount >= criteria.minAppointments);
    if (frequentCustomers.length > 0) {
      segments.push({
        name: "Frequent Customers",
        customers: frequentCustomers,
        criteria: "Appointments >= ".concat(criteria.minAppointments),
        size: frequentCustomers.length,
      });
    }
  }
  // At-Risk Customers
  if (criteria.daysSinceLastVisit) {
    var atRiskCustomers = customers.filter((c) => {
      if (!c.lastVisitDate) return false;
      var daysSince = calculateDaysSinceLastVisit(c.lastVisitDate);
      return daysSince >= criteria.daysSinceLastVisit;
    });
    if (atRiskCustomers.length > 0) {
      segments.push({
        name: "At-Risk Customers",
        customers: atRiskCustomers,
        criteria: "No visit for ".concat(criteria.daysSinceLastVisit, "+ days"),
        size: atRiskCustomers.length,
      });
    }
  }
  // Satisfied Customers
  if (criteria.satisfactionThreshold) {
    var satisfiedCustomers = customers.filter(
      (c) => c.satisfactionRating && c.satisfactionRating >= criteria.satisfactionThreshold,
    );
    if (satisfiedCustomers.length > 0) {
      segments.push({
        name: "Highly Satisfied Customers",
        customers: satisfiedCustomers,
        criteria: "Satisfaction >= ".concat(criteria.satisfactionThreshold),
        size: satisfiedCustomers.length,
      });
    }
  }
  return segments;
}
/**
 * Calculate retention rate over a period
 * @param customers - Array of customers
 * @param periodMonths - Period in months to analyze
 * @returns Retention analysis object
 */
function calculateRetentionRate(customers, periodMonths) {
  if (!customers || customers.length === 0) {
    return {
      totalCustomers: 0,
      activeCustomers: 0,
      churnedCustomers: 0,
      retentionRate: 0,
      averageLifetimeValue: 0,
      riskCustomers: [],
    };
  }
  var now = Date.now();
  var periodStart = now - periodMonths * 30 * 24 * 60 * 60 * 1000;
  // Customers who were active at the start of the period
  var eligibleCustomers = customers.filter((c) => {
    var registrationDate = Date.parse(c.registrationDate);
    return registrationDate <= periodStart;
  });
  // Customers still active (visited within last 60 days)
  var activeCustomers = eligibleCustomers.filter((c) => {
    if (!c.lastVisitDate) return false;
    var daysSince = calculateDaysSinceLastVisit(c.lastVisitDate);
    return daysSince <= 60;
  });
  // Churned customers
  var churnedCustomers = eligibleCustomers.filter((c) => {
    if (!c.lastVisitDate) return true;
    var daysSince = calculateDaysSinceLastVisit(c.lastVisitDate);
    return daysSince > 120;
  });
  // At-risk customers (60-120 days since last visit)
  var riskCustomers = eligibleCustomers.filter((c) => {
    if (!c.lastVisitDate) return false;
    var daysSince = calculateDaysSinceLastVisit(c.lastVisitDate);
    return daysSince > 60 && daysSince <= 120;
  });
  var retentionRate =
    eligibleCustomers.length > 0 ? (activeCustomers.length / eligibleCustomers.length) * 100 : 0;
  var averageLifetimeValue =
    customers.length > 0
      ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
      : 0;
  return {
    totalCustomers: eligibleCustomers.length,
    activeCustomers: activeCustomers.length,
    churnedCustomers: churnedCustomers.length,
    retentionRate: Math.round(retentionRate * 100) / 100,
    averageLifetimeValue: Math.round(averageLifetimeValue * 100) / 100,
    riskCustomers: riskCustomers,
  };
}
