import {createAction, createSlice} from '@reduxjs/toolkit';
import {BusinessPeople, ContentCreator, UserRoles} from '../../../model/User';

interface CreateAdditionalAccountState {
  role: UserRoles;
  data?: ContentCreator | BusinessPeople;
}

const initialState = {
  role: undefined,
  data: undefined,
} as CreateAdditionalAccountState;

export const setRole = createAction<UserRoles>('setRole');
export const updateData = createAction<ContentCreator | BusinessPeople>(
  'updateData',
);

const createAdditionalAccountSlice = createSlice({
  name: 'createAdditionalAccount',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setRole, (state, action) => {
      state.role = action.payload;
    });
    builder.addCase(updateData, (state, action) => {
      state.data = {
        ...state.data,
        ...action.payload,
      };
    });
  },
});

export default createAdditionalAccountSlice.reducer;