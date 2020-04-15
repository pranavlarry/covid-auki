import React, { useState } from "react";
import MainNavigator from "./navigations/MainNavigator";
// import * as Font from "expo-font";
// import { AppLoading } from "expo";

export default function App() {

  const [fontLoaded,updateFontloaded] = useState(true);

  // const fetchFonts = () => {
  //   return Font.loadAsync({
  //     "open-sans": require("./assets/fonts/OpenSans-Regular.ttf"),
  //     "open-sans-bold": require("./assets/fonts/OpenSans-Bold.ttf"),
  //   });
  // };

  if(!fontLoaded) {
    return (
      <AppLoading 
      startAsync={fetchFonts}
      onFinish={()=>{updateFontloaded(true)}}/>
    )
  }
  else {
    return <MainNavigator />;
  }
}
