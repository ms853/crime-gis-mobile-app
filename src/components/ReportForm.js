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
     reportChange, 
     getUsername
} from '../../actions/ReportActions';

const URL = "https://crimegis-backend.herokuapp.com"; //link to my deployed REST API.

const ID_KEY = "currentUserId";

class ReportForm extends Component {
    
    
    
    //component level state 
    state = {
        //latitude: undefined,
        //longitude: undefined,
        address: null
    };

    //This function is responsible for conditional rendering. 
    //This means the username of the user will not be rendered to the screen if they are a guest. 
    renderUsername = () => {
    
        const { currentUser } = firebase.auth(); //Get the current user instance from firebase.
        const { username } = this.props;
        //A check to ensure that the user is anonymous.
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
  
    // //Function for requesting user location. 
    // requestUserLocation = async () => {
    //     try{
    //         const status = await Permissions.getAsync(Permissions.LOCATION);
    //         if(status !== 'granted') {
    //             let response = await Permissions.askAsync(Permissions.LOCATION);
    //             //console.log('User location: ',response); 
    //         }
           
    //     }catch(e) {
    //         console.log(e);
    //     }
    // };

   
    //Code adapted from https://github.com/Agontuk/react-native-geolocation-service
    async componentWillMount() {
        
        try{
            //await this.requestUserLocation(); //get user location, by asking for permission to use it. 
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
               // console.log("LOOK ===", this.state.latitude + " " +this.state.longitude);
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
   

    render() {
        
        const { 
            textAreaStyle, labelStyle, 
            inputStyle, inputContainerStyle
        } = styles;
        
        var { address } = this.state;
            return (
            <KeyboardAvoidingView behavior="padding" enabled>
                   <Card>
                   <ScrollView>
                       <CardSection>{this.renderUsername()}</CardSection>
                       <Text style={{ marginTop: 10, marginBottom: 10, fontSize: 12, color: 'red'}}>
                       {this.props.error}
                       </Text>
                        <Text style={labelStyle}>Report Date </Text>
                        <CardSection>
                        <DatePicker
                            style={{width: 200}}
                            date={this.props.dateOfCrime}
                            mode="date"
                            placeholder="select date"
                            format="YYYY-MM-DD"
                            minDate="2019-01-01"
                            maxDate="2020-12-31"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            customStyles={{
                            dateIcon: {
                                position: 'absolute',
                                left: 0,
                                top: 4,
                                marginLeft: 0
                            },
                            dateInput: {
                                marginLeft: 36
                            }
                            }}
                            onDateChange={date => {this.props.reportChange({ prop: "dateOfCrime", value: date})}}
                        />    
                        </CardSection> 

                        <CardSection>
                        <Text style={labelStyle}>Your Current Address</Text>
                        </CardSection>

                        <CardSection>
                            <Text style={{ marginTop: 10, fontWeight: '400', marginBottom: 10 }}>{address}</Text>
                        </CardSection>
                        
                        <Text style={labelStyle}>
                            Provide the time of the incident
                        </Text>
                        <CardSection>
                        <DatePicker
                            style={{width: 200}}
                            date={this.props.time}
                            mode="time"
                            placeholder="select time"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            customStyles={{
                            dateIcon: {
                                position: 'absolute',
                                left: 0,
                                top: 4,
                                marginLeft: 0
                            },
                            dateInput: {
                                marginLeft: 36
                            }
                            }}
                            onDateChange={date => {this.props.reportChange({ prop: "time", value: date})}}
                        />    
                        </CardSection>


                        <Text style={labelStyle}>Select Type of Crime</Text>
                        <Picker
                                selectedValue={this.props.type_of_crime}
                                style={{height: 50, width: 250}}
                                onValueChange={value => this.props.reportChange({ prop: "type_of_crime", value: value})}
                            >
                                <Picker.Item label="Antisocial Behaviour" value="Antisocial Behaviour" />
                                <Picker.Item label="Knife Crime" value="Knife Crime" />
                                <Picker.Item label="Violent Crime" value="Violent Crime" />
                                <Picker.Item label="Burglary" value="Burglary" />
                                <Picker.Item label="Street Crime" value="Street Crime" />
                                <Picker.Item label="Street Vandalism" value="Street Vandalism" />
                                <Picker.Item label="Murder" value="Murder" />
                        </Picker>
       
                        
                        <Text style={labelStyle}>Is there a crime happening now?</Text>
                            <Picker
                                selectedValue={this.props.answer1}
                                style={{height: 50, width: 150}}
                                onValueChange={value => this.props.reportChange({ prop: "answer1", value: value})}
                            >
                                <Picker.Item label="No" value="No" />
                                <Picker.Item label="Yes" value="Yes" />
                                
                            </Picker>

                        <Text style={labelStyle}>Has the suspect fled the scene?</Text>                        
                            <Picker
                                selectedValue={this.props.answer2}
                                style={{height: 50, width: 150}}
                                onValueChange={value => this.props.reportChange({ prop: "answer2", value: value})}
                            >
                                <Picker.Item label="No" value="No" />
                                <Picker.Item label="Yes" value="Yes" />
                            </Picker>

                        <Text style={labelStyle}>Does the suspect pose a threat to your safety?</Text>
                            <Picker
                                selectedValue={this.props.answer3}
                                style={{height: 50, width: 150}}
                                onValueChange={value => {
                                    this.props.reportChange({ prop: "answer3", value: value});
                                }}
                                onTouchMove={this.renderWarning()}  
                            >
                                <Picker.Item label="No" value="No" />
                                <Picker.Item label="Yes" value="Yes" />
                            </Picker>

                        <CardSection>
                        <Input 
                            inputStyle={inputStyle}
                            labelStyle={labelStyle}
                            containerStyle={inputContainerStyle}
                            label="Please provide a description of the crime you have witnessed." 
                            multiline={true} 
                            numberOfLines={4}
                            autoCorrect={true}
                            value={this.props.crimeDescription}
                            onChangeText={value => this.props.reportChange({ prop: "crimeDescription", value: value})}
                        />
                        </CardSection>
                    </ScrollView>           
                   </Card>
            </KeyboardAvoidingView>
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

const mapStateToProps = (state) => {
 const { username, answer1, answer2, error, 
    answer3, type_of_crime, time, dateOfCrime, crimeDescription, loading,
    response, userId
} = state.report;

    return { 
        username, answer1, answer2, error, 
        answer3, type_of_crime, time, dateOfCrime, crimeDescription,
        loading, response, userId 
    };
}

export default connect(mapStateToProps, { 
     reportChange, getUsername
})(ReportForm);