import {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {User} from '../model/User';
import {Content, ContentView} from '../model/Content';
import {setContents} from '../redux/slices/contentSlice';
import {createThumbnail} from 'react-native-create-thumbnail';
import {uploadFile} from '../helpers/storage';

export const useContent = () => {
  const [rawContents, setRawContents] = useState<Content[]>([]);
  const {contents} = useAppSelector(state => state.content);
  const dispatch = useAppDispatch();

  useEffect(() => {
    Content.getAll().then(c => {
      c.forEach(content => {
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
      setRawContents(c);
    });
  }, []);

  useEffect(() => {
    User.getAll(async users => {
      const processedContents = rawContents
        .filter(rawContent => rawContent.userId !== undefined)
        .map((rawContent): ContentView => {
          return {
            content: rawContent.toJSON(),
            user: users.find(user => user.id === rawContent.userId)?.toJSON()!!,
          };
        })
        .filter(contentView => contentView?.user?.id);
      dispatch(setContents(processedContents));
    });
  }, [dispatch, rawContents]);
  return {contents};
};
