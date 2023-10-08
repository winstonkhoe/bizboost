import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

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

      await firestore().collection('users').doc(userCredential.user.uid).set({
        fullname: 'fullname',
        phone: 'phone',
        profilePicture: 'pic',
        email: email.toLowerCase(),
        role: 'CC',
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw Error('Email address is already in use!');
      }

      if (error.code === 'auth/invalid-email') {
        throw Error('That email address is invalid!');
      }
    }
  }

  static async signupWithGoogle() {
    const {idToken} = await GoogleSignin.signIn();

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    try {
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      const userSnapshot = await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .get();

      if (userSnapshot.exists) {
        console.log('User Exists');
      } else {
        console.log("User doesn't exist");

        await firestore().collection('users').doc(userCredential.user.uid).set({
          fullname: userCredential.user.displayName,
          phone: 'phone',
          profilePicture: userCredential.user.photoURL,
          email: userCredential.user.email,
          role: 'CC',
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  }
}
