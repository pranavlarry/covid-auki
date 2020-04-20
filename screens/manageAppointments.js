import React, { useEffect } from "react";
import { Card } from "react-native-elements";
import HeaderButton from "../components/headerButton";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";
import * as userAction from "../store/actions/user";
import { ScrollView, FlatList, View, Text, Button, StyleSheet } from "react-native";
import { firebaseAuth } from "../config";

const ManageAppointments = (props) => {
  const dispatch = useDispatch();
  const userId = firebaseAuth.currentUser.uid;
  const app = useSelector((state) => state.user.appointments);
  console.log(app);
  useEffect(() => {
    if (app.length === 0) {
      dispatch(userAction.setAppointments(userId));
    }
  }, []);

  const cancel = id => {

  }

  const renderAppoinment = (itemData) => {
    return (
      <Card>
        <Text style={{paddingVertical: 5}}>Booking id: {itemData.item.id}</Text>
        <Text style={{paddingVertical: 5}}>Business Name: {itemData.item.businessName}</Text>
        <View style={styles.row}>
          <Text>Time: {itemData.item.time}</Text>
          <Text>Date: {itemData.item.date}</Text>
        </View>
        <View style={styles.row}>
          <Text>Booking Staus: {itemData.item.bookingStatus}</Text>
          <Text>Appointment Status: {itemData.item.appointmentStatus}</Text>
        </View>
        <View style={styles.row}>
          <View>
            <Button
              onPress={cancel.bind(this, itemData.item.id)}
              title="Cancel Booking"
            />
          </View>
          <View>
            <Button onPress={()=>{}} title="Contact" />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <FlatList
      data={app}
      renderItem={renderAppoinment}
      keyExtractor={(item) => item.id}
    />
  );
};

ManageAppointments.navigationOptions = (navData) => {
  return {
    headerTitle: "Manage Appointments",
    headerLeft: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5
  }
  
})
