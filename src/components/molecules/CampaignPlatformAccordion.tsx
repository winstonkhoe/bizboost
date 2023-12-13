import React, {useState} from 'react';
import {Pressable, Text} from 'react-native';
import {CampaignPlatform} from '../../model/Campaign';
import {View} from 'react-native';
import Checkmark from '../../assets/vectors/checkmark.svg';
import InstagramLogo from '../../assets/vectors/instagram.svg';
import TikTokLogo from '../../assets/vectors/tiktok.svg';
import ChevronDown from '../../assets/vectors/chevron-down.svg';
import ChevronUp from '../../assets/vectors/chevron-up.svg';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {flex} from '../../styles/Flex';

const logo = {
  Instagram: <InstagramLogo width={20} height={20} />,
  TikTok: <TikTokLogo width={20} height={20} />,
};
type Props = {
  platform: CampaignPlatform;
};

const CampaignPlatformAccordion = ({platform}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View
      className={`${
        isOpen ? 'bg-white border-gray-200' : 'bg-gray-100 border-white'
      } mb-3 p-3 rounded-lg border`}>
      <Pressable onPress={() => setIsOpen(value => !value)}>
        <View className="flex flex-row justify-between items-center">
          <View className="flex flex-row items-center">
            {logo[platform.name as keyof typeof logo]}
            <Text
              style={textColor(COLOR.black[100])}
              className={`${isOpen ? 'font-semibold' : 'font-normal'} ml-1`}>
              {platform.name}
            </Text>
          </View>
          {isOpen ? (
            <ChevronUp width={10} height={10} fill={COLOR.black[100]} />
          ) : (
            <ChevronDown width={10} height={10} fill={COLOR.black[100]} />
          )}
        </View>
      </Pressable>
      {isOpen &&
        platform.tasks.map((t, idx) => (
          <View key={idx}>
            <View className="flex flex-row items-center ml-2 mt-1">
              <Checkmark color={COLOR.black[100]} width={20} height={20} />
              {/* TODO: fix, show desc etc */}
              <Text style={textColor(COLOR.black[100])} className="ml-1">
                {t.name}
              </Text>
              <View style={flex.flexRow}>
                <Text style={textColor(COLOR.green[50])} className="ml-1">
                  x
                </Text>
                <Text style={textColor(COLOR.green[50])} className="ml-1">
                  {t.quantity}
                </Text>
              </View>
            </View>
            <Text className="ml-7" numberOfLines={2}>
              {t.description}
            </Text>
          </View>
        ))}
    </View>
  );
};

export default CampaignPlatformAccordion;
