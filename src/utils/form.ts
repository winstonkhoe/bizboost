import {FieldError} from 'react-hook-form';

type FieldState = {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error?: FieldError;
};

export const isValidField = (fieldState: FieldState) => {
  return !fieldState.invalid && fieldState.isDirty;
};
