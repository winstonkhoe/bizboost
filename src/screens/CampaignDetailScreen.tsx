import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  AuthenticatedNavigation,
  RootAuthenticatedNavigationStackProps,
  RootAuthenticatedStackParamList,
} from '../navigation/AuthenticatedNavigation';
import {Text} from 'react-native';
import {View} from 'react-native';
import {Image} from 'react-native';
import TagCard from '../components/atoms/TagCard';
import {ScrollView} from 'react-native-gesture-handler';
import {Campaign, CampaignPlatform} from '../model/Campaign';
import {getDate} from '../utils/date';
import {CustomButton} from '../components/atoms/Button';
import {useUser} from '../hooks/user';
import {Transaction, TransactionStatus} from '../model/Transaction';
import RegisteredUserListCard from '../components/molecules/RegisteredUserListCard';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {borderRadius, radiusSize} from '../styles/BorderRadius';
import Checkmark from '../assets/vectors/checkmark.svg';
import InstagramLogo from '../assets/vectors/instagram.svg';
import TikTokLogo from '../assets/vectors/tiktok.svg';
import People from '../assets/vectors/people.svg';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {useNavigation} from '@react-navigation/native';
type Props = NativeStackScreenProps<
  RootAuthenticatedStackParamList,
  AuthenticatedNavigation.CampaignDetail
>;

const logo = {
  Instagram: <InstagramLogo width={20} height={20} />,
  TikTok: <TikTokLogo width={20} height={20} />,
};

const CampaignDetailScreen = ({route}: Props) => {
  const {uid} = useUser();
  const navigation = useNavigation<RootAuthenticatedNavigationStackProps>();
  const {campaignId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TransactionStatus.notRegistered,
  );
  // TODO: move to another screen? For Campaign's owner (business people), to check registered CC
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);

  useEffect(() => {
    Campaign.getById(campaignId).then(c => setCampaign(c));
  }, [campaignId]);

  useEffect(() => {
    const unsubscribe = Transaction.getTransactionStatusByContentCreator(
      campaignId,
      uid || '',

      status => {
        setTransactionStatus(status);
      },
    );

    return unsubscribe;
  }, [campaignId, uid]);

  // TODO: validate join only for CC
  const handleJoinCampaign = () => {
    const data = new Transaction({
      contentCreatorId: uid || '',
      campaignId: campaignId,
      status: TransactionStatus.registrationPending,
    });

    data.insert().then(isSuccess => {
      if (isSuccess) {
        console.log('Joined!');
      }
    });
  };

  if (!campaign) {
    return <Text>Loading</Text>;
  }

  return (
    <PageWithBackButton>
      <View className="w-full pt-4">
        <View className="w-full h-60 overflow-hidden ">
          <Image
            className="w-full h-full object-cover"
            source={{uri: campaign.image}}
          />
        </View>
        <View className="flex flex-col p-4 gap-4">
          <View>
            <Text className="font-bold text-2xl mb-2">{campaign.title}</Text>
            <View className="flex flex-row justify-between">
              <Text className="font-bold text-xs">
                {campaign.start &&
                  getDate(campaign.start).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                -{' '}
                {campaign.end &&
                  getDate(campaign.end).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
              </Text>
              <View className="flex flex-row items-center">
                <People width={20} height={20} />
                <View className="ml-2 bg-gray-300 py-1 px-2 rounded-md min-w-12">
                  <Text className="text-center text-xs font-bold">
                    0/{campaign.slot}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View>
            {/* <Text className="font-semibold text-base pb-2">Criteria</Text> */}
            <View className="flex flex-row flex-wrap gap-2">
              {campaign.criterias &&
                campaign.criterias.map((_item: any, index: number) => (
                  <View key={index}>
                    <TagCard text={_item} />
                  </View>
                ))}
            </View>
          </View>

          <Text>{campaign.description}</Text>

          <View className="flex flex-row items-center justify-between flex-wrap ">
            <Text className="font-semibold text-base">Fee</Text>
            <View>
              {campaign.fee && (
                <Text className="font-medium ">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(campaign.fee)}
                </Text>
              )}
            </View>
          </View>

          {isMoreInfoVisible && (
            <View className="flex flex-col" style={[gap.medium]}>
              <View className="">
                <Text className="font-semibold text-base pb-2">
                  Important Information
                </Text>
                {campaign.importantInformation &&
                  campaign.importantInformation.map(
                    (_item: any, index: number) => (
                      <View
                        key={index}
                        className="mb-2 flex flex-row items-center">
                        <View className="bg-gray-300 py-1 px-[11px] rounded-full mr-2">
                          <Text className="text-center text-xs">i</Text>
                        </View>
                        <Text>{_item}</Text>
                      </View>
                    ),
                  )}
              </View>

              <View className="">
                <Text className="font-semibold text-base pb-2">
                  Task Summary
                </Text>
                <View className="flex flex-col flex-wrap gap-2">
                  {campaign.platforms &&
                    campaign.platforms.map(
                      (_item: CampaignPlatform, index: number) => (
                        <View key={index}>
                          <View className="flex flex-row items-center">
                            {logo[_item.name as keyof typeof logo]}
                            <Text className="font-semibold ml-1">
                              {_item.name}
                            </Text>
                          </View>
                          {_item.tasks.map((t, idx) => (
                            <View
                              key={idx}
                              className="flex flex-row items-center ml-3">
                              <Checkmark
                                color={COLOR.black[100]}
                                width={20}
                                height={20}
                              />
                              <Text className="ml-1">{t}</Text>
                            </View>
                          ))}
                        </View>
                      ),
                    )}
                </View>
              </View>
              <View className="">
                <Text className="font-semibold text-base pb-2">Location</Text>
                <View className="flex flex-row flex-wrap gap-2">
                  {campaign.locations &&
                    campaign.locations.map((_item: any, index: number) => (
                      <View key={index}>
                        <TagCard text={_item} />
                      </View>
                    ))}
                </View>
              </View>
            </View>
          )}
          <View>
            <CustomButton
              customBackgroundColor={COLOR.background.neutral}
              customTextColor={COLOR.text.neutral}
              verticalPadding="xsmall"
              inverted
              text={
                isMoreInfoVisible ? 'Hide Information' : 'Read More Information'
              }
              rounded="default"
              onPress={() => setIsMoreInfoVisible(value => !value)}
            />
          </View>
          {/* <Text>{transactionStatus}</Text> */}
          {uid !== campaign.userId &&
            transactionStatus === TransactionStatus.notRegistered && (
              <View className="py-2">
                {/* TODO: validate join only for CC */}

                <CustomButton
                  customBackgroundColor={COLOR.background.neutral}
                  customTextColor={COLOR.text.neutral}
                  text="Join Campaign"
                  rounded="default"
                  onPress={handleJoinCampaign}
                />
              </View>
            )}
          {/* TODO: move to another screen? For Campaign's owner (business people), to check registered CC */}
          {uid === campaign.userId && (
            <View className="py-2">
              <CustomButton
                customBackgroundColor={COLOR.background.neutral}
                customTextColor={COLOR.text.neutral}
                text="View Registrants"
                rounded="default"
                onPress={() =>
                  navigation.navigate(
                    AuthenticatedNavigation.CampaignRegistrants,
                    {campaignId: campaignId},
                  )
                }
              />
              {/* {transactions.map((t, index) => (
                  <RegisteredUserListCard transaction={t} key={index} />
                ))} */}
            </View>
          )}
        </View>
      </View>
    </PageWithBackButton>
  );
};

export default CampaignDetailScreen;
