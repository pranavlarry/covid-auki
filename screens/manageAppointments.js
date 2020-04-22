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
import { formatDate, callNumber } from "../helper/helperFunctions";

let tDate = new Date();

const ManageAppointments = React.memo((props) => {
  const type = props.navigation.getParam("type");
  const dispatch = useDispatch();
  const userId = firebaseAuth.currentUser.uid;
  console.log(firebaseAuth.currentUser);
  console.log(userId)
  const app = useSelector((state) => state.user.appointments);
  let flag = true;
  app.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  const [error, updateError] = useState(null);
  const [selectedBusiness, updateSelectedBusiness] = useState({});
  const [cancelStatus, updateCancelStatus] = useState({
    openStatus: false,
    status: "",
    canceled: false,
  });
  const [rescheduleDetailes, updateRescheduleDetailes] = useState({
    openCal: false,
    invalidDate: false,
  });

  const loadBookings = useCallback(async () => {
    updateError(null);
    try {
      await dispatch(userAction.setAppointments(userId));
    } catch (err) {
      // console.log(err);
      updateError(err.message);
    }
  });

  useEffect(() => {
    const willFocus = props.navigation.addListener("willFocus", () => {
      loadBookings();
      flag = false;
    });
    return () => {
      willFocus.remove();
    };
  }, [dispatch, userAction.setAppointments]);

  useEffect(() => {
      if(flag) {
        loadBookings();
      }
  }, [cancelStatus.canceled]);

  const cancel = useCallback((id, bid, time, date) => {
    Alert.alert(
      "Cancel appointment",
      "Are you sure you want to cancel the appointment",
      [
        {
          text: "Yes Cancel",
          onPress: () => {
            const booking = firestore.collection("userBooking").doc(id);
            const timeSlot = firestore
              .collection(`timeSlots/${bid}/bookings`)
              .doc(date);
            updateCancelStatus({
              openStatus: true,
              canceled: false,
              status: "Please wait while we check you status",
            });
            firestore
              .runTransaction(function (transaction) {
                return transaction.get(timeSlot).then(function (slotVal) {
                  const alldata = { ...slotVal.data() };
                  const data = { ...alldata[time] };
                  data[userId] = "unbooked";
                  alldata[time] = data;
                  transaction.set(timeSlot, alldata);
                  transaction.update(booking, {
                    appointmentStatus: "cancelled",
                    bookingStatus: "cancelled",
                  });
                  return "done";
                });
              })
              .then((status) => {
                if (status === "done") {
                  updateCancelStatus((ps) => ({
                    ...ps,
                    canceled: true,
                    status: "Your Booking is canceled",
                  }));
                } else {
                  updateCancelStatus((ps) => ({
                    ...ps,
                    canceled: false,
                    status:
                      "Sorry were unable to process your request please directly contact the business agents if it is urgent",
                  }));
                }
              })
              .catch((err) => {
                updateCancelStatus((ps) => ({
                  ...ps,
                  canceled: false,
                  status:
                    "Sorry were unable to process your request please directly contact the business agents if it is urgent",
                }));
              });
          },
        },
        {
          text: "Close",
        },
      ]
    );
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
                resp.data().slotInterval,
                resp.data().contact
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

  const pastAppointment = (date, time) => {
    const startTime = time.slice(0, 5).split(":");
    const changeDate = date.split("-").join("/");
    if (startTime[0] > 12) startTime[0] = 12 + parseInt(startTime[0]);
    // console.log(startTime)
    const bdate = changeDate + " " + startTime[0] + ":" + startTime[1];
    if (new Date() > new Date(bdate)) {
      return true;
    }
    return false;
  };

  const renderAppoinment = useCallback(
    (itemData) => {
      const check =
        type === "cancel"
          ? itemData.item.bookingStatus !== "open"
          : itemData.item.bookingStatus === "open";
      if (check) {
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
                      onPress={() => {
                        if (
                          !pastAppointment(
                            itemData.item.date,
                            itemData.item.time
                          )
                        ) {
                          cancel(
                            itemData.item.id,
                            itemData.item.businessId,
                            itemData.item.time,
                            itemData.item.date
                          );
                        } else {
                          Alert.alert(
                            "Can't Cancel",
                            "Your booking is already completed the business agent might not have updated the status",
                            [{ text: "OK" }]
                          );
                        }
                      }}
                      title="Cancel Booking"
                    />
                  </View>
                )}

                <View>
                  <Button
                    onPress={() => {
                      if (itemData.item.contact) {
                        callNumber(itemData.item.contact);
                      } else {
                        Alert.alert("Phone number is not available");
                      }
                    }}
                    title="Contact"
                  />
                </View>
              </View>
              {itemData.item.bookingStatus === "open" && (
                <Button
                  title="Reschedule"
                  onPress={() => {
                    if (
                      !pastAppointment(itemData.item.date, itemData.item.time)
                    ) {
                      reschedule(
                        itemData.item.id,
                        itemData.item.businessId,
                        itemData.item.time,
                        itemData.item.date
                      );
                    } else {
                      Alert.alert(
                        "Can't Reschedule",
                        "Your booking is already completed the business agent might not have updated the status",
                        [{ text: "OK" }]
                      );
                    }
                  }}
                />
              )}
            </React.Fragment>
          </Card>
        );
      } else {
        return null;
      }
    },
    [reschedule, cancel]
  );

  return (
    <React.Fragment>
      {type === undefined && (
        <Button
          title="View Canceled and Closed bookings"
          onPress={() => {
            props.navigation.push("manage", {
              type: "cancel",
            });
          }}
        />
      )}
      <Overlay isVisible={cancelStatus.openStatus}>
        <React.Fragment>
          <View style={styles.cancleCon}>
          <Text style={styles.cancelText}>{cancelStatus.status}</Text>
          <View style={styles.cancelBtn}>
          <Button
            title="Close"
            onPress={() => {
              updateCancelStatus({ openStatus: false });
            }}
          />
          </View>
          </View>
        </React.Fragment>
      </Overlay>
      <View>
        {error ? (
          <View style={styles.error}>
          <Text>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={app}
            renderItem={renderAppoinment}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>
      <Overlay isVisible={rescheduleDetailes.openCal}>
        <React.Fragment>
          <Text>Select A Date</Text>
          <Calendar
            // Initially visible month. Default = Date()
            current={(() => {
              const current = new Date();
              return formatDate(current);
            })()}
            // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
            minDate={(() => {
              const minDate = new Date();
              return formatDate(minDate.setDate(minDate.getDate() + 1));
            })()}
            // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
            maxDate={(() => {
              const maxDate = new Date();
              return formatDate(maxDate.setDate(maxDate.getDate() + 30));
            })()}
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
            hideArrows={false}
            // Replace default arrows with custom ones (direction can be 'left' or 'right')
            renderArrow={(direction) => {
              if (direction === "right") {
                return <Text>Next</Text>;
              } else if (direction === "left") {
                return <Text>Prev</Text>;
              }
            }}
            // Do not show days of other months in month page. Default = false
            hideExtraDays={true}
            // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
            // day from another month that is visible in calendar page. Default = false
            disableMonthChange={false}
            // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
            firstDay={1}
            // Hide day names. Default = false
            hideDayNames={false}
            // Show week numbers to the left. Default = false
            showWeekNumbers={true}
            // Handler which gets executed when press arrow icon left. It receive a callback can go back month
            onPressArrowLeft={(substractMonth) => substractMonth()}
            // Handler which gets executed when press arrow icon right. It receive a callback can go next month
            onPressArrowRight={(addMonth) => addMonth()}
            // Disable left arrow. Default = false
            disableArrowLeft={false}
            // Disable right arrow. Default = false
            disableArrowRight={false}
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
  error: {
    height: 400,
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  cancelBtn: {
    paddingVertical: 20,
    width: 100
  },
  cancleCon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    textAlign: "center"
  }
});
