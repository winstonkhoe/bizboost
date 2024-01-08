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

export const usePortfolio = (userId?: string): usePortfolioHook => {
  const [rawPortfolios, setRawPortfolios] = useState<Portfolio[]>([]);
  const {portfolios} = useAppSelector(state => state.portfolio);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const processPortfolioThumbnails = (c?: Portfolio[]) => {
      c?.forEach(content => {
        console.log('masuk2: ' + userId);
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
                  content.updateThumbnail(url);
                },
              });
            })
            .catch(err => console.log({err}));
        }
      });
      if (c) {
        setRawPortfolios(c);
      }
    };
    if (userId) {
      console.log('masuk: ' + userId);
      Portfolio.getByUserId(userId)
        .then(processPortfolioThumbnails)
        .catch(() => setRawPortfolios([]));
    } else {
      Portfolio.getAll()
        .then(processPortfolioThumbnails)
        .catch(() => setRawPortfolios([]));
    }
  }, [userId]);

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
      console.log('masuk3: ' + userId);
      dispatch(setPortfolios(processedPortfolios));
    });
  }, [dispatch, rawPortfolios, userId]);
  return {portfolios};
};
