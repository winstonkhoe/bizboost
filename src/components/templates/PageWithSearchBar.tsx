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
import {useOngoingCampaign} from '../../hooks/campaign';

interface Props {}

export const PageWithSearchBar = ({}: Props) => {
  return <SearchBar />;
};

interface SearchAutocompletePlaceholderProps {
  children: ReactNode;
}

export const SearchAutocompletePlaceholder = ({
  ...props
}: SearchAutocompletePlaceholderProps) => {
  const {activeRole} = useUser();
  const {isOnSearchPage, searchTerm} = useAppSelector(state => state.search);
  const {nonUserCampaigns} = useOngoingCampaign();
  const [contentCreators, setContentCreators] = useState<User[]>([]);

  useEffect(() => {
    console.log(
      'page with search bar, fetch campaign get all, user get content creators',
    );
    User.getContentCreators().then(setContentCreators);
  }, []);

  return isOnSearchPage ? (
    <View style={[flex.flex1, flex.flexCol]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[flex.flexCol, gap.default]}>
          {activeRole === UserRole.ContentCreator
            ? searchTerm !== '' &&
              getSimilarCampaigns(nonUserCampaigns, searchTerm).map(
                (campaign: Campaign) =>
                  campaign.title && (
                    <HorizontalPadding key={campaign.id}>
                      <AutoCompleteSearchItem itemValue={campaign.title} />
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
    props.children
  );
};

interface HideOnActiveSearchProps {
  children: ReactNode;
}

export const HideOnActiveSearch = ({...props}: HideOnActiveSearchProps) => {
  const {isOnSearchPage} = useAppSelector(state => state.search);
  return isOnSearchPage ? null : props.children;
};
