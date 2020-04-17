import React, { useReducer, useCallback, useState } from "react";
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Button,
  Text,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch } from "react-redux";

import Input from "../components/Input";
import Card from "../components/Card";
import { firebaseAuth } from "../config";

const FORM_INPUT_UPDATE = "FORM_INPUT_UPDATE";

const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value,
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid,
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues,
    };
  }
  return state;
};

const SignUp = (props) => {
  // const dispatch = useDispatch();
  const [error, updateError] = useState("");
  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      email: "",
      password: "",
      confirmPass: "",
    },
    inputValidities: {
      email: false,
      password: false,
    },
    formIsValid: false,
  });

  const signupHandler = () => {
    // dispatch(
    //   authActions.signup(
    //     formState.inputValues.email,
    //     formState.inputValues.password
    //   )
    // );
    if (formState.inputValues.password !== formState.inputValues.confirmPass) {
      updateError("Passwords don't match try again");
    } else {
      firebaseAuth
        .createUserWithEmailAndPassword(
          formState.inputValues.email,
          formState.inputValues.password
        )
        .then(() => props.navigation.navigate("home"))
        .catch((error) => updateError(error.message));
    }
  };

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier,
      });
    },
    [dispatchFormState]
  );

  return (
    <KeyboardAvoidingView keyboardVerticalOffset={50} style={styles.screen}>
      <LinearGradient colors={["#ffedff", "#ffe3ff"]} style={styles.gradient}>
        <Text>{error}</Text>
        <Card style={styles.authContainer}>
          <ScrollView>
            <Input
              id="email"
              label="E-Mail"
              keyboardType="email-address"
              required
              email
              autoCapitalize="none"
              errorText="Please enter a valid email address."
              onInputChange={inputChangeHandler}
              initialValue=""
            />
            <Input
              id="password"
              label="Password"
              keyboardType="default"
              secureTextEntry
              required
              minLength={5}
              autoCapitalize="none"
              errorText="Please enter a valid password."
              onInputChange={inputChangeHandler}
              initialValue=""
            />
            <Text
              style={{
                // fontFamily: 'open-sans-bold',
                marginVertical: 8,
              }}
            >
              Confirm Password
            </Text>
            <TextInput
              label="Confirm Password"
              keyboardType="default"
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
              value={formState.inputValues.confirmPass}
              onChangeText={(val) =>
                inputChangeHandler("confirmPass", val, true)
              }
            />
            <View style={styles.buttonContainer}>
              <Button
                title="Sign Up"
                // color={Colors.accent}
                onPress={signupHandler}
              />
              <View style={styles.buttonContainer}>
                <Button
                  title="Go to Login"
                  // color={Colors.primary}
                  onPress={() => {
                    props.navigation.navigate("auth");
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </Card>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

SignUp.navigationOptions = {
  headerTitle: "Sign Up",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authContainer: {
    width: "80%",
    maxWidth: 400,
    maxHeight: 400,
    padding: 20,
  },
  input: {
    paddingHorizontal: 2,
    paddingVertical: 5,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default SignUp;
