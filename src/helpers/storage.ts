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
  task.then(async () => {
    reference
      .getDownloadURL()
      .then(url => {
        onUploadComplete(url);
      })
      .catch(err => {
        onUploadError && onUploadError(err);
      });
  });
};
