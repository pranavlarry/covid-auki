import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, Text, View, Alert, FlatList } from "react-native";
import { SearchBar } from "react-native-elements";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import Geocoder from "react-native-geocoding";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import HeaderButton from "../components/headerButton";
import AllServiceCat from "../components/allServiceCategories";
import CategoryGridTile from '../components/CategoryGridTile';
import { CATEGORIES } from "../dummyData/categories";
import * as SetLoc from '../store/actions/user';
import { useDispatch } from 'react-redux';


// AIzaSyAGDHLqd2GWGd3n3ia3dkwYek926FSyecI
const Homepage = (props) => {
  const [search, updateSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [filteredCat,UpdateFilteredCat] = useState(CATEGORIES);

  const dispatch = useDispatch();

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
      },1500);

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
    //   setPickedLocation({
    //     lat: location.coords.latitude,
    //     lng: location.coords.longitude,
    //   });
    console.log(location)
      dispatch(SetLoc.setLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      }));
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
          props.navigation.navigate({
            routeName: 'serviceScreen',
            params: {
              categoryId: itemData.item.id
            }
          });        // console.log("pressed",itemData.item.id)

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

      <View>
          {
              filteredCat.length > 0 ?
                    <FlatList
                    data={filteredCat}
                    renderItem={renderGridItem}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    />
                    :
                    <Text>Sorry No Services Available</Text>
          }

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

});

export default Homepage;
