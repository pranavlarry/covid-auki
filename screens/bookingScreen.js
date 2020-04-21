import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { Overlay } from "react-native-elements";
import { firestore, firebaseAuth } from "../config";
import { sendPushNotification } from "../helper/helperFunctions";
import TimeSlots from "../components/timeSlots";



const BookingScreen = React.memo((props) => {
  const isReshedule = props.navigation.getParam("reschedule"); //is it rescheduling or new booking
  const [bookingStatus, updateBookingStatus] = useState("");
  const [bookingModal, updateBookingModal] = useState(false); 
  const [selectedTime, updateSelectedTime] = useState(""); //selected time
  const [loadingTime, updateLoadingTime] = useState(false); //loading spinner




 //clicked business
  const selectedBussiness = useSelector(
    (state) => state.business.selectedBusiness
  );

  //notification token
  const nToken = useSelector((state) => state.user.notificationToken);

  
  

  const [enterpurpose, updatePurpose] = useState("");
  

  const handlePurpose = useCallback((text) => {
    if(/^[A-Za-z ]*$/.test(text)) {
      updatePurpose(text);
    }
  });



  // const inputChangeHandler = useCallback(
  //   (inputIdentifier, inputValue, inputValidity) => {
  //     dispatchFormState({
  //       type: FORM_INPUT_UPDATE,
  //       value: inputValue,
  //       isValid: inputValidity,
  //       input: inputIdentifier,
  //     });
  //   },
  //   [dispatchFormState]
  // );

  const handleBooking = useCallback(() => {
    if (enterpurpose === "" || selectedTime === "") {
      Alert.alert("Wrong Value", "Please Select Correct values", [
        {
          text: "Ok",
        },
      ]);
    } else {
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
                businessName: selectedBussiness.name,
                date: props.navigation.getParam("date"),
                purpose: enterpurpose,
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
            //change business name
            sendPushNotification(
              "Booking Success",
              `Your booking at business name between is registered`,
              nToken
            );
          }
        })
        .catch(function (err) {
          updateBookingStatus(
            "Sorry we can't process your booking now please try again later."
          );
          console.error(err);
        });
    }
  }, [firebaseAuth.currentUser, enterpurpose, selectedBussiness, selectedTime]);

  const handleReshedule = useCallback(() => {
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
            return true;
          }
        });
      })
      .then(function (res) {
        if (res) {
          // updateBookingStatus(
          //   "Your Resheduling is successful check your Manage appointments section for more details."
          // );
          firestore
            .runTransaction(function (transaction) {
              return transaction.get(oldTimeSlot).then(function (tSlot) {
                var currentBookings = tSlot.data();
                var slotBookingNo = currentBookings[oldTime] - 1;
                transaction.update(oldTimeSlot, {
                  [oldTime]: slotBookingNo,
                });
                return true;
              });
            })
            .then(function (res) {
              if (res) {
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
        }
      })
      .catch(function (err) {
        updateBookingStatus(
          "Sorry we can't process your booking now please try again later."
        );
        console.error(err);
      });
  }, [selectedBussiness, selectedTime]);

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
                props.navigation.popToTop();
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
      {loadingTime ? (
        <View style={styles.lcontainer}>
          <Text>Loading Available Time Slots</Text>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <React.Fragment>
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
            <TimeSlots selectedTime={selectedTime} loadingTime={updateLoadingTime} updateSelection={updateSelectedTime} date ={props.navigation.getParam("date")}/>
            {!isReshedule && (
              <React.Fragment>
                <View style={{ width: "100%" }}>
                  <Text>Purpose of visit</Text>
                  <TextInput
                    style={{
                      paddingHorizontal: 2,
                      paddingVertical: 5,
                      borderBottomColor: "#ccc",
                      borderBottomWidth: 1,
                    }}
                    onChangeText={handlePurpose}
                    value={enterpurpose}
                  />
                </View>
                {/* <Input
                  id="purpose"
                  label="Purpose of visit"
                  required
                  minLength={5}
                  errorText="Please enter a valid value."
                  onInputChange={inputChangeHandler}
                  initialValue=""
                /> */}
              </React.Fragment>
            )}
          </View>
          <View style={styles.bookBtn}>
            <Button
              title="Confirm Booking"
              onPress={isReshedule ? handleReshedule : handleBooking}
            />
          </View>
        </React.Fragment>
      )}
    </View>
  );
});

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
  lcontainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    minHeight: 300,
  },
});
