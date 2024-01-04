import React from 'react';
import {Text} from 'react-native';
import {View} from 'react-native';
import {font} from '../../styles/Font';
import {flex, items} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {rounded} from '../../styles/BorderRadius';
import {padding} from '../../styles/Padding';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import LocationIcon from '../../assets/vectors/location.svg';

import {textColor} from '../../styles/Text';

type Props = {
  text: string;
};
const LocationTag = ({text}: Props) => {
  return (
    <View
      style={[
        flex.flexRow,
        gap.xsmall,
        items.center,
        rounded.small,
        padding.vertical.xsmall,
        padding.horizontal.small,
        border({
          borderWidth: 1,
          color: COLOR.red[80],
        }),
      ]}>
      <LocationIcon width={16} height={16} fill={COLOR.red[80]} />
      <Text
        className="font-semibold"
        style={[textColor(COLOR.red[80]), font.size[30]]}>
        {text}
      </Text>
    </View>
  );
};

export default LocationTag;
