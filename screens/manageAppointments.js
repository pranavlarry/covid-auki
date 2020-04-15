import React from "react";
import { View, Text } from "react-native";
import HeaderButton from "../components/headerButton";
import { HeaderButtons, Item } from "react-navigation-header-buttons";

const ManageAppointments = (props) => {
  return (
    <View>
      <Text>Appointments Page</Text>
    </View>
  );
};

ManageAppointments.navigationOptions = navData => {
    return {
      headerTitle: "Manage Appointments",
      headerLeft: () => (
        <HeaderButtons>
          <Item
            title="menu"
            iconName="ios-menu"
            onPress={() => {
              navData.navigation.toggleDrawer();
            }}
          />
        </HeaderButtons>
      ),
    };
  };

export default ManageAppointments;
