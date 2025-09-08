// AR Simulator Helper Functions

const getErrorMessage = (error: unknown,): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
}

const getDevErrorMessage = (error: unknown,): string => {
  if (process.env.NODE_ENV === 'development') {
    return getErrorMessage(error,)
  }
  return 'Something went wrong'
}

export { getDevErrorMessage, getErrorMessage, }
