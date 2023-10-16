export enum ErrorCode {
  AUTH_USER_NOT_FOUND = 'auth/user-not-found',
  AUTH_EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  AUTH_WRONG_PASSWORD = 'auth/wrong-password',
  AUTH_INVALID_EMAIL = 'auth/invalid-email',
}

export enum ErrorMessage {
  CREDENTIALS_INVALID = 'Invalid Credentials!',
  MISSING_FIELDS = 'Missing fields!',
  PASSWORD_EMPTY = 'Password is required!',
  EMAIL_ALREADY_EXISTS = 'Email address is already in use!',
  EMAIL_INVALID = 'That email address is invalid!',
  GOOGLE_ERROR = 'Google sign in error!',
  LOGIN_FAILED = 'Login failed!',
  DEFAULT = 'Error!',
}
