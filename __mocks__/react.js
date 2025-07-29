// Mock React for Jest testing
module.exports = {
  ...jest.requireActual('react'),
  useState: jest.fn((initial) => [initial, jest.fn()]),
  useEffect: jest.fn((fn) => fn()),
  useCallback: jest.fn((fn) => fn),
  useRef: jest.fn(() => ({ current: null })),
  useMemo: jest.fn((fn) => fn())
};