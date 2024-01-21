export enum ErrorCode {
  AUTH_USER_NOT_FOUND = 'auth/user-not-found',
  AUTH_EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  AUTH_WRONG_PASSWORD = 'auth/wrong-password',
  AUTH_INVALID_EMAIL = 'auth/invalid-email',
  AUTH_USER_SUSPENDED = 'custom/user-suspended', // Custom Error Code
}

export enum ErrorMessage {
  GENERAL = 'Oops! Something went wrong. Please try again.',
  CREDENTIALS_INVALID = 'Invalid Credentials!',
  MISSING_FIELDS = 'Missing fields!',
  PASSWORD_EMPTY = 'Password is required!',
  EMAIL_ALREADY_EXISTS = 'Email address is already in use!',
  EMAIL_INVALID = 'That email address is invalid!',
  GOOGLE_ERROR = 'Google sign in error!',
  FACEBOOK_SIGN_IN_CANCEL = 'Cancel Facebook sign in!',
  FACEBOOK_ACCESS_TOKEN_ERROR = 'Failed retrieving facebook access token',
  LOGIN_FAILED = 'Login failed!',
  USER_EXISTS = 'User already exists',
  PROVIDER_ERROR = 'Provider error!',
  DEFAULT = 'Error!',
  USER_SUSPENDED = 'Login failed! Your account has been suspended.',
  CAMPAIGN_SLOT_FULL = 'Campaign slot is already full!',
}
