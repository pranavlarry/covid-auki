export const SELECT_BUSINESS = "SELECT_BUSINESS";
export const SET_CATEGORIES = "SET_CATEGORIES";
import {firestore} from '../../config';

import ServiceCategory from "../../models/serviceCategory";

export const selectedBusiness= selectedBusiness => {
    console.log(selectedBusiness);
    return {type: SELECT_BUSINESS, selectedBusiness}
}

export const setCategories = () => {
    let categories = [];
    return async dispatch => {
        try {
            const response = firestore.collection("categories").doc("list").get();

            if(!(await response).empty) {
                const data = (await response).data();
                for(let id in data) {
                    categories.push(new ServiceCategory(id,data[id].name,data[id].icon));
    
                }
                dispatch({type:SET_CATEGORIES,categories});
            }
            else {
                throw new Error("No Categories Found")
            }

        }
        catch (err) {
            // console.log(err);
            throw err;
        }
    }
    // return {type: SET_CATEGORIES, }
}
