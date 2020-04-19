export const SET_USER_LOC = "SET_USER_LOC";
export const SET_USER_DETAILS = "SET_USER_DETAILS";
export const SET_APPOINTMENTS = "GET_APPOINTMENTS";
import Booking from "../../models/bookingModel";
import { firestore } from "../../config";

export const setLocation = (location) => {
  return { type: SET_USER_LOC, location: location };
};

export const setAppointments = (userId) => {
  let app = [];
  return async (dispatch) => {
    try {
      const bookings = firestore.collection("userBooking");
      const query = bookings.where("userId", "==", userId).get();
      const data = (await query).data();
      console.log(data,"hoii");
      for (let id in data) {
        app.push(
          new Booking(
            query.id(),
            data[id].bookingStatus,
            data[id].appointmentStatus,
            data[id].date,
            data[id].time,
            data[id].bName
          )
        );
      }
    dispatch({type:SET_APPOINTMENTS,app});

    } catch (err) {
      console.log(error);
    }
  };
  // return {type: SET_APPOINTMENTS,app}
};

export const setUser = (user) => {
    return {type: SET_USER_DETAILS,user}
}
