import React, { useState } from "react";
import MainNavigator from "./navigations/MainNavigator";
import { createStore, combineReducers, applyMiddleware } from 'redux';
import userReducer from './store/reducer/user';
import businessReducers from './store/reducer/business';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import {firestore} from './config';



// import * as Font from "expo-font";
// import { AppLoading } from "expo";

const rootReducer = combineReducers({
  business: businessReducers,
  user: userReducer,

});

const store = createStore(rootReducer,applyMiddleware(ReduxThunk));

export default function App() {
  
  return (
  <Provider store={store} >      
    <MainNavigator />
  </Provider>
  );

  // const [fontLoaded,updateFontloaded] = useState(true);

  // const fetchFonts = () => {
  //   return Font.loadAsync({
  //     "open-sans": require("./assets/fonts/OpenSans-Regular.ttf"),
  //     "open-sans-bold": require("./assets/fonts/OpenSans-Bold.ttf"),
  //   });
  // };

  // if(!fontLoaded) {
  //   return (
  //     <AppLoading 
  //     startAsync={fetchFonts}
  //     onFinish={()=>{updateFontloaded(true)}}/>
  //   )
  // }
  // else {


      // ;
  // }
}
