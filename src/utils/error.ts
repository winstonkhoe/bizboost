import {ErrorCode, ErrorMessage} from '../constants/errorMessage';

export const handleError = (
  errorCode: number | string,
  defaultErrorMessage: string | undefined = ErrorMessage.DEFAULT,
) => {
  if (errorCode === ErrorCode.AUTH_EMAIL_ALREADY_IN_USE) {
    throw Error(ErrorMessage.EMAIL_ALREADY_EXISTS);
  }

  if (errorCode === ErrorCode.AUTH_INVALID_EMAIL) {
    throw Error(ErrorMessage.EMAIL_INVALID);
  }

  if (errorCode === ErrorCode.AUTH_USER_NOT_FOUND) {
    throw Error(ErrorMessage.CREDENTIALS_INVALID);
  }

  if (errorCode === ErrorCode.AUTH_WRONG_PASSWORD) {
    throw Error(ErrorMessage.CREDENTIALS_INVALID);
  }

  throw Error(defaultErrorMessage);
};
