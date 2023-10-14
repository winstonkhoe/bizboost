import {useAppSelector} from '../redux/hooks';

export const useCreateAdditionalAccount = () => {
  const {role, data} = useAppSelector(state => state.createAdditionalAccount);

  return {role, data};
};
