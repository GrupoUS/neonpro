/**
 * @file Core analytics calculation utilities
 */

// Constants
const PERCENTAGE_MULTIPLIER = 100
const DECIMAL_PRECISION = 100
const MONTHS_PER_YEAR = 12
const CENTS_THRESHOLD = 1000
const ZERO = 0
const NEGATIVE_ONE = -1

interface Subscription {
  amount?: number
  interval?: 'monthly' | 'yearly'
  price?: number
  status: 'active' | 'cancelled' | 'inactive'
}

/**
 * Calculate growth percentage between current and previous values
 * @param {number} current Current value
 * @param {number} previous Previous value
 * @returns {number} Growth percentage
 */
const calculateGrowth = (current: number, previous: number,): number => {
  if (previous === ZERO) {
    if (current > ZERO) {
      return PERCENTAGE_MULTIPLIER
    }
    return ZERO
  }
  return ((current - previous) / previous) * PERCENTAGE_MULTIPLIER
}

/**
 * Calculate growth rate between current and previous values
 * @param {number | null} previous Previous value
 * @param {number | null} current Current value
 * @returns {number} Growth rate as decimal
 */
const calculateGrowthRate = (
  previous: number | null,
  current: number | null,
): number => {
  if (current === null || previous === null) {
    return Number.NaN
  }
  if (Number.isNaN(current,) || Number.isNaN(previous,)) {
    return Number.NaN
  }
  if (previous === ZERO) {
    if (current > ZERO) {
      return Number.POSITIVE_INFINITY
    }
    return NEGATIVE_ONE
  }
  if (current === ZERO && previous > ZERO) {
    return NEGATIVE_ONE
  }
  return (current - previous) / previous
}

/**
 * Calculate Monthly Recurring Revenue from subscriptions
 * @param {Subscription[] | null | undefined} subscriptions Array of subscription objects
 * @returns {number} MRR value
 */
const calculateMRR = (
  subscriptions: Subscription[] | null | undefined,
): number => {
  if (!Array.isArray(subscriptions,)) {
    return ZERO
  }
  const mrr = subscriptions
    .filter((sub,) => sub?.status === 'active')
    .reduce((sum, sub,) => {
      // Price selection rule: prefer 'amount' over 'price' (amount is primary billing field)
      const price = sub?.amount ?? sub?.price ?? ZERO
      if (typeof price !== 'number' || Number.isNaN(price,)) {
        return sum
      }
      const dollarPrice = price > CENTS_THRESHOLD ? price / DECIMAL_PRECISION : price
      const monthlyPrice = sub?.interval === 'yearly'
        ? dollarPrice / MONTHS_PER_YEAR
        : dollarPrice
      return sum + monthlyPrice
    }, ZERO,)
  return Math.round(mrr * DECIMAL_PRECISION,) / DECIMAL_PRECISION
}

/**
 * Calculate Annual Recurring Revenue from MRR
 * @param {number} mrr Monthly Recurring Revenue
 * @returns {number} ARR value
 */
const calculateARR = (mrr: number,): number => mrr * MONTHS_PER_YEAR

/**
 * Calculate churn rate based on churned and total customers
 * @param {number | null} churnedCustomers Number of churned customers
 * @param {number | null} totalCustomers Total number of customers
 * @returns {number} Churn rate as percentage
 */
const calculateChurnRate = (
  churnedCustomers: number | null,
  totalCustomers: number | null,
): number => {
  if (totalCustomers === null || churnedCustomers === null) {
    return Number.NaN
  }
  if (Number.isNaN(totalCustomers,) || Number.isNaN(churnedCustomers,)) {
    return Number.NaN
  }
  if (totalCustomers === ZERO) {
    return ZERO
  }
  return (churnedCustomers / totalCustomers) * PERCENTAGE_MULTIPLIER
}

/**
 * Calculate Customer Lifetime Value
 * @param {number} averageOrderValue Average order value
 * @param {number} purchaseFrequency Purchase frequency
 * @param {number} customerLifespan Customer lifespan
 * @returns {number} CLV value
 */
const calculateCLV = (
  averageOrderValue: number,
  purchaseFrequency: number,
  customerLifespan: number,
): number => {
  // Validate that all inputs are numbers and finite
  if (typeof averageOrderValue !== 'number' || !Number.isFinite(averageOrderValue,)) {
    throw new TypeError('averageOrderValue must be a finite number',)
  }
  if (typeof purchaseFrequency !== 'number' || !Number.isFinite(purchaseFrequency,)) {
    throw new TypeError('purchaseFrequency must be a finite number',)
  }
  if (typeof customerLifespan !== 'number' || !Number.isFinite(customerLifespan,)) {
    throw new TypeError('customerLifespan must be a finite number',)
  }

  // Validate that all inputs are greater than 0
  if (averageOrderValue <= 0) {
    throw new RangeError('averageOrderValue must be greater than 0',)
  }
  if (purchaseFrequency <= 0) {
    throw new RangeError('purchaseFrequency must be greater than 0',)
  }
  if (customerLifespan <= 0) {
    throw new RangeError('customerLifespan must be greater than 0',)
  }

  return averageOrderValue * purchaseFrequency * customerLifespan
}

export {
  calculateARR,
  calculateChurnRate,
  calculateCLV,
  calculateGrowth,
  calculateGrowthRate,
  calculateMRR,
  type Subscription,
}
