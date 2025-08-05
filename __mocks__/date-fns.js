// Mock for date-fns module
const actualDateFns = jest.requireActual("date-fns");

module.exports = {
  ...actualDateFns,

  // Create mockable functions
  format: jest.fn((date, formatStr) => actualDateFns.format(date, formatStr)),
  parseISO: jest.fn((dateString) => actualDateFns.parseISO(dateString)),
  startOfMonth: jest.fn((date) => actualDateFns.startOfMonth(date)),
  startOfDay: jest.fn((date) => actualDateFns.startOfDay(date)),
  endOfMonth: jest.fn((date) => actualDateFns.endOfMonth(date)),
  endOfDay: jest.fn((date) => actualDateFns.endOfDay(date)),
  addDays: jest.fn((date, amount) => actualDateFns.addDays(date, amount)),
  isValid: jest.fn((date) => actualDateFns.isValid(date)),
  isBefore: jest.fn((date, dateToCompare) => actualDateFns.isBefore(date, dateToCompare)),
  isAfter: jest.fn((date, dateToCompare) => actualDateFns.isAfter(date, dateToCompare)),
  differenceInDays: jest.fn((dateLeft, dateRight) =>
    actualDateFns.differenceInDays(dateLeft, dateRight),
  ),
  eachDayOfInterval: jest.fn((interval) => actualDateFns.eachDayOfInterval(interval)),
};
