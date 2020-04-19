import React from 'react';
import {createStackNavigator, createBottomTabNavigator, createDrawerNavigator, createSwitchNavigator} from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome5';
//importing the different class components for my application that will be configured as screens. 
import WelcomeScreen from '../src/screens/WelcomeScreen';
import LoginScreen from "../src/screens/LoginScreen";
import SignUpScreen from "../src/screens/SignUpScreen";
import MapScreen from "../src/screens/MapScreen";
import ReportScreen from "../src/screens/ReportScreen";
import ReportListScreen from "../src/screens/ReportListScreen";
import ReportEditScreen from '../src/screens/ReportEditScreen';
import OverviewScreen from '../src/screens/OverviewScreen';
import SettingsScreen from '../src/screens/SettingsScreen';

/** 
 * Here I configured the following screens as stack navigators separate
 * -from the main navigation flow of the application. 
 * */
const AuthNavigation = createStackNavigator({
    welcome: {screen: WelcomeScreen},
    signUp: {screen: SignUpScreen},
    login: {screen: LoginScreen},
});

/* 
Settings: createDrawerNavigator({
            Settings: {screen: SettingsScreen}
        })
*/
/** 
 * The app navigation object is an instance of tab navigator. 
 * The navigation for my main application, is a tab navigator. 
 * */
const AppNavigation = createBottomTabNavigator({
    Map: {screen: MapScreen,
        navigationOptions: {
            tabBarLabel:"Map View",
            // tabBarIcon: () => (
                
            //   <Icon name="map-marked-alt" size={20} color="#fff" />
            // )
          },
    },

    //Nested Stack navigator inside the tab navigator. 
    Report: createStackNavigator({
        
        Report: {screen: ReportScreen},
        ReportList: {screen: ReportListScreen},
        EditReport: {screen: ReportEditScreen},
        Overview: {screen: OverviewScreen},
    }),
    Settings: {screen: SettingsScreen,
        navigationOptions: {
            tabBarLabel:"General Settings",
            // tabBarIcon: () => (
            //   <Icon name="user-cog" size={20} color="#fff" />
            // )
        }
    }
}, {
    tabBarOptions: {
        activeTintColor: '#e91e63',
        labelStyle: {
          fontSize: 12,
          color: 'white'
        },
        style: {
          backgroundColor: '#191970',
        },
    }
},{ lazy: false }
);

/** 
 * Lastly, an appSwitchNavigation object is created to connect two different application flows.
 * This file is then exported to the root component App.js it is rendered there.  
 * */
const appSwitchNav = createSwitchNavigator({
    AuthNav: AuthNavigation,
    AppNav: AppNavigation
});

export default appSwitchNav;