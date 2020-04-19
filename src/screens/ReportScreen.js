import React,{ Component } from "react";
import { 
    Text, View, Platform, Picker, Alert, AsyncStorage, ActivityIndicator, 
    TextInput, Dimensions, KeyboardAvoidingView, ScrollView } from "react-native";
import { Button, Input, Card } from "react-native-elements";
import * as Permissions from 'expo-permissions';
import DatePicker from 'react-native-datepicker';
import axios from 'axios';
import firebase from "firebase";
import CardSection from '../components/CardSection';
import Icon from 'react-native-vector-icons/FontAwesome';

import { GOOGLE_MAPS_API_KEY } from "../../config";

import { connect } from "react-redux";
import { 
    //email_validator, reportChange, reportEmailChanged, 
    reportCrimeAnonymously, reportUserCrime, getUsername
} from '../../actions/ReportActions';
import ReportForm from "../components/ReportForm";

const URL = "https://crimegis-backend.herokuapp.com"; //link to my deployed REST API.


class ReportScreen extends Component {
    
    static navigationOptions = ({ navigation }) => {
       return {
            headerTitle: 'Report',
            headerStyle: {
            backgroundColor: '#191970',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
            fontWeight: 'bold',
            }, 
            headerRight: <Button title=""
                            icon={<Icon name="list" color="#fff" size={25}/>}
                            onPress={() => navigation.navigate('ReportList')}
                            type="clear"
                            color="rgba(0, 122, 255, 1)"                            
                        />,
            style: {
                marginTop: Platform.OS === 'android' ? 24 : 0
            },
                
        };   
    };
    
    //component level state 
    state = {
        latitude: undefined,
        longitude: undefined,
        address: null
    };

     //method for updating and validating the user email input.
    // updateEmailInput = (email) => {
    //     this.props.reportEmailChanged(email);
    //     if(email != "") {
    //         this.props.email_validator(email);
    //     }
    // };
    //Helper function for retrieving the current users email address. 
    renderUsername = () => {
        const { currentUser } = firebase.auth();
        const { username } = this.props;

        if(!currentUser.isAnonymous) {
            this.props.getUsername({ username });
            return (
                <View>
                    <Text style={styles.labelStyle}>Your Username</Text>
                    <Text style={{ marginTop: 10, fontSize: 15 }}>{username}</Text>
                </View>
            );
        }
    }
  
    //function for requesting user location. 
    requestUserLocation = async () => {
        try{
            const status = await Permissions.getAsync(Permissions.LOCATION);
            if(status !== 'granted') {
                let response = await Permissions.askAsync(Permissions.LOCATION);
                //console.log('User location: ',response); 
            }
           
        }catch(e) {
            console.log(e);
        }
    };

   
    //Code adapted from https://github.com/Agontuk/react-native-geolocation-service
    async componentWillMount() {
        
        try{
            await this.requestUserLocation(); //get user location, by asking for permission to use it. 
                //use the react-native geolocation api to retrieve
                navigator.geolocation.getCurrentPosition(
                    ({ coords: { latitude, longitude } }) => this.setState({ latitude: latitude, longitude: longitude }, 
                    () => {
                        console.log('Position: ', this.props.latitude + " " + this.props.longitude)
                        this.getCurrentUserAddress(this.state.latitude,this.state.longitude)
                    },
                    
                    (error) => console.log('Error:', error),
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                )
                );
                console.log("LOOK ===", this.state.latitude + " " + this.state.longitude);
                // var { userId } = this.props;
                // this.getUserId({userId});
                //await AsyncStorage.removeItem(ID_KEY);

        }catch(e) {
            console.log(e);
        }
    }


    //This method invokes the google maps geocoding api, which then converts the user's current location and returns information with the address.
    getCurrentUserAddress = (lat,lng) => {
        
            fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+"&key="+GOOGLE_MAPS_API_KEY)
            .then((response) => response.json())
            .then((responseJson) => {
            console.log('ADDRESS !! => ' + JSON.stringify(responseJson.results[0].formatted_address));
            this.setState({ address: responseJson.results[0].formatted_address});
            
            }).catch((err) => console.log(err));
    };


    renderWarning = () => {
        if(this.props.answer3 === "Yes") {
            Alert.alert("Warning", 
        "If you are currently in a position where your safety is at risk, then call 999! \n\nMake sure that you are in a safe place!");
        }
    }

    getUserId = async() => {
        var { username } = this.props;
        //this.props.getUsername({ username });
        var userId = null;
         try{
             let result = await axios.get(`${URL}/userid/${username}`);
             let { data } = result;
            userId = data.userId;
            console.log("User id: " + userId);
            return userId;
            }catch(e) {
             console.log('Unable to process request ', e);
         }
    }
    

    //method for user to submit a report report. 
    onReportCrime = async () => {
        const { address } = this.state;
        var { answer1, answer2, 
            answer3, type_of_crime, 
            time, dateOfCrime, crimeDescription, 
            userId, navigation
         } = this.props;

        //const { currentUser } = firebase.auth(); //get current user instance. 
        
       try{
        userId = await this.getUserId(); //retrieve user id from the server.
        
        //Call the redux action method for reporting the crime. 
        //The apporpriate action creator function will be invoked based on the type of user.
        if(firebase.auth().currentUser.isAnonymous) {
            this.props.reportCrimeAnonymously({ address, answer1, answer2, answer3, 
                type_of_crime, time, dateOfCrime, crimeDescription });
        }else{
            //This function will take the userId of the current user.
            this.props.reportUserCrime({ userId, address, answer1, answer2, answer3, 
                type_of_crime, time, dateOfCrime, crimeDescription });
                
                //navigate user to report list. 
                navigation.navigate('ReportList');
        }    
       }catch(e) {
           console.error(e);
       }
    }

    renderButton = () => {
        if(this.props.loading) {
            return (
                <View style={{ marginTop: 10}}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            );
        }else{
            return <Button 
                    raised={true} title="REPORT NOW" 
                    onPress={this.onReportCrime} 
                    iconRight={true}
                    icon={<Icon style={{ marginLeft: 10 }} 
                    name="pencil-square" size={30} color="#fff"/>}
                    />;
        }
    }

    render() {
        
        
        //var { address } = this.state;
            return (
            <View>
                <ScrollView>
                    <ReportForm { ...this.props } />
                    <View style={{ marginTop: 15, borderRadius: 20, marginBottom: 10 }}>
                        {this.renderButton()}
                    </View>
                </ScrollView>
            </View>    
            
        );
    }
}


const styles = {
    inputContainerStyle: {
        paddingRight: 20,
        //fontSize: 12
    },
    labelStyle: {
        paddingRight: 25,
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#000000',
        
    },
    textAreaStyle: {
        borderTopColor: '#000000', 
        borderBottomColor: '#000000',
        borderBottomWidth: 1 
    },
    titleStyle: {
        justifyContent: 'center',
        alignContent: 'center',
        fontSize: 30,
        color: 'black',
        //fontWeight: 'bold',
        marginBottom: 20
    },
    inputStyle: {
        marginTop: 30,
        borderRadius: 20,
        marginBottom: 0,
        paddingLeft: 10,
        lineHeight: 20
    },
    btnStyle: {
        marginTop: 25,
        //flex: 1
    },
    linkStyle: {
        fontSize: 12,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center'

    }
}

const mapStateToProps = ({ report }) => {
 const { username, answer1, answer2, error, 
    answer3, type_of_crime, time, dateOfCrime, crimeDescription, loading,
    response, userId
} = report;

    return { 
        username, answer1, answer2, error, 
        answer3, type_of_crime, time, dateOfCrime, crimeDescription,
        loading, response, userId 
    };
}

export default connect(mapStateToProps, { 
     
    reportCrimeAnonymously, reportUserCrime, getUsername
})(ReportScreen);