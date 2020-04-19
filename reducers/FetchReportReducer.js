import { Alert } from 'react-native';
import {GET_CRIME_REPORT_LIST_SUCCESS, GET_LIST_OF_CRIME_REPORTS_FAILED, GET_LIST_OF_CRIME_REPORTS, OFFLINE_SEARCH_REPORT_LIST } from "../actions/types";

const initialStates = {
    data: []
}; //values to be determined through runtime.

export default (state = initialStates, action) => {
    switch(action.type) {
        case GET_LIST_OF_CRIME_REPORTS:
            return {...state}

        case GET_CRIME_REPORT_LIST_SUCCESS: 
            //console.log('Payload: ' + action.payload); 
            return {...state, data: action.payload};

        case GET_LIST_OF_CRIME_REPORTS_FAILED:
            Alert.alert('Error', 'Something went wrong trying to get your reports.\nCheck your wifi/internet connection.');

        case OFFLINE_SEARCH_REPORT_LIST: 
            return {...state, data: action.payload }
        default:
            return state;
    }
};