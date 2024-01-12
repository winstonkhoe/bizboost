import {User} from '../../model/User';
import ContentCreatorCard from '../atoms/ContentCreatorCard';
import MasonryLayout from '../layouts/MasonryLayout';
import {EmptyPlaceholder} from '../templates/EmptyPlaceholder';

interface ContentCreatorListProps {
  data: User[];
}

export const ContentCreatorList = ({data}: ContentCreatorListProps) => {
  if (data.length === 0) {
    return (
      <EmptyPlaceholder
        title={"There isn't an ideal content creator for this filter or search"}
        description="Try to change the filter or search for another content creator"
      />
    );
  }
  return (
    <MasonryLayout
      data={data}
      renderItem={(item, itemIndex) => (
        <ContentCreatorCard key={itemIndex} data={item} />
      )}
    />
  );
};
