import {createSlice} from '@reduxjs/toolkit';
import {User, UserRole, UserRoles} from '../../model/User';

interface UserState {
  uid: string | null;
  user: User | null;
  activeRole: UserRoles;
}

const initialState = {
  uid: null,
  user: null,
  activeRole: undefined,
} as UserState;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      if (action.payload?.contentCreator) {
        state.activeRole = UserRole.ContentCreator;
      } else if (action.payload?.businessPeople) {
        state.activeRole = UserRole.BusinessPeople;
      }
    },
    setUserUid(state, action) {
      state.uid = action.payload;
    },
    switchAccountToBusinessPeople(state) {
      state.activeRole = UserRole.BusinessPeople;
    },
    switchAccountToContentCreator(state) {
      state.activeRole = UserRole.ContentCreator;
    },
  },
});

export const {
  setUser,
  setUserUid,
  switchAccountToBusinessPeople,
  switchAccountToContentCreator,
} = userSlice.actions;
export default userSlice.reducer;
