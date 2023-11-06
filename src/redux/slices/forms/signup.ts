import {createAction, createSlice} from '@reduxjs/toolkit';
import {User, UserRoles} from '../../../model/User';
import {Providers} from '../../../model/AuthMethod';

export interface TemporarySignupData {
  profilePicture?: string;
  fullname?: string;
  token?: string;
}

interface CreateAdditionalAccountState {
  data?: User;
  provider?: Providers;
  temporaryData?: TemporarySignupData;
}

const initialState = {
  role: undefined,
  data: undefined,
  provider: undefined,
} as CreateAdditionalAccountState;

export const setSignupProvider = createAction<Providers>('setSignupProvider');
export const updateSignupData = createAction<User>('updateSignupData');
export const updateTemporarySignupData = createAction<TemporarySignupData>(
  'updateTemporarySignupData',
);

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setSignupProvider, (state, action) => {
      state.provider = action.payload;
    });
    builder.addCase(updateSignupData, (state, action) => {
      state.data = new User({
        ...state.data,
        ...action.payload,
      }).toJSON();
    });
    builder.addCase(updateTemporarySignupData, (state, action) => {
      state.temporaryData = {
        ...state.temporaryData,
        ...action.payload,
      };
    });
  },
});

export default signupSlice.reducer;
