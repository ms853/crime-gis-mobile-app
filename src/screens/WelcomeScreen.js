import React,{ Component } from "react";
import { Text, View, Platform, ScrollView, AsyncStorage } from "react-native";
import firebase from 'firebase';

import Slides from '../components/Slides';

const WELCOME_SLIDE_DATA = [
{text: 'According to the BBC, violent crime has risen considerably high in comparison to the previous years.', color: '#6495ed'}, //color = cornflowerblue 
{text: 'In 2018 alone, studies have shown that street crime has risen by 14%!', color: '#dc143c'}, //color = crimson
{text: 'However, statistics often do not portray a trueful picture...', color: '#1e90ff'}, //color = dodgerblue
{text: 'Studies show that crime statistics tend to have inconsistencies and are subject to deliberate tampering!', color:'#dc143c' },
{text: 'With your help we can bring some validity to the official crime statistics!', color: '#6495ed'},
{text: 'By giving you the chance to report a crime the moment you see it!', color: '#000000'}
];

const ACCESS_TOKEN = "access_token"; //key for storing the access token.

class WelcomeScreen extends Component {
    static navigationOptions = {
        //headerVisible: false,
        header: null
    };
    
    state = { token: null }; //set initial state of the token to null.
    

    async componentWillMount() {
        
        //retrieve the token value from the local storage. 
        let token = await AsyncStorage.getItem(ACCESS_TOKEN);
        this.setState({ token });
        console.log("User token: " + token);
         //check the session of the user
         await this._userSession;

        if(token) { 
            //if there is a token, we know the user is authenticated.
            //Therefore, navigate to the main flow of the app.
            this.props.navigation.navigate('Map');
        }else{
            this.setState({ token: false });
        }
    }

    //Method for removing token 
    async removeToken() {
        try{
             //this.getToken();
             const token = await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
             console.log("Token: " + token);
             
        }catch(error) {
         console.log(error);
        }
    };

    _userSession = async () => {
        const auth = firebase.auth(); //gets the authentication service for the app.
        
        auth.onAuthStateChanged((user) => {
            //if the user is not a guest and the user has signed out 
            if( !user.isAnonymous && user === null ) {
                this.removeToken();
                this.setState({ token: false })
                console.log("Token has been removed -> " + result);
            }
            // else{
            //     console.log("Anonymous user has signed out");
            // }
        });
    };
    
    onSlidesComplete = () => {
        this.props.navigation.navigate('signUp');
    }

    render() {

        return (
            <ScrollView >
                <Slides data={WELCOME_SLIDE_DATA} onComplete={this.onSlidesComplete} />
            </ScrollView>
        );
    }
}

const style = {
    initStyle: {
        marginTop: Platform.OS === 'android' ? 24 : 0
    }
}

export default WelcomeScreen;