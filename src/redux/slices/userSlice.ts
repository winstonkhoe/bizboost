import {createAction, createSlice} from '@reduxjs/toolkit';
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

export const switchRole = createAction<UserRoles | undefined>('switchRole');

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
      } else if (action.payload?.isAdmin === true) {
        state.activeRole = UserRole.Admin;
      }
    },
    setUserUid(state, action) {
      state.uid = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(switchRole, (state, action) => {
      state.activeRole = action.payload;
    });
  },
});

export const {setUser, setUserUid} = userSlice.actions;
export default userSlice.reducer;
