//Implemented my custom modal using the help of the react-native documentation on modal. 
//https://facebook.github.io/react-native/docs/modal#transparent
import React from 'react';
import { Text, View, Modal} from 'react-native';
import {Button} from 'react-native-elements';

import CardSection from './CardSection';

//This is functional component that will return JSX code. 
//This will allow the component to be resuable. 
const ModalView = ({children, visible, onAccept, onDecline}) => {
    const {textStyle, cardSectionStyle, containerStyle} = styles; //de-structuring the styles object. 
  return (
    <Modal 
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => {}}
        
    >
    
    <View style={containerStyle}>
        <CardSection style={cardSectionStyle}>
            <Text style={textStyle}>{children}</Text>
        </CardSection>

        <CardSection style={cardSectionStyle}>
            <Button label="Close" 
            color="rgba(0, 122, 255, 1)" 
            type="clear"
            onPress={onDecline}
            />
        </CardSection>
    </View>
    </Modal>
  );
};

const styles = {
    containerStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        position: 'relative',
        flex: 1,
        justifyContent: 'center'
    },
    cardSectionStyle: {
        justifyContent: 'center'
    },
    textStyle: {
        flex: 1,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 40
    }
};

export default ModalView;