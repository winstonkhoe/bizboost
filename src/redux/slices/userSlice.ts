import {createAction, createSlice} from '@reduxjs/toolkit';
import {User, UserRole} from '../../model/User';
import {showToast} from '../../helpers/toast';

interface UserState {
  uid: string | null;
  user: User | null | undefined;
  activeRole?: UserRole;
  isAdmin: boolean;
  isBusinessPeople: boolean;
  isContentCreator: boolean;
}

const initialState = {
  uid: null,
  user: undefined,
  activeRole: undefined,
  isAdmin: false,
  isBusinessPeople: false,
  isContentCreator: false,
} as UserState;

export const switchRole = createAction<UserRole | undefined>('switchRole');

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      console.log('old!: ' + state.activeRole);
      state.user = action.payload;
      if (state.activeRole) {
        // TODO: supaya abis update profile BP, ga ke switch ke CC (belom tau solusi terbaik apa ngga)
        return;
      } else if (action.payload?.isAdmin === true) {
        state.activeRole = UserRole.Admin;
      } else if (action.payload?.contentCreator.fullname) {
        state.activeRole = UserRole.ContentCreator;
      } else if (action.payload?.businessPeople.fullname) {
        state.activeRole = UserRole.BusinessPeople;
      }

      state.isAdmin = state.activeRole === UserRole.Admin;
      state.isBusinessPeople = state.activeRole === UserRole.BusinessPeople;
      state.isContentCreator = state.activeRole === UserRole.ContentCreator;
    },
    setUserUid(state, action) {
      state.uid = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(switchRole, (state, action) => {
      const newRole = action.payload;
      if (newRole) {
        showToast({
          message: `Switched to ${newRole}`,
        });
      }

      state.activeRole = newRole;
      state.isAdmin = newRole === UserRole.Admin;
      state.isBusinessPeople = newRole === UserRole.BusinessPeople;
      state.isContentCreator = newRole === UserRole.ContentCreator;
    });
  },
});

export const {setUser, setUserUid} = userSlice.actions;
export default userSlice.reducer;
