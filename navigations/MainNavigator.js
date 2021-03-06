import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { Platform, Text, View, SafeAreaView,TouchableOpacity, Alert, Settings } from "react-native";
import {
  createDrawerNavigator,
  DrawerNavigatorItems,
} from "react-navigation-drawer";
import Homepage from "../screens/homepage";
import ManageAppointments from "../screens/manageAppointments";
import ServiceScreen from "../screens/serviceScreen";
import BookingScreen from "../screens/bookingScreen";
import AuthScreen from "../screens/AuthScreen";
import SignUp from "../screens/signUpScreen";
import Loading from "../screens/loading";
import {firebaseAuth} from "../config";
import SettingsScreen from "../screens/settingsScreen";
import Feedback from "../screens/feedbackScreen";

const AppointmentsNavigator = createStackNavigator({
  manage: {
    screen: ManageAppointments,
  },
  bookingScreen: {
    screen: BookingScreen,
  },
},{
  initialRouteName: 'manage'
});

const MainNavigator = createStackNavigator({
  homeScreen: {
    screen: Homepage,
  },
  serviceScreen: {
    screen: ServiceScreen,
  },
  bookingScreen: {
    screen: BookingScreen,
  },
  manage: {
    screen: AppointmentsNavigator,
    navigationOptions: {
      title: 'Home',
      headerShown: false //this will hide the header
    },
  },
},{
  initialRouteName: "homeScreen"
});

const AccountSettingsNavigator = createStackNavigator({
  settings: {
    screen: SettingsScreen
  }
});

const FeedbackNavigator = createStackNavigator({
  feedbak: {
    screen: Feedback
  }
})


const SideNavigator = createDrawerNavigator(
  {
    homePage: {
      screen: MainNavigator,
      navigationOptions: {
        drawerLabel: "Home Page",
      },
    },
    AppointmentsPage: {
      screen: AppointmentsNavigator,
      navigationOptions: {
        drawerLabel: "Manage Appointments",
      },
    },
    SettingsPage: {
      screen: AccountSettingsNavigator,
      navigationOptions: {
        drawerLabel: "Settings",
      },
    },
    FeedbackPage: {
      screen: FeedbackNavigator,
      navigationOptions: {
        drawerLabel: "Feedback",
      },
    },
  },
  {
    contentComponent: (props) => (
      <View style={{ flex: 1 }}>
        <SafeAreaView forceInset={{ top: "always", horizontal: "never" }}>
          <DrawerNavigatorItems {...props} />
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Log out",
                "Do you want to logout?",
                [
                  {
                    text: "Cancel",
                    onPress: () => {
                      return null;
                    },
                  },
                  {
                    text: "Confirm",
                    onPress: () => {
                    //   AsyncStorage.clear();
                    firebaseAuth.signOut().then(function() {
                      props.navigation.navigate("auth");
                      }).catch(function(error) {
                        // An error happened.
                      });
                    },
                  },
                ],
                { cancelable: false }
              )
            }
          >
            <Text
              style={{
                margin: 16,
                fontWeight: "bold",
                // color: colors.textColor,
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    ),
    drawerOpenRoute: "DrawerOpen",
    drawerCloseRoute: "DrawerClose",
    drawerToggleRoute: "DrawerToggle",
  }
);

const AuthNavigator = createStackNavigator({
  authScreen: AuthScreen,
});

const authNavigator = createSwitchNavigator({
  loading: Loading,
  auth: AuthNavigator,
  signUp: SignUp,
  home: SideNavigator,
});

export default createAppContainer(authNavigator);
