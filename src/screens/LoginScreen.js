/**
 * Reference react-navigation that is where I learned how to pass the data 
 * - as a parameter to the next route: https://reactnavigation.org/docs/en/params.html 
 */
import React,{ Component } from "react";
import { Text, View, Platform, ScrollView, KeyboardAvoidingView,
    TouchableOpacity, ActivityIndicator, AsyncStorage, Alert } from "react-native";
import { Button, Input, Divider, Overlay  } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import firebase from "firebase";

const URL = "https://crimegis-backend.herokuapp.com"; //link to my deployed REST API.
const ACCESS_TOKEN_KEY = "access_token"; //key for storing the user token to mobile storage 

const USERNAME_STORAGE_KEY = "username_key"; //key for storing the email address to the phone. 
const ANONYMOUS_USER_KEY = "guest_user"; //key for storing guest user. 

class LoginScreen extends Component {
    
    static navigationOptions = ({ navigation }) => {
        return {
             headerTitle: 'Log In',
             headerStyle: {
             backgroundColor: '#191970',
             },
             headerTintColor: '#fff',
             headerTitleStyle: {
             fontWeight: 'bold',
             }, 
             style: {
                 marginTop: Platform.OS === 'android' ? 24 : 0
             }
         };   
     };
    
    state = {
        username: '',
        password: '',
        emailReset: '', //email state for resetting password.
        loading: false, //state for handling the loading screen.
        error: '',
        visible: false //modal state
    };

    //Method to store token to local storage. 
    async storeToken(accessToken) {
        try{
            await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            this.getToken();
        }catch(error) {
            console.log(error);
        }
    };
    
    //Retrieve token from local storage.
    async getToken() {
        try{
            const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            console.log('Token is: ', token);
        }catch(error) {
            console.log(error);
        }
    };

    //method for removing token from local storage
     async removeToken() {
       try{
            this.getToken();
            const token = await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
            console.log('Token: ' + token);
       }catch(error) {
        console.log(error);
       }
     };

     //method for storing email address.
     async storeUsername(username) {
         try{
            await AsyncStorage.setItem(USERNAME_STORAGE_KEY, username);
         }catch(e) {
            console.error(e);
         }
     };

     
    handleSignIn = async () => {
       this.setState({ loading: true}); //display loading spinner when this function is invoked. 
       //let response = null;

       try{
        let { data } = await axios.post(`${URL}/api/login`, { 
            username: this.state.username, 
            password: this.state.password
        });
        
        this.setState({ loading: false, password: ''}); //update the state of the 
       
        await firebase.auth().signInWithCustomToken(data.token); //authenticate with email and password.
        
        this.storeToken(data.token); //store token to local storage. 
   
        Alert.alert('Crime GIS', 'Login Successful!\nNow you can start reporting crimes!');

        await this.storeUsername(this.state.username); //store username 
        this.props.navigation.navigate('Report'); //navigate to the report screen. 
        
        }catch(error){
          Alert.alert('Error', 'Unable to log in. Email/Password provided is incorrect.');  
            this.setState({ 
                loading: false, error: 'Authentication Failed',
                username: '', password: ''
            });
            //this.removeToken();
            console.log(error);
        }
    };

    //async method for signing in as a guest. 
    anonymousSignIn = async () => {  
        try{
          let { user } = await firebase.auth().signInAnonymously();
            console.log("Successfully signed in as a guest!", user.accessToken);
            //this.storeToken()
            //this.storeToken(user.getIdToken);
            if(user.isAnonymous) {
                Alert.alert("Crime GIS","You are signed in as a guest.\nIf you want your personal information to be saved, and display your list of crimes you have reported then register an account.");
            }
            this.props.navigation.navigate('Map'); //Navigate to the app.
            
        }catch(e) {
            console.log("Error: " + e);
        }
    }

    renderButton() {
        const { btnStyle } = style;
        if(this.state.loading) {
            return (
                <View style={{ marginTop: 10}}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            );
        }else{
            return <Button
            buttonStyle={btnStyle}
            raised={true}
            title="LOG IN"
            iconRight={true}
            
            icon={<Icon style={{ marginLeft: 10 }} name="login" size={30} color="#fff" />}
            onPress={this.handleSignIn}
            titleStyle={{ fontSize: 20}}
            />;
        }
    };

    //Method for displaying the error message.
    renderErrorMsg() {
        const { error } = this.state;
        if(error.length != null) {
            return (
                <Text style={{ marginTop: 5, color: 'red', fontSize: 14}}>
                    {error}
                </Text>
            );
        }
    };

    //method for requesting to reset password.
    requestPasswordReset = async () =>  {
        try{
            let response = await axios.post(`${URL}/forgot`, { email: this.state.emailReset });
            alert("A link to reset your password has been sent to: " + this.state.emailReset);
            console.log(response);
            this.setState({ emailReset: '' }); //clear the form
        }catch(error) {
            alert("Unable to send the link to reset your password." + "\n" + "This is due to: ", error);
        }
        
    };

    render() {
        const { initStyle, inputStyle, titleStyle, btnStyle} = style;
        const { username, password, emailReset } = this.state;
        return (
            <View>
                <KeyboardAvoidingView behavior="padding" enabled>
                <ScrollView>
                   <Input
                        inputStyle={inputStyle}
                        placeholder="Enter Your Username" 
                        textContentType="username"
                        label="Username" 
                        labelStyle={{color: '#000000', marginTop: 15 }}
                        value={username}
                        onChangeText={username => this.setState({username})}
                    />

                    <Input 
                        inputStyle={inputStyle}
                        placeholder="Enter Password" 
                        textContentType="password"
                        labelStyle={{ color:'#000000', marginTop: 15 }}
                        label="Password" 
                        value={password}
                        secureTextEntry={true}
                        onChangeText={password => this.setState({password})}
                    /> 

                    {this.renderButton()}
                    {this.renderErrorMsg()}

                    <View style={{ marginTop: 12 }}>
                        <TouchableOpacity onPress={() => this.setState({ visible: true })}>
                            <Text style={{ fontWeight: "bold"}}>Forgotten your password?</Text>        
                        </TouchableOpacity>
                     </View>
                    <Overlay
                        isVisible={this.state.visible}
                        onRequestClose={() =>  this.setState({ visible: false})}
                        onBackdropPress={() => this.setState({ visible: false })}
                    >
                        <Text style={titleStyle}>Reset Your Password</Text>
                        <Input
                            inputStyle={inputStyle}
                            placeholder="Enter Email Address" 
                            textContentType="emailAddress"
                            keyboardType="email-address"
                            label="Email" 
                            labelStyle={{color: '#000000', marginTop: 15 }}
                            value={emailReset}
                            onChangeText={emailReset => this.setState({emailReset})}
                        />
                        <Button 
                            title="SEND LINK TO EMAIL" 
                            raised={true} titleStyle={{ fontWeight: "normal"}}
                            buttonStyle={{ marginTop: 20 }}
                            onPress={this.requestPasswordReset}
                        />
                    </Overlay>

                    <Divider style={{marginTop:15, backgroundColor: '#191970', height: 4 }} />
                    <Text style={titleStyle}>Guest</Text>
                    <Button 
                    title="SIGN IN AS GUEST" 
                    raised={true}
                    iconRight={true}
                    icon={<Icon name="user" size={30} color="#fff"/>}
                    buttonStyle={btnStyle} onPress={this.anonymousSignIn}/>
                </ScrollView>
            
                <View style={{ marginTop: 12 }}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('signUp')}>
                    <Text>Click here to create a new account here</Text>        
                </TouchableOpacity>
                </View>

                </KeyboardAvoidingView>
              
            </View>
        );
    }
}

const style = {
    initStyle: {
        marginTop: Platform.OS === 'android' ? 24 : 0
    },
    titleStyle: {
        textAlign: 'center',
        fontSize: 20,
        color: 'black',
        //fontWeight: 'bold',
        marginTop: 10
    },
    inputStyle: {
        marginTop: 10,
        marginBottom: 20
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

export default LoginScreen;