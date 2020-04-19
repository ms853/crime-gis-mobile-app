import React,{ Component } from "react";
import { 
    Text, View, Platform, Picker, Alert, AsyncStorage, ActivityIndicator, 
    TextInput, Dimensions, KeyboardAvoidingView, ScrollView } from "react-native";
import { Button, Input, Card } from "react-native-elements";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import _ from 'lodash';

import { GOOGLE_MAPS_API_KEY } from "../../config";

import { connect } from "react-redux"; //connect helper from react-redux 
import { 
    editCrimeReport, deleteCrimeReport, reportChange
} from '../../actions/ReportActions'; //imported action creator functions.
import CardSection from "../components/CardSection";
import ReportForm from "../components/ReportForm";


class ReportEditScreen extends Component {
    
    static navigationOptions = ({ navigation }) => {
       return {
            headerTitle: 'Edit Report',
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

    
    componentWillMount() { 
        //Before component is rendered to the screen, display this message to the user.
        Alert.alert('Crime GIS', 'To make any changes to your report, edit the description, the type of crime, and date and time field.'
        + '\nOnce you are done press SAVE CHANGES to submit. \n\nTo delete your current report press delete.');
        console.log("Check out navigation prop: "+ this.props.navigation); 
        var reportData = this.props.navigation.getParam('reportInfo');
        //console.log(report);
        //this.setState({ formData: report})
        //lodash method for iterating over elements (foreach loop)
        _.each(reportData, (value, prop) => {
            this.props.reportChange({prop, value});//call action creator method
        });
    }

    // componentDidMount() {
    //     var report = this.props.navigation.dangerouslyGetParent().getParam('report');
    //     console.log(report);
    // }

    // componentDidUpdate() {
    //     if(this.props.crime) {}
    // }

    //Method for saving changes (asynchronous)
    onSaveChanges = async() => {
        const { type_of_crime, time, dateOfCrime, crimeDescription} = this.props;
        try{
            this.props.editCrimeReport({ cId: this.props.data._id, crimeDescription, type_of_crime, dateOfCrime, time});
            this.props.navigation.goBack(); //navigate back to the list screen.

        }catch(error) {
            console.log(error);
        }
    };

    //Method for deleting a report (asynchronous)
    onDeleteReport = async() => {
        //const {} = this.props;
        try{
            this.props.deleteCrimeReport({ cId: this.props.data._id });
            this.props.navigation.goBack();
        }catch(e) {
            console.log(e);
        }
    };
    
    render() {
        
        const { deleteButtonStyle, saveButtonStyle} = styles; //destructure the styles object.
        
        return (
            <ScrollView>
               <ReportForm {...this.props} />
                <View style={saveButtonStyle}>
                    <Button title="SAVE CHANGES" 
                        raised={true} onPress={this.onSaveChanges}
                        iconRight={true}
                        icon={<Icon name="content-save-edit" color="#fff" size={30}/>}
                        iconContainerStyle={{ marginLeft: 10}}
                    />
                </View> 
                <View style={deleteButtonStyle}>
                    <Button title="DELETE REPORT" 
                    raised={true} onPress={this.onDeleteReport}
                        iconRight={true}
                        icon={<Icon name="delete" color="#fff" size={30}/>}
                        iconContainerStyle={{ marginLeft: 10}}
                    />
                </View> 
            </ScrollView>
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
    saveButtonStyle: {
        marginTop: 10,
        marginBottom: 10
        //flex: 1
    },
    deleteButtonStyle: {
        marginTop: 10,
        marginBottom: 10
        //flex: 1
    },
    

   
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
    editCrimeReport, deleteCrimeReport, reportChange
})(ReportEditScreen);