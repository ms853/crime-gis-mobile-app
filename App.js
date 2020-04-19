//Reference for app navigation: https://reactnavigation.org/docs/en/tab-based-navigation.html

import React from 'react';
import { StyleSheet, Text, View, Platform, StatusBar } from 'react-native';
import { createAppContainer, createBottomTabNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation';
import firebase from 'firebase';
import { Provider } from 'react-redux';
import store from './store';
import NavigationConfig from "./navigation";

const AppContainer = createAppContainer(NavigationConfig);

//Firebase Configuration
const configurationForProject = {
  apiKey: "AIzaSyB2sGikDr7v3a-0MdM-YI2hMSJV48xwcYc",
  authDomain: "my-crime-gis-app.firebaseapp.com",
  databaseURL: "https://my-crime-gis-app.firebaseio.com",
  projectId: "my-crime-gis-app",
  storageBucket: "",
  messagingSenderId: "176863517265",
  appId: "1:176863517265:web:3daa91eca0a9287a"
};

//Check to see if there is more than one firebase instance initialized. 
//This is to stop re-initializing the application everytime.
//!firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app(); 

firebase.initializeApp(configurationForProject);

const App = () => {
  return (
    <Provider store={store}> 
        <AppContainer />
    </Provider>
  );
}

const styles = {
  tabBarSyles: {
    color: 'white',
    backgroundColor: '#191970' //midnightBlue
  }
};

export default App;
