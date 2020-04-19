import * as firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";
// import { Firebase } from "react-native-firebase";
const firebaseConfig = {
    apiKey: "AIzaSyAGDHLqd2GWGd3n3ia3dkwYek926FSyecI",
    authDomain: "covid-auki.firebaseapp.com",
    databaseURL: "https://covid-auki.firebaseio.com",
    projectId: "covid-auki",
    storageBucket: "covid-auki.appspot.com",
    messagingSenderId: "1039505605670",
    appId: "1:1039505605670:web:da80e5ade1384b7a08d2e7",
    measurementId: "G-DEVJDJX8S2"
    // apiKey: "AIzaSyAGDHLqd2GWGd3n3ia3dkwYek926FSyecI",
    // authDomain: "covid-auki.firebaseapp.com",
    // databaseURL: "https://covid-auki.firebaseio.com",
    // projectId: "covid-auki",
    // storageBucket: "covid-auki.appspot.com",
    // messagingSenderId: "1039505605670",
    // appId: "1:1039505605670:web:be8d8a1eddfd1f3508d2e7",
    // measurementId: "G-MT29B77X78"
  };

 export const firebaseApp = firebase.initializeApp(firebaseConfig);

 export const firestore = firebase.firestore();

 export const firebaseAuth = firebase.auth();
