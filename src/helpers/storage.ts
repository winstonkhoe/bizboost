import uuid from 'react-native-uuid';
import storage from '@react-native-firebase/storage';

interface UploadFileProps {
  originalFilePath: string;
  targetFolder: string;
  onUploadProgressChange?: (progress: number) => void;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
}
export const uploadFile = ({
  originalFilePath,
  targetFolder,
  onUploadProgressChange,
  onUploadComplete,
  onUploadError,
}: UploadFileProps) => {
  const imageType = originalFilePath.split('.').pop();
  const filename = `${targetFolder}/${uuid.v4()}.${imageType}`;

  const reference = storage().ref(filename);
  const task = reference.putFile(originalFilePath);
  if (onUploadProgressChange) {
    task.on('state_changed', taskSnapshot => {
      onUploadProgressChange(
        taskSnapshot.bytesTransferred / taskSnapshot.totalBytes,
      );
    });
  }
  task
    .then(async () => {
      reference
        .getDownloadURL()
        .then(url => {
          onUploadComplete(url);
        })
        .catch(err => {
          onUploadError && onUploadError(err);
        });
    })
    .catch(err => console.log('storage.uploadFile error ' + err));
};

export const deleteFileByURL = (url: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (!url.startsWith('http')) {
      reject('Invalid URL: ' + url);
    }

    const reference = storage().refFromURL(url);
    reference
      .delete()
      .then(() => {
        console.log('File deleted successfully!');
        resolve();
      })
      .catch(error => {
        console.log(error);
        reject('File deletion error!');
      });
  });
};
