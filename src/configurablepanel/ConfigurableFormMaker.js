
export default class ConfigurableFormMaker {
    constructor() {
        this.formMakerLayout = null
        this.formCustomProcessingMap = null;
    }   

    initFormMaker(configurableElementClassMap) {
        this.formMakerLayout = this.createMakerFormLayout(configurableElementClassMap);

        let customProcessingMap = {};
        for(let elementType in configurableElementClassMap) {
            let elementClass = configurableElementClassMap[elementType];
            if(elementClass.makerCustomProcessing) {
                customProcessingMap[elementType] = elementClass.makerCustomProcessing;
            }
        }
        this.formCustomProcessingMap = customProcessingMap;
    }

    getFormMakerLayout() {
        return this.formMakerLayout;
    }

    getOutputFormLayout(formResult) {
        return formResult.map(elementResult => this.getElementLayout(elementResult.value));
    }

    //==============================
    // Internal Functions
    //==============================


    createMakerFormLayout(configurableElementClassMap) {

        //first create the javascript objects for the child panel and list
        //these will be embedded in the top level layout
        let childPanelElementsLayout = {
            type: "list",
            key: "formData",
            entryTypes: []
        }
        let childListElementsLayout = {
            type: "list",
            label: "List Entry Elements: ",
            key: "entryTypes",
            entryTypes: []
        }
        let listLayoutAddition = [
            {
                type: "htmlDisplay",
                html: "<hr style='border-top: 1px dashed darkgray'>"
            },
            {
                type: "textField",
                label: "List Entry Button Text: ",
                key: "_listButtonText"
            }
        ];
            
        for(let elementType in configurableElementClassMap) {
            let elementInfo = configurableElementClassMap[elementType].FORM_INFO;
            
            if(elementInfo) {
                //update the panel element list
                let panelLayoutListEntry = {};
                panelLayoutListEntry.label = elementInfo.label;
                let panelLayout = this.getMakerLayout(elementInfo,childPanelElementsLayout,childListElementsLayout);
                panelLayoutListEntry.layout = {
                    type: "panel",
                    formData: panelLayout,
                    key: elementInfo.type
                }
                childPanelElementsLayout.entryTypes.push(panelLayoutListEntry);
            
                //update the list element list
                let listLayoutListEntry = {};
                listLayoutListEntry.label = elementInfo.label;
                let listPanelLayout = this.getMakerLayout(elementInfo,childPanelElementsLayout,childListElementsLayout);
                let modifiedListPanelLayout = listPanelLayout.concat(listLayoutAddition);
                listLayoutListEntry.layout = {
                    type: "panel",
                    formData: modifiedListPanelLayout,
                    key: elementInfo.type
                }
                childListElementsLayout.entryTypes.push(listLayoutListEntry);
            }
        }

        //create the layout for the top level panel
        let topLevelFormInfo = configurableElementClassMap["panel"].TOP_LEVEL_FORM_INFO;
        return this.getMakerLayout(topLevelFormInfo,childPanelElementsLayout,childListElementsLayout);
    }

    getMakerLayout(elementInfo,childPanelElementsLayout,childListElementsLayout) {
        let layout = [];

        //type field - always
        layout.push({
            type: "invisible",
            value: elementInfo.type,
            key: "type"
        });
            
        //heading
        layout.push({
            type: "heading",
            text: elementInfo.label
        });

        //label
        if(elementInfo.makerFlags.indexOf("hasLabel") >= 0) {
            layout.push(LABEL_ELEMENT_CONFIG);
        }

        //entries
        if(elementInfo.makerFlags.indexOf("hasEntries") >= 0) {
            layout.push(ENTRIES_ELEMENTS_CONFIG);
        }

        //element specific layout
        if(elementInfo.customLayout) {
            layout.push(...elementInfo.customLayout);
        }

        //children - this makes a form data entry or, formatted for a panel or list
        if(elementInfo.makerFlags.indexOf("hasChildren") >= 0) {
            layout.push(childPanelElementsLayout);
        }
        else if(elementInfo.makerFlags.indexOf("hasList") >= 0) {
            layout.push(childListElementsLayout)
        }

        //value - string format
        if(elementInfo.makerFlags.indexOf("valueString") >= 0) {
            layout.push(VALUE_STRING_ELEMENT_CONFIG);
        }

        //value - json literal format
        if(elementInfo.makerFlags.indexOf("valueJson") >= 0) {
            layout.push(VALUE_JSON_ELEMENT_CONFIG);
        }

        //value - string or json literal format
        if(elementInfo.makerFlags.indexOf("valueStringOrJson") >= 0) {
            layout.push(VALUE_EITHER_ELEMENT_CONFIG);
        }

        //value - boolean format
        if(elementInfo.makerFlags.indexOf("valueBoolean") >= 0) {
            layout.push(VALUE_BOOLEAN_ELEMENT_CONFIG);
        }

        //key
        if(elementInfo.makerFlags.indexOf("hasKey") >= 0) {
            layout.push(KEY_ELEMENT_CONFIG);
        }
            
        //additional options
        let hasHint = (elementInfo.makerFlags.indexOf("hasHint") >= 0);
        let hasHelp = (elementInfo.makerFlags.indexOf("hasHelp") >= 0);
        let hasSelector = (elementInfo.makerFlags.indexOf("hasSelector") >= 0);

        if((hasHint)||(hasHelp)||(hasSelector)) {
            let additionalOptionsElement = {
                type: "showHideLayout",
                heading: "More Options",
                closed: true,
                formData: []
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

            layout.push(additionalOptionsElement);
        }
            
        return layout;
    }

    getElementLayout(elementFormResult) {

        let customLayoutProcessing = this.formCustomProcessingMap[elementFormResult.type];

        //make a copy - we wil modify it
        //I want to change this to just do a copy line by line
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
        if(elementFormResult.entries !== undefined) {
            if(elementFormResult.entries !== "") {
                elementConfig.entries = JSON.parse(elementFormResult.entries);
            }
        }

        //----------
        //process values
        //----------
        if(elementFormResult.valueJson !== undefined) {
            if(elementFormResult.valueJson !== "") {
                elementConfig.value = JSON.parse(elementFormResult.valueJson);
            }
        }
        if(elementFormResult.valueString !== undefined) {
            if(elementFormResult.valueString !== "") {
                elementConfig.value = elementFormResult.valueString;
            }
        }
        if(elementFormResult.valueStringOrJson !== undefined) {
            if(elementFormResult.valueType == "string") {
                elementConfig.value = elementFormResult.valueStringOrJson;
            }
            else if(elementFormResult.valueType == "json") {
                elementConfig.value = JSON.parse(elementFormResult.valueStringOrJson);
            }
        }
        if(elementFormResult.valueBoolean !== undefined) {
            if(elementFormResult.valueBoolean !== null) {
                elementConfig.value = elementFormResult.valueBoolean;
            }
        }

        //-------------------
        //child data
        //-------------------
        if(elementFormResult.formData) {
            elementConfig.formData = elementFormResult.formData.map(elementInfo => this.getElementLayout(elementInfo.value));
        }
        if(elementFormResult.entryTypes) {
            elementConfig.entryTypes = elementFormResult.entryTypes.map(elementInfo => {
                let entryType = {};
                if(elementInfo.value.label) entryType.label = elementInfo.value._listButtonText;
                entryType.layout = this.getElementLayout(elementInfo.value);
                return entryType;
            });
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
            else if(selectorInput.valueType == "literal") {
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
                else if(selectorInput.valuePanel.valueType == "literal") {
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
            customLayoutProcessing(elementFormResult,elementConfig);
        }

        //console.log(JSON.stringify(elementConfig,null,"\t"));

        return elementConfig;
    }
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
	type: "textField",
	label: "Entries: ",
	key: "entries",
	hint: "optional, array of values (use quotes on strings)"
}

const VALUE_STRING_ELEMENT_CONFIG = {
	type: "textField",
	label: "Initial Value: ",
	key: "valueString",
	hint: "optional, text"
}
			
const VALUE_JSON_ELEMENT_CONFIG = {
	type: "textField",
	label: "Initial Value: ",
	key: "valueJson",
	hint: "optional, JSON literal - Number, boolean, quoted string, JSON array..."
}
			
const VALUE_EITHER_ELEMENT_CONFIG = {
	type: "horizontalLayout",
	formData: [
		{
			type: "textField",
			label: "Initial Value: ",
			key: "valueStringOrJson"
		},
		{
			type: "radioButtonGroup",
			label: "Value Type: ",
			entries: [["String","string"],["JSON literal - Number, boolean, quoted string, JSON array...","json"]],
			key: "valueType",
			hint: "optional"
		}
	]
}
			
const VALUE_BOOLEAN_ELEMENT_CONFIG = {
	type: "radioButtonGroup",
	label: "Initial Value: ",
	entries: [["true",true],["false",false],["Not Set",null]],
	key: "booleanValue",
    hint: "optional"
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
						key: "parentValue",
						selector: {
							parentKey: "valueType",
							parentValues: ["string","literal"]
						}
					},
					{
						type: "radioButtonGroup",
						label: "Value Type: ",
						entries: [["String","string"],["Literal - Number, Boolean, null","literal"]],
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
						entries: [["String","string"],["Literal - Number, Boolean, null","literal"],["Multiple Values - Enter an array of literals or quoted strings","multi"]],
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
							parentValues: ["string","literal"]
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
