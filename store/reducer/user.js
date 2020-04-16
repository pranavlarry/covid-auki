import {SET_USER_LOC} from '../actions/user';

const initialState={
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
        default: // need this for default case
            return state 
    }
}