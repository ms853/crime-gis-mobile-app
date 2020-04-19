import React, { Component } from 'react';
import { Text, ScrollView, 
    Platform, View, Alert, StyleSheet, 
    TouchableHighlight, FlatList, AsyncStorage, 
    ActivityIndicator, Dimensions
} from 'react-native';
import axios from 'axios';
import _ from 'lodash';
import { SearchBar, Card, Button } from 'react-native-elements';
import firebase from 'firebase';
import CardSection from '../components/CardSection';
import ReportListItem from '../components/ReportListItem';
import Icon from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import { fetchUserReports, searchLocalList } from '../../actions/ReportActions';

const URL = "https://crimegis-backend.herokuapp.com"; //link to my deployed REST API.

const USERNAME_STORAGE_KEY = "username_key"; //key for storing the email address to the phone. 


const { height } = Dimensions.get('window');

class ReportListScreen extends Component {
    
    static navigationOptions = ({ navigation }) => {
        return {
             headerTitle: 'My Crime Reports',
             headerStyle: {
             backgroundColor: '#191970',
             },
             headerTintColor: '#fff',
             headerTitleStyle: {
             fontWeight: 'bold',
             }, 
             headerRight: <Button title=""
                            icon={<Icon name="piechart" color="#fff" size={25}/>}
                             onPress={() => navigation.navigate('Overview')}
                             type="clear"
                             color="rgba(0, 122, 255, 1)"                            
                         />,
             style: {
                 marginTop: Platform.OS === 'android' ? 24 : 0
             }
         };   
    };

    //component level state. 
    state = {
        searchQuery: '',
        loading: false,
        username: '',
        displayButton: true,
        reportsCopy: this.props.data
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

     /**
     *When this helper function is called this will asychronously call to get the 
     current user's id. Furthermore, the userId of the current user will the be used to call
     * - the action creator fetchUserReports() function which takes the user's object id, 
     - and returns if successful a crime report corresponding to that particular user.
     * 
     */
    fetchCrimeReports = async() => {
        this.setState({ loading: true, displayButton: false }); //display loading screen while making request and hide the button.
        const userId = await this.getUserIdFromServer();
        try{
        //network request to my backend remote server to retrieve the users report 
        //This operation is peformed by the action creator method which I have defined in redux. 
        this.props.fetchUserReports({ userId });
        this.setState({ loading: false});
        }catch(error) {
            this.setState({ loading: false });
            Alert.alert('Error', 
            'Something went wrong trying to download your reports\nCheck your wifi/internet connection.');
            console.log(error);
        }
          
    };

    
    renderListItem = ({ item }) => {
        //navigation prop and the item is passed to the item list component.
        //https://github.com/react-navigation/react-navigation/issues/3719
        return <ReportListItem data={item} navigation={this.props.navigation}/>;
    };

    
    //methods for updating the search box 
    //NEEDS WORK
    updateSearch = searchText => {
        var queryFormat = searchText.toLowerCase();
        const data = _.filter(this.state.reportsCopy, item => {
            return searchLocalList(item, queryFormat);
        });
        this.setState({ search: queryFormat, reportsCopy: data  });
        console.log(searchText);
    };
    
    renderContent = () => {
        const { currentUser } = firebase.auth();
        //If the type of user is anonymous, then do not render the screen. 
        if(currentUser.isAnonymous) {
            return (
                <View style={{ marginTop: 20, justifyContent: 'center' }}>
                    <Text style={{ textAlign: 'center', fontSize: 15}}>
                        As an anonymous user you cannot view a list of reported crimes.
                        Please, if you wish to see a personalized list of crimes which you have reported,
                        register an account!
                    </Text>
                    <Icon name="user" style={{  marginTop: 15 }} 
                    size={40} color="#000000" />
                </View>
            );
        }
            //While data is being fetched from the remote server display the loading screen.
            if(this.state.displayButton){
                return (
                    <View style={{ justifyContent: 'center', marginTop: height * 0.35 }}>
                        <Button 
                            title="SHOW MY LIST OF CRIMES"
                            onPress={this.fetchCrimeReports}
                            raised={true}
                            iconRight={true}
                            icon={<Icon name="bars" color="#fff" size={30} style={{ marginLeft: 15}}/>}
                        />
                     </View>
                );
            }

            if(this.state.loading) {
                return(
                    <View style={{ justifyContent: 'center', marginTop: height * 0.35 }}>
                        <Text style={{ textAlign: 'center'}}> One moment... We are getting your list of reports.</Text>
                        <ActivityIndicator size="large" color="blue" />
                    </View>
                );
            }

                return (
                    <View>
                        {/* <SearchBar 
                            placeholder="Enter date/type of crime" 
                            onChangeText={this.updateSearch} 
                            value={this.state.search} 
                            lightTheme={true}
                            spellCheck={true}
                            platform = {Platform.OS === 'android' ? "android" : "ios"}
                            onClear={value => this.setState({ search: ''}) }
                            style={{ flex: 1 }}        
                        /> */}
                       
                        <FlatList 
                            renderItem={this.renderListItem}
                            data={this.props.data}
                            scrollEnabled={true}
                            keyExtractor={(item, index) => index.toString()}
                        />

                    
    
                    </View>
                    
                );
 
    };

    render() {
        return (
          <View>
              {this.renderContent()}
          </View>       
          
        );
    }
};

const styles = StyleSheet.create({
  
    keyStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#191970',
        marginTop: 10,
        marginBottom: 20,
        //marginLeft: 5,
        //marginRight: 20
    },
    listItem: {
        flex: 1,
        flexDirection: "column",
        fontSize: 16,
        color: '#000000',
    },
    titleStyle: {
       // flex: 1,
        fontSize: 18,
        color: '#191970',
        marginBottom: 5,
        marginTop: 5
    }
});






const mapStateToProps = ({ fetchReport }) => {
    //console.log("Check state from reducer -> ", fetchReport.data);
    
   
    const data = _.map(fetchReport.data, (val, _id) => {
        return { ...val, _id }
    });

    return { data }; //retrun new array object. 
    
};


export default connect(mapStateToProps, { fetchUserReports })(ReportListScreen);

