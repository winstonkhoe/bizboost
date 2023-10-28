import {StyleSheet} from 'react-native';

export const flex = StyleSheet.create({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  flexRowReverse: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexColReverse: {
    display: 'flex',
    flexDirection: 'column-reverse',
  },
  flex1: {
    flex: 1,
  },
  growShrink: {
    flex: 1,
  },
  grow: {
    flexGrow: 1,
  },
});

export const justify = StyleSheet.create({
  start: {
    justifyContent: 'flex-start',
  },
  end: {
    justifyContent: 'flex-end',
  },
  center: {
    justifyContent: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  around: {
    justifyContent: 'space-around',
  },
  evenly: {
    justifyContent: 'space-evenly',
  },
});

export const items = StyleSheet.create({
  start: {
    alignItems: 'flex-start',
  },
  end: {
    alignItems: 'flex-end',
  },
  center: {
    alignItems: 'center',
  },
  baseline: {
    alignItems: 'baseline',
  },
  stretch: {
    alignItems: 'stretch',
  },
});
