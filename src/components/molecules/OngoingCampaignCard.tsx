import {Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {Campaign} from '../../model/Campaign';
import Business from '../../assets/vectors/business.svg';

import {
  formatDateToDayMonthYear,
  getDateDiff,
  getTimeAgo,
} from '../../utils/date';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {Label} from '../atoms/Label';
import {useEffect, useMemo, useState} from 'react';
import {COLOR} from '../../styles/Color';
import {User} from '../../model/User';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {dimension} from '../../styles/Dimension';
import {formatToRupiah} from '../../utils/currency';
import {useCategory} from '../../hooks/category';
import {BaseCard} from './TransactionCard';
type Props = {
  campaign: Campaign;
};

const OngoingCampaignCard = ({campaign}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [user, setUser] = useState<User | null>();
  const {categories} = useCategory();
  const currentCategory = useMemo(() => {
    return categories.find(
      category => category.id === campaign?.categories?.[0],
    );
  }, [categories, campaign]);
  const now = new Date();
  const isCampaignUnderAWeek =
    getDateDiff(now, new Date(new Campaign(campaign).getTimelineStart().end)) <
    7;

  useEffect(() => {
    if (campaign.userId) {
      User.getById(campaign.userId).then(setUser);
    }
  }, [campaign]);

  const onViewCampaignDetailButtonClicked = () => {
    navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
      campaignId: campaign.id || '',
    });
  };

  return (
    <BaseCard
      icon={<Business width={15} height={15} stroke={COLOR.green[50]} />}
      headerTextLeading={`${user?.businessPeople?.fullname}`}
      handleClickHeader={() => {
        navigation.navigate(AuthenticatedNavigation.BusinessPeopleDetail, {
          businessPeopleId: user?.id || '',
        });
      }}
      headerTextTrailing={
        !isCampaignUnderAWeek ? (
          `Until ${formatDateToDayMonthYear(
            new Date(new Campaign(campaign).getTimelineStart().end),
          )}`
        ) : (
          <Label
            radius="default"
            fontSize={20}
            text={getTimeAgo(new Campaign(campaign).getTimelineStart().end)}
            type="danger"
          />
        )
      }
      imageSource={{uri: campaign.image}}
      imageDimension={dimension.square.xlarge4}
      bodyText={`${campaign.title}`}
      handleClickBody={onViewCampaignDetailButtonClicked}
      bodyContent={
        <>
          {campaign.categories?.slice(0, 1).map(category => (
            <View key={category} style={[flex.flexRow]}>
              <Label
                key={category}
                radius="default"
                fontSize={10}
                text={`${
                  currentCategory?.alias || currentCategory?.id || category
                }`}
              />
            </View>
          ))}
          <View style={[flex.flexRow, gap.small]}>
            {campaign?.platformTasks?.map(platform => (
              <Label
                key={platform.name}
                type="neutral"
                radius="default"
                text={platform.name}
              />
            ))}
          </View>
          <View style={[flex.flexCol, gap.small]}>
            {campaign.fee && (
              <Text
                className="font-semibold"
                style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                {formatToRupiah(campaign.fee)}
              </Text>
            )}
          </View>
        </>
      }
    />
  );
};

export {OngoingCampaignCard};
