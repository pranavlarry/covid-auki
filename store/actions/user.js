export const SET_USER_LOC = "SET_USER_LOC";
export const SET_USER_DETAILS = "SET_USER_DETAILS";

export const setLocation= location => {
    return {type: SET_USER_LOC, location: location}
}

