import {FieldError} from 'react-hook-form';

type FieldState = {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error?: FieldError;
};

export const isValidField = (
  fieldState: FieldState,
  checkDirty: boolean = true,
) => {
  if (checkDirty) {
    return !fieldState.invalid && fieldState.isDirty;
  }
  return !fieldState.invalid;
};
