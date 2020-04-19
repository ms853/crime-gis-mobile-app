//https://www.quora.com/Mapping-What-is-the-latitude-delta
//https://medium.com/quick-code/how-to-add-awesome-maps-to-a-react-native-app-%EF%B8%8F-fc7cbde9c7e9
import React,{ Component } from "react";
import { Text, View, Dimensions,
    ScrollView, Image, Picker, KeyboardAvoidingView, ActivityIndicator, StyleSheet,
    FlatList, TextInput, AsyncStorage, } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout, Polyline } from "react-native-maps";
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import { Card, Button, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { connect } from 'react-redux';
import { searchInputChanged, searchForTypeOfCrime, mapInputChange, getDirectionsFromGoogleAPI } from "../../actions/MapActions";
import { fetchUserReports } from '../../actions/ReportActions';

import { GOOGLE_MAPS_API_KEY, customMapStyle } from '../../config'; //my auth key for google web api.

import _ from 'lodash'; //utility library in Javascript. 

const { width, height } = Dimensions.get("screen"); //height and width of the device screen.
//Code taken from this source for latitude and longitude delta calculation. 
//https://stackoverflow.com/questions/36685372/how-to-zoom-in-out-in-react-native-map 
var LONGITUDE_DELTA = 0; 
var LATITUDE_DELTA = 0.0922; 
LONGITUDE_DELTA = LATITUDE_DELTA * (width/height);

const URL = "https://crimegis-backend.herokuapp.com"; //link to my deployed REST API.
const crimeAtLocationURL = "https://data.police.uk/api/crimes-at-location?"; //API URL getting crimes at location from data.police.uk 
const USERNAME_STORAGE_KEY = "username_key"; //key for storing the email address to the phone. 

var USER_CRIME_REPORT_ARRAY = [], COORD_FOR_REPORTS = [];

class MapScreen extends Component {

    state = {   
        routeExist: false, //boolean flag to indicate whether there is a route 
        latitude: null,
        longitude: null,
        list_of_nearby_crimes: [], //Will contain crimes based on the users location. 
        markers: [], //Is responsible for stoirng the crime data that will be rendered as markers. 
        totalNumOfCrimesToGet: '5',
        type_of_crime: '',
        dataReceived: [],
        directionCoordinates: [], //state for storing the coordinates. 
        date: null,
        username: null
        //distance: '',
        //search: '' //contain the string for the search query. 
    };


    //function for requesting user location. 
    requestUserLocation = async () => {
        try{
            /*An asynchronous request, which gets the users permission to use their location, 
            and returns a status object. */
            const { status } = await Permissions.getAsync(Permissions.LOCATION);
            //A check to see if the user has granted permission to use their location. 
            if(status !== 'granted') {
                let response = await Permissions.askAsync(Permissions.LOCATION);
                console.log('User location: ',response); 
            }
        }catch(e) {
            console.log(e);
        }
    }

    

    //Method returns a list of crimes based on the location of the user.
    getCrimesNearMe = async() => {
        try{
            let response = await axios.get(crimeAtLocationURL, { 
                params: {
                    date: this.state.date, 
                    /*Both latitude and longitude values will 
                    come from the the users current location */
                    lat: this.state.latitude, 
                    lng: this.state.longitude 
                }
            });
            var { data } = response;
            JSON.stringify(data);
            //console.log("Crimes recorded near you: " + data);
            this.setState({ list_of_nearby_crimes: data});
            //console.log("check -> ", this.state.list_of_nearby_crimes);
        }catch(e){
            console.log("Unable to process request: \n", e);
        }
    };

    /**
     * Network request responsible for retrieving the userId from my remote server.
     * This function will be called when a request is made to retrieve crime reports 
     * -relevant to a particular user.
     * 
     */
    getUserIdFromServer = async() => {
        var value = await AsyncStorage.getItem(USERNAME_STORAGE_KEY); //retrieve email from phone storage. 
        console.log("Username: " + value);
        this.setState({ username: value });

        var userId = null;
         try{
            let { data } = await axios.get(`${URL}/userid/${this.state.username}`);
            userId = data.userId;
            console.log("User id: " + userId);
            return userId;

            }catch(e) {
             console.log('Unable to process request: ', e);
         }
    }

    //This method gets the coordinates of the user crime report.
    //Uses the google geolocation api
    getCoordinatesOfCrimeAddress = async(address) => {
        try{
            let response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+address+"&key="+GOOGLE_MAPS_API_KEY);
            let { data } = response;
            JSON.stringify(data);
            let { location } = data.results[0].geometry;
            console.log("Geolocation location", location);
            COORD_FOR_REPORTS.push(location);
        }catch(e) {console.log(e)}
    };

    renderMarkersForCrimeReports = async() => {
        const userId = await this.getUserIdFromServer();
        try{
            USER_CRIME_REPORT_ARRAY = this.props.fetchUserReports({ userId });
            //console.log("User reports --- ", USER_CRIME_REPORT_ARRAY);
            _.forEach(this.props.crimeReport, function(element){
                console.log(element.address); 
            })

        }catch(e) { console.error(e) }
    };

    //Ask for user permission before component is rendered unto the screen. 
    async componentWillMount() {
        try{
            await this.requestUserLocation();
            
            /*Geolocation library provided by react-native which allows me 
             - to get the current position (location) coordinates of the user.
                This callback method succeeds only if the user enables their location device.
             */
            navigator.geolocation.getCurrentPosition(
                ({ coords: { latitude, longitude } }) => this.setState({ latitude, longitude }, 
                () => {
                    console.log('State: ', this.state);
                    var { latitude, longitude } = this.state;
                    //this.getCrimesNearMe(latitude, longitude); //invoke this method to get nearby recorded crimes. 
                }),
                (error) => console.log('Error:', error),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
            this.renderMarkersForCrimeReports();

        }catch(error){
            console.error(error);
        }
    };


    //Method for adding markers to the map.
    renderCrimeMarker = () => {
        //get the state of nearby crimes. 
        const { longitude, latitude } = this.state;
        const { markerStyle } = styles;
    
        return (
        <View>
            <Marker
            coordinate={{ latitude: latitude, longitude: longitude}}
            title={"Crimes Near Me"}
            >
              <View>
                <Image source={require('../../assets/markers/crime_marker.png')} style={markerStyle}/>    
              </View>
          </Marker> 
        </View>
           
        );
    };

    //Method for displaying the list of crimes.
    _renderItem = ({ item }) => {
        return (
            <View>
                <View style={{ marginBottom: 5}}>
                    <Text style={styles.keyStyle}>
                    Type of Crime: {item.category}
                    </Text>
                </View>

                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>Latitude: {item.location.latitude}</Text>
                </View>
                
                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>Longitude: {item.location.longitude}</Text>
                </View>

                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>Street Name: {item.location.street.name}</Text>
                </View>
                
                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>Outcome: {item.outcome_status.category}</Text>
                </View>
                
                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>Date: {item.outcome_status.date}</Text>
                </View>

            </View>
        );
    }
    
    //A helper function to invoke the action creator that retrieves the crimes from the server. 
    getSearchedCrimes = () => {
        var { searchQuery, crimesFound } = this.props;
        var query = searchQuery.toLowerCase();
        this.props.searchForTypeOfCrime(query);
        console.log(crimesFound);

       
    }
   

    /*
    Method that invokes the google maps geocoding api to take each address of 
    the user crime report and convert it latitude and longitude coordinates. */ 
    convertAddressToCoordinates = async (address) => {
        try{
         let response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + GOOGLE_MAPS_API_KEY);
            var { data } = response.json;
            console.log(JSON.stringify(data));
        }catch(e){
            console.log("Unable to process request due to: ", e);
        }
    };

    //Event handler method to handle the user pressing the button. 
    getAllCrimesRequestedByUser = async() => {
        
        const { totalNumOfCrimesToGet } = this.state;
        var dataArr = await this.getAllCrimesRequested(totalNumOfCrimesToGet); 
        console.log(dataArr); //print statement to check the request. 
        this.setState({ markers: dataArr});
        
    };

    
    //This is a helper method that I implemented to handle the client-side invocation,
    //-of HTTP GET method for retrieving all the crimes
    getAllCrimesRequested = async(numberOfCrimes) => {
        try{
        let {data} = await axios.get(`${URL}/api/crimes/${numberOfCrimes}`);
            JSON.stringify(data.list_of_crimes);
            return data.list_of_crimes;
            
        }catch(e) {
            console.log(e);
        }
        
    }
    
    
    renderMapView = (latitude, longitude) => {
        const { informationStyle, mapStyle, markerStyle } = styles;

        if(latitude && longitude) {
            return (
                 <View>
                     <MapView style={mapStyle}
                        
                        customMapStyle={customMapStyle}
                        //zoom level longitudeDelta 0.04, latitudeDelta 0.09
                        //for closer zoom level 0.002
                        provider={PROVIDER_GOOGLE}
                        showsUserLocation
                        region={{
                            longitude,
                            latitude,
                            longitudeDelta: LONGITUDE_DELTA, 
                            latitudeDelta: LATITUDE_DELTA 
                        }}
                    >
                        
                        { this.state.markers.map((element) => (
                            <Marker
                                key={element._id.toString()}
                                coordinate={{ latitude: parseFloat(element.latitude), longitude: parseFloat(element.longitude) }}
                                title={element.category}
                                cluster={true}
                            >
                                {/* <View>
                                    <Image source={require('../../assets/markers/searched-crimes-marker.png')} style={markerStyle}/>    
                                </View> */}
                            </Marker>
                        ))}

                        <MapView.Polyline
                            coordinates={this.props.coordinates}
                            strokeWidth={2}
                            strokeColor="blue"/>

                     
                        {this.renderCrimeMarker()}
                    </MapView>   

                    <Callout>
                    <View style={styles.calloutView}>
                    <Button title=""
                            icon={<Icon name="search" color="#000000" size={25}/>}
                            onPress={this.getSearchedCrimes}
                            type="clear"
                            color="rgba(0, 122, 255, 1)" //transparent style applied to button. cloud-download-alt                           
                        />
                    <TextInput style={styles.calloutSearch}
                        placeholder="Search By Type of Crime"
                        value={this.props.searchQuery}
                        onChangeText={value => this.props.searchInputChanged(value)}
                    />
                    </View>
                    {this.renderListBasedOnSearch()}
                    {/* {this.getAllCrimesRequestedByUser()}  */}
                    </Callout>
            
                 </View>
            );
         }else{
             return (
                 <View style={informationStyle}>
                     <Text>Please, provide your location, so that map can be displayed.</Text>
                 </View>
             );
         }

    }

    _renderListItemForSearchResult = ({ item }) => {
        return (
            <Card containerStyle={{ borderColor: "transparent", }}>
                <Text>{item.category}</Text>
                <Text>{item.street_name}</Text>
                <Text>{item.date}</Text>
            </Card>
        );
    }
    
    //render a list based on the user search. 
    renderListBasedOnSearch = () => {
        console.log(this.props.crimesFound);
        //if(this.props.crimesFound.length != 0) {
            return (
                <FlatList 
                    renderItem={this._renderListItemForSearchResult}
                    data={this.props.crimesFound}
                    keyExtractor={(item,index) => index.toString()}
                /> 
            );
        //}
    }

    //This function invokes the redux action creator function, which sends a HTTP GET request,
    //to the server. 
    getDirection = () => {
        const { endLocation, startLocation } = this.props;
        this.props.getDirectionsFromGoogleAPI(startLocation, endLocation);
    };

    renderButton() {
        if(this.props.loading) {
            return <ActivityIndicator size="large" color="blue" />;
        }
        return <Button 
            title="Get Route" 
            raised={true}
            onPress={this.getDirection}
        />;
    }

    ////////-------------------------JSX UI COMPONENT IS RENDERED HERE------------------------------//////////
    //Render method for rendering the User Interface, which is in JSX (compiled javascript written in XML type syntax).
    render() {
        const { latitude, longitude} = this.state;
        const { startLocation, endLocation} = this.props;
        const { labelStyle } = styles;
        return(
            //Only display the map with we have a latitude and longitude available.
        <View style={styles.containerStyle}>
            <ScrollView>
                <KeyboardAvoidingView behavior="padding" enabled>
                <View>
                    {this.renderMapView(latitude, longitude)}
                                        
                    <Card>
                            <Text style={labelStyle}>Select the total number of crimes you want to display on the map. </Text>
                            <Picker
                                selectedValue={this.state.totalNumOfCrimesToGet}
                                style={{height: 50, width: 150}}
                                onValueChange={(itemValue) => this.setState({totalNumOfCrimesToGet: itemValue})}
                            >
                                <Picker.Item label="5" value="5" />
                                <Picker.Item label="10" value="10" />
                                <Picker.Item label="20" value="20" />
                                <Picker.Item label="25" value="25" />
                                <Picker.Item label="30" value="30" />

                        </Picker>
                        <Button title="Render Markers" titleStyle={{ marginLeft: 10, color: "#000000"}}
                            //buttonStyle={{ width: 30}}
                            icon={<Icon name="map-marker-alt" color="#000000" size={25}/>}
                            onPress={this.getAllCrimesRequestedByUser}
                            type="clear"
                            color="rgba(0, 122, 255, 1)" //transparent style applied to button. cloud-download-alt                           
                        />
                    </Card>
                    <Card>
                            <Text style={styles.labelStyle}>
                                List of crimes recorded at your location for the past 2 years.
                            </Text>
                            <Card>
                        <Text>Select a date of when you want to display a crime </Text>
                        <Picker
                                selectedValue={this.state.date}
                                style={{height: 50, width: 250}}
                                onValueChange={(itemValue) => this.setState({date: itemValue})}
                            >
                                <Picker.Item label="2019-01" value="2019-01" />
                                <Picker.Item label="2018-01" value="2018-01" />
                                <Picker.Item label="2017-01" value="2017-01" />
                        </Picker>
                        <Button title="SUBMIT" raised={true} onPress={this.getCrimesNearMe} />
                    </Card>
                            
                    </Card> 

                    <Card>
                        {/*FlatList component is responsible for rendering the list */}
                        <FlatList 
                            renderItem={this._renderItem}
                            data={this.state.list_of_nearby_crimes}
                            keyExtractor={(item,index) => index.toString()}
                        />  
                    </Card> 

                    
            
                    <Card>
                        <Text style={labelStyle}>Get route to the nearest police station</Text>
                            
                            <Input 
                                label="Specify Police Station"
                                placeholder="provide an address"
                                inputStyle={{ borderBottomEndRadius: 20, fontSize: 16}}
                                value={endLocation}
                                onChangeText={value => this.props.mapInputChange({ prop: 'endLocation',  value})}
                            />

                            <Input
                                value={startLocation} 
                                label="Specify Your Current Address"
                                placeholder="provide an address"
                                inputStyle={{ borderBottomEndRadius: 20, fontSize: 16}}
                                onChangeText={value => this.props.mapInputChange({ prop: 'startLocation',  value})}
                            />
                            {this.renderButton()}
                    </Card>

                </View>
                </KeyboardAvoidingView>
                
            </ScrollView>
        </View>
        );       
    }
}

const styles = StyleSheet.create({
    informationStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 20,
        flex: 1,
        marginTop: 25

    },
    containerStyle: {
        flex: 1,
        backgroundColor: "#fff"
    },
    contentContainerStyle: {
        justifyContent: 'center',
    },
    mapStyle: {
        flex: 1, 
        width: width, 
        height: height * 0.75,
        position: "relative"
    },
    labelStyle: {
        marginBottom: 5,
        fontSize: 15,
        fontWeight: 'bold'
    },
    markerStyle: {
        width: 20,
        height: 20
    },
    viewStyle: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: '#fff'
    },
    textStyle: {
        fontSize: 14,
        color: '#000000',
        //marginLeft: 20,
        marginRight: 10,
        //paddingRight: 20,
        alignItems: 'center',
    },
    keyStyle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#191970',
        marginTop: 10,
        marginBottom: 20,
        //marginLeft: 5,
        marginRight: 20
    },
    //style objects for the callout view and search box. 
    calloutView: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 10,
        width: "60%",
        marginLeft: "20%",
        marginRight: "20%",
        marginTop: 25
    },
    calloutSearch: {
        borderColor: "transparent",
        marginLeft: 10,
        height: 45,
        borderWidth: 0.0,
        width: width * 0.5,
        marginRight: 20,  
    }, 
    textfieldStyle: {
        fontSize: 15,
        marginBottom: 10,
        marginTop: 5
    }
});

//A core function that needs to be implement by a component that uses redux. 
//This function will map all the component states to props, such that they can be 
//-passed as child porps from the reducer to the component to be used. 
const mapStateToProps = ({ map, fetchReport }) => {
    const { loading, error, crimesFound, distance, searchQuery,
         listOfCrimesStoredLocally, totalNumberOfCrimes, allCrimesBasedOnNumber, 
         startLocation, 
         endLocation,    
         coordinates,
        } = map;

    const crimeReport = fetchReport.data;



    return { 
        loading, error, crimesFound, 
        distance, searchQuery, listOfCrimesStoredLocally, 
        totalNumberOfCrimes, allCrimesBasedOnNumber,
        startLocation, 
        endLocation,    
        coordinates,
        crimeReport
    };
};

//Passing this react class component to a redux store. 
export default connect(mapStateToProps, {searchInputChanged, 
    searchForTypeOfCrime, 
    getDirectionsFromGoogleAPI, mapInputChange, fetchUserReports
 })(MapScreen);
