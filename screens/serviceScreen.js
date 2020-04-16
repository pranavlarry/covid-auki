import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import HeaderButton from "../components/headerButton";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { Slider } from "react-native-elements";
import BusinessList from '../components/businessList';

const ServiceScreen = (props) => {
  const [kmSelector, updateKmSelector] = useState(10);

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
      <BusinessList distance={kmSelector}
        cid={props.navigation.getParam("categoryId")}/>
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
