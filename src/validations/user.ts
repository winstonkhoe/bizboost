import {User} from '../model/User';

export const getSimilarContentCreators = (
  users: User[],
  searchTerm: string,
) => {
  return users.filter((user: User) => {
    return user.contentCreator?.fullname
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });
};
