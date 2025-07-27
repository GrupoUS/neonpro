import { TestEnvironment } from 'jest-environment-jsdom'

export default class CustomTestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup()
    
    // Mock React 19 scheduler with simple functions
    this.global.scheduler = {
      postTask: () => {},
      unstable_scheduleCallback: () => {},
      unstable_cancelCallback: () => {},
      unstable_shouldYield: () => false,
      unstable_requestPaint: () => {},
      unstable_runWithPriority: (_: any, callback: any) => callback(),
      unstable_next: (callback: any) => callback(),
      unstable_wrapCallback: (callback: any) => callback,
      unstable_getCurrentPriorityLevel: () => 1,
      unstable_ImmediatePriority: 1,
      unstable_UserBlockingPriority: 2,
      unstable_NormalPriority: 3,
      unstable_LowPriority: 4,
      unstable_IdlePriority: 5,
      unstable_now: () => Date.now()
    }

    // Set React testing environment flag
    this.global.IS_REACT_ACT_ENVIRONMENT = true
  }
}
