import React, { useState, useEffect, useCallback, useReducer } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useSelector } from "react-redux";
import Input from "../components/Input";
import { Overlay } from "react-native-elements";
import { firebase, firestore, firebaseAuth } from "../config";
const FORM_INPUT_UPDATE = "FORM_INPUT_UPDATE";

const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value,
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid,
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues,
    };
  }
  return state;
};

const changeFormat = (time) => {
  var timeStr;
  var timeArr = time.split(":");
  var amOrPm;
  if (parseInt(timeArr[0]) <= 12) {
    timeStr = timeArr[0];
    amOrPm = " am";
  } else {
    timeStr = "" + (parseInt(timeArr[0]) - 12);
    amOrPm = " pm";
  }

  return timeStr + ":" + timeArr[1] + amOrPm;
};

const getSlots = (startTime, endTime, slot) => {
  const start = startTime.split(":");
  const end = endTime.split(":");
  let startTimevar = new Date(
    2020,
    4,
    20,
    parseInt(start[0]),
    parseInt(start[1])
  );
  const endTimevar = new Date(
    2020,
    4,
    20,
    parseInt(end[0]),
    parseInt(end[1])
  ).getTime();
  const slots = [];
  while (startTimevar.getTime() < endTimevar) {
    var bSlot = startTimevar.toTimeString().slice(0, 5);
    startTimevar = new Date(startTimevar.getTime() + slot * 60000);
    var eSlot = startTimevar.toTimeString().slice(0, 5);
    slots.push({ bSlot, eSlot });
  }
  // return slots;
  let finalSlots = [];
  slots.forEach((val) => {
    finalSlots.push(`${changeFormat(val.bSlot)} - ${changeFormat(val.eSlot)}`);
  });
  return finalSlots;
};

const BookingScreen = (props) => {
  const isReshedule = props.navigation.getParam("reschedule");
  const [bookingStatus, updateBookingStatus] = useState("");
  const [bookingModal, updateBookingModal] = useState(false);

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      purpose: "",
    },
    inputValidities: {
      purpose: false,
    },
    formIsValid: false,
  });

  const checkTimeStot = (bookedSlots, timeSlots) => {
    let formatedTimeSlots = [];
    const personPerSlot = selectedBussiness.personsPerSlot;
    console.log(selectedBussiness);
    timeSlots.forEach((element) => {
      if (
        bookedSlots[element] === undefined ||
        bookedSlots[element] < personPerSlot || bookedSlots[element] === NaN
      ) {
        formatedTimeSlots.push(element);
      }
    });
    return formatedTimeSlots;
  };
  const selectedBussiness = useSelector(
    (state) => state.business.selectedBusiness
  );
  const [timeSlots, updateTimeSlots] = useState(
    getSlots(
      selectedBussiness.timing.startTime,
      selectedBussiness.timing.closeTime,
      selectedBussiness.slotInterval
    )
  );
  const [checkedtimeslots, updateCheckedtimeslots] = useState([]);
  const [selectedTime, updateSelectedTime] = useState("");
  const handlePress = (time) => {
    updateSelectedTime(time);
    console.log(selectedTime);
  };

  useEffect(() => {
    firestore
      .collection(`timeSlots/${selectedBussiness.id}/bookings`)
      .doc(props.navigation.getParam("date"))
      .get()
      .then((res) => {
        console.log(res.data());
        if (res.empty || res.data() === undefined) {
          updateCheckedtimeslots(timeSlots);
        } else {
          updateCheckedtimeslots(checkTimeStot(res.data(), timeSlots));
        }
      })
      .catch((err) => console.log(err));
  }, [timeSlots]);

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier,
      });
    },
    [dispatchFormState]
  );

  const handleBooking = () => {
    const user = firebaseAuth.currentUser;
    updateBookingStatus("Please Wait Your Booking Is Being Processed.");
    updateBookingModal(true);
    const bookingDoc = firestore.collection("userBooking").doc();
    const timeSlotUpdate = firestore
      .collection(`timeSlots/${selectedBussiness.id}/bookings`)
      .doc(props.navigation.getParam("date"));
    firestore
      .runTransaction(function (transaction) {
        return transaction.get(timeSlotUpdate).then(function (tSlot) {
          var currentBookings = tSlot.data();
          try {
            var slotBookingNo = currentBookings[selectedTime];
          } catch {
            var slotBookingNo = undefined;
          }
          if (
            slotBookingNo < selectedBussiness.personsPerSlot ||
            slotBookingNo == undefined
          ) {
            var newVal = slotBookingNo ? slotBookingNo + 1 : 1;
            currentBookings
              ? transaction.set(timeSlotUpdate, {
                  ...currentBookings,
                  [selectedTime]: newVal,
                })
              : transaction.set(timeSlotUpdate, { [selectedTime]: newVal });
            transaction.set(bookingDoc, {
              businessId: selectedBussiness.id,
              userId: user.uid,
              username: user.displayName,
              email: user.email,
              time: selectedTime,
              bookingStatus: "open",
              appointmentStatus: "walk-in",
              date: props.navigation.getParam("date"),
              purpose: formState.inputValues.purpose,
            });
            return "done";
          }
        });
      })
      .then(function (status) {
        if (status === "done") {
          updateBookingStatus(
            "Your booking is successful check your Manage appointments section for more details."
          );
        }
      })
      .catch(function (err) {
        updateBookingStatus(
          "Sorry we can't process your booking now please try again later."
        );
        console.error(err);
      });
  };

  const handleReshedule = () => {
    const oldTime = props.navigation.getParam("time");
    updateBookingStatus("Please Wait Your Reschedule is being processed.");
    updateBookingModal(true);
    const bookingDoc = firestore
      .collection("userBooking")
      .doc(props.navigation.getParam("id"));
    const timeSlotUpdate = firestore
      .collection(`timeSlots/${selectedBussiness.id}/bookings`)
      .doc(props.navigation.getParam("date"));
    const oldTimeSlot = firestore
      .collection(`timeSlots/${selectedBussiness.id}/bookings`)
      .doc(props.navigation.getParam("oldDate"));
    firestore
      .runTransaction(function (transaction) {
        return transaction.get(timeSlotUpdate).then(function (tSlot) {
          var currentBookings = tSlot.data();
          try {
            var slotBookingNo = currentBookings[selectedTime];
          } catch {
            var slotBookingNo = undefined;
          }
          if (
            slotBookingNo < selectedBussiness.personsPerSlot ||
            slotBookingNo == undefined
          ) {
            var newVal = slotBookingNo ? slotBookingNo + 1 : 1;
            currentBookings
              ? transaction.set(timeSlotUpdate, {
                  ...currentBookings,
                  [selectedTime]: newVal,
                })
              : transaction.set(timeSlotUpdate, { [selectedTime]: newVal });
            transaction.update(bookingDoc, {
              time: selectedTime,
              date: props.navigation.getParam("date"),
            });
            return "done";
          }
        });
      })
      .then(function (status) {
        if (status === "done") {
          updateBookingStatus(
            "Your Resheduling is successful check your Manage appointments section for more details."
          );
        }
      })
      .catch(function (err) {
        updateBookingStatus(
          "Sorry we can't process your booking now please try again later."
        );
        console.error(err);
      });
      firestore
      .runTransaction(function (transaction) {
        return transaction.get(oldTimeSlot).then(function (tSlot) {
          var currentBookings = tSlot.data();
          var slotBookingNo = currentBookings[oldTime] - 1;
          transaction.update(oldTimeSlot, {
            [oldTime]: slotBookingNo,
          });
          return "done"
        })
      }).then(function (status) {
        if (status === "done") {
          updateBookingStatus(
            "Your Resheduling is successful check your Manage appointments section for more details."
          );
        }
      })
      .catch(function (err) {
        updateBookingStatus(
          "Sorry we can't process your booking now please try again later."
        );
        console.error(err);
      });
  };

  return (
    <View>
      <Overlay isVisible={bookingModal}>
        <View style={styles.bookingStatus}>
          <Text style={styles.bookingText}>{bookingStatus}</Text>
          <View>
            <Button
              style={styles.bookingCpmBtn}
              onPress={() => {
                updateBookingModal(false);
                props.navigation.popToTop()
              }}
              title="Go Back Home"
            />
          </View>
          <View>
            <Button
              style={styles.bookingCpmBtn}
              onPress={() => {
                updateBookingModal(false);
                props.navigation.navigate({
                  routeName: "manage",
                });
              }}
              title="Manage Appointments"
            />
          </View>
        </View>
      </Overlay>
      <Text>
        Select a time slot for an appointment in {selectedBussiness.name}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        {checkedtimeslots.map((elem, index) => {
          const color = selectedTime === elem.time ? "blue" : "#3492e3";
          return (
            <View key={index} style={styles.timeSlots}>
              <Button
                color={color}
                style={
                  selectedTime === elem ? styles.notSelected : styles.selected
                }
                title={elem}
                disabled={elem.disable}
                onPress={handlePress.bind(this, elem)}
              />
            </View>
          );
        })}
        {!isReshedule && (
          <Input
            id="purpose"
            label="Purpose of visit"
            required
            minLength={5}
            errorText="Please enter a valid value."
            onInputChange={inputChangeHandler}
            initialValue=""
          />
        )}
        <View style={styles.bookBtn}>
          <Button
            title="Confirm Booking"
            onPress={isReshedule ? handleReshedule : handleBooking}
          />
        </View>
      </View>
    </View>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  timeSlots: {
    // justifyContent: "space-around",
    // flexWrap: "wrap",
    paddingVertical: 10,
    width: 100,
    // paddingHorizontal: 10
  },
  bookBtn: {
    paddingVertical: 20,
  },
  bookingStatus: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bookingText: {
    paddingVertical: 20,
  },
  bookingCpmBtn: {
    paddingVertical: 20,
  },
});
