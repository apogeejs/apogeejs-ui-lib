import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";

export default class ConfigurableFormDesigner {
    constructor(designerElementInfoArray,topLevelFormInfo) {
        this.cachedLayouts = {};
        this.designerElementInfoArray = designerElementInfoArray;
        this.topLevelFormInfo = topLevelFormInfo;

        let customProcessingMap = {};
        if(designerElementInfoArray) {
            designerElementInfoArray.forEach(designerElementInfo => {
                if((designerElementInfo.designerCustomProcessing)&&(designerElementInfo.formInfo.uniqueKey)) {
                    customProcessingMap[designerElementInfo.formInfo.uniqueKey] = designerElementInfo.designerCustomProcessing;
                }
            })
        }
        this.formCustomProcessingMap = customProcessingMap;
    }

    getFormDesignerLayout(flags) {
        let flagsString = this.getFlagsString(flags);
        let layout = this.cachedLayouts[flagsString];
        if(!layout) {
            layout = this.createDesignerFormLayout(flags);
            this.cachedLayouts[flagsString] = layout;
        }
        return layout;
    }

    getOutputFormLayout(formResult) {
        let layout = [];
        if(formResult.formData) {
            let bodyLayout = formResult.formData.map(elementResult => this.getElementLayout(elementResult.value));
            layout = layout.concat(bodyLayout);
        }
        if(formResult.submit) {
            layout.push(formResult.submit);
        }
        return layout;
    }

    //==============================
    // Internal Functions
    //==============================

    /** This method checks if the designer element info meets the options for the input flags. */
    getFlagsValid(designerElementInfo,flags) {
        if(!designerElementInfo.flags) return true;

        for(let key in designerElementInfo.flags) {
            let keyValue = designerElementInfo.flags[key];
            let targetValue = flags[key];
            //the key value is either a single value or an array
            if(Array.isArray(keyValue)) {
                //flag must equal one of the designer element values
                if(keyValue.indexOf(targetValue) < 0) return false;
            }
            else {
                //flag value must equal designer element value
                if(keyValue != targetValue) return false;
            }
        }
        return true;
    }

    getFlagsString(flags) {
        return JSON.stringify(apogeeutil.getNormalizedObjectCopy(flags));
    }

    /** This function configures a layout for the form designer, depending on the input option flags
     * This value is recursive, meaning the collection layouts contain children which include
     * themselves. As such, the value will cause a stack overflow if you try to convert it to a JSON or extended JSON. */
    createDesignerFormLayout(flags) {

        //The top level of a form is a panel. It can have a number of child elements in it.
        //These chid elements include "parents", which are elements that can have child elements,
        //such as the panel or the list (or the layout elements).

        //This is a list of info on each element, including the form designer layout of this element when it appears 
        //in a collection, such as the panel.
        let elementLayoutInfoList = [];

        //This is a list of info for each parent object
        let parentLayoutInfoList = [];

        //this is the returned layout for the top level form
        let topLevelLayout;

        try {
            
            //process each configurable element (FUTURE - allow multiple form designer entries for a single element, such as 
            //a simple list and a flexible list)
            this.designerElementInfoArray.forEach(designerElementInfo => {
                //verify some required elements
                let missingElements = [];
                if(!designerElementInfo) {
                    console.error("Form designer error: Designer Element Info missing!");
                    return;
                }
                if(!designerElementInfo.category) missingElements.push("category");
                if(!designerElementInfo.formInfo) missingElements.push("formInfo");
                if((designerElementInfo.category == "collection")||(designerElementInfo.category == "layout")) {
                    if(!designerElementInfo.completeChildListLayout) {
                        missingElements.push(completeChildListLayout);
                    }
                }
                if(missingElements.length > 0) {
                    console.error("Missing required elements for form designer element: " + missingElements.join(", ") + "; " + JSON.stringify(designerElementInfo));
                    return;
                }   

                //create the form designer element layouts - first filtering them based on flags
                if(this.getFlagsValid(designerElementInfo,flags)) {

                    //this is the layout of an element as it appears in the form designer
                    let elementLayout = this.getDesignerElementLayout(designerElementInfo.formInfo,flags);

                    if(designerElementInfo.isTopLevelLayout) {
                        topLevelLayout = elementLayout;
                    }
                    else {
                        elementLayoutInfoList.push({
                            designerElementInfo: designerElementInfo,
                            elementLayout: elementLayout
                        });
                    }

                    //save any parent elements, for additional processing
                    if((designerElementInfo.category == "collection")||(designerElementInfo.category == "layout")) {
                        parentLayoutInfoList.push({
                            designerElementInfo:designerElementInfo,
                            parentLayout: elementLayout
                        })
                    }
                }
            })

            //for each collection, complete its list of child elements, converting the layouts as needed
            parentLayoutInfoList.forEach(parentLayoutInfo => {
                parentLayoutInfo.designerElementInfo.completeChildListLayout(parentLayoutInfo.parentLayout,elementLayoutInfoList);
            })

        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            return [this.getErrorElementLayout("Form Designer Error: " + error.toString())];
        }

        if(topLevelLayout) {
            return topLevelLayout;
        }
        else {
            return [this.getErrorElementLayout("Error loading form designer")];
        }
    }

    /** This returns a form layout that displays an error message. */
    getErrorElementLayout(msg) {
        return {
            type: "htmlDisplay",
            html: '<span style="color: red;">' + msg + '</span>'
        }
    }

    /** This method returns the form layout for this element as it will appear in the designer as a child in a collection. */
    getDesignerElementLayout(formInfo,flags) {
        let layout = [];

        try {

            let allowInputExpresssions = flags.inputExpressions ? true : false;

            //store the element tpe
            layout.push({
                type: "invisible",
                value: formInfo.uniqueKey,
                key: "uniqueKey"
            });

            //type field - always
            layout.push({
                type: "invisible",
                value: formInfo.type,
                key: "type"
            });
                
            // //heading
            // layout.push({
            //     type: "heading",
            //     text: formInfo.label
            // });
            //heading alternative
            //element label
            let mainShowHide = {
                type: "showHideLayout",
                heading: formInfo.label,
                closed: false,
                formData: []
            };
            let elementMainContent = mainShowHide.formData;
            layout.push(mainShowHide);

            //label
            if(formInfo.designerFlags.indexOf("hasLabel") >= 0) {
                elementMainContent.push(LABEL_ELEMENT_CONFIG);
            }

            //entries
            if(formInfo.designerFlags.indexOf("hasEntries") >= 0) {
                if(allowInputExpresssions) {
                    elementMainContent.push(COMPILED_ENTRIES_ELEMENTS_CONFIG);
                }
                else {
                    elementMainContent.push(ENTRIES_ELEMENTS_CONFIG);
                }
            }

            //element specific layout
            if(formInfo.customLayout) {
                elementMainContent.push(...formInfo.customLayout);
            }

            //children - add the child list if we have one for this element (for collections only)
            if(formInfo.childLayoutTemplate) {
                elementMainContent.push(apogeeutil._.cloneDeep(formInfo.childLayoutTemplate));
            }

            //value - string format
            if(formInfo.designerFlags.indexOf("valueString") >= 0) {
                if(allowInputExpresssions) {
                    elementMainContent.push(COMPILED_VALUE_STRING_ELEMENT_CONFIG);
                }
                else {
                    elementMainContent.push(VALUE_STRING_ELEMENT_CONFIG);
                }
            }

            //value - json literal format
            if(formInfo.designerFlags.indexOf("valueJson") >= 0) {
                if(allowInputExpresssions) {
                    elementMainContent.push(COMPILED_VALUE_JSON_ELEMENT_CONFIG);
                }
                else {
                    elementMainContent.push(VALUE_JSON_ELEMENT_CONFIG);
                }
            }

            //value - string or json literal format
            if(formInfo.designerFlags.indexOf("valueStringOrJson") >= 0) {
                if(allowInputExpresssions) {
                    elementMainContent.push(COMPILED_VALUE_EITHER_ELEMENT_CONFIG);
                }
                else {
                    elementMainContent.push(VALUE_EITHER_ELEMENT_CONFIG);
                }
            }

            //value - boolean format
            if(formInfo.designerFlags.indexOf("valueBoolean") >= 0) {
                if(allowInputExpresssions) {
                    elementMainContent.push(COMPILED_VALUE_BOOLEAN_ELEMENT_CONFIG);
                }
                else {
                    elementMainContent.push(VALUE_BOOLEAN_ELEMENT_CONFIG);
                }
            }

            //value - array format
            if(formInfo.designerFlags.indexOf("valueArray") >= 0) {
                if(allowInputExpresssions) {
                    elementMainContent.push(COMPILED_VALUE_ARRAY_ELEMENT_CONFIG);
                }
                else {
                    elementMainContent.push(VALUE_ARRAY_ELEMENT_CONFIG);
                }
            }
                
            //additional options
            let hasHint = (formInfo.designerFlags.indexOf("hasHint") >= 0);
            let hasHelp = (formInfo.designerFlags.indexOf("hasHelp") >= 0);
            let hasSelector = (formInfo.designerFlags.indexOf("hasSelector") >= 0);
            let hasOptionsCustomLayout = (formInfo.optionsCustomLayout !== undefined);

            if((hasHint)||(hasHelp)||(hasSelector)||(hasOptionsCustomLayout)) {
                let additionalOptionsElement = {
                    type: "showHideLayout",
                    heading: "More Options",
                    closed: true,
                    formData: []
                }
                if(hasOptionsCustomLayout) {
                    additionalOptionsElement.formData.push(...formInfo.optionsCustomLayout);
                }
                if(hasHint) {
                    additionalOptionsElement.formData.push(HINT_ELEMENT_CONFIG);
                }
                if(hasHelp) {
                    additionalOptionsElement.formData.push(HELP_ELEMENT_CONFIG);
                }
                if(hasSelector) {
                    additionalOptionsElement.formData.push(...SELECTOR_ELEMENT_CONFIG_LIST);
                }

                elementMainContent.push(additionalOptionsElement);
            }

            if(formInfo.designerFlags.indexOf("hasSubmit") >= 0) {
                elementMainContent.push(SUBMIT_DESIGNER_LAYOUT);
            }

            //key
            if(formInfo.designerFlags.indexOf("hasKey") >= 0) {
                layout.push(KEY_ELEMENT_CONFIG);
            }
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            let errorLayout = this.getErrorElementLayout("Error making element: " + error.toString());
            layout.push(errorLayout);
        }
            
        return layout;
    }

    getElementLayout(elementFormResult) {

        try {

            let customLayoutProcessing = this.formCustomProcessingMap[elementFormResult.uniqueKey];

            //make a copy - we wil modify it
            let elementConfig = {};

            if(elementFormResult.type) {
                if(elementFormResult.type !== "") {
                    elementConfig.type = elementFormResult.type;
                }
            }
            if(elementFormResult.label) {
                if(elementFormResult.label !== "") {
                    elementConfig.label = elementFormResult.label;
                }
            }

            //---------------
            //process entries
            //---------------

            if(elementFormResult.entriesList !== undefined) {
                elementConfig.entries = elementFormResult.entriesList.map(entry => {
                    let value;
                    let valueEntry;
                    if(entry.valueType == "json") {
                        value = JSON.parse(entry.valueMixed);
                    }
                    else {
                        //entryType string or reference
                        value = entry.valueMixed;
                    }
                    if(entry.displayLabel) {
                        valueEntry = [entry.displayLabel,value];
                    }
                    else {
                        valueEntry = value;
                    }
                    return valueEntry;
                })
            }
            
            if(elementFormResult.entries !== undefined) {
                if(elementFormResult.entries !== "") {
                    elementConfig.entries = elementFormResult.entries;
                }
                else {
                    //set to an empty entry list by default
                    elementConfig.entries = [];
                }
            }

            //----------
            //process values
            //----------
            if(elementFormResult.valueStringified !== undefined) {
                if(elementFormResult.valueStringified !== "") {
                    elementConfig.value = JSON.parse(elementFormResult.valueStringified);
                }
            }
            if(elementFormResult.value !== undefined) {
                if(elementFormResult.value !== "") {
                    elementConfig.value = elementFormResult.value;
                }
            }
            if(elementFormResult.valueAlt !== undefined) {
                if(elementFormResult.valueAlt !== "") {
                    elementConfig.value = elementFormResult.valueAlt;
                }
            }
            if(elementFormResult.valueMixed !== undefined) {
                if((elementFormResult.valueType == "string")||(elementFormResult.valueType == "expressionReference")) {
                    elementConfig.value = elementFormResult.valueMixed;
                }
                else if(elementFormResult.valueType == "json") {
                    elementConfig.value = JSON.parse(elementFormResult.valueMixed);
                }
            }
            if(elementFormResult.valueArray !== undefined) {
                elementConfig.value = elementFormResult.valueArray.map(entry => {
                    if((entry.valueType == "string")||(entry.valueType == "expressionReference")) {
                        return entry.valueMixed;
                    }
                    else if(entry.valueType == "json") {
                        return JSON.parse(entry.valueMixed);
                    }
                })
                
            }

            //-------------------
            //child data (panel-like entries handled here)
            //-------------------
            if(elementFormResult.formData) {
                elementConfig.formData = elementFormResult.formData.map(formInfo => this.getElementLayout(formInfo.value));
            }

            //-------------------
            //other simple values
            //-------------------
            if(elementFormResult.key) {
                if(elementFormResult.key !== "") {
                    elementConfig.key = elementFormResult.key;
                }
            }
            if(elementFormResult.hint) {
                if(elementFormResult.hint !== "") {
                    elementConfig.hint = elementFormResult.hint;
                }
            }
            if(elementFormResult.help) {
                if(elementFormResult.help !== "") {
                    elementConfig.help = elementFormResult.help;
                }
            }

            //--------------------
            //process the selector
            //--------------------

            if(elementFormResult.simpleSelector) {
                let selectorInput = elementFormResult.simpleSelector;
                let selectorOutput = {};
                selectorOutput.parentKey = selectorInput.parentKey;
                
                if(selectorInput.valueType == "string") {
                    selectorOutput.parentValue = selectorInput.parentValue;
                }
                else if(selectorInput.valueType == "json") {
                    selectorOutput.parentValue = JSON.parse(selectorInput.parentValue);
                }
                else {
                    throw new Error("Unknown selector value type: " + selectorInput.valueType);
                }
                
                elementConfig.selector = selectorOutput;
            }
            else if(elementFormResult.advancedSelector) {
                let selectorInput = elementConfig.advancedSelector;
                let selectorOutput = {};
                
                if(selectorInput.keyType == "relative") {
                    selectorOutput.parentKey = selectorInput.parentKey;
                }
                else if(selectorInput.keyType == "absolute") {
                    selectorOutput.parentKey = JSON.parse(selectorInput.parentKey);
                }
                else if(selectorInput.keyType == "multi") {
                    selectorOutput.parentKeys = JSON.parse(selectorInput.parentKeys);
                }
                else {
                    throw new Error("Unknown selector parent key type: " + selectorInput.keyType);
                }
                
                if(selectorInput.action == "custom") {
                    //create the function
                    let args = selectorInput.argList;
                    let body = selectorInput.actionFunction;
                    selectorOutput.actionFunction = new Function(args,body);
                }
                else {
                    
                    if(!selectorInput.valuePanel) {
                        throw new Error("Missing values from form input!");
                    }
                    
                    if(selectorInput.valuePanel.valueType == "string") {
                        selectorOutput.parentValue = selectorInput.valuePanel.parentValue;
                    }
                    else if(selectorInput.valuePanel.valueType == "json") {
                        selectorOutput.parentValue = JSON.parse(selectorInput.valuePanel.parentValue);
                    }
                    else if(selectorInput.valuePanel.valueType == "multi") {
                        selectorOutput.parentValues = JSON.parse(selectorInput.valuePanel.parentValues);   
                    }
                    delete selectorInput.valuePanel;
                    
                    selectorOutput.action = selectorInput.action;
                }
                
                elementConfig.selector = selectorOutput;
            }

            //-----------------
            //custom processing
            //-----------------
            if(customLayoutProcessing) {
                customLayoutProcessing(elementFormResult,elementConfig,this);
            }

            return elementConfig;
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            return this.getErrorElementLayout("Error making element: " + error.toString());
        }
    }
}

/** This is the added layout if there has a submit button. */
const SUBMIT_DESIGNER_LAYOUT = {
    "type": "panel",
    "formData": [
        {
            "type": "htmlDisplay",
            "html": "<hr style='border-top: 1px solid rgba(0,0,0,.4);'>"
        },
        {
            "type": "heading",
            "text": "Submit"
        },
        {
            "type": "invisible",
            "value": "submit",
            "key": "type"
        },
        {
            "type": "horizontalLayout",
            "formData": [
                {
                    "type": "checkbox",
                    "label": "Submit Button:",
                    "value": true,
                    "key": "useSubmit"
                },
                {
                    "type": "textField",
                    "label": "Text: ",
                    "value": "OK",
                    "key": "submitLabel",
                    "selector": {
                        "parentKey": "useSubmit",
                        "parentValue": true
                    }
                }
            ]
        },
        {
            "type": "horizontalLayout",
            "formData": [
                {
                    "type": "checkbox",
                    "label": "Cancel Button: ",
                    "value": false,
                    "key": "useCancel"
                },
                {
                    "type": "textField",
                    "label": "Text: ",
                    "value": "Cancel",
                    "key": "cancelLabel",
                    "selector": {
                        "parentKey": "useCancel",
                        "parentValue": true
                    }
                }
            ]
        }
    ],
    "key": "submit"
}

//layout items to make the form generator layout

const LABEL_ELEMENT_CONFIG = {
    type: "textField",
    label: "Label: ",
    size: 30,
    key: "label",
    hint: "optional"
}

const ENTRIES_ELEMENTS_CONFIG = {
	type: "list",
	label: "Entries: ",
    entryType: {
        label: "Entry",
        layout: {
            type: "panel",
            formData: [
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "textField",
                            label: "Value: ",
                            key: "valueMixed"
                        },
                        {
                            type: "radioButtonGroup",
                            label: "Value Type: ",
                            entries: [["String","string"],["Non-String","json"]],
                            key: "valueType",
                            hint: "optional"
                        }
                    ]
                },
                {
                    type: "textField",
                    label: "Display Label: ",
                    key: "displayLabel",
                    hint: "optional, defaults to value"
                }

            ],
            key: "entry"
        },
        key: "entriesList"
    },
	key: "entriesList",
	hint: "required"
}

const COMPILED_ENTRIES_ELEMENTS_CONFIG = {
    type: "horizontalLayout",
    formData: [
        {
            type: "list",
            label: "Entries: ",
            entryType: {
                label: "Entry",
                layout: {
                    type: "panel",
                    formData: [
                        {
                            type: "horizontalLayout",
                            formData: [
                                {
                                    type: "textField",
                                    label: "Value: ",
                                    key: "valueMixed",
                                    meta: {
                                        expression: "choice",
                                        expressionChoiceKey: "valueType",
                                        expressionChoiceMap: {
                                            "string": "value",
                                            "json": "value",
                                            "expressionReference": "reference"
                                        }
                                    }
                                },
                                {
                                    type: "radioButtonGroup",
                                    label: "Value Type: ",
                                    entries: [["String","string"],["Non-String","json"],["Reference","expressionReference"]],
                                    value: "string",
                                    key: "valueType"
                                }
                            ]
                        },
                        {
                            type: "textField",
                            label: "Display Label: ",
                            key: "displayLabel",
                            hint: "optional, defaults to value"
                        }
        
                    ],
                    key: "entry"
                },
                key: "entriesList"
            },
            key: "entriesList",
            hint: "required",
            selector: {
                parentKey: "entriesType",
                parentValue: "value"
            }
        },
        {
            type: "textField",
            label: "Entries: ",
            size: 50,
            key: "entries",
            selector: {
                parentKey: "entriesType",
                parentValue: "reference"
            },
            meta: {
                expression: "reference",
            }
        },
        {
            type: "radioButtonGroup",
            entries: [["Value","value"],["Reference","reference"]],
            value: "value",
            key: "entriesType"
        }
    ]
}


const VALUE_STRING_ELEMENT_CONFIG = {
	type: "textField",
	label: "Initial Value: ",
	key: "value",
	hint: "optional, text"
}

const COMPILED_VALUE_STRING_ELEMENT_CONFIG = {
    type: "horizontalLayout",
    formData: [
        {
        	type: "textField",
        	label: "Initial Value: ",
        	key: "value",
        	hint: "optional, text",
        	meta: {
                expression: "choice",
                expressionChoiceKey: "expressionType",
            }
        },
        {
            type: "radioButtonGroup",
            entries: [["Value","value"],["Reference","reference"]],
            value: "value",
            key: "expressionType"
        }
    ]
}
			
const VALUE_JSON_ELEMENT_CONFIG = {
	type: "textField",
	label: "Initial Value: ",
	key: "valueStringified",
	hint: "optional"
}
			
const COMPILED_VALUE_JSON_ELEMENT_CONFIG = {
    type: "horizontalLayout",
    formData: [
        {
        	type: "textField",
        	label: "Initial Value: ",
        	key: "valueStringified",
        	hint: "optional",
        	meta: {
                expression: "choice",
                expressionChoiceKey: "expressionType",
            }
        },
        {
            type: "radioButtonGroup",
            entries: [["Value","value"],["Reference","reference"]],
            value: "value",
            key: "expressionType"
        }
    ]
}
			
const VALUE_EITHER_ELEMENT_CONFIG = {
	type: "horizontalLayout",
	formData: [
		{
			type: "textField",
			label: "Initial Value: ",
			key: "valueMixed"
		},
		{
			type: "radioButtonGroup",
			label: "Value Type: ",
			entries: [["String","string"],["Non-String","json"]],
			key: "valueType",
			hint: "optional"
		}
	]
}

const COMPILED_VALUE_EITHER_ELEMENT_CONFIG = {
	type: "horizontalLayout",
	formData: [
		{
			type: "textField",
			label: "Initial Value: ",
			key: "valueMixed",
			meta: {
                expression: "choice",
                expressionChoiceKey: "valueType",
                expressionChoiceMap: {
                    "string": "value",
                    "json": "value",
                    "expressionReference": "reference"
                }
            }
		},
		{
			type: "radioButtonGroup",
			label: "Value Type: ",
			entries: [["String","string"],["Non-String","json"],["Reference","expressionReference"]],
			value: "string",
            key: "valueType",
			hint: "optional"
		}
	]
}
			
const VALUE_BOOLEAN_ELEMENT_CONFIG = {
	type: "radioButtonGroup",
	label: "Initial Value: ",
	entries: [["true",true],["false",false],["Not Set",null]],
	key: "value",
    hint: "optional"
}

const COMPILED_VALUE_BOOLEAN_ELEMENT_CONFIG = {
    type: "horizontalLayout",
    formData: [
        {
            type: "radioButtonGroup",
        	label: "Initial Value: ",
        	entries: [["true",true],["false",false],["Not Set",null]],
        	key: "value",
            hint: "optional",
            selector: {
                parentKey: "entriesType",
                parentValue: "value"
            }
        },
        {
            type: "textField",
            label: "Initial Value: ",
            size: 50,
            key: "valueAlt",
            selector: {
                parentKey: "entriesType",
                parentValue: "reference"
            },
            meta: {
                expression: "reference",
            }
        },
        {
            type: "radioButtonGroup",
            entries: [["Value","value"],["Reference","reference"]],
            value: "value",
            key: "entriesType"
        }
    ]
}


const VALUE_ARRAY_ELEMENT_CONFIG = {
	type: "list",
	label: "Initial Array Value: ",
    entryType: {
        label: "Entry",
        layout: {
            type: "panel",
            formData: [
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "textField",
                            label: "Value: ",
                            key: "valueMixed"
                        },
                        {
                            type: "radioButtonGroup",
                            label: "Value Type: ",
                            entries: [["String","string"],["Non-String","json"]],
                            key: "valueType",
                            hint: "optional"
                        }
                    ]
                }
            ],
            key: "entry"
        },
        key: "valueArray"
    },
	key: "valueArray",
	hint: "optional"
}

const COMPILED_VALUE_ARRAY_ELEMENT_CONFIG = {
    type: "horizontalLayout",
    formData: [
        {
            type: "list",
            label: "Initial Array Value: ",
            entryType: {
                label: "Entry",
                layout: {
                    type: "panel",
                    formData: [
                        {
                            type: "horizontalLayout",
                            formData: [
                                {
                                    type: "textField",
                                    label: "Value: ",
                                    key: "valueMixed",
                                    meta: {
                                        expression: "choice",
                                        expressionChoiceKey: "valueType",
                                        expressionChoiceMap: {
                                            "string": "value",
                                            "json": "value",
                                            "expressionReference": "reference"
                                        }
                                    }
                                },
                                {
                                    type: "radioButtonGroup",
                                    label: "Value Type: ",
                                    entries: [["String","string"],["Non-String","json"],["Reference","expressionReference"]],
                                    value: "string",
                                    key: "valueType"
                                }
                            ]
                        }       
                    ],
                    key: "entry"
                },
                key: "valueArray"
            },
            key: "valueArray",
            hint: "optional",
            selector: {
                parentKey: "valueType",
                parentValue: "value"
            }
        },
        {
            type: "textField",
            label: "Initial Value Array: ",
            size: 50,
            key: "value",
            hint: "optional",
            selector: {
                parentKey: "valueType",
                parentValue: "reference"
            },
            meta: {
                expression: "reference",
            }
        },
        {
            type: "radioButtonGroup",
            entries: [["Value","value"],["Reference","reference"]],
            value: "value",
            key: "valueType"
        }
    ]
}

const KEY_ELEMENT_CONFIG = {
	type: "textField",
	label: "Key: ",
	size: 30,
	key: "key",
	hint: "required"
}

const HINT_ELEMENT_CONFIG = {
	type: "textField",
	label: "Hint: ",
	size: 40,
	key: "hint",
    hint: "optional"
}

const HELP_ELEMENT_CONFIG = {
	type: "textarea",
	label: "Help: ",
	cols: 50,
	rows: 5,
	key: "help",
    hint: "optional"
}
	
const SELECTOR_ELEMENT_CONFIG_LIST = [
	{
		type: "radioButtonGroup",
		label: "Selector: ",
		entries: [["None","none"],["Simple Selector","simple"],["Advanced Selector","advanced"]],
		value: "none",
		key: "useSelector"
	},
	{
		type: "panel",
		formData: [
			{
				type: "textField",
				label: "Selector Parent Key: ",
				size: 30,
				key: "parentKey",
				hint: "required"
			},
			{
				type: "horizontalLayout",
				formData: [
					{
						type: "textField",
						label: "Selector Parent Value: ",
						size: 30,
						key: "parentValue"
					},
					{
						type: "radioButtonGroup",
						label: "Value Type: ",
						entries: [["String","string"],["Non-String","json"]],
						value: "string",
						key: "valueType",
						hint: "required",
					},

				]
			},
			
		],
		key: "simpleSelector",
		selector: {
			parentKey: "useSelector",
			parentValue: "simple"
		}
	},
	{
		type: "panel",
		formData: [
			//key type
			{
				type: "radioButtonGroup",
				label: "Selector Parent Key Type: ",
				vertical: true,
				entries: [
					["Local Key - Enter the parent key","relative"],
					["Absolute Path - Enter an array of quoted keys","absolute"],
					["Multiple Parents - Enter an array containing the quoted keys (for local keys) and/or arrays of quoted keys (for absolute paths)","multi"]
				],
				value: "relative",
				key: "keyType"
			},
			{
				type: "textField",
				label: "Selector Parent Key: ",
				size: 30,
				key: "parentKey",
				selector: {
					parentKey: "keyType",
					parentValues: ["relative","absolute"]
				},
				hint: "required"
			},
			{
				type: "textField",
				label: "Selector Parent Keys: ",
				size: 60,
				key: "parentKeys",
				selector: {
					parentKey: "keyType",
					parentValue: "multi"
				},
				hint: "required"
			},
			//value type
			{
				type: "panel",
				formData: [
					{
						type: "radioButtonGroup",
						label: "Selector Parent Value Type: ",
						vertical: true,
						entries: [["String","string"],["Non-String","json"],["Multiple Values - Enter an array, use qoutes on strings","multi"]],
						value: "string",
						key: "valueType"
					},
					{
						type: "textField",
						label: "Selector Parent Value: ",
						size: 30,
						key: "parentValue",
						selector: {
							parentKey: "valueType",
							parentValues: ["string","json"]
						},
				        hint: "required"
					},
					{
						type: "textField",
						label: "Selector Parent Values: ",
						size: 60,
						key: "parentValues",
						selector: {
							parentKey: "valueType",
							parentValue: "multi"
						},
				        hint: "required"
					}
				],
				key: "valuePanel",
				selector: {
					parentKey: "action",
					parentValues: ["normalInactive","normalHidden","normalDisabled"]
				}
			},
			{
				type: "dropdown",
				label: "Selector Action: ",
				entries: [
						["Normal / Hidden and Inactive","normalInactive"],
						["Normal / Hidden but Active","normalHidden"],
						["Normal / Disabled","normalDisabled"],
						["Custom Action","custom"]],
				value: "normalInactive",
				key: "action"
			},
			{
				type: "textField",
				label: "Selector Action Arg List: ",
				size: 60,
				key: "argList",
                selector: {
					"parentKey": "action",
					"parentValue": "custom"
				},
				hint: "required",
				help: "The first argument is this child element object. The next arguments are the parent element objects, in order they are specified."
			},
			{
				type: "textarea",
				label: "Selector Action Function: ",
				cols: 80,
				rows: 10,
				key: "actionFunction",
				selector: {
					"parentKey": "action",
					"parentValue": "custom"
				},
				hint: "required",
				help: "This is a function that takes the arg list above and does the desired action on this child element."
			}
			
		],
		key: "advancedSelector",
		selector: {
			parentKey: "useSelector",
			parentValue: "advanced"
		}
	}
]
