import {ReactNode, useEffect, useState} from 'react';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {HorizontalPadding} from '../atoms/ViewPadding';
import {SearchBar} from '../organisms/SearchBar';
import {Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {ScrollView} from 'react-native-gesture-handler';
import {AutoCompleteSearchItem} from '../molecules/AutoCompleteSearchItem';
import {gap} from '../../styles/Gap';
import {useAppSelector} from '../../redux/hooks';
import {Campaign} from '../../model/Campaign';
import {getSimilarCampaigns} from '../../validations/campaign';
import {getSimilarContentCreators} from '../../validations/user';
import {User, UserRole} from '../../model/User';
import {useUser} from '../../hooks/user';

interface Props {
  children: ReactNode;
}

export const PageWithSearchBar = ({children}: Props) => {
  const {activeRole} = useUser();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contentCreators, setContentCreators] = useState<User[]>([]);
  const {isOnSearchPage, searchTerm} = useAppSelector(state => state.search);

  useEffect(() => {
    console.log(
      'page with search bar, fetch campaign get all, user get content creators',
    );
    Campaign.getAll().then(setCampaigns);
    User.getContentCreators().then(setContentCreators);
  }, []);

  return (
    <SafeAreaContainer customInsets={{bottom: 0}} enable>
      <View className="h-full text-center" style={[flex.flexCol]}>
        <HorizontalPadding>
          <SearchBar />
        </HorizontalPadding>
        <View className="mb-3" />
        {isOnSearchPage ? (
          <View className="h-full w-full" style={[flex.flexCol]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[flex.flexCol, gap.default]}>
                {activeRole === UserRole.ContentCreator
                  ? searchTerm !== '' &&
                    getSimilarCampaigns(campaigns, searchTerm).map(
                      (campaign: Campaign) =>
                        campaign.title && (
                          <HorizontalPadding key={campaign.id}>
                            <AutoCompleteSearchItem
                              itemValue={campaign.title}
                            />
                          </HorizontalPadding>
                        ),
                    )
                  : searchTerm !== '' &&
                    getSimilarContentCreators(contentCreators, searchTerm).map(
                      (cc: User) =>
                        cc.contentCreator?.fullname && (
                          <HorizontalPadding key={cc.id}>
                            <AutoCompleteSearchItem
                              itemValue={cc.contentCreator?.fullname}
                            />
                          </HorizontalPadding>
                        ),
                    )}
              </View>
            </ScrollView>
          </View>
        ) : (
          children
        )}
      </View>
    </SafeAreaContainer>
  );
};
