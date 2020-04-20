import { Linking, Alert, Platform } from 'react-native';

export const formatDate = (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
  
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
  
    return [year, month, day].join("-");
  };


export const callNumber = phone => {
console.log('callNumber ----> ', phone);
let phoneNumber = phone;
if (Platform.OS !== 'android') {
phoneNumber = `telprompt:${phone}`;
}
else  {
phoneNumber = `tel:${phone}`;
}
Linking.canOpenURL(phoneNumber)
.then(supported => {
if (!supported) {
    Alert.alert('Phone number is not available');
  } else {
    return Linking.openURL(phoneNumber);
}
})
.catch(err => console.log(err));
};