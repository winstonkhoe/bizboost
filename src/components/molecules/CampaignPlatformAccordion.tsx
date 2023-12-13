import React, {useState} from 'react';
import {Pressable, Text} from 'react-native';
import {CampaignPlatform} from '../../model/Campaign';
import {View} from 'react-native';
import Checkmark from '../../assets/vectors/checkmark.svg';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {flex, items, justify} from '../../styles/Flex';
import {ChevronRight, PlatformIcon} from '../atoms/Icon';
import {background} from '../../styles/BackgroundColor';
import {border} from '../../styles/Border';
import {rounded} from '../../styles/BorderRadius';
import {padding} from '../../styles/Padding';
import {font} from '../../styles/Font';
import {gap} from '../../styles/Gap';
import {campaignTaskToString} from '../../utils/campaign';

type Props = {
  platform: CampaignPlatform;
};

const CampaignPlatformAccordion = ({platform}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View
      style={[
        flex.flexCol,
        gap.small,
        padding.default,
        rounded.default,
        isOpen
          ? [
              background(COLOR.background.neutral.default),
              border({
                borderWidth: 1,
                color: COLOR.black[20],
              }),
            ]
          : [
              background(COLOR.background.neutral.low),
              border({
                borderWidth: 1,
                color: COLOR.black[0],
              }),
            ],
      ]}>
      <Pressable onPress={() => setIsOpen(value => !value)}>
        <View style={[flex.flexRow, justify.between, items.center]}>
          <View style={[flex.flexRow, items.center, gap.xsmall]}>
            <PlatformIcon platform={platform.name} />
            <Text
              className="font-semibold"
              style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
              {platform.name}
            </Text>
          </View>
          <View
            style={[
              {
                transform: [
                  {
                    rotate: !isOpen ? '90deg' : '-90deg',
                  },
                ],
              },
            ]}>
            <ChevronRight />
          </View>
        </View>
      </Pressable>
      {isOpen &&
        platform.tasks.map((task, idx) => (
          <View key={idx} style={[flex.flexRow, items.start, gap.xsmall]}>
            <Checkmark color={COLOR.green[50]} width={20} height={20} />
            <View style={[flex.flexCol, gap.xsmall2]}>
              <Text style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
                {campaignTaskToString(task)}
              </Text>
              <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
                {task.description}
              </Text>
            </View>
          </View>
        ))}
    </View>
  );
};

export default CampaignPlatformAccordion;
