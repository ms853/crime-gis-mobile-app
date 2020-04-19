import { Alert } from 'react-native';
import { 
    REPORT_INPUT_CHANGED, 
    GET_CURRENT_LOCATION_TO_REPORT_CRIME, 
    REPORT_CRIME_SUCCESS, REPORT_CRIME_FAIL, 
    REPORT_USER_CRIME, REPORT_CRIME_ANONYMOUSLY, 
    UPDATE_CRIME_REPORT,
    DELETE_CRIME_REPORT,
    GET_USERNAME
} from "../actions/types";


const initialState = {
        answer1: 'No' || 'Yes',
        answer2: 'No' || 'Yes',
        answer3: 'No' || 'Yes',
        crimeDescription: '',
        dateOfCrime: '',
        type_of_crime: '',
        time: '', //records the time of the crime. 
        username: '',
        error: '',
        loading: false,
        response: null,
        userId: undefined
};

//Reducer function for handling state changes for the report form, based on invocation of specific actions.
export default (state = initialState, action) => {
    switch(action.type) {
        case REPORT_INPUT_CHANGED: 
            return {...state, [action.payload.prop]: action.payload.value };
        // case REPORT_EMAIL_CHANGED: 
        //     return {...state, email: action.payload}
        // case VALID_EMAIL:
        //     return {...state, error: ''}
        // case INVALID_EMAIL: 
        //     //Alert.alert('Warning', 'Invalid email! Please provide a valid format');
        //     return {...state, error: 'Invalid email! Email address must be of the following user@mail.com or user12@mail.com.'}
        case GET_USERNAME:
            //the state property email is set to the payload received. 
            return {...state, username: action.payload }
        case REPORT_USER_CRIME: 
            return {...state, loading: true}
        case REPORT_CRIME_ANONYMOUSLY: 
            return {...state, loading: true}
        case REPORT_CRIME_SUCCESS:
            return initialState
            
        case REPORT_CRIME_FAIL: 
            return {...state, error: action.payload, loading: false, initialState } 
        
        case UPDATE_CRIME_REPORT: 
            return initialState
        default: 
            return state;
    };
};