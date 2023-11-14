import {createAction, createSlice} from '@reduxjs/toolkit';
import {ContentView} from '../../model/Content';

interface ContentState {
  contents: ContentView[];
}

const initialState = {
  contents: [],
} as ContentState;

export const setContents = createAction<ContentView[]>('setContents');

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setContents, (state, action) => {
      state.contents = action.payload;
    });
  },
});

export default contentSlice.reducer;
