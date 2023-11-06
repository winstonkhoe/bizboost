const black = {
  100: '#000000',
  90: '#12171D', //importance text. heading, title
  80: '#19222A',
  70: '#28323B',
  60: '#3B444C',
  50: '#4E565E',
  45: '#5D6469', //common text
  40: '#60686E',
  30: '#797F85',
  25: '#92979C',
  20: '#D9D9D9',
  15: '#C8CBCD',
  10: '#E1E3E4',
  5: '#F1F2F2',
  1: '#F9F9FA',
  0: '#FFFFFF',
};

const green = {
  95: '#0C3912',
  90: '#12521A',
  80: '#15631F',
  70: '#197425',
  60: '#197E27',
  50: '#25A436',
  40: '#209F32',
  30: '#17B52C',
  20: '#09BA2E',
  15: '#74E281',
  10: '#B2EFB9',
  5: '#D6F7DA',
  1: '#ECFDED',
};

const red = {
  100: '#4F0D14',
  95: '#6B0A0A',
  90: '#78131F',
  80: '#8F1111',
  70: '#B31B1B',
  60: '#D92727',
  50: '#F03131',
  40: '#F5806C',
  30: '#FF9090',
  20: '#FFB1B1',
  10: '#FFB1B1',
  5: '#FFB1B1',
  1: '#FFF6F6',
};

export const COLOR = {
  primary: {
    100: '',
  },
  white: '#ffffff',
  text: {
    neutral: {
      default: `${black[90]}`,
      high: `${black[90]}`,
      med: `${black[90]}b3`,
      low: `${black[90]}66`,
      disabled: `${black[90]}33`,
    },
    green: {
      default: `${green[60]}`,
      disabled: `${green[60]}66`,
    },
    success: {
      default: `${green[60]}`,
    },
    danger: {
      default: `${red[60]}`,
    },
  },
  background: {
    neutral: {
      default: `${black[0]}`,
      low: `${black[1]}`,
      med: `${black[40]}b3`,
      high: `${black[80]}`,
      disabled: `${black[10]}`,
    },
    green: {
      default: `${green[1]}`,
      low: `${green[5]}`,
      med: `${green[40]}`,
      high: `${green[50]}`,
      disabled: `${green[50]}66`,
    },
    success: {
      default: `${green[1]}`,
      low: `${green[5]}`,
      med: `${green[40]}`,
      high: `${green[50]}`,
    },
    danger: {
      default: `${red[1]}`,
      low: `${red[5]}`,
      med: `${red[40]}`,
      high: `${red[50]}`,
      disabled: `${red[50]}66`,
    },
    light: '#ffffff',
  },
  black: {
    ...black,
  },
  blue: {
    100: 'rgba(197, 241, 251, 0.50)',
    200: 'rgba(31, 117, 197, 1)',
  },
  green: {
    ...green,
  },
  red: {
    error: '#FF0034',
    ...red,
  },
};
