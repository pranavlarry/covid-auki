import React, { useEffect, useState } from "react";
import { Card, Overlay } from "react-native-elements";
import HeaderButton from "../components/headerButton";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";
import * as userAction from "../store/actions/user";
import { Calendar } from "react-native-calendars";
import { firestore } from "../config";
import * as businessAction from "../store/actions/business";
import BusinessModel from "../models/businessmodel";

import { FlatList, View, Text, Button, StyleSheet } from "react-native";
import { firebaseAuth } from "../config";

const formatDate = () => {
  var d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const ManageAppointments = (props) => {
  const dispatch = useDispatch();
  const userId = firebaseAuth.currentUser.uid;
  const app = useSelector((state) => state.user.appointments);
  const [selectedBusiness, updateSelectedBusiness] = useState({});
  const [rescheduleDetailes, updateRescheduleDetailes] = useState({
    openCal: false,
    invalidDate: false,
  });
  useEffect(() => {
    dispatch(userAction.setAppointments(userId));
  }, []);

  const cancel = (id) => {};

  const checkAvailability = (day) => {
    const dateobj = new Date(day.dateString);
    const dayString = dateobj.toDateString().slice(0, 3);
    // console.log(selectedBusiness,"yoo");
    const holidays = selectedBusiness.holidays;
    if (
      holidays != undefined &&
      (holidays.days.filter(
        (val) => val.toLowerCase() === dayString.toLowerCase()
      ).length > 0 ||
        holidays.date.filter((val) => val === day.dateString).length > 0)
    ) {
      updateRescheduleDetailes((ps) => ({
        ...ps,
        invalidDate: true,
      }));
    } else {
      updateRescheduleDetailes((ps) => ({
        ...ps,
        invalidDate: false,
        openCal: false,
      }));
      dispatch(businessAction.selectedBusiness(selectedBusiness));
      props.navigation.navigate({
        routeName: "bookingScreen",
        params: {
          date: day.dateString,
          oldDate: rescheduleDetailes.date,
          time: rescheduleDetailes.time,
          reschedule: true,
          id: rescheduleDetailes.id
        },
      });
    }
  };

  const reschedule = (bookingId,id, time, date) => {
    console.log(id);
    updateRescheduleDetailes({
      time: time,
      date: date,
      id: bookingId,
      openCal: true,
      invalidDate: false,
    });
    firestore
      .collection("serviceCategory")
      .doc(id)
      .get()
      .then((resp) => {
        //handle error
        updateSelectedBusiness(
          new BusinessModel(
            resp.id,
            resp.data().name,
            resp.data().location,
            resp.data().personPerSlot,
            resp.data().holidays,
            resp.data().timing,
            resp.data().slotInterval
          )
        );
      });
  };

  const renderAppoinment = (itemData) => {
    return (
      <Card>
        <Text style={{ paddingVertical: 5 }}>
          Booking id: {itemData.item.id}
        </Text>
        <Text style={{ paddingVertical: 5 }}>
          Business Name: {itemData.item.businessName}
        </Text>
        <View style={styles.row}>
          <Text>Time: {itemData.item.time}</Text>
          <Text>Date: {itemData.item.date}</Text>
        </View>
        <View style={styles.row}>
          <Text>Booking Staus: {itemData.item.bookingStatus}</Text>
          <Text>Appointment Status: {itemData.item.appointmentStatus}</Text>
        </View>
        <View style={styles.row}>
          {itemData.item.bookingStatus === "open" && (
            <View>
              <Button
                onPress={cancel.bind(this, itemData.item.id)}
                title="Cancel Booking"
              />
            </View>
          )}

          <View>
            <Button onPress={() => {}} title="Contact" />
          </View>
        </View>
        {itemData.item.bookingStatus === "open" && (
          <Button
            title="Reschedule"
            onPress={reschedule.bind(
              this,
              itemData.item.id,
              itemData.item.businessId,
              itemData.item.time,
              itemData.item.date
            )}
          />
        )}
      </Card>
    );
  };

  return (
    <React.Fragment>
      <FlatList
        data={app}
        renderItem={renderAppoinment}
        keyExtractor={(item) => item.id}
      />
      <Overlay isVisible={rescheduleDetailes.openCal}>
        <Text>Select A Date</Text>
        <Calendar
          // Initially visible month. Default = Date()
          current={rescheduleDetailes.date}
          // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
          minDate={rescheduleDetailes.date}
          // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
          maxDate={"2020-05-30"}
          // Handler which gets executed on day press. Default = undefined
          onDayPress={(day) => {
            checkAvailability(day);
          }}
          // Handler which gets executed on day long press. Default = undefined
          onDayLongPress={(day) => {
            console.log("selected day", day);
          }}
          // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
          monthFormat={"yyyy MM"}
          // Handler which gets executed when visible month changes in calendar. Default = undefined
          onMonthChange={(month) => {
            console.log("month changed", month);
          }}
          // Hide month navigation arrows. Default = false
          hideArrows={true}
          // Replace default arrows with custom ones (direction can be 'left' or 'right')
          renderArrow={(direction) => <Arrow />}
          // Do not show days of other months in month page. Default = false
          hideExtraDays={true}
          // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
          // day from another month that is visible in calendar page. Default = false
          disableMonthChange={false}
          // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
          firstDay={1}
          // Hide day names. Default = false
          hideDayNames={true}
          // Show week numbers to the left. Default = false
          showWeekNumbers={true}
          // Handler which gets executed when press arrow icon left. It receive a callback can go back month
          onPressArrowLeft={(substractMonth) => substractMonth()}
          // Handler which gets executed when press arrow icon right. It receive a callback can go next month
          onPressArrowRight={(addMonth) => addMonth()}
          // Disable left arrow. Default = false
          disableArrowLeft={true}
          // Disable right arrow. Default = false
          disableArrowRight={true}
        />
        {rescheduleDetailes.invalidDate && (
          <Text>
            Sorry the date you have selected is a holiday please select an new
            date
          </Text>
        )}
        <Button
          title="Close"
          onPress={() => {
            updateRescheduleDetailes({ openCal: false });
          }}
        />
      </Overlay>
    </React.Fragment>
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
    paddingVertical: 5,
  },
});
