import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SearchBar, Slider } from "react-native-elements";
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../components/headerButton';

const Homepage = (props) => {
  const [search, updateSearch] = useState("");
  const [kmSelector, updateKmSelector] = useState(10);

  const handleSearch = useCallback((enterText) => {
    updateSearch(enterText);
  }, []);

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search for services "
        onChangeText={handleSearch}
        value={search}
        lightTheme={true}
      />
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
    </View>
  );
};

Homepage.navigationOptions = navData => {
    return {
            headerTitle: 'Home Screen',
            headerLeft: ()=>(
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item 
                        title="menu"
                        iconName="ios-menu"
                        onPress={()=>{
                            navData.navigation.toggleDrawer();
                        }}
                    />
                </HeaderButtons>

            )
        }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  kmContainer: {
      paddingVertical: 20,
      paddingHorizontal: 10
  },
  kmTitle: {
    fontSize: 18
  }
});

export default Homepage;
