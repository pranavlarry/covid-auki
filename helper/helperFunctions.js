import {
  Linking,
  Alert,
  Platform,
} from "react-native";

export const formatDate = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

export const callNumber = (phone) => {
  console.log("callNumber ----> ", phone);
  let phoneNumber = phone;
  if (Platform.OS !== "android") {
    phoneNumber = `telprompt:${phone}`;
  } else {
    phoneNumber = `tel:${phone}`;
  }
  Linking.canOpenURL(phoneNumber)
    .then((supported) => {
      if (!supported) {
        Alert.alert("Phone number is not available");
      } else {
        return Linking.openURL(phoneNumber);
      }
    })
    .catch((err) => console.log(err));
};






  // componentDidMount() {

  //   // Handle notifications that are received or selected while the app
  //   // is open. If the app was closed and then opened by tapping the
  //   // notification (rather than just tapping the app icon to open it),
  //   // this function will fire on the next tick after the app starts
  //   // with the notification data.
  //   this._notificationSubscription = Notifications.addListener(this._handleNotification);
  // }

  // _handleNotification = notification => {
  //   Vibration.vibrate();
  //   console.log(notification);
  //   this.setState({ notification: notification });
  // };

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
export const sendPushNotification = async (title,body,token) => {

    const message = {
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: { data: 'goes here' },
      _displayInForeground: true,
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

