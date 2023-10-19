import {createSlice} from '@reduxjs/toolkit';
import {ChatView} from '../../model/Chat';

interface ChatState {
  userChats: ChatView[];
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
