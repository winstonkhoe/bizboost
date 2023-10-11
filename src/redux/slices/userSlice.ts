import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {createSlice} from '@reduxjs/toolkit';
import {User, UserRole} from '../../model/User';

interface UserState {
  uid: string | null;
  user: User | null;
  activeRole: UserRole;
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
        state.activeRole = 'CC';
      } else if (action.payload?.businessPeople) {
        state.activeRole = 'BP';
      }
    },
    setUserUid(state, action) {
      state.uid = action.payload;
    },
    switchAccountToBusinessPeople(state) {
      state.activeRole = 'BP';
    },
    switchAccountToContentCreator(state) {
      state.activeRole = 'CC';
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
