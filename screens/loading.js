import React, { useEffect } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { firebaseAuth } from "../config";
const Loading = React.memo((props) => {
  useEffect(() => {
    firebaseAuth.onAuthStateChanged((user) => {
      props.navigation.navigate(user ? "home" : "auth");
    });
  }, []);
  return (
    <View style={styles.container}>
      <Text>Loading</Text>
      <ActivityIndicator size="large" />
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default Loading;
