export const SET_USER_LOC = "SET_USER_LOC";

export const setLocation= location => {
    return {type: SET_USER_LOC, location: location}
}
