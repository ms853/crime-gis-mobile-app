import React,{ Component } from "react";
import { Text, View, Platform, KeyboardAvoidingView, Alert,
    ScrollView, TouchableOpacity, ActivityIndicator} from "react-native";
import { Button, Input } from "react-native-elements";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from "axios";


const apiURL = "https://crimegis-backend.herokuapp.com";

class SignUpScreen extends Component {
    
    static navigationOptions = ({ navigation }) => {
        return {
             headerTitle: 'Sign Up',
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
        email: '',
        password: '',
        phoneNumber: '', 
        loading: false,
        error: '' 
    }; //initialize phone number as component level state.
     
    handleUserSignUp = async () => {
       
        this.setState({ loading: true }); 

        let response = null;
        /*Will handle call request to my backend api to signup the new user,
        and once the user is signed in, the user is then navigated to the login page.     
        */
        //The following network request is an asynchronous method call. 
        try{
            //create the user
            response = await axios.post(`${apiURL}/api/signup`, 
            { phone: this.state.phoneNumber,
                email: this.state.email,
                password: this.state.password
            });

           
            Alert.alert('Crime GIS','Your account has been created. \n' + 'Now login with your new account.');
            Alert.alert('Informtion','To log in use your username which is: ' 
            + this.state.email.substring(0, this.state.email.lastIndexOf('@')));

            this.setState({loading: false, email: '', password: '', phoneNumber: '' });
            this.props.navigation.navigate('login');
        }catch(error) {
            this.setState({ 
                loading: false, 
                email: '', password: '', 
                phoneNumber: '',
                error: '*Failed to create an account. Please check the credentials you have provided*' }); //stop displaying the loading screen. 
            
           Alert.alert("Error", error + "\n" + response);     
           console.log("The following error occured:\n" + error);
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

    renderButton() {
        const {btnStyle} = styles;
        //if loading is true render spinner. 
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
                    title="SIGN UP"
                    titleStyle={{ fontSize: 20 }}
                    onPress={this.handleUserSignUp}
                    iconRight={true}
                    icon={<Icon  style={{ marginLeft: 10 }} color="#fff" size={30} name="account-arrow-right"/>}
                />
        }
    }


    render() {
        const { initStyle, inputStyle, titleStyle} = styles;
        const { phoneNumber, email, password } = this.state;

        return (
            <View>
                <KeyboardAvoidingView  behavior="padding" enabled>
                <ScrollView>
                <Input 
                    inputStyle={inputStyle}
                    placeholder="Enter Email Address" 
                    textContentType="emailAddress"
                    keyboardType='email-address'
                    value={email}
                    onChangeText={email => this.setState({ email })}
                    label="Email" 
                    labelStyle={{ color:'#000000', marginTop: 15 }}
                />

                <Input 
                    inputStyle={inputStyle}
                    placeholder="Enter Password" 
                    textContentType="password"
                    value={password}
                    onChangeText={password => this.setState({ password })}
                    label="Password" 
                    labelStyle={{ color:'#000000', marginTop: 15 }}
                    secureTextEntry={true}
                    
                />

                <Input 
                    inputStyle={inputStyle}
                    placeholder="Enter Phone Number" 
                    textContentType="telephoneNumber"
                    keyboardType="name-phone-pad"
                    value={phoneNumber}
                    onChangeText={phoneNumber => this.setState({ phoneNumber })}
                    label="Phone Number" 
                    labelStyle={{ color:'#000000', marginTop: 15 }}
                />

                {this.renderButton()}
                {this.renderErrorMsg()} 
                <View style={{ justifyContent: 'center'}}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('login')}>
                        <Text style={{ marginTop: 20, marginBottom: 20}}>Already have an account? Click here to sign in.</Text>        
                    </TouchableOpacity>
                </View>                     
                </ScrollView>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        fontSize: 30,
        color: 'black',
        //fontWeight: 'bold',
        marginBottom: 20
    },
    inputStyle: {
        marginTop: 30,
        //marginBottom: 20
    },
    btnStyle: {
        marginTop: 25,
        //flex: 1
    }
}

export default SignUpScreen;