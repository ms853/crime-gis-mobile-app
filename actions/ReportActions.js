/** 
 * Here I have implemented the following redux action creators, which will,
 * handle the types of actions. The action types called here will trigger the reducer to update the
 * application's state. 
*/
import { Alert, AsyncStorage } from "react-native";
import axios from 'axios';

const USERNAME_STORAGE_KEY = "username_key"; //key for storing the email address to the phone. 
const URL = "https://crimegis-backend.herokuapp.com"; //link to my deployed REST API.

//List of action types imported. 
import { 
    REPORT_INPUT_CHANGED, VALID_EMAIL, INVALID_EMAIL,  
    REPORT_CRIME_SUCCESS, REPORT_CRIME_FAIL, 
    REPORT_USER_CRIME, REPORT_CRIME_ANONYMOUSLY, 
    REPORT_EMAIL_CHANGED, GET_LIST_OF_CRIME_REPORTS, GET_LIST_OF_CRIME_REPORTS_FAILED, GET_CRIME_REPORT_LIST_SUCCESS, GET_EMAIL, UPDATE_CRIME_REPORT, GET_USERNAME
} from "../actions/types";

//Action creator function to handle all the changes 
export const reportChange = ({ prop, value }) => {
    return {
        type: REPORT_INPUT_CHANGED,
        //Returns a key interpulation - values determined through runtime.
        payload: { prop, value }
    };
};

export const reportEmailChanged = (value) => {
    return {
        type: REPORT_EMAIL_CHANGED,
        payload: value
    };
}; 

//method for getting email address.
export const getUsername = ({ username }) => {
    return(dispatch) => {
       AsyncStorage.getItem(USERNAME_STORAGE_KEY)
       .then((result) => {
        username = result;
        dispatch({ type: GET_USERNAME, payload: username});
        console.log("username: " + username);
        
       }).catch((err) => console.log(err));
       //return email;
    }
};

// export const getUserId = () => {
//     var email = null;
//     var userId = null;
//     return(dispatch) => {
//         dispatch({ type: });
//         let result = await axios.get(`${URL}/userid/${email}`);
//          let { data } = result;
//          //JSON.stringify(data.valueOf());
//         userId = data.userId;
//          //uid = data;
//         console.log("User id: " + userId);
//         return userId;
       
//          console.log('Unable to process request ', e);
//      }
// }

export const email_validator = (text) => {
    emailValid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    //Using middleware redux-thunk to satisfy the requirement of redux action creators.
    return(dispatch) => {

            if(emailValid.test(text)){
                dispatch({ type: VALID_EMAIL });
                console.log('Correct user input');
            }else{
                dispatch({ type: INVALID_EMAIL });
                
            }
    };
}


//Action creator for a registered user to submit crime report. 
export const reportUserCrime = ({ userId, address, dateOfCrime, time, type_of_crime, crimeDescription, answer1, answer2, answer3}) => {
       //Redux thunk middleware applied to this function to handle this asynchronous call. 
        return (dispatch) => {
            dispatch({ type: REPORT_USER_CRIME });
            
            axios.post(`${URL}/api/reportnewcrime/${userId}`, {
                type: type_of_crime,
                date: dateOfCrime,
                time: time,    
                address: address,
                description: crimeDescription,
                answer1: answer1,
                answer2: answer2,
                answer3: answer3
            }).then((response) => {
                reportCrimeSucceeds(dispatch, response);
                Alert.alert('Crime GIS', 'Thank you for reporting a crime. It is people like you who make the difference!');
            }).catch((error) => {
                reportCrimeFailed(dispatch, error);
                Alert.alert('Error', 'Something went wrong when trying submit your report.');
            });
            
        };
};


export const reportCrimeAnonymously = ({ address, dateOfCrime, time, type_of_crime, crimeDescription, answer1, answer2, answer3}) => {
    //Redux thunk middleware applied to this function to handle this asynchronous call. 
     return (dispatch) => {
         dispatch({ type: REPORT_CRIME_ANONYMOUSLY });
         
         axios.post(`${URL}/api/reportcrimeanonymously/`, {
             type: type_of_crime,
             date: dateOfCrime,
             time: time,
             address: address,
             description: crimeDescription,
             answer1: answer1,
             answer2: answer2,
             answer3: answer3
         }).then((response) => {
             reportCrimeSucceeds(dispatch); //if request succeeds return a dispatch object with the response from the server. 
             Alert.alert('Crime GIS', 'Thank you for reporting a crime. Your report has been saved!');
         }).catch((error) => {
             reportCrimeFailed(dispatch, error);
             Alert.alert('Error', 'Something went wrong when trying submit your report.');
         });
         
     };
 };

 //This action creator successfully renders the list of reports, however it doesn't return any data. 
 export const fetchUserReports = ({ userId }) => {
    //var response = null;
    return(dispatch) => {
        dispatch({ type: GET_LIST_OF_CRIME_REPORTS});
        
        //network request to my backend remote server to retrieve the users reports
        axios.get(`${URL}/api/getcrimereports/${userId}`)
        .then((result) => {
            var { data } = result;
            response = data;
            console.log('User Reports: ', response);

            dispatch({ type: GET_CRIME_REPORT_LIST_SUCCESS, payload: response});
            return response;
        })
        .catch((error) => {
            //getUserCrimeReportsFailed(dispatch, error);
            dispatch({ type: GET_LIST_OF_CRIME_REPORTS_FAILED });
            console.error(error);
        });
        //return response;

    };
 };

/** 
 * Synchronous helper functions I created 
 * that return dispatcher objects which indicate
 * -what type of action is invoked.
 * */
const reportCrimeFailed = (dispatch, err) => {
    dispatch({ type: REPORT_CRIME_FAIL, payload: err});
};

const reportCrimeSucceeds = (dispatch) => {
    dispatch({ type: REPORT_CRIME_SUCCESS });
}

//This action creator method sends a network request to my remote rest api to update a crime report.
export const editCrimeReport = ({ crimeId, description, type, date, time }) => {
    return (dispatch) => {
        axios.put(`/api/editcrimereport/${crimeId}`, {
            type: type,
            date: date,
            time: time, 
            description: description
        }).then((res) => {
            console.log(res.data);
            dispatch({ type: UPDATE_CRIME_REPORT });
            Alert.alert('Crime GIS', 'Your report has been updated!');

        }).catch((err) => {
            Alert.alert('Error', 'Something went wrong, when trying to update your report!');
        })
    }
};

//This action creator method is responsible for making network request to delete a users report. 
export const deleteCrimeReport = ({ crimeId }) => {
    return (dispatch) => {
        axios.delete(`/api/deletereport/${crimeId}`)
        .then((res) => {
            dispatch({ type: DELETE_CRIME_REPORT });
            Alert.alert('Crime GIS', 'Your report has been deleted!');
            console.log(res.data);
        }).catch(err => {
            Alert.alert('Error', 'Something went wrong, when trying to delete your report!');
            console.log(err);
        })
    }
};

//This method will not return an action type.
//local list search
export const searchLocalList = ({date, typeOfCrime}, query) => {
    if(date.includes(query) || typeOfCrime.includes(query)) {
        return true;
    }

    return false;
};

/*
{
	"type":"Street Crime",
	"date":"2019-08-28",
	"time":"02:55",
	"address":"Mayor's Walk, Leicester LE1 7RH, UK",
	"description":"A young man mid 20s was riding his bike and suffered an attack from a local gang!",
	"answer1":"Yes",
	"answer2":"Yes",
	"answer3":"No"
}
*/