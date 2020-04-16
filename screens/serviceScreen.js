import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import HeaderButton from "../components/headerButton";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { Slider, Overlay } from "react-native-elements";
import BusinessList from "../components/businessList";
import { Calendar } from "react-native-calendars";
import { useSelector } from 'react-redux';



const startDate = new Date();


const ServiceScreen = (props) => {
  startDate.setDate(startDate.getDate() + 1);
  let date=null;
  const [kmSelector, updateKmSelector] = useState(10);
  const [calVisible, updateCalVisible] = useState(false);
  const [invalidDate,updateInvalidDate] = useState(false);
  const selectedBusiness = useSelector(state=> state.business);

  useEffect(()=>{
    let day = ''+startDate.getDate();
    let mon = ''+startDate.getMonth();
    let year = startDate.getFullYear();
    if(day<10){
        day = '0'+day;
    }
    if(mon < 10){
        mon='0'+mon
    }
    date=year+"-"+mon+"-"+day;
  },[])

  const checkAvailability = (day) => {
    const dateobj = new Date(day.dateString);
    const dayString = dateobj.toDateString().slice(0,3);
    const holidays = selectedBusiness.holidays;
    if((holidays.days.filter(val => val.toLowerCase() === dayString.toLowerCase()).length > 0) || (holidays.date.filter(val => val === day.dateString).length > 0)){
        updateInvalidDate(true);
    }
    else {
        updateInvalidDate(false);
        updateCalVisible(false);
        props.navigation.navigate({
            routeName: 'bookingScreen',
            params: {
                date: day.dateString
            }
        });
    } 
  }
//   
//   const date = '' + startDate.getDate() < 10 ?   
  return (
    <View>
      <View style={styles.kmContainer}>
        <Text style={styles.kmTitle}>Sreach with in: {kmSelector} KM</Text>
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
        <Text>Select A Date</Text>
        <Calendar
          // Initially visible month. Default = Date()
          current={date}
          // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
          minDate={"2020-04-16"}
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
        {invalidDate && <Text>Sorry the date you have selected is a holiday please select an new date</Text>}
        <Button title="Close" onPress={()=> {
                updateInvalidDate(false);
                updateCalVisible(false);
            }}/>
      </Overlay>
    </View>
  );
};

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
