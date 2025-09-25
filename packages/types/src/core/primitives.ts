/**
 * Primitive Types and Utility Functions
 * Basic types and utilities used throughout the application
 */

// String types
export type NonEmptyString = string & { readonly __brand: unique symbol }
export type EmailString = string & { readonly __brand: unique symbol }
export type PhoneNumberString = string & { readonly __brand: unique symbol }
export type URLString = string & { readonly __brand: unique symbol }
export type UUIDString = string & { readonly __brand: unique symbol }

// Number types
export type PositiveNumber = number & { readonly __brand: unique symbol }
export type NonNegativeNumber = number & { readonly __brand: unique symbol }
export type Percentage = number & { readonly __brand: unique symbol }

// Date types
export type ISODateString = string & { readonly __brand: unique symbol }
export type DateTimeString = string & { readonly __brand: unique symbol }
export type TimeString = string & { readonly __brand: unique symbol }

// Array types
export type NonEmptyArray<T> = [T, ...T[]]
export type ReadonlyNonEmptyArray<T> = Readonly<[T, ...T[]]>

// Object types
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Function types
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>
export type SyncFunction<T = unknown> = (...args: unknown[]) => T

// Event handler types
export type EventHandler<T = unknown> = (event: T) => void
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>

// Predicate types
export type Predicate<T = unknown> = (value: T) => boolean
export type AsyncPredicate<T = unknown> = (value: T) => Promise<boolean>

// Mapper types
export type Mapper<T, U> = (value: T) => U
export type AsyncMapper<T, U> = (value: T) => Promise<U>

// Reducer types
export type Reducer<T, U> = (accumulator: U, value: T) => U
export type AsyncReducer<T, U> = (accumulator: U, value: T) => Promise<U>

// Comparator types
export type Comparator<T> = (a: T, b: T) => number
export type AsyncComparator<T> = (a: T, b: T) => Promise<number>

// Validator types
export type Validator<T = unknown> = (value: T) => boolean | string
export type AsyncValidator<T = unknown> = (value: T) => Promise<boolean | string>

// Transformer types
export type Transformer<T, U> = (value: T) => U
export type AsyncTransformer<T, U> = (value: T) => Promise<U>

// Formatter types
export type Formatter<T = unknown> = (value: T) => string
export type AsyncFormatter<T = unknown> = (value: T) => Promise<string>

// Parser types
export type Parser<T = unknown> = (value: string) => T
export type AsyncParser<T = unknown> = (value: string) => Promise<T>

// Serializer types
export type Serializer<T = unknown> = (value: T) => string
export type AsyncSerializer<T = unknown> = (value: T) => Promise<string>

// Guard functions
export function isNonEmptyString(value: unknown): value is NonEmptyString {
  return typeof value === 'string' && value.trim().length > 0
}

export function isEmailString(value: unknown): value is EmailString {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isPhoneNumberString(value: unknown): value is PhoneNumberString {
  return typeof value === 'string' && /^[\d\s\-+()]+$/.test(value)
}

export function isURLString(value: unknown): value is URLString {
  return typeof value === 'string' && /^https?:\/\/.+/.test(value)
}

export function isUUIDString(value: unknown): value is UUIDString {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export function isPositiveNumber(value: unknown): value is PositiveNumber {
  return typeof value === 'number' && value > 0
}

export function isNonNegativeNumber(value: unknown): value is NonNegativeNumber {
  return typeof value === 'number' && value >= 0
}

export function isPercentage(value: unknown): value is Percentage {
  return typeof value === 'number' && value >= 0 && value <= 100
}

export function isISODateString(value: unknown): value is ISODateString {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function isDateTimeString(value: unknown): value is DateTimeString {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
}

export function isTimeString(value: unknown): value is TimeString {
  return typeof value === 'string' && /^\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)
}

// Utility functions
export function assertNonEmptyString(value: unknown): asserts value is NonEmptyString {
  if (!isNonEmptyString(value)) {
    throw new Error('Expected non-empty string')
  }
}

export function assertEmailString(value: unknown): asserts value is EmailString {
  if (!isEmailString(value)) {
    throw new Error('Expected valid email string')
  }
}

export function assertUUIDString(value: unknown): asserts value is UUIDString {
  if (!isUUIDString(value)) {
    throw new Error('Expected valid UUID string')
  }
}

export function assertPositiveNumber(value: unknown): asserts value is PositiveNumber {
  if (!isPositiveNumber(value)) {
    throw new Error('Expected positive number')
  }
}

export function asNonEmptyString(value: unknown): NonEmptyString {
  assertNonEmptyString(value)
  return value
}

export function asEmailString(value: unknown): EmailString {
  assertEmailString(value)
  return value
}

export function asUUIDString(value: unknown): UUIDString {
  assertUUIDString(value)
  return value
}

export function asPositiveNumber(value: unknown): PositiveNumber {
  assertPositiveNumber(value)
  return value
}

// Type constructors
export type PickRequired<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PickOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Utility types
export type NonNullable<T> = T extends null | undefined ? never : T
export type NonUndefined<T> = T extends undefined ? never : T
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>
}
export type NonUndefinedFields<T> = {
  [P in keyof T]: NonUndefined<T[P]>
}

// Conditional types
export type If<C extends boolean, T, F> = C extends true ? T : F
export type IsNever<T> = [T] extends [never] ? true : false
export type IsAny<T> = 0 extends 1 & T ? true : false
export type IsUnknown<T> = IsNever<T> extends false ? IsAny<T> extends false ? true : false : false

// String manipulation types
export type Capitalize<S extends string> = S extends `${infer First}${infer Rest}` 
  ? `${Uppercase<First>}${Rest}`
  : S
export type Uncapitalize<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Lowercase<First>}${Rest}`
  : S

// Number manipulation types
export type Add<A extends number, B extends number> = 
  number extends A | B ? number : 
  A extends 0 ? B : 
  B extends 0 ? A : 
  number

export type Subtract<A extends number, B extends number> = 
  number extends A | B ? number : 
  B extends 0 ? A : 
  never

// Array manipulation types
export type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...readonly unknown[]] ? H : never
export type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer _Rest] ? _Rest : never
export type Last<T extends readonly unknown[]> = T extends readonly [...infer _Rest, infer L] ? L : never
export type Push<T extends readonly unknown[], U> = [...T, U]
export type Unshift<T extends readonly unknown[], U> = [U, ...T]
export type Concat<T extends readonly unknown[], U extends readonly unknown[]> = [...T, ...U]

// Function manipulation types
export type Parameters<T> = T extends (...args: infer P) => unknown ? P : never
export type ReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never
export type ThisParameterType<T> = T extends (this: infer U, ...args: unknown[]) => unknown ? U : unknown
export type OmitThisParameter<T> = T extends (this: unknown, ...args: infer P) => infer R ? (...args: P) => R : T

// Promise manipulation types
export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
export type PromiseValue<T> = T extends Promise<infer U> ? U : T

