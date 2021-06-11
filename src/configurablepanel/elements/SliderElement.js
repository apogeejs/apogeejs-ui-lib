import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import ConfigurableElement from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class SliderElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        let labelElement = this.getLabelElement(elementInitData);
        if(labelElement) {
            containerElement.appendChild(labelElement);
        }
        
        //slider
        this.sliderElement = uiutil.createElement("input",{"type":"range"});
        containerElement.appendChild(this.sliderElement); 

        this.setFocusElement(this.sliderElement);

        this.changeListener = () => {
            this.inputDone();
            this.valueChanged();
        }

        this.sliderElement.addEventListener("change",this.changeListener);

        if(elementInitData.min !== undefined) {
            this.sliderElement.min = elementInitData.min;
        }
        if(elementInitData.max !== undefined) {
            this.sliderElement.max = elementInitData.max;
        }
        if(elementInitData.step !== undefined) {
            this.sliderElement.step = elementInitData.step;
        }

        //hint
        let hintElement = this.getHintElement(elementInitData);
        if(hintElement) {
            containerElement.appendChild(hintElement);
        }

        //help element
        let helpElement = this.getHelpElement(elementInitData);
        if(helpElement) {
            containerElement.appendChild(helpElement);
        }

        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        let stringValue = this.sliderElement.value;
        return parseFloat(stringValue);
    }  
    
    //===================================
    // protectd Methods
    //==================================

    /** This method updates the list of checked entries. */
    setValueImpl(value) {
        this.sliderElement.value = value;
    }

    destroy() {
        super.destroy();
        
        this.sliderElement.removeEventListener("change",this.changeListener);
        this.changeListener = null;
        this.sliderElement = null;
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.sliderElement.disabled = isDisabled;
    }
}

SliderElement.TYPE_NAME = "slider";

//------------------------
// Form Maker Data
//------------------------

const FORM_INFO = {
	"type": "slider",
	"label": "Slider",
	"customLayout": [
		{
			"type": "panel",
			"formData": [
				{
					"type": "textField",
					"label": "Min: ",
					"key": "min"
				},
				{
					"type": "textField",
					"label": "Max: ",
					"key": "max"
				},
				{
					"type": "textField",
					"label": "Step: ",
					"key": "step"
				}
			],
			"key": "customLayout"
		}
	],
	"makerFlags": [
		"hasLabel",
		"valueJson",
		"hasKey",
		"hasHint",
		"hasHelp",
		"hasSelector"
	]
}

const COMPILED_FORM_INFO = {
	"type": "slider",
	"label": "Slider",
	"customLayout": [
		{
			"type": "panel",
			"formData": [
				{
					"type": "horizontalLayout",
					"formData": [
						{
							"type": "textField",
							"label": "Min: ",
							"key": "min",
							"meta": {
								"expression": "choice",
								"expressionChoiceKey": "minType"
							}
						},
						{
							"type": "radioButtonGroup",
							"entries": [
								[
									"Value",
									"value"
								],
								[
									"Reference",
									"simple"
								]
							],
							"value": "value",
							"key": "minType"
						}
					]
				},
				{
					"type": "horizontalLayout",
					"formData": [
						{
							"type": "textField",
							"label": "Max: ",
							"key": "max",
							"meta": {
								"expression": "choice",
								"expressionChoiceKey": "maxType"
							}
						},
						{
							"type": "radioButtonGroup",
							"entries": [
								[
									"Value",
									"value"
								],
								[
									"Reference",
									"simple"
								]
							],
							"value": "value",
							"key": "maxType"
						}
					]
				},
				{
					"type": "horizontalLayout",
					"formData": [
						{
							"type": "textField",
							"label": "Step: ",
							"key": "step",
							"meta": {
								"expression": "choice",
								"expressionChoiceKey": "stepType"
							}
						},
						{
							"type": "radioButtonGroup",
							"entries": [
								[
									"Value",
									"value"
								],
								[
									"Reference",
									"simple"
								]
							],
							"value": "value",
							"key": "stepType"
						}
					]
				}
			],
			"key": "customLayout"
		}
	],
	"makerFlags": [
		"hasLabel",
		"valueJson",
		"hasKey",
		"hasHint",
		"hasHelp",
		"hasSelector"
	]
}

const MAKER_CUSTOM_PROCESSING_FUNCTION = function(formResult,elementConfig) {
    if((formResult.customLayout)&&(formResult.customLayout.min)) {
        if(formResult.customLayout.minType == "simple") {
            elementConfig.min = formResult.customLayout.min;
        }
        else {
            elementConfig.min = parseFloat(formResult.customLayout.min);
        }
    }
    if((formResult.customLayout)&&(formResult.customLayout.max)) {
        if(formResult.customLayout.maxType == "simple") {
            elementConfig.max = formResult.customLayout.max;
        }
        else {
            elementConfig.max = parseFloat(formResult.customLayout.max);
        }
    }
    if((formResult.customLayout)&&(formResult.customLayout.step)) {
        if(formResult.customLayout.stepType == "simple") {
            elementConfig.step = formResult.customLayout.step;
        }
        else {
            elementConfig.step = parseFloat(formResult.customLayout.step);
        }
    }   
}


SliderElement.MAKER_ELEMENT_INFO = {
    formInfo: FORM_INFO,
	compiledFormInfo: COMPILED_FORM_INFO,
	makerCustomProcessing: MAKER_CUSTOM_PROCESSING_FUNCTION
}