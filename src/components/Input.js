import React from 'react';
import { TextInput, View, Text } from 'react-native';

//This functional component will hold objects, that can be reused to modify this component. 
const Input = ({ label, value, onChangeText, 
	placeholder, secureTextEntry, autoCorrect }) => {
    
    const { labelStyle, containerStyle, inputStyle } = styles;
    return (
        <View style={containerStyle}>
            <Text style={labelStyle}>{label}</Text>
            <TextInput
                secureTextEntry={secureTextEntry}
                placeholder={placeholder}
                autoCorrect={autoCorrect} //disable autocorrect
                style={inputStyle}
                value={value}
                onChangeText={onChangeText} 
               
            />
        </View>
    );
};

const styles = {
    inputStyle: {
        color: '#000',
        fontSize: 17,
        paddingRight: 5,
        paddingLeft: 20,
        lineHeight: 30,
        flex: 2,
        backgroundColor: 'rgba(255,255,255,1)'
    },
    labelStyle: {
        fontSize: 15,
        flex: 1,
	//marginBottom: 5
    },
    containerStyle: {
        height: 50,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    }
};

export default Input;