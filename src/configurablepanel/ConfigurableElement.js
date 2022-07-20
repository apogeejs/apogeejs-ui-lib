import ConfigurablePanelConstants from "/apogeejs-ui-lib/src/configurablepanel/ConfigurablePanelConstants.js";
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";
import {getHelpElement} from "/apogeejs-ui-lib/src/tooltip/tooltip.js";

/** This is an element that composes the content of a configurable panel.
 * 
 * @class 
 */
export default class ConfigurableElement {
    constructor(form,elementInitData) {
        this.form = form;
        this.state = ConfigurablePanelConstants.STATE_NORMAL;
        this.key = elementInitData.key;
        this.excludeValue = elementInitData.excludeValue;
        this.meta = elementInitData.meta;
        this.selectorConfig = elementInitData.selector;
        this.isMultiselect = false;
        this.focusElement = null;

        //legacy code-----------------
        //Previously exclude value was included in meta
        if((this.excludeValue === undefined)&&(this.meta !== undefined)&&(this.meta.excludeValue !== undefined)) {
            this.excludeValue = this.meta.excludeValue;
        }
        //-----------------------------

        this.onChangeListeners = [];
        this.onInputListeners = [];

        this.domElement = uiutil.createElement("div",{"className":ConfigurableElement.CONTAINER_CLASS});
        //explicitly set the margin and padding
        this.domElement.style.margin = ConfigurableElement.ELEMENT_MARGIN_STANDARD;
        this.domElement.style.padding = ConfigurableElement.ELEMENT_PADDING_STANDARD;
        this.domElement.style.display = ConfigurableElement.ELEMENT_DISPLAY_FULL_LINE;

        this.errorDiv;

        this.visibleDisplayStyle = ConfigurableElement.ELEMENT_DISPLAY_FULL_LINE;
    }
    
    /** This method returns the key for this ConfigurableElement within this panel. */
    getKey() {
        return this.key;
    }

    /** This method returns the configured meta value for this element. */
    getMeta() {
        return this.meta;
    }

    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return undefined;
    }  

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.setValueImpl(value);
        this.valueChanged(true);
    }

    /** This retrieves the excludeValue. If the element value is this, it will not be returned as part of
     * the panel value. It is intended for things like optional values, which are omitted if they are not set
     * away from this value. */
    getExcludeValue() {
        return this.excludeValue;
    }
    
    getState() {
        return this.state;
    }

    /** This hides or shows the given element within the panel. */
    setState(state) {
        this.state = state;
        switch(state) {
            case ConfigurablePanelConstants.STATE_NORMAL:
                this._setVisible(true);
                this._setDisabled(false);
                break;
                
            case ConfigurablePanelConstants.STATE_DISABLED:
                this._setVisible(true);
                this._setDisabled(true);
                break;
                
            case ConfigurablePanelConstants.STATE_HIDDEN:
                this._setVisible(false);
                break;
                
            case ConfigurablePanelConstants.STATE_INACTIVE:
                this._setVisible(false);
                break;
        }
        
    }

    /** This function attempts to give focus to the element. It will return true if element successfullly got focus. */
    giveFocus() {
        if((this.state == ConfigurablePanelConstants.STATE_NORMAL)&&(this.focusElement)) {
            this.focusElement.focus();
            return (document.activeElement == this.focusElement);
        }
        else {
            return false;
        }
    }

    /** This method returns the DOM element for this configurable element. */
    getElement() {
        return this.domElement;
    }
    
    /** This method returns the parent form for this configurable element. */
    getForm() {
        return this.form;
    }

    getBaseForm() {
        return this.form.getBaseForm();
    }

    addOnChange(onChange) {
        this.onChangeListeners.push(onChange);
    }

    addOnInput(onInput) {
        this.onInputListeners.push(onInput);
    }

    /** This is used to determine what type of child element this is for a panel. */
    get elementType() {
        return "ConfigurableElement";
    }

    /** This method is called during configuration to populate the selectors of the element. */
    populateSelectors() {
        if(this.selectorConfig) {
            try {
                this._addSelector(this.selectorConfig);
            }
            catch(error) {
                let errorMsg = "Error calling selector: " + error.message ? error.message : error ? error.toString() : "Unknown";
                console.error(errorMsg);
                if(error.stack) console.error(error.stack);
                this.setElementErrorMsg(errorMsg)
            }
        }
    }

    //==================================
    //protected methods
    //==================================

    /** If the element returns multiple selected values, such as a checkbox group, then isMultiselect
     * should be set to true. The default is false. */
    setIsMultiselect(isMultiselect) {
        this.isMultiselect = isMultiselect;
    }

    /** This method should be implemented by extending to set the value for the element. The method 
     * "valueChanged" does not need to be called. It is called automatically. */
    setValueImpl(value) {}

    /** This method should be called when the value changes. Here value changed refers to a completed
     * input. For example typing a character a text field should not trigger this event, only the update 
     * of the value of a given field. */
    valueChanged() {
        if(this.onChangeListeners.length > 0) {
            let value =this.getValue();
            this.onChangeListeners.forEach( listener => listener(value,this.form));
        }
    }

    /** This method should be called input is done at the user interface. Thiw is should be called when typing
     * characters in a text field or when changing an element such as a checkbox. */
    inputDone() {
        if(this.onInputListeners.length > 0) {
            let value =this.getValue();
            this.onInputListeners.forEach( listener => listener(value,this.form));
        }
    }

    /** This function should be used to set the display state for the element, since that variable
     * is also used to control visibility. */
    setVisibleDisplayStyle(visibleDisplayStyle) {
        this.visibleDisplayStyle = visibleDisplayStyle;
        if((this.domElement)&&(this.domElement.style.display != "none")) {
            this.domElement.style.display = this.visibleDisplayStyle;
        }
    }

    /** This method should be called by extending methods to set the focus element, if there is one. */
    setFocusElement(focusElement) {
        this.focusElement = focusElement;
    }

    /** This cleans up the element. It should be extended to do any additional cleanup in an extending class. */
    destroy() {
        this.form = null;
        this.onChangeListeners = [];
        this.onInputListeners = [];
        this.domElement = null;
        this.focusElement  = null;
    }

    /** This function creates a label element and returns it if the element init data defines a label.
     * Otherwise it returns null. */
    getLabelElement(elementInitData) {
        if(elementInitData.label) {
            let labelElement = document.createElement("span");
            labelElement.className = "apogee_configurablePanelLabel apogee_configurableElement_hideSelection";
            labelElement.innerHTML = elementInitData.label;
            return labelElement;
        }
        else {
            return null;
        }
    }

    getHelpElement(elementInitData) {
        if(elementInitData.help) {
            //note - the funciton below is the imported one, not the class member function
            let options = {
                wrapperAddonClass: "apogee_configurableElementHelpWrapperAddon",
                textAddonClass: "apogee_configurableElementHelpTextAddon"
            };
            if(elementInitData.help.length > 24) {
                options.textWidth = "300px";
            }
            let helpElements = getHelpElement(elementInitData.help,options);
            helpElements.wrapperElement.classList.add("apogee_configurableElementHelpAddon");
            return helpElements.wrapperElement;
        }
        else {
            return null;
        }
    }

    /** This function creates a label element and returns it if the element init data defines a label.
     * Otherwise it returns null. */
    getHintElement(elementInitData) {
        if(elementInitData.hint) {
            let hintElement = document.createElement("span");
            hintElement.className = "apogee_configurablePanelHint";
            hintElement.innerHTML = elementInitData.hint;
            return hintElement;
        }
        else {
            return null;
        }
    }

    /** This sets the content of a div that displays an error mesage */
    setElementErrorMsg(errorMsg) {
        if(!this.errorDiv) {
            //add an error display
            this.errorDiv = document.createElement("div");
            this.errorDiv.className = "apogee_configubleElementErrorDiv";
            this.domElement.append(this.errorDiv);
        }
        this.errorDiv.innerHTML = errorMsg;
    }

    //----------------------------------
    // Function Body Generator Static Methods
    //----------------------------------

    /** This gets a code exrpession to return the value of the element given by the bvalue and layout. 
     * It also returns a flag indicating if an expression is present or not.
     * return value: {hasExpression, valueCodeText}
    */
    static createValueCodeText(value,layout,containerValue) {

        if(value === undefined) {
            return "undefined";  //THIS IS NOT RIGHT!!!??
        }
        
        //get the expression type
        let expressionType;
        let meta = layout.meta
        if((meta)&&(meta.expression)) {
            if(meta.expression == "choice") {
                expressionType = getExpressionChoiceType(containerValue,meta);
            }
            else {
                expressionType = meta.expression;
            }
        }
        else {
            expressionType = "value"
        }
        
        //get the value or expression
        let hasExpression
        let valueCodeText
        switch(expressionType) {
            case "value": 
                //plain value, not an expression
                valueCodeText = getSimpleValueEntry(value)
                hasExpression = false
                break
        
            case "stringified": 
                //plain value, not an expression
                valueCodeText = getStringifiedValueEntry(value)
                hasExpression = false
                break
        
            case "simple":
            case "code":
                //this is a javascript expression
                valueCodeText = getSimpleExpressionEntry(value)
                hasExpression = true
                break
        
            case "reference":
                //this is a variable reference 
                valueCodeText = getReferenceExpressionEntry(value)
                hasExpression = true
                break
        
            case "function":
                //this is a function
                let argList;
                if(meta) {
                    if(meta.argList) argList = meta.argList;
                    else if(meta.argListKey) argList = containerValue[meta.argListKey];
                }
                else argList = ""
                valueCodeText = getFunctionExpression(value,argList)
                hasExpression = true
                break
                
            default:
                throw new Error("Expression type not supported for " + expressionType)
        }

        return {hasExpression, valueCodeText}
    }

    //===================================
    // internal Methods
    //==================================
    
    /** This method does standard initialization which requires the element be created. 
     * Any extending method should call this at the end of the constructor. */
    _postInstantiateInit(elementInitData) {
        
        //standard fields
        if(elementInitData.value !== undefined) {
            this.setValue(elementInitData.value);
        }
        
        var state = (elementInitData.state != undefined) ? elementInitData.state : ConfigurablePanelConstants.STATE_NORMAL;
        this.setState(state);
        
        //standard events
        if(elementInitData.onChange) {
            this.addOnChange(elementInitData.onChange);
        }
        if(elementInitData.onInput) {
            this.addOnInput(elementInitData.onInput);
        }
    }
    
    _setDisabled(isDisabled) {};
    
    _setVisible(isVisible) {
        if(!this.domElement) return;

        if(isVisible) {
            this.domElement.style.display = this.visibleDisplayStyle;
        }
        else {
            this.domElement.style.display = "none";
        }
    }

    /** This processes a selector entry from the init data */
    _addSelector(selectorConfig) {

        //get parent element list
        let parentKeys = selectorConfig.parentKey ? [selectorConfig.parentKey] : selectorConfig.parentKeys;
        if(!parentKeys) throw new Error("Parent key(s) not found for selectable child element " + selectorConfig.key);
        let parentElements = parentKeys.map( parentKey => {
            if(Array.isArray(parentKey)) {
                //absolute path
                let baseForm = this.getBaseForm();
                return baseForm.getEntryFromPath(parentKey);
            }
            else {
                //local key in form
                return this.form.getEntry(parentKey);

            }
        })
        if(parentElements.indexOf(undefined) >= 0) throw new Error("Parent element not found for selectable child element " + selectorConfig.key);

        
        //get the internal function
        let actionFunction;
        if(selectorConfig.actionFunction) {
            actionFunction = selectorConfig.actionFunction;
        }
        else {
            actionFunction = this._getPredefinedActionFunction(selectorConfig,parentElements);
        }
        if(!actionFunction) throw new Error("Action function not found for selectable child element " + selectorConfig.key);

        //handler
        let functionArgs = [this].concat(parentElements);
        let onValueChange = () => actionFunction.apply(null,functionArgs);
        
        if(onValueChange) {
            parentElements.forEach(parentElement =>parentElement._addDependentCallback(onValueChange));
        }
    }

    /** This method gets an instance of a predefined action function for the given selector config. */
    _getPredefinedActionFunction(selectorConfig,parentElements) {

        //these only apply to single parent objects, not multiple parents
        let inputParentElement = parentElements[0];

        //get the action
        let action = selectorConfig.action;
        if(!action) action = ConfigurablePanelConstants.DEFAULT_SELECTOR_ACTION;

        //get the target values. This can be a single value of a list of values
        let target, targetIsMultichoice;
        if(selectorConfig.parentValue !== undefined) {
            target = selectorConfig.parentValue;
            targetIsMultichoice = false;
        }
        else if(selectorConfig.parentValues !== undefined) {
            target = selectorConfig.parentValues;
            targetIsMultichoice = true;
        }
        else {
            throw new Error("A child selectable element must contain a value or list of values: " + selectorConfig.key)
        }

        //get the match check function
        //handle cases of potential multiple target values and multiple select parents
        let valueMatch;
        if(inputParentElement.isMultiselect) {
            if(targetIsMultichoice) {
                valueMatch = parentValue => containsCommonValue(target,parentValue);
            }
            else {
                valueMatch = parentValue => (parentValue.indexOf(target) >= 0);
            }
        }
        else {
            if(targetIsMultichoice) {
                valueMatch = parentValue => (target.indexOf(parentValue) >= 0);
            }
            else {
                valueMatch = parentValue => (parentValue == target);
            }
        }
        
        //this is the function that will do the test at compare time
        return (childElement,parentElement) => {
            let match = valueMatch(parentElement.getValue());
            if(action == ConfigurablePanelConstants.SELECTOR_ACTION_VALUE) {
                if(childElement.getValue() !== match) {
                    childElement.setValue(match);
                }
            }
            else {
                let state; 
                if(match) {
                    state = ConfigurablePanelConstants.STATE_NORMAL;
                }
                else {
                    state = ConfigurablePanelConstants.SELECTOR_FALSE_STATE[action];
                }
                if(childElement.getState() != state) {
                    childElement.setState(state);
                }
            }
        }
    }

    /** This function adds a callback that came from config element initialization */
    _addDependentCallback(onValueChange) {
        if(!this.dependentCallbacks) {
            this._initForDependents();
        }
        this.dependentCallbacks.push(onValueChange);

        //call now to initialize state
        try {
            onValueChange();
        }
        catch(error) {
            let errorMsg = "Error calling selector: " + error.message ? error.message : error ? error.toString() : "Unknown";
            console.error(errorMsg);
            if(error.stack) console.error(error.stack);
            this.setElementErrorMsg(errorMsg);
        }
    }

    /** This function calls all the onValueChange callbacks for dependent elements. */
    _callDependentCallbacks() {
        if(this.dependentCallbacks) {
            try {
                this.dependentCallbacks.forEach( onValueChange => onValueChange() );
            }
            catch(error) {
                let errorMsg = "Error calling selector: " + error.message ? error.message : error ? error.toString() : "Unknown";
                console.error(errorMsg);
                if(error.stack) console.error(error.stack);
                this.setElementErrorMsg(errorMsg)
            }
        }
    }

    _initForDependents() {
        this.dependentCallbacks = [];
        this.addOnChange( (value,form) => this._callDependentCallbacks() );
    }
            
}

ConfigurableElement.CONTAINER_CLASS = "apogee_configurablePanelLine";

ConfigurableElement.ELEMENT_MARGIN_STANDARD = "0px";
ConfigurableElement.ELEMENT_MARGIN_NONE = "0px";
ConfigurableElement.ELEMENT_PADDING_STANDARD = "4px";
ConfigurableElement.ELEMENT_PADDING_NONE = "0px";
ConfigurableElement.ELEMENT_DISPLAY_FULL_LINE = "block";
ConfigurableElement.ELEMENT_DISPLAY_PARTIAL_LINE = "inline-block";
ConfigurableElement.ELEMENT_DISPLAY_INVISIBLE = "none";

//================
//Other functions
//================

/**This function checks if the two array share any common values. */
function containsCommonValue(array1,array2) {
    return array1.some( value => (array2.indexOf(value) >= 0) );
}

//---------------------
// Value Code Generation functions
//---------------------

function getExpressionChoiceType(containerValue,meta) {
    if(!containerValue) throw new Expression("Error in choice expression. Not in a valid parent object.")
    if(!meta.expressionChoiceKey) throw new Error("Meta expressionChoiceKey entry missing");

    let expressionType;
    if(meta.expressionChoiceMap) {
        let expressionInput = containerValue[meta.expressionChoiceKey];
        expressionType = meta.expressionChoiceMap[expressionInput];
    }
    else {
        expressionType = containerValue[meta.expressionChoiceKey];
    }
    if(!expressionType) throw new Error("Expression choice not found for key for: " + meta.expressionChoiceKey);
    
    return expressionType;
}

/** This loads to the function body a form element value for a simple JSON literal value. */
function getSimpleValueEntry(value) {
    return JSON.stringify(value)
}

function getStringifiedValueEntry(value) {
    return value
}

/** This loads a value to the function body for a javascript expression. */
function getSimpleExpressionEntry(value) {
    //this shouldn't happen, the input should be a string
    if(value === null) return null

    let trimmedValue = value.toString().trim();
    if(trimmedValue === "") return null
    
    return trimmedValue
}

/** This laods a value to the function body for a reference expression. This means the value should be
 * then name of a variable, such as a member name por a member name dot one of its fields.
 */
function getReferenceExpressionEntry(value) {
    //this shouldn't happen, the input should be a string
    if(value === null) return false;

    let trimmedValue = value.toString().trim();
    if(trimmedValue === "") return false;

    if(!isValidQualifiedVariableName(trimmedValue)) {
        throw new Error("The following is not a valid reference: " + trimmedValue + " (Required: a valid variable name, dots allowed)");
    }

    //from here it is the same as a simple expression
    return getSimpleExpressionEntry(trimmedValue);

}

function getFunctionExpression(functionBody,argList) {
    //this shouldn't happen, the input should be a string
    if(!functionBody) functionBody = "";
    if(!argList) argList = "";
    
    return `function(${argList}){\n${functionBody}\n}`
}

/** This test a general qualified variable name. There is no provision for excluded member names. 
 * @private */
const QUALFIED_NAME_PATTERN = /([a-zA-Z_$][0-9a-zA-Z_$]*)+(\.+[a-zA-Z_$][0-9a-zA-Z_$]*)*/;

function isValidQualifiedVariableName(variableName) {
    let nameResult = QUALFIED_NAME_PATTERN.exec(variableName);
    return ((nameResult)&&(nameResult[0] == variableName));
}

