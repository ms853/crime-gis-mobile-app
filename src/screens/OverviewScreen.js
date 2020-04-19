import React,{ Component } from "react";
import { Text, View, Platform } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

class OverviewScreen extends Component {
    
    static navigationOptions = () => {
        return{
            headerTitle: 'Summary of Crime Reports',
            headerStyle: {
            backgroundColor: '#191970',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
            fontWeight: 'bold',
            },    
        };
    };

    render() {
        const { initStyle, titleStyle } = styles;
        return (
            <View>
                <Text>
                    Overview of Crime Reports
                </Text> 
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

export default OverviewScreen;