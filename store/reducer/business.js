import {SELECT_BUSINESS, SET_CATEGORIES} from '../actions/business';


const initialState = {
    categories:[],
    selectedBusiness:{}
}

export default (state=initialState, action)=> {
    switch(action.type) {
        case SELECT_BUSINESS: 
            return {...state,selectedBusiness: action.selectedBusiness};
        case SET_CATEGORIES:
            return {...state,categories: action.categories}
        default: // need this for default case
            return state; 
    }
}


