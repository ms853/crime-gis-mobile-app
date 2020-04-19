import React, {Component} from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableHighlight} from "react-native";
import CardSection from './CardSection';
import { Card } from "react-native-elements";

//this functional component renders the section list based near by crimes. 
class ReportListItem extends Component{

    editReport = () => {
        //this.props;
        this.props.navigation.navigate('EditReport', { reportInfo: this.props.data });

    }

    render() {
        const { listItem } = styles;
        const { typeOfCrime, address, time, description } = this.props.data;
        return(
            <ScrollView>
            <TouchableHighlight onPress={this.editReport}>
            <View style={{ marginBottom: 10 }}>
                <Card>
                    <CardSection>
                            <Text style={listItem}>{typeOfCrime}</Text>
                    </CardSection>        
                    <CardSection>
                        <Text style={listItem}>{address}</Text>
                    </CardSection>
                    <CardSection>
                        <Text style={listItem}>{time}</Text>
                    </CardSection>
                    <CardSection>
                        <Text style={listItem}>{description}</Text>
                    </CardSection>
                </Card> 
                
                
            </View>
            </TouchableHighlight>
            </ScrollView>
        );
    }
};
 
const styles = StyleSheet.create({
    listItem: {
        flex: 1,
        flexDirection: "column",
        fontSize: 16,
        color: '#000000',
    },
    viewStyle: {
        flexDirection: 'column',
        flex: 1,
        backgroundColor: 'rgb(98, 180, 115)'
    },
    textStyle: {
        fontSize: 15,
        fontWeight: '400',
        color: '#000000',
        marginLeft: 20,
        marginRight: 10
    }
});

export default ReportListItem;