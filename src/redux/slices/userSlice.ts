import {createAction, createSlice} from '@reduxjs/toolkit';
import {User, UserRole} from '../../model/User';
import {showToast} from '../../helpers/toast';

interface UserState {
  uid: string | null;
  user: User | null | undefined;
  activeRole?: UserRole;
}

const initialState = {
  uid: null,
  user: undefined,
  activeRole: undefined,
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
      console.log('role: ' + state.activeRole);
      console.log(action.payload?.contentCreator);
    },
    setUserUid(state, action) {
      state.uid = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(switchRole, (state, action) => {
      showToast({
        message: `Switched to ${action.payload}`,
      });
      state.activeRole = action.payload;
    });
  },
});

export const {setUser, setUserUid} = userSlice.actions;
export default userSlice.reducer;
