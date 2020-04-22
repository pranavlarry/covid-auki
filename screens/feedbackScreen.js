import React, { useState, useCallback } from 'react';
import {Text, View, TextInput, Button, StyleSheet} from "react-native";
import HeaderButton from "../components/headerButton";
import { HeaderButtons, Item } from "react-navigation-header-buttons";

const Feedback = props => {
    const [feedbackInput,updateFeedback] = useState("");

    const handleChange= useCallback((text)=> {
        if(/^[A-Za-z ]*$/.test(text)) {
            updateFeedback(text);
        }
    },[]);

    return (
        <View>
            <View style={styles.headingCon}>
            <Text style={styles.heading}>Give Us Your Feedback</Text>
            </View>
            <TextInput
                multiline={true}
                numberOfLines={5}
                onChangeText={handleChange}
                value={feedbackInput} 
                placeholder="Enter feedback"
                style={styles.textarea}
            />
            <Button 
                title="Submit"
                onPress={()=>{}}
            />
        </View>
        
    )
}

Feedback.navigationOptions = (navData) => {
    return {
      headerTitle: "Feedback",
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

export default Feedback;

const styles = StyleSheet.create({
    headingCon: {
        paddingVertical:30,
        alignItems: "center"
    },
    heading: {
        fontSize: 18
    },
    textarea: {
        height : 100,
        paddingHorizontal: 30,
        paddingBottom: 20
    }
})