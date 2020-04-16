import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, Text, View, Alert, FlatList } from "react-native";
import { SearchBar, Slider } from "react-native-elements";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import Geocoder from "react-native-geocoding";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import HeaderButton from "../components/headerButton";
import AllServiceCat from "../components/allServiceCategories";
import CategoryGridTile from '../components/CategoryGridTile';
import { CATEGORIES } from "../dummyData/categories";


const distance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
};



// AIzaSyAGDHLqd2GWGd3n3ia3dkwYek926FSyecI
const Homepage = (props) => {
  const [search, updateSearch] = useState("");
  const [kmSelector, updateKmSelector] = useState(10);
  const [isFetching, setIsFetching] = useState(false);
  const [pickedLocation, setPickedLocation] = useState();
  const [filteredCat,UpdateFilteredCat] = useState(CATEGORIES);


  const searchData=useCallback((val)=> {
    let result = [];
    result= CATEGORIES.filter(cat => cat.title.toLowerCase().includes(val.toLowerCase()));
    return result;
  },[CATEGORIES]);

  let timmer;
  const handleSearch = useCallback((enterText) => {
    clearTimeout(timmer);
    timmer = setTimeout(()=>{
        UpdateFilteredCat(searchData(enterText));
      },2000);

    updateSearch(enterText);
    
  },[]);



  useEffect(() => {
    // Geocoder.init("AIzaSyAGDHLqd2GWGd3n3ia3dkwYek926FSyecI", {
    //   language: "en",
    // });
    getLocationHandler();
  }, []);

  const verifyPermissions = async () => {
    const result = await Permissions.askAsync(Permissions.LOCATION);
    if (result.status !== "granted") {
      Alert.alert(
        "Insufficient permissions!",
        "You need to grant location permissions to use this app.",
        [{ text: "Okay" }]
      );
      return false;
    }
    return true;
  };

  const getLocationHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      setIsFetching(true);
      const location = await Location.getCurrentPositionAsync({
        timeout: 5000,
      });
      setPickedLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      //   Geocoder.from(pickedLocation.lat, pickedLocation.lng)
      // 	.then(json => {
      // 	var addressComponent = json.results[0].address_components[0];
      // 		console.log(addressComponent);
      // 	})
      // 	.catch(error => console.warn(error));
    } catch (err) {
      Alert.alert(
        "Could not fetch location!",
        "Please try again later or pick a location on the map.",
        [{ text: "Okay" }]
      );
    }
    setIsFetching(false);
  };

  const renderGridItem = itemData => {
    return (
      <CategoryGridTile
        title={itemData.item.title}
        icon={itemData.item.icon}
        onSelect={() => {
        //   props.navigation.navigate({
        //     routeName: 'CategoryMeals',
        //     params: {
        //       categoryId: itemData.item.id
        //     }
        //   });
        console.log("pressed",itemData.item.id)

        }}
      />
    );
  };

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
      <View>
        <FlatList
          data={filteredCat}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
        />
      </View>
    </View>
  );
};

Homepage.navigationOptions = (navData) => {
  return {
    headerTitle: "Home Screen",
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  kmContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  kmTitle: {
    fontSize: 18,
  },
});

export default Homepage;
