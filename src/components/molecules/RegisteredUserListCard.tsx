import {Pressable, View} from 'react-native';
import {Text} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {Image} from 'react-native';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {User} from '../../model/User';
import {useEffect, useState} from 'react';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';
import {CustomButton} from '../atoms/Button';
import SelectableTag from '../atoms/SelectableTag';
import {shadow} from '../../styles/Shadow';
import {Campaign} from '../../model/Campaign';
import {textColor} from '../../styles/Text';
import {font, fontSize} from '../../styles/Font';
import ChevronRight from '../../assets/vectors/chevron-right.svg';
import {AnimatedPressable} from '../atoms/AnimatedPressable';
import Animated from 'react-native-reanimated';
import {background} from '../../styles/BackgroundColor';

type Props = {
  transaction: Transaction;
};
const RegisteredUserListCard = ({transaction}: Props) => {
  const [contentCreator, setContentCreator] = useState<User>();
  const [campaign, setCampaign] = useState<Campaign>();
  useEffect(() => {
    User.getById(transaction.contentCreatorId || '').then(u =>
      setContentCreator(u),
    );
  }, [transaction]);

  useEffect(() => {
    Campaign.getById(transaction.campaignId || '').then(c => setCampaign(c));
  }, [transaction]);

  return (
    <View style={[shadow.default, rounded.medium]}>
      <View
        className="bg-white flex flex-col pt-4 overflow-hidden"
        style={[rounded.medium]}>
        <View
          className="flex flex-row justify-between items-center border-b pb-2 px-3 "
          style={[border({color: COLOR.black[20]})]}>
          <Text style={[textColor(COLOR.green[50]), font.size[20]]}>
            {campaign?.title}
          </Text>
          <Text style={[textColor(COLOR.black[30]), font.size[20]]}>
            [] hours ago
          </Text>
        </View>
        <View className="flex flex-row items-center p-3 justify-between">
          <View className="flex flex-row items-center">
            <View
              className="mr-2 w-12 h-12 items-center justify-center overflow-hidden"
              style={[flex.flexRow, rounded.default]}>
              <Image
                className="w-full h-full object-cover"
                source={
                  contentCreator?.contentCreator?.profilePicture
                    ? {
                        uri: contentCreator?.contentCreator?.profilePicture,
                      }
                    : require('../../assets/images/bizboost-avatar.png')
                }
              />
            </View>
            <View className="flex flex-col w-3/4">
              <Text className="font-semibold text-base " numberOfLines={1}>
                {contentCreator?.contentCreator?.fullname} asd dsad dsadas
                dsadsa
              </Text>
              <SelectableTag text={transaction.status || ''} />
            </View>
          </View>
          <ChevronRight fill={COLOR.black[20]} />
        </View>
        {transaction.status === TransactionStatus.registrationPending && (
          <View className="flex flex-row items-center justify-between w-full">
            <View className="w-1/2">
              {/* TODO: @win bisa gak kalo animatednya optional, soalnya disini keknya ga perlu animasi (apa bikin komponen beda lg?) */}
              <CustomButton
                text="Accept"
                onPress={() => {
                  transaction.updateStatus(
                    TransactionStatus.registrationApproved,
                  );
                }}
                rounded="none"
                className="w-full"
                customTextSize={font.size[20]}
              />
            </View>
            <View className="w-1/2">
              <CustomButton
                text="Reject"
                onPress={() => {
                  transaction.updateStatus(
                    TransactionStatus.registrationRejected,
                  );
                }}
                rounded="none"
                className="w-full"
                customTextSize={font.size[20]}
                type="alternate"
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default RegisteredUserListCard;
