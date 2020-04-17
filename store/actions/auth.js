import { firebaseAuth } from "../../config";
export const SIGNUP = "SIGNUP";

export const signup = (email, password) => {
  console.log(password);
  return (dispatch) => {
    // const response = await fetch(
    //   'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAGDHLqd2GWGd3n3ia3dkwYek926FSyecI',
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       email: email,
    //       password: password,
    //       returnSecureToken: true
    //     })
    //   }
    // );
    // firebaseAuth
    //   .signInWithEmailAndPassword(this.state.email, this.state.password)
    //   .then(() => this.props.navigation.navigate("Main"))
    //   .catch((error) => this.setState({ errorMessage: error.message }));
    // firebaseAuth
    //   .createUserWithEmailAndPassword(email, "prl489248")
    //   .then((response) => console.log(response))
    //   .catch((error) => console.log(error.message));

    // if (!response.ok) {
    //   throw new Error("Something went wrong!");
    // }

    // const resData = await response.json();
    // console.log(resData);
    dispatch({ type: SIGNUP });
  };
};
