import {SELECT_BUSINESS} from '../actions/business';

export default (state={}, action)=> {
    switch(action.type) {
        case SELECT_BUSINESS: 
        return action.selectedBusiness;
        default: // need this for default case
            return state; 
    }
}


