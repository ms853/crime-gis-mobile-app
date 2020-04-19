//https://firebase.google.com/docs/auth/web/manage-users  - reference for managing users.

import React,{ Component } from "react";
import { Text, View, Platform, 
    TouchableOpacity, AsyncStorage, Alert} from "react-native";
import { Button, Card, Overlay } from 'react-native-elements';
import firebase from "firebase";
import CardSection from "../components/CardSection";
import ModalView from "../components/ModalView";
import Icon from 'react-native-vector-icons/AntDesign';

const ACCESS_TOKEN_KEY = "access_token"; //key for access token 
const USERNAME_STORAGE_KEY = "username_key";

class SettingsScreen extends Component {
    
    state = {
        text: '',
        modalVisible: false //state for handling the modal view. 
    };

    //small sets of helper functions for displaying modal according to 
    // -the link. 
    showModalForTerms = () => {
        this.setState({ 
            modalVisible: true,
            text: 'Terms and conditions of Crime GIS.'
        });
    }
    showModalForAbout = () => {
        this.setState({
            modalVisible: true,
            text:
            'Crime GIS \n' + 
            '\n' +
            'A mobile application that allows people to report a crime the moment they witness it. \n'
            + '\n'
            + 'Step 1: Sign Up and Login in with your phone number.\n'
            + 'Step 2: Make sure you have enabled your location as the map needs your location to display crime information relevant to your location.\n'
            + 'Step 3: Navigate to Reports to report a crime.\n'
            + 'Step 4: Once a crime has been successfully reported, go to My Crime Reports to see the reports you have submitted.'
        });
    }

    showModalIP = () => {
      this.setState({ 
          modalVisible: true,
          text: 'This application is ensured by Intellectual Property Law.' 
        }); 
    }


    //on this request close modal.
    onDecline() {
        this.setState({ modalVisible: false });
    }

    //Method for removing token 
    async removeToken() {
        try{
             //this.getToken();
             const token = await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
             console.log('Token: ' + token);
        }catch(error) {
         console.log(error);
        }
    };

    //Method for removing token 
    async removeUsername() {
        try{
             //this.getToken();
             const username = await AsyncStorage.removeItem(USERNAME_STORAGE_KEY);
             console.log('Current username removed: ' + username);
        }catch(error) {
         console.log(error);
        }
    };

    logout = async () => {
        try{

            //id of the current user. 
            const currentUserId = firebase.auth().currentUser.uid;

            const { currentUser } = firebase.auth(); //retrieve current user object

            //check to see if the current user is anonymous
            if(currentUser.isAnonymous) {
                await currentUser.delete(); //signs out and deletes the anonymous user.
                console.log('Anonymous user: ' + currentUserId + " has been deleted!");
                //navigate back to login screen.
                this.props.navigation.navigate('login');    
            }

            firebase.auth().signOut(); //sign user out. 
            console.log('User has signed out', currentUserId);
            await this.removeToken();
            await this.removeUsername();
             //navigate back to login screen.
            this.props.navigation.navigate('login');
            
        }catch(error) {
            console.log('Unable to logout becuase: ', error);
        }
    };

    render() {
        const { initStyle, titleStyle } = styles;
        return (
            <View styles={initStyle}>
                <Card title="Settings" titleStyle={titleStyle}>
                    <CardSection>
                        <TouchableOpacity style={{ marginBottom: 10}}
                        onPress={this.showModalForTerms}>
                            <Text>Terms and Conditions</Text>
                        </TouchableOpacity>
                    </CardSection>
                    <CardSection>
                        <TouchableOpacity style={{ marginBottom: 10}}
                            onPress={this.showModalIP}
                        >
                            <Text>Intellectual Property Guidelines</Text>
                        </TouchableOpacity>
                    </CardSection>
                    <CardSection>
                        <TouchableOpacity style={{ marginBottom: 10}}
                            onPress={this.showModalForAbout}
                        >
                            <Text>About Crime GIS</Text>
                        </TouchableOpacity>
                    </CardSection>

                    <Overlay
                     isVisible={this.state.modalVisible}
                     onRequestClose={() => { this.setState({ modalVisible: false})}}
                     onBackdropPress={() => this.setState({ modalVisible: false })}
                    >
                        <Text style={{ marginBottom: 80, justifyContent: 'center'}}>
                        {this.state.text}
                        </Text>
                        <Button 
                            title="Close"
                            raised
                            //style={{ position: 'relative'}} 
                            onPress={this.onDecline.bind(this)} 
                        />
                        
                    </Overlay>

                    <Button  
                        buttonStyle={{ marginTop: 10 }} title="LOG OUT" 
                        iconRight={true}
                        icon={<Icon style={{ marginLeft: 10 }} name="logout" color="#fff" size={30} />}
                        onPress={this.logout} 
                    />
                </Card>
                 
            </View>
        );
    }
}

const styles = {
    initStyle: {
        marginTop: Platform.OS === 'android' ? 24 : 0
    },
    titleStyle: {
        justifyContent: 'center',
        alignContent: 'center',
        fontSize: 30,
        color: 'black',
        //fontWeight: 'bold',
        marginBottom: 20
    },
}

export default SettingsScreen;