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

      return true;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw Error('Email address is already in use!');
      }

      if (error.code === 'auth/invalid-email') {
        throw Error('That email address is invalid!');
      }

      return false;
    }
  }

  static async signUpWithGoogle() {
    const {idToken} = await GoogleSignin.signIn();

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    try {
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      if (!userCredential.additionalUserInfo?.isNewUser) {
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

      return true;
    } catch (error: any) {
      console.log(error);

      return false;
    }
  }

  static async login(email: string, password: string) {
    try {
      await auth().signInWithEmailAndPassword(email, password);

      return true;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw Error('User not found!');
      }

      if (error.code === 'auth/wrong-password') {
        throw Error('Invalid password!');
      }

      return false;
    }
  }

  static async loginWithGoogle() {
    const {idToken} = await GoogleSignin.signIn();

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    try {
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      if (!userCredential.additionalUserInfo?.isNewUser) {
        console.log('User Exists');

        return true;
      } else {
        // TODO: optimize? (redirect to register page after signing in with google acc that doesn't exist)
        userCredential.user.delete();
        console.log('user gaada, acc diapus lg');
        throw Error("User doesn't exist");
      }
    } catch (error: any) {
      console.log(error);

      return false;
    }
  }
}
