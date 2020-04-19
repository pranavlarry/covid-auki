import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet, Button } from "react-native";
// import { BUSINESS } from "../dummyData/bussiness";
import businessModel from "../models/businessmodel";
import { Card } from "react-native-elements";
import * as businessAction from "../store/actions/business";
import { useSelector, useDispatch } from "react-redux";
import { firestore } from "../config";

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

const BusinessList = (props) => {
  const dispatch = useDispatch();

  const location = useSelector((state) => state.user.location);

  const [businessList, updateBusinessList] = useState([]);

  useEffect(() => {
    let list = [];
    const business = firestore.collection("serviceCategory");
    const query = business
      .where("category", "==", props.cid)
      .get()
      .then((res) => {
        if (res.empty) {
          console.log("empty"); //handle this
          return;
        }
        res.forEach((doc) => {
          list.push(
            new businessModel(
              doc.id,
              doc.data().name,
              doc.data().location,
              doc.data().personPerSlot,
              doc.data().holidays,
              doc.data().timing,
              doc.data().slotInterval
            )
          );
        });
        updateBusinessList(list);
        // updateFilteredResults(getBusinessWithInDistance());
        // console.log(filteredResults);
      })
      .catch((err) => {
        console.log("Error getting documents", err);
      });
  }, []);

  const getBusinessWithInDistance = () => {
    const filterList = [];
    // const businessList = BUSINESS[props.cid];
    businessList.forEach((val)=> {
      const lat = val.location.lat;
      const lng = val.location.lng;

      if (
        distance(location.lat, location.lng, lat, lng, "k") <= props.distance
      ) {
        filterList.push(val);
      }
    });
    return filterList;
  };

  const [filteredResults, updateFilteredResults] = useState(
    getBusinessWithInDistance()
  );

  const onclickHandle = useCallback((id) => {
    props.handleSelect(id);
  });

  useEffect(() => {
    updateFilteredResults(getBusinessWithInDistance());

  }, [props.distance,businessList]);

  const renderCards = (itemData) => {
    return (
      <Card title={itemData.item.name}>
        <View style={styles.btnContainer}>
          <Button
            // icon={<Icon name='code' color='#ffffff' />}
            onPress={() => {
              // const catSelecte = BUSINESS[props.cid];
              dispatch(
                businessAction.selectedBusiness(itemData.item)
              );
              props.cal(true);
            }}
            buttonStyle={styles.btn}
            title="Book Now"
          />
          <Button
            // icon={<Icon name='code' color='#ffffff' />}
            buttonStyle={styles.btn}
            title="Contact"
          />
        </View>
      </Card>
    );
  };
  return (
    <View>
      <FlatList
        data={filteredResults}
        renderItem={renderCards}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default BusinessList;

const styles = StyleSheet.create({
  btn: {
    borderRadius: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
