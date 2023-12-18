import {createSlice} from '@reduxjs/toolkit';
import {Chat} from '../../model/Chat';

interface ChatState {
  userChats: Chat[];
}

const initialState = {
  userChats: [],
} as ChatState;

const ChatSlice = createSlice({
  name: 'Chat',
  initialState,
  reducers: {
    setUserChats(state, action) {
      state.userChats = action.payload;
    },
  },
});

export const {setUserChats} = ChatSlice.actions;
export default ChatSlice.reducer;
