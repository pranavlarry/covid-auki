import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import HeaderButton from "../components/headerButton";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { Slider, Overlay } from "react-native-elements";
import BusinessList from "../components/businessList";
import { Calendar } from "react-native-calendars";
import { useSelector } from "react-redux";
import { formatDate } from "../helper/helperFunctions";

const ServiceScreen = React.memo((props) => {
  const [kmSelector, updateKmSelector] = useState(10);
  const [calVisible, updateCalVisible] = useState(false);
  const [invalidDate, updateInvalidDate] = useState(false);
  const selectedBusiness = useSelector(
    (state) => state.business.selectedBusiness
  );

  const checkAvailability = useCallback(
    (day) => {
      const dateobj = new Date(day.dateString);
      const dayString = dateobj.toDateString().slice(0, 3);
      const holidays = selectedBusiness.holidays;
      if (
        holidays != undefined &&
        ((holidays.days !== undefined &&
          holidays.days.filter(
            (val) => val.toLowerCase() === dayString.toLowerCase()
          ).length > 0) ||
          (holidays.date !== undefined &&
            holidays.date.filter(
              (val) =>
                new Date(val).getTime() === new Date(day.dateString).getTime()
            ).length > 0)) 
      ) {
        updateInvalidDate(true);
      } else {
        updateInvalidDate(false);
        updateCalVisible(false);
        props.navigation.navigate({
          routeName: "bookingScreen",
          params: {
            date: day.dateString,
            reschedule: false,
          },
        });
      }
    },
    [selectedBusiness]
  );

  return (
    <View>
      <View style={styles.kmContainer}>
        <Text style={styles.kmTitle}>Search with in: {kmSelector} KM</Text>
        <Slider
          value={kmSelector}
          onValueChange={(value) => updateKmSelector(value)}
          minimumValue={10}
          maximumValue={50}
          step={5}
        />
      </View>
      <BusinessList
        distance={kmSelector}
        cal={updateCalVisible}
        cid={props.navigation.getParam("categoryId")}
      />
      <Overlay isVisible={calVisible}>
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
          {invalidDate && (
            <Text>
              Sorry the date you have selected is a holiday please select an new
              date
            </Text>
          )}
          <Button
            title="Close"
            onPress={() => {
              updateInvalidDate(false);
              updateCalVisible(false);
            }}
          />
        </React.Fragment>
      </Overlay>
    </View>
  );
});

ServiceScreen.navigationOptions = (navData) => {
  return {
    headerTitle: "",
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

export default ServiceScreen;

const styles = StyleSheet.create({
  kmContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  kmTitle: {
    fontSize: 18,
  },
});
