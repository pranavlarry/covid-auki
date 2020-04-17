import { createStackNavigator} from 'react-navigation-stack';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import { Platform, Text } from 'react-native';
import { createDrawerNavigator } from 'react-navigation-drawer';
import Homepage from '../screens/homepage';
import ManageAppointments from '../screens/manageAppointments';
import ServiceScreen from '../screens/serviceScreen';
import BookingScreen from '../screens/bookingScreen';
import AuthScreen from '../screens/AuthScreen';
import SignUp from '../screens/signUpScreen';

const MainNavigator = createStackNavigator({
    homeScreen: {
        screen: Homepage
    },
    serviceScreen: {
        screen: ServiceScreen
    },
    bookingScreen: {
        screen: BookingScreen
    }
});

const AppointmentsNavigator = createStackNavigator({
    manage: {
        screen: ManageAppointments
    }
});
const SideNavigator = createDrawerNavigator (
    {
        homePage: {
            screen: MainNavigator,
            navigationOptions: {
                drawerLabel: "Home Page"
            }
        },
        AppointmentsPage: {
            screen: AppointmentsNavigator,
            navigationOptions: {
                drawerLabel: "Manage Appointments"
            }
        },
    }
)

const AuthNavigator = createStackNavigator(
    {
        authScreen: AuthScreen,
    }
)

const authNavigator = createSwitchNavigator(
    {
        auth: AuthNavigator,
        signUp: SignUp,
        home: SideNavigator
    }
)

export default createAppContainer(authNavigator);