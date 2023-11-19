import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {StyleSheet, Text, View} from 'react-native';

import {Campaign, CampaignStep} from '../model/Campaign';

import {useUser} from '../hooks/user';

import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {useNavigation} from '@react-navigation/native';
import {flex, items, justify} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {Stepper} from '../components/atoms/Stepper';
import {font} from '../styles/Font';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {CustomButton} from '../components/atoms/Button';
import {border} from '../styles/Border';
import {textColor} from '../styles/Text';
import {formatDateToDayMonthYear} from '../utils/date';
import StatusTag from '../components/atoms/StatusTag';
import {Transaction, TransactionStatus} from '../model/Transaction';
import {LoadingScreen} from './LoadingScreen';
import {shadow} from '../styles/Shadow';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignTimeline
>;

type CampaignTimelineMap = {
  [key in CampaignStep]?: {
    start: number;
    end: number;
  };
};

const CampaignTimelineScreen = ({route}: Props) => {
  const {uid} = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  const {campaignId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TransactionStatus.notRegistered,
  );
  const [isLoading, setIsLoading] = useState(false);
  const currentActiveTimeline = useMemo(() => {
    const now = new Date().getTime();
    return campaign?.timeline?.find(
      timeline => now >= timeline.start && now <= timeline.end,
    );
  }, [campaign]);
  const currentActiveIndex = useMemo(
    () =>
      currentActiveTimeline
        ? Object.values(CampaignStep)
            .filter(step =>
              campaign?.timeline?.some(timeline => timeline.step === step),
            )
            .indexOf(currentActiveTimeline?.step)
        : Object.values(CampaignStep).filter(step =>
            campaign?.timeline?.some(timeline => timeline.step === step),
          ).length + 1,
    [currentActiveTimeline, campaign],
  );
  const campaignTimelineMap = useMemo(
    () =>
      campaign?.timeline?.reduce((accumulated, currentTimeline) => {
        accumulated[currentTimeline.step] = {
          start: currentTimeline.start,
          end: currentTimeline.end,
        };
        return accumulated;
      }, {} as CampaignTimelineMap),
    [campaign],
  );

  const registerCampaign = () => {
    if (uid && campaign?.userId) {
      const data = new Transaction({
        contentCreatorId: uid || '',
        campaignId: campaignId,
        businessPeopleId: campaign?.userId,
      });

      setIsLoading(true);
      data
        .register()
        .then(isSuccess => {
          if (isSuccess) {
            console.log('Joined!');
          }
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

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

  if (!campaign) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      <PageWithBackButton enableSafeAreaContainer fullHeight>
        <HorizontalPadding>
          <View style={[flex.flexCol, gap.default, padding.top.xlarge3]}>
            <Stepper
              type="content"
              currentPosition={currentActiveIndex}
              maxPosition={0}>
              {campaignTimelineMap?.[CampaignStep.Registration] && (
                <View
                  style={[
                    flex.flexCol,
                    shadow.medium,
                    rounded.medium,
                    background(COLOR.black[0]),
                  ]}>
                  <View
                    style={[
                      flex.flexRow,
                      gap.medium,
                      items.center,
                      padding.default,
                      transactionStatus === TransactionStatus.notRegistered &&
                        styles.headerBorder,
                    ]}>
                    <View style={[flex.flexCol]}>
                      <Text
                        className="font-semibold"
                        style={[
                          font.size[40],
                          textColor(COLOR.text.neutral.high),
                        ]}
                        numberOfLines={1}>
                        {CampaignStep.Registration}
                      </Text>
                      <Text
                        style={[
                          font.size[20],
                          textColor(COLOR.text.neutral.high),
                        ]}
                        numberOfLines={1}>
                        {`${formatDateToDayMonthYear(
                          new Date(
                            campaignTimelineMap[
                              CampaignStep.Registration
                            ].start,
                          ),
                        )} - ${formatDateToDayMonthYear(
                          new Date(
                            campaignTimelineMap[CampaignStep.Registration].end,
                          ),
                        )}`}
                      </Text>
                    </View>
                    {transactionStatus !== TransactionStatus.notRegistered && (
                      <StatusTag status={transactionStatus} />
                    )}
                  </View>
                  {transactionStatus === TransactionStatus.notRegistered && (
                    <View style={[padding.default]}>
                      <CustomButton
                        text="Register now"
                        onPress={registerCampaign}
                      />
                    </View>
                  )}
                </View>
              )}
              {campaignTimelineMap?.[CampaignStep.Brainstorming] && (
                <View
                  style={[
                    flex.flexCol,
                    shadow.medium,
                    rounded.medium,
                    background(COLOR.black[0]),
                  ]}>
                  <View
                    style={[
                      flex.flexCol,
                      padding.default,
                      styles.headerBorder,
                    ]}>
                    <Text
                      className="font-semibold"
                      style={[font.size[40]]}
                      numberOfLines={1}>
                      {CampaignStep.Brainstorming}
                    </Text>
                    <Text
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {`${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[CampaignStep.Brainstorming].start,
                        ),
                      )} - ${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[CampaignStep.Brainstorming].end,
                        ),
                      )}`}
                    </Text>
                  </View>
                  <View
                    style={[
                      flex.flexCol,
                      padding.default,
                      rounded.default,
                      gap.default,
                    ]}>
                    <View
                      style={[
                        flex.flexCol,
                        gap.default,
                        padding.default,
                        rounded.default,
                        background(`${COLOR.green[5]}`),
                      ]}>
                      <Text>💡 Things to highlight</Text>
                      <Text>
                        Features: Multiple compartments for organized packing
                        Water-resistant and weather-proof material Lightweight
                        and easy to carry Available in various sizes and colors
                        Tagline: “Travel with confidence with Koper Idaman
                        Petualang!”
                      </Text>
                    </View>
                    <CustomButton text="Submit idea" />
                  </View>
                </View>
              )}
              {campaignTimelineMap?.[CampaignStep.ContentSubmission] && (
                <View
                  style={[
                    flex.flexCol,
                    shadow.medium,
                    rounded.medium,
                    background(COLOR.black[0]),
                  ]}>
                  <View
                    style={[
                      flex.flexCol,
                      padding.default,
                      styles.headerBorder,
                    ]}>
                    <Text
                      className="font-semibold"
                      style={[
                        font.size[40],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {CampaignStep.ContentSubmission}
                    </Text>
                    <Text
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {`${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[
                            CampaignStep.ContentSubmission
                          ].start,
                        ),
                      )} - ${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[
                            CampaignStep.ContentSubmission
                          ].end,
                        ),
                      )}`}
                    </Text>
                  </View>
                  <View style={[flex.flexCol, gap.small, padding.default]}>
                    <View style={[flex.flexRow, justify.between, items.center]}>
                      <Text className="font-semibold" style={[font.size[30]]}>
                        Revision needed!
                      </Text>
                      <Text style={[font.size[20]]}>
                        Nov 19, 2023 16:20 WIB
                      </Text>
                    </View>
                    <Text>
                      {`1. The introduction should have a brief explanation about the brand and also please make the transition between shots smoother.\n2. The audio quality is kinda bad, please provide caption for it`}
                    </Text>
                    <CustomButton text="Upload" />
                  </View>
                </View>
              )}
              {campaignTimelineMap?.[
                CampaignStep.EngagementResultSubmission
              ] && (
                <View style={[flex.flexCol, shadow.medium, rounded.medium]}>
                  <View
                    style={[
                      flex.flexCol,
                      padding.default,
                      styles.headerBorder,
                    ]}>
                    <Text
                      className="font-semibold"
                      style={[
                        font.size[40],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {CampaignStep.EngagementResultSubmission}
                    </Text>
                    <Text
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {`${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[
                            CampaignStep.EngagementResultSubmission
                          ].start,
                        ),
                      )} - ${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[
                            CampaignStep.EngagementResultSubmission
                          ].end,
                        ),
                      )}`}
                    </Text>
                  </View>
                  <View
                    style={[
                      flex.flexCol,
                      padding.default,
                      rounded.default,
                      gap.default,
                    ]}>
                    <Text
                      className="font-semibold"
                      style={[
                        font.size[40],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      Submit your ideas!
                    </Text>
                    <View
                      style={[
                        flex.flexCol,
                        gap.default,
                        padding.default,
                        rounded.default,
                        background(`${COLOR.green[5]}`),
                      ]}>
                      <Text>💡 Things to highlight</Text>
                      <Text>
                        Features: Multiple compartments for organized packing
                        Water-resistant and weather-proof material Lightweight
                        and easy to carry Available in various sizes and colors
                        Tagline: “Travel with confidence with Koper Idaman
                        Petualang!”
                      </Text>
                    </View>
                    <CustomButton text="Submit idea" />
                  </View>
                </View>
              )}
            </Stepper>
          </View>
        </HorizontalPadding>
      </PageWithBackButton>
    </>
  );
};

export default CampaignTimelineScreen;

const styles = StyleSheet.create({
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black[20],
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: COLOR.black[20],
  },
});
