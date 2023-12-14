import {Appearance} from 'react-native';

const colorScheme = Appearance.getColorScheme();
const isDarkMode = colorScheme === 'dark';

const black = {
  100: '#000000',
  90: '#0C0C0F', //importance text. heading, title
  // 90: '#12171D', //importance text. heading, title
  80: '#101014',
  // 80: '#19222A',
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
  10: '#fecccb',
  5: '#ffe6e6',
  1: '#FFF6F6',
};

const yellow = {
  95: '#4d2c02',
  90: '#6b3c03',
  80: '#7e4704',
  70: '#925304',
  60: '#a76005',
  50: '#bc6e06',
  40: '#ce7c06',
  30: '#e39304',
  20: '#f1ab02',
  15: '#ffcd00',
  10: '#fedd6c',
  5: '#feedb1',
  1: '#fff8e0',
};

const getColorValue = (value: number, max: number) => {
  return isDarkMode ? max - value : value;
};

export const COLOR = {
  primary: {
    100: '',
  },
  white: '#ffffff',
  text: {
    neutral: {
      default: `${black[isDarkMode ? 10 : 90]}`,
      high: `${black[isDarkMode ? 10 : 90]}`,
      med: `${black[isDarkMode ? 10 : 90]}b3`,
      low: `${black[isDarkMode ? 10 : 90]}66`,
      disabled: `${black[isDarkMode ? 10 : 90]}33`,
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
      disabled: `${red[30]}`,
    },
  },
  background: {
    neutral: {
      default: `${black[isDarkMode ? 90 : 0]}`,
      low: `${black[isDarkMode ? 80 : 1]}`,
      med: `${black[isDarkMode ? 70 : 5]}`,
      high: `${black[isDarkMode ? 60 : 20]}`,
      disabled: `${black[isDarkMode ? 90 : 10]}`,
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
  },
  yellow: {
    ...yellow,
  },
  black: {
    100: isDarkMode ? black[0] : black[100],
    90: isDarkMode ? black[1] : black[90],
    80: isDarkMode ? black[5] : black[80],
    70: isDarkMode ? black[10] : black[70],
    60: isDarkMode ? black[15] : black[60],
    50: isDarkMode ? black[20] : black[50],
    40: isDarkMode ? black[25] : black[40],
    30: isDarkMode ? black[30] : black[30],
    25: isDarkMode ? black[40] : black[25],
    20: isDarkMode ? black[50] : black[20],
    15: isDarkMode ? black[60] : black[15],
    10: isDarkMode ? black[70] : black[10],
    5: isDarkMode ? black[80] : black[5],
    1: isDarkMode ? black[90] : black[1],
    0: isDarkMode ? black[100] : black[0],
  },
  absoluteBlack: {
    ...black,
  },
  blue: {
    100: 'rgba(197, 241, 251, 0.50)',
    200: 'rgba(31, 117, 197, 1)',
  },
  green: {
    // 95: isDarkMode ? green[1] : green[95],
    // 90: isDarkMode ? green[5] : green[90],
    // 80: isDarkMode ? green[10] : green[80],
    // 70: isDarkMode ? green[15] : green[70],
    // 60: isDarkMode ? green[20] : green[60],
    // 50: isDarkMode ? green[30] : green[50],
    // 40: isDarkMode ? green[40] : green[40],
    // 30: isDarkMode ? green[50] : green[30],
    // 20: isDarkMode ? green[60] : green[20],
    // 15: isDarkMode ? green[70] : green[15],
    // 10: isDarkMode ? green[80] : green[10],
    // 5: isDarkMode ? green[90] : green[5],
    // 1: isDarkMode ? green[95] : green[1],
    ...green,
  },
  red: {
    error: '#FF0034',
    ...red,
  },
};
