import axios from "axios";
import { 
    SEARCH_CRIMES, 
    CRIMES_FOUND, 
    CRIME_NOT_FOUND,
    SEARCH_QUERY_CHANGED,
    GET_ALL_CRIMES_IN_CUSTOM_AREA,
    MAP_NUMBER_PICKER_CHANGED,
    GET_DIRECTIONS, MAP_INPUT_CHANGED
} from "./types";
import { GOOGLE_MAPS_API_KEY } from '../config'

const DOWNLOADED_CRIMES_KEY = "downloaded_crimes_key"; //Key for storing crimes if the user chooses to download it.

const URL = "https://crimegis-backend.herokuapp.com"; //Link to my deployed REST API.

import Polyline from '@mapbox/polyline'; //Library for decoding the polyline received from the google directions API. 

//Action creator for handling the change in the search input. 
export const searchInputChanged = (text) => {
    return {
        type: SEARCH_QUERY_CHANGED,
        payload: text
    };
}

export const mapInputChange = ({ prop, value }) => {
    return {
        type: MAP_INPUT_CHANGED,
        //Returns a key interpulation - values determined through runtime.
        payload: { prop, value }
    };
};
//Action creator for handling the value change for the picker component. 
export const pickerInputChanged = (text) => {
    return {
        type: MAP_NUMBER_PICKER_CHANGED,
        payload: text
    };
}


//Action creators for returning dispatch.
const foundSearchResult = (dispatch, result) => {
    dispatch({ type: CRIMES_FOUND, payload: result});
}

const searchNotFound = (dispatch, err) => {
    dispatch({ type: CRIME_NOT_FOUND,  payload: err});
}

//Action Creator method for searching the type of crime. This function makes a network request,
//- to the server and retrieves the data. 
export const searchForTypeOfCrime = (search) => {
    //Making use of the redux thunk middleware of delaying the return of the dispatch object.
    //This makes this action creators asynchronous. 
    console.log(search);
    return(dispatch) => {
        axios.get(`${URL}/api/searchcrimes?search=${search}`)
        .then((result) => {
            var { data } = result;
            JSON.stringify(data.result); 
            foundSearchResult(dispatch, data);
          
        }).catch((error) => {
            searchNotFound(dispatch, error);
            console.log(error);
        });
    }
};

//Gets all the crimes based on the limit specified by the user.
//For longterm scalability of the application all the crimes are not downloaded at once.
export const getAllCrimes = (numberOfCrimes) => {
    return(dispatch) => {
        axios.get(`${URL}/api/crimes/${numberOfCrimes}`).then((result) => {
            var { data } = result;
            
            dispatch({ type: GET_ALL_CRIMES_IN_CUSTOM_AREA, payload: JSON.stringify(data.list_of_crimes) });
            //return data.list_of_crimes;
        }).catch((err) => {
            console.log(err);
        })
    }
}

//Action creator for storing crime data locally to the device. 
export const downloadCrimeData = (crimeData) => {};

//This is a method sending a network request to the google api to request direction from 
//-the start location to the end location.
export const getDirectionsFromGoogleAPI = (startLocation,endLocation) => {
    return(dispatch) => {
        //Request to fetch routes from the google api. 
        axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation}&destination=${endLocation}`, 
        { 
            params: { key: GOOGLE_MAPS_API_KEY }
        })
        .then((response) => {
            var { data } = response;
            let resJson = JSON.stringify(data); //stringify json response
            console.log(resJson)
            //decode the polyline to get direction data. 
            let points = Polyline.decode(resJson.routes[0].overview_polyline.points);
            let coordinates = points.map((point, index) => {
                return {
                    latitude: point[0],
                    longitude: point[1]
                }
            });
            dispatch({ type: GET_DIRECTIONS, payload: coordinates});
            
            return coordinates;

        }).catch((error) => console.log(error));

    };
};

