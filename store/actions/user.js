export const SET_USER_LOC = "SET_USER_LOC";
export const SET_USER_DETAILS = "SET_USER_DETAILS";
export const SET_APPOINTMENTS = "GET_APPOINTMENTS";
export const SET_NOTIFICATION = "SET_NOTIFICATION";
import Booking from "../../models/bookingModel";
import { firestore,firebaseAuth } from "../../config";

export const setLocation = (location) => {
  return { type: SET_USER_LOC, location: location };
};

export const setAppointments = (userId) => {
  let app = [];
  return async (dispatch) => {
    try {
      const bookings = firestore.collection("userBooking");
      const query = bookings.where("userId", "==", userId).get();
      // if (!query.ok) {
      //   throw new Error('Something went wrong!');
      // }
      if(!(await query).empty) {
        (await query).forEach((doc) => {
          const data = doc.data();
          // console.log(,doc.id);
          app.push(
            new Booking(
              doc.id,
              data.bookingStatus,
              data.appointmentStatus,
              data.date,
              data.time,
              data.businessName,
              data.businessId,
            )
          );
        });
      dispatch({ type: SET_APPOINTMENTS, app });

      }
      else {
        // throw ;
        throw new Error("No Appointments to display")
      }

    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  // return {type: SET_APPOINTMENTS,app}
};

export const setUser = () => {
  return async (dispatch) => {
    try {
      const user = firestore.collection("users").doc(firebaseAuth.currentUser.uid).get();
      if((await user).empty) {
        throw new Error("Something went wrong");
      }
      const data = (await user).data();
      dispatch({type: SET_USER_DETAILS, data});
    }
    catch (err) {
      throw err;
    }
  }
  // return { type: SET_USER_DETAILS, user };
};

export const setNotification = (token) => {
  return {type: SET_NOTIFICATION, token}
}
