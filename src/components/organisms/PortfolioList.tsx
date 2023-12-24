import {useNavigation} from '@react-navigation/native';
import {PortfolioView} from '../../model/Portfolio';
import MasonryLayout from '../layouts/MasonryLayout';
import {PortfolioCard} from '../molecules/PortfolioCard';
import {EmptyPlaceholder} from '../templates/EmptyPlaceholder';

interface PortfolioListProps {
  portfolios: PortfolioView[];
}

export const PortfolioList = ({portfolios}: PortfolioListProps) => {
  if (portfolios.length === 0) {
    return <EmptyPlaceholder title="Content creator has no portfolio" />;
  }
  return (
    <MasonryLayout
      data={portfolios}
      renderItem={(item, itemIndex) => (
        <PortfolioCard key={itemIndex} portfolio={item} />
      )}
    />
  );
};
