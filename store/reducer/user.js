import {SET_USER_LOC,SET_APPOINTMENTS,SET_USER_DETAILS} from '../actions/user';


const initialState={
    user: {},
    appointments: [],
    location: {
        lat: '',
        lng: ''
    }
};

export default (state=initialState, action)=> {
    switch(action.type) {
        case SET_USER_LOC: 
            const location= {
                lat: action.location.lat,
                lng: action.location.lng
            }
            return {
                ...state,location:location
            }

        case SET_APPOINTMENTS: 
            return {...state, appointments: action.app}
        case SET_USER_DETAILS: 
            return {...state,user: action.user}
        default: // need this for default case
            return state 
    }
}