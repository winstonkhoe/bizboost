import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
export class User {
  static async signUp(email: string, password: string) {
    if (email.trim() === '' || password.trim() === '') {
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      console.log('id:' + userCredential.user.uid);

      await firestore().collection('users').doc(userCredential.user.uid).set({
        fullname: 'fullname',
        phone: 'phone',
        profilePicture: 'pic',
        email: email,
        role: 'CC',
      });
      console.log('masuk');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('That email address is already in use!');
      }

      if (error.code === 'auth/invalid-email') {
        console.log('That email address is invalid!');
      }
    }

    //     console.error(error);
    //   });
  }
}
