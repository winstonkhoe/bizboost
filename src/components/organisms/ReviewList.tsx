import {View} from 'react-native';
import {Review} from '../../model/Review';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {ReviewCard} from '../molecules/ReviewCard';
import {EmptyPlaceholder} from '../templates/EmptyPlaceholder';

interface ReviewListProps {
  reviews: Review[];
}
export const ReviewList = ({reviews}: ReviewListProps) => {
  if (reviews.length === 0) {
    return <EmptyPlaceholder />;
  }
  return (
    <View style={[flex.flex1, flex.flexCol, gap.default]}>
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </View>
  );
};
