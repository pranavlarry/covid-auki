import React, { useEffect, useState, useCallback } from "react";
import { Card, Overlay } from "react-native-elements";
import HeaderButton from "../components/headerButton";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";
import * as userAction from "../store/actions/user";
import { Calendar } from "react-native-calendars";
import { firestore } from "../config";
import * as businessAction from "../store/actions/business";
import BusinessModel from "../models/businessmodel";
import { FlatList, View, Text, Button, StyleSheet, Alert } from "react-native";
import { firebaseAuth } from "../config";
import { formatDate } from "../helper/formatTime";

let tDate = new Date();
let secondDate = new Date();

const ManageAppointments = React.memo((props) => {
  const dispatch = useDispatch();
  const userId = firebaseAuth.currentUser.uid;
  const app = useSelector((state) => state.user.appointments);
  const [selectedBusiness, updateSelectedBusiness] = useState({});
  const [cancelStatus, updateCancelStatus] = useState({
    openStatus: false,
    status: "",
  });
  const [rescheduleDetailes, updateRescheduleDetailes] = useState({
    openCal: false,
    invalidDate: false,
  });

  useEffect(() => {
    dispatch(userAction.setAppointments(userId));
  }, []);

  useEffect(() => {
    secondDate = new Date();
  }, [rescheduleDetailes.openCal]);

  const cancel = useCallback((id, bid, time, date) => {
    const booking = firestore.collection("userBooking").doc(id);
    const timeSlot = firestore
      .collection(`timeSlots/${bid}/bookings`)
      .doc(date);
    updateCancelStatus({
      openStatus: true,
      status: "Please wait while we check you status",
    });
    firestore
      .runTransaction(function (transaction) {
        return transaction.get(timeSlot).then(function (tslot) {
          const currentDatas = tslot.data();
          const currentValue = currentDatas[time] - 1;
          transaction.update(timeSlot, {
            [time]: currentValue,
          });
          transaction.update(booking, {
            bookingStatus: "canceled",
          });
          return "done";
        });
      })
      .then((status) => {
        if (status === "done") {
          updateCancelStatus((ps) => ({
            ...ps,
            status: "Your Booking is canceled",
          }));
        } else {
          updateCancelStatus((ps) => ({
            ...ps,
            status:
              "Sorry were unable to process your request please directly contact the business agents if it is urgent",
          }));
        }
      })
      .catch((err) => {
        updateCancelStatus(
          "Sorry were unable to process your request please directly contact the business agents if it is urgent"
        );
      });
  }, []);

  const checkAvailability = useCallback(
    (day) => {
      const dateobj = new Date(day.dateString);
      const dayString = dateobj.toDateString().slice(0, 3);
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
            id: rescheduleDetailes.id,
          },
        });
      }
    },
    [rescheduleDetailes, selectedBusiness]
  );

  const reschedule = useCallback(
    (bookingId, id, time, date) => {
      if (date !== formatDate(tDate)) {
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
      } else {
        Alert.alert(
          "Cannot Reschedule",
          "Your appointment is today we can only reschedule 24 hours prior contact the business agent for more details",
          [
            {
              text: "Close",
              onPress: () => {
                return null;
              },
            },
          ],
          { cancelable: false }
        );
      }
    },
    [formatDate, tDate]
  );

  const renderAppoinment = useCallback(
    (itemData) => {
      return (
        <Card>
          <React.Fragment>
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
            <Text>Booking Staus: {itemData.item.bookingStatus}</Text>
            <Text>Appointment Status: {itemData.item.appointmentStatus}</Text>
            <View style={styles.row}>
              {itemData.item.bookingStatus === "open" && (
                <View>
                  <Button
                    onPress={cancel.bind(
                      this,
                      itemData.item.id,
                      itemData.item.businessId,
                      itemData.item.time,
                      itemData.item.date
                    )}
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
          </React.Fragment>
        </Card>
      );
    },
    [reschedule, cancel]
  );

  return (
    <React.Fragment>
      <Overlay isVisible={cancelStatus.openStatus}>
        <React.Fragment>
          <Text>{cancelStatus.status}</Text>
          <Button
            title="Close"
            onPress={() => {
              updateCancelStatus({ openStatus: false });
            }}
          />
        </React.Fragment>
      </Overlay>
      <FlatList
        data={app}
        renderItem={renderAppoinment}
        keyExtractor={(item) => item.id}
      />
      <Overlay isVisible={rescheduleDetailes.openCal}>
        <React.Fragment>
          <Text>Select A Date</Text>
          <Calendar
            // Initially visible month. Default = Date()
            current={formatDate(tDate)}
            // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
            minDate={formatDate(secondDate.setDate(secondDate.getDate() + 1))}
            // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
            maxDate={formatDate(secondDate.setDate(secondDate.getDate() + 30))}
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
        </React.Fragment>
      </Overlay>
    </React.Fragment>
  );
});

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
