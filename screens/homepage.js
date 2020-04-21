import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SearchBar } from "react-native-elements";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
// import Geocoder from "react-native-geocoding";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import HeaderButton from "../components/headerButton";
import CategoryGridTile from "../components/CategoryGridTile";
import * as UserAction from "../store/actions/user";
import { useDispatch, useSelector } from "react-redux";
import * as Business from "../store/actions/business";
import Constants from "expo-constants";
import { Notifications } from "expo";

registerForPushNotificationsAsync = async () => {
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync();
    UserAction.setNotification(token);
    // console.log(token,"hiiii");
    // this.setState({ expoPushToken: token });
  } else {
    alert(
      "Your loaction won't be correnct and Push Notifications won't work on virtual device!"
    );
  }

  if (Platform.OS === "android") {
    Notifications.createChannelAndroidAsync("default", {
      name: "default",
      sound: true,
      priority: "max",
      vibrate: [0, 250, 250, 250],
    });
  }
};

// AIzaSyAGDHLqd2GWGd3n3ia3dkwYek926FSyecI
const Homepage = React.memo((props) => {
  const categories = useSelector((state) => state.business.categories);
  const [search, updateSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [filteredCat, UpdateFilteredCat] = useState("");
  const [error, updateError] = useState(null);
  const [loadingService, updateLoadingService] = useState(false);
  const dispatch = useDispatch();

  const searchData = useCallback(
    (val) => {
      let result = [];
      result = categories.filter((cat) =>
        cat.title.toLowerCase().includes(val.toLowerCase())
      );
      return result;
    },
    [categories]
  );

  let timmer;
  const handleSearch = useCallback((enterText) => {
    clearTimeout(timmer);
    timmer = setTimeout(() => {
      UpdateFilteredCat(searchData(enterText));
    }, 1500);

    updateSearch(enterText);
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      updateError(null);
      updateLoadingService(true);
      dispatch(Business.setCategories())
        .then(() => {
          updateLoadingService(false);
        })
        .catch((err) => {
          updateError(err.message);
          updateLoadingService(false);
        });
    }
    registerForPushNotificationsAsync();
    getLocationHandler();
    // const _notificationSubscription = Notifications.addListener(this._handleNotification);
  }, [categories]);

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
      console.log(location);
      dispatch(
        UserAction.setLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        })
      );
    } catch (err) {
      Alert.alert(
        "Could not fetch location!",
        "Please try again! App won't be able to load the services in your area without location",
        [
          {
            text: "Okay",
            onPress: () => {
              return null;
            },
          },
          {
            text: "Retry",
            onPress: () => {
              getLocationHandler();
            },
          },
        ]
      );
    }
    setIsFetching(false);
  };

  const renderGridItem = useCallback((itemData) => {
    return (
      <CategoryGridTile
        title={itemData.item.title}
        icon={itemData.item.icon}
        onSelect={() => {
          props.navigation.navigate({
            routeName: "serviceScreen",
            params: {
              categoryId: itemData.item.id,
            },
          });
        }}
      />
    );
  }, []);

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search for services "
        onChangeText={handleSearch}
        value={search}
        lightTheme={true}
      />
      {error && (
        <View style={styles.error}>
          <Text>{error}</Text>
        </View>
      )}
      {loadingService ? (
        <View style={styles.lcontainer}>
          <Text>Loading Services</Text>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View>
          <FlatList
            data={search !== "" ? filteredCat : categories}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
          />
        </View>
      )}
    </View>
  );
});

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
  lcontainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  error: {
    width: "100%",
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Homepage;
