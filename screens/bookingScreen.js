import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useSelector } from "react-redux";
import {  Input } from "react-native-elements";

const BookingScreen = (props) => {
  const checkTimeStot = (timeSlots) => {
    const bookingDetails =
      selectedBussiness.bookings[props.navigation.getParam("date")];
    let formatedTimeSlots = [];
    const personPerSlot = selectedBussiness.personsPerSlot;
    if (bookingDetails === undefined) {
      timeSlots.forEach((element) => {
        formatedTimeSlots.push({
          time: element,
          disable: false,
        });
      });
      return formatedTimeSlots;
    } else {
      timeSlots.forEach((element) => {
        if (
          bookingDetails[element] !== undefined &&
          Object.keys(bookingDetails[element]).length >= personPerSlot
        ) {
          formatedTimeSlots.push({
            time: element,
            disable: true,
          });
        } else {
          formatedTimeSlots.push({
            time: element,
            disable: false,
          });
        }
      });
    }
    return formatedTimeSlots;
  };
  const selectedBussiness = useSelector((state) => state.business);
  const timeSlots = selectedBussiness.timeSlots;
  const checkedtimeslots = checkTimeStot(timeSlots);
  const [selectedTime, updateSelectedTime] = useState("");
  const handlePress = (time) => {
    updateSelectedTime(time);
  };
  return (
    <View>
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
                style={selectedTime === elem.time ? styles.notSelected : styles.selected}
                title={elem.time}
                disabled={elem.disable}
                onPress={handlePress.bind(this, elem.time)}
              />
            </View>
          );
        })}

        <Input placeholder="Purpose of visit" />
        <View style={styles.bookBtn}>
          <Button title="Confirm Booking" />
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
});
