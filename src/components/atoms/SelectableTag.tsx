import React from 'react';
import {Pressable, PressableProps, Text} from 'react-native';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {background} from '../../styles/BackgroundColor';
import {rounded} from '../../styles/BorderRadius';
import {padding} from '../../styles/Padding';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';

interface Props extends PressableProps {
  text: string;
  isSelected?: boolean;
  isDisabled?: boolean;
}
const SelectableTag = ({
  text,
  isSelected = false,
  isDisabled = false,
  ...props
}: Props) => {
  return (
    <Pressable
      {...props}
      style={[
        rounded.default,
        padding.vertical.small,
        padding.horizontal.default,
        isSelected
          ? [
              border({
                borderWidth: 1,
                color: COLOR.green[50],
              }),
              background(COLOR.green[5]),
            ]
          : [
              border({
                borderWidth: 1,
                color: COLOR.black[25],
              }),
              background(COLOR.black[1]),
            ],
        isDisabled && [
          background(COLOR.background.neutral.disabled),
          border({
            borderWidth: 1,
            color: COLOR.black[20],
          }),
        ],
      ]}>
      <Text
        style={[
          font.size[20],
          font.weight.medium,
          isSelected
            ? [textColor(COLOR.green[50])]
            : [textColor(COLOR.text.neutral.med)],
          isDisabled && [textColor(COLOR.text.neutral.disabled)],
        ]}>
        {text}
      </Text>
    </Pressable>
  );
};

export default SelectableTag;
