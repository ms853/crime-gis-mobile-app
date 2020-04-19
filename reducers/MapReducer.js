import { SEARCH_QUERY_CHANGED, SEARCH_CRIMES, 
    CRIMES_FOUND, CRIME_NOT_FOUND, 
    GET_ALL_CRIMES_IN_CUSTOM_AREA, 
    MAP_NUMBER_PICKER_CHANGED, 
    GET_DIRECTIONS, MAP_INPUT_CHANGED } from "../actions/types";


const initialState = {
        
        
        startLocation: null, //states for handling the start and end locations of the user. 
        endLocation: '',    
        coordinates: [],
        loading: false, 
        crimesFound: [], //retrieved from the api.
        error: '',
        searchQuery: '',
        totalNumberOfCrimes: '', //number specified by the user, to limit the result for crimes 
        listOfCrimesStoredLocally: [], //this array will hold the crimesFound array and will store it locally to the device.
        allCrimesBasedOnNumber: [] //crimes array containing all the crimes from the backend database, size of the array, will be determined by the user's request. 
};

//Reducer function for calculating the state. 
export default (state = initialState, action) => {
    switch(action.type) {
        case SEARCH_QUERY_CHANGED: 
            return {...state, searchQuery: action.payload}
        case SEARCH_CRIMES:             
            return {...state, loading: true}
        case CRIMES_FOUND: 
            console.log("Crimes retrieved: " + action.payload);

            return {...state, crimesFound: action.payload, 
                listOfCrimesStoredLocally: action.payload, loading: false }
        
        case CRIME_NOT_FOUND:
            return {...state, error: action.payload, loading: false }   

        case MAP_NUMBER_PICKER_CHANGED: 
            return {...state, totalNumberOfCrimes: action.payload }
        case MAP_INPUT_CHANGED: 
            return {...state, [action.payload.prop]: action.payload.value };
        case GET_ALL_CRIMES_IN_CUSTOM_AREA:
            //console.log("JSON PARSED -> ", action.payload);
            return {...state, allCrimesBasedOnNumber: action.payload} 
        case GET_DIRECTIONS: 
                return {...state, coordinates: action.payload, loading: true }
        
        default: 
            return state;
    }
};