import { createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import { Platform, Text } from 'react-native';
import { createDrawerNavigator } from 'react-navigation-drawer';
import Homepage from '../screens/homepage';
import ManageAppointments from '../screens/manageAppointments';
import ServiceScreen from '../screens/serviceScreen';

const MainNavigator = createStackNavigator({
    homeScreen: {
        screen: Homepage
    },
    serviceScreen: {
        screen: ServiceScreen
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

export default createAppContainer(SideNavigator);