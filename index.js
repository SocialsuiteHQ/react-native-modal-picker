'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
    View,
    Modal,
    Text,
    ScrollView,
    TouchableOpacity,
    ViewPropTypes,
    Dimensions
} from 'react-native';

import styles from './style';
import BaseComponent from './BaseComponent';

let componentIndex = 0;
let rnVersion = Number.parseFloat(require('react-native/package.json').version);
let { height } = Dimensions.get('window');


const propTypes = {
    data: PropTypes.array,
    onChange: PropTypes.func,
    initValue: PropTypes.string,
    style: rnVersion >= 0.44 ? ViewPropTypes.style : View.propTypes.style,
    selectStyle: rnVersion >= 0.44 ? ViewPropTypes.style : View.propTypes.style,
    optionStyle: rnVersion >= 0.44 ? ViewPropTypes.style : View.propTypes.style,
    optionTextStyle: Text.propTypes.style,
    sectionStyle: rnVersion >= 0.44 ? ViewPropTypes.style : View.propTypes.style,
    sectionTextStyle: Text.propTypes.style,
    cancelStyle: rnVersion >= 0.44 ? ViewPropTypes.style : View.propTypes.style,
    cancelTextStyle: Text.propTypes.style,
    overlayStyle: View.propTypes.style,
    optionContainerStyle: View.propTypes.style,
    cancelContainerStyle: View.propTypes.style,
    cancelText: PropTypes.string
};

const defaultProps = {
    data: [],
    onChange: ()=> {},
    initValue: 'Select me!',
    style: {},
    selectStyle: {},
    optionStyle: {},
    optionTextStyle: {},
    sectionStyle: {},
    sectionTextStyle: {},
    cancelStyle: {},
    cancelTextStyle: {},
    overlayStyle: {},
    cancelText: 'cancel',
    keyboardShouldPersistTaps: 'always'
};

export default class ModalSelector extends BaseComponent {

    constructor() {

        super();

        this._bind(
            'onChange',
            'open',
            'close',
            'renderChildren'
        );

        this.state = {
            animationType: 'slide',
            modalVisible: false,
            transparent: false,
            selected: '',
            height: 0,
        };
    }

    componentDidMount() {
        this.setState({selected: this.props.initValue, cancelText: this.props.cancelText});
    }

    // TODO: If items updated reset this.state.height to 0
    componentWillReceiveProps(nextProps) {
        if (nextProps.initValue != this.props.initValue) {
            this.setState({selected: nextProps.initValue});
        }
    }

    onChange(item) {
        this.props.onChange(item);
        this.setState({selected: item.label});
        this.close();
    }

    close() {
        this.setState({
            modalVisible: false
        });
    }

    open() {
        this.setState({
            modalVisible: true
        });
    }

    renderSection(section) {
        return (
            <View key={section.key} style={[styles.sectionStyle,this.props.sectionStyle]}>
                <Text style={[styles.sectionTextStyle,this.props.sectionTextStyle]}>{section.label}</Text>
            </View>
        );
    }

    setRenderHeight(event) {
        if(this.state.height !== 0) {
            return;
        }

        var height = Math.ceil(event.nativeEvent.layout.height);

        if(this.state.height !== height) {
            this.setState({height: height});
        }
    }

    renderOption(option) {
        return (
            <TouchableOpacity key={option.key} onPress={()=>this.onChange(option)} onLayout={event => this.setRenderHeight(event)}>
                <View style={[styles.optionStyle, this.props.optionStyle]}>
                    <Text style={[styles.optionTextStyle,this.props.optionTextStyle]}>{option.label}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    renderOptionList() {
        var options = this.props.data.map((item) => {
            if (item.section) {
                return this.renderSection(item);
            } else {
                return this.renderOption(item);
            }
        });

        //Set the max scroll view height to take up 50% of the screen height
        var optionsMaxHeight = Math.min(this.state.height * this.props.data.length, ((height / this.state.height * 0.5) | 0) * this.state.height);

        return (
            <View style={[styles.overlayStyle, this.props.overlayStyle]} key={'modalPicker'+(componentIndex++)}>
                <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
                    <View style={[styles.optionContainer, {maxHeight: optionsMaxHeight}, this.props.optionContainerStyle]}>
                        <ScrollView keyboardShouldPersistTaps='always'>
                            {options}
                        </ScrollView>
                    </View>
                    <View style={[styles.cancelContainer, this.props.cancelContainerStyle]}>
                        <TouchableOpacity onPress={this.close}>
                            <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                                <Text style={[styles.cancelTextStyle, this.props.cancelTextStyle]}>{this.props.cancelText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    renderChildren() {

        if(this.props.children) {
            return this.props.children;
        }
        return (
            <View style={[styles.selectStyle, this.props.selectStyle]}>
                <Text style={[styles.selectTextStyle, this.props.selectTextStyle]}>{this.state.selected}</Text>
            </View>
        );
    }

    render() {

        const dp = (
            <Modal transparent={true} ref="modal" visible={this.state.modalVisible} onRequestClose={this.close} animationType={this.state.animationType}>
                {this.renderOptionList()}
            </Modal>
        );

        return (
            <View style={this.props.style}>
                {dp}
                <TouchableOpacity onPress={this.open}>
                    {this.renderChildren()}
                </TouchableOpacity>
            </View>
        );
    }
}

ModalSelector.propTypes = propTypes;
ModalSelector.defaultProps = defaultProps;
