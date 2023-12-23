import {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {User} from '../model/User';
import {Portfolio, PortfolioView} from '../model/Portfolio';
import {setPortfolios} from '../redux/slices/portfolioSlice';
import {createThumbnail} from 'react-native-create-thumbnail';
import {uploadFile} from '../helpers/storage';

interface usePortfolioHook {
  portfolios: PortfolioView[];
}

export const usePortfolio = (): usePortfolioHook => {
  const [rawPortfolios, setRawPortfolios] = useState<Portfolio[]>([]);
  const {portfolios} = useAppSelector(state => state.portfolio);
  const dispatch = useAppDispatch();

  useEffect(() => {
    Portfolio.getAll().then(c => {
      c.forEach(content => {
        console.log(content.description);
        if (!content?.thumbnail && content?.uri) {
          createThumbnail({
            url: content?.uri,
            timeStamp: 0,
          })
            .then(response => {
              uploadFile({
                originalFilePath: response.path,
                targetFolder: 'thumbnails',
                onUploadComplete: url => {
                  content.thumbnail = url;
                  content.update();
                },
              });
            })
            .catch(err => console.log({err}));
        }
      });
      setRawPortfolios(c);
    });
  }, []);

  useEffect(() => {
    User.getAll(async users => {
      const processedPortfolios = rawPortfolios
        .filter(rawPortfolio => rawPortfolio.userId !== undefined)
        .map((rawPortfolio): PortfolioView => {
          return {
            portfolio: rawPortfolio.toJSON(),
            user: users
              .find(user => user.id === rawPortfolio.userId)
              ?.toJSON()!!,
          };
        })
        .filter(portfolioView => portfolioView?.user?.id);
      dispatch(setPortfolios(processedPortfolios));
    });
  }, [dispatch, rawPortfolios]);
  return {portfolios};
};
