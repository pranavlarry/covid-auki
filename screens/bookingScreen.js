import React from 'react';
import {View,Text} from 'react-native';
import {useSelector} from 'react-redux';

const BookingScreen = props => {

    const selectedBussiness = useSelector(state=> state.business)
    return (
        <View>
            <Text>Booking Screen of {selectedBussiness.name} date: {props.navigation.getParam("date")}</Text>
        </View>
    )
}

export default BookingScreen;