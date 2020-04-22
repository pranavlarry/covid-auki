import React, { useState, useCallback, useEffect } from "react";
import { View, Button, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { firebaseAuth, firestore } from "../config";

//change time from 24 hour clock
const changeFormat = (time) => {
  var timeStr;
  var timeArr = time.split(":");
  var amOrPm;
  if (parseInt(timeArr[0]) <= 12) {
    timeStr = timeArr[0];
    amOrPm = " am";
    timeStr === "12" && (amOrPm = "pm");
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

const TimeSlots = (props) => {
  const selectedBussiness = useSelector(
    (state) => state.business.selectedBusiness
  );
  const [checkedtimeslots, updateCheckedtimeslots] = useState([]); //filtered time slot
  const [timeSlots, updateTimeSlots] = useState(
    //timeslots created from start time - close time and interval (change this too much load)
    getSlots(
      selectedBussiness.timing.startTime,
      selectedBussiness.timing.closeTime,
      selectedBussiness.slotInterval
    )
  );
  let timer;
  const user = firebaseAuth.currentUser.uid;



  //checking for free slots
  const checkTimeStot = useCallback(
    (bookedSlots, timeSlots) => {
        let formatedTimeSlots = [];
        timeSlots.forEach((elem)=>{
            const slot = bookedSlots[elem];
            let count = 0;

            try {
            if(slot[user] !== undefined) {
              if(slot[user] === 'booked') {
                  //you already have a booking //handle this Alert here
                  return formatedTimeSlots;
              }
              else if(slot[user].toDate() > new Date()) {
                console.log("here");
                  lockTheSlot(elem);
                  props.updateSelection(elem);
              }
            }}
            catch (errr) {

            }
            for (let key in slot) {
                if ((slot[key].toDate() > new Date() && key !== user) || slot[key] ==="booked") {
                    count++;
                }
            }
            if(count < selectedBussiness.personsPerSlot) {
                formatedTimeSlots.push(elem);
            }
        });
        return formatedTimeSlots;
    },
    [selectedBussiness]
  );

  const lockTheSlot = useCallback(async (time)=> {
      const slot = firestore
      .collection(`timeSlots/${selectedBussiness.id}/bookings`)
      .doc(props.date);//check if where works
      try{
        firestore.runTransaction(function(transaction) {
            let count = 0,flag=true;
            return transaction.get(slot).then(function(slotVal) {
                const alldata = {...slotVal.data()};
                const data = {...alldata[time]};
                if(!slotVal.empty) {
                    for(let key in data) {
                        if(data[key] === "unbooked" || data[key].toDate() < new Date()) {
                            console.log("here");
                            data[user] = new Date(new Date().getTime() + 5*60000);
                            if(key !== user) {
                                delete data[key];
                            }
                            flag = false;
                        }
                        count ++;
                    }
                    if(flag) {
                        if(count < selectedBussiness.personsPerSlot) {
                            data[user] = new Date(new Date().getTime() + 5*60000);
                        }
                    }
                }
                alldata[time] = data;
                transaction.set(slot,alldata)

                return "done";
            })
        })
      }
      catch (err) {
        //handle error
      }

    
  },[]);

  const handlePress = useCallback((time) => {
      if(props.selectedTime !== time) {
        clearTimeout(timer);
        timer = setTimeout(()=>{
          lockTheSlot(time);
        },15000);
       props.updateSelection(time);
      }

  }, []);

  useEffect(() => {
    //loading booked slots from db
    // props.loadingTime(true);
    firestore
      .collection(`timeSlots/${selectedBussiness.id}/bookings`)
      .doc(props.date)
      .get()
      .then((res) => {
        if (res.empty || res.data() === undefined) {
          updateCheckedtimeslots(timeSlots);
        } else {
          updateCheckedtimeslots(checkTimeStot(res.data(), timeSlots));
        }
        // props.loadingTime(false);
      })
      .catch((err) => console.log(err));
  }, []);


  return (
      <React.Fragment>
    {checkedtimeslots.map((elem, index) => {
        const color = props.selectedTime === elem ? "blue" : "#3492e3";  
        return (
          <View key={index} style={styles.timeSlots}>
            <Button
              color={color}
              title={elem}
              disabled={elem.disable}
              onPress={handlePress.bind(this, elem)}
            />
          </View>
        );
      })}
      </React.Fragment>
  )
};

export default TimeSlots;

const styles = StyleSheet.create({
  timeSlots: {
    paddingVertical: 10,
    width: 100,
  }
});