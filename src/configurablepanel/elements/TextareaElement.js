import ConfigurableElement from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class TextareaElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        let labelElement = this.getLabelElement(elementInitData);
        if(labelElement) {
            containerElement.appendChild(labelElement);
        }
        
        //text field
        this.inputElement = uiutil.createElement("textarea");
        this.inputElement.style.verticalAlign = "top";
        if(elementInitData.rows) {
            this.inputElement.rows = elementInitData.rows;
        }
        if(elementInitData.cols) {
            this.inputElement.cols = elementInitData.cols;
        }
        containerElement.appendChild(this.inputElement); 

        this.setFocusElement(this.inputElement);

        //add dom listeners
        this.inputListener = () => this.inputDone();
        this.changeListener = () => this.valueChanged();
        this.inputElement.addEventListener("input",this.inputListener);
        this.inputElement.addEventListener("change",this.changeListener);

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
        return this.inputElement.value.trim();
    }   

    //==================================
    // protected methods
    //==================================

    /** This method updates the UI value for a given element. */
    setValueImpl(value) {
        this.inputElement.value = value;
    }

    destroy() {
        super.destroy();
        this.inputElement.removeEventListener("input",this.inputListener);
        this.inputElement.removeEventListener("change",this.changeListener);
        this.inputListener = null;
        this.changeListener = null;
        this.inputElement = null;
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.inputElement.disabled = isDisabled;
    }
}

TextareaElement.TYPE_NAME = "textarea";

//------------------------
// Form Maker Data
//------------------------

const FORM_INFO = {
	"type": "textarea",
	"label": "Text Area",
	"customLayout": [
		{
			"type": "panel",
			"formData": [
				{
					"type": "textField",
					"label": "Number Columns: ",
					"key": "cols",
					"hint": "optional"
				},
				{
					"type": "textField",
					"label": "Number Rows: ",
					"key": "rows",
					"hint": "optional"
				}
			],
			"key": "customLayout"
		}
	],
	"makerFlags": [
		"hasLabel",
		"valueString",
		"hasKey",
		"hasHint",
		"hasHelp",
		"hasSelector"
	]
}

const MAKER_CUSTOM_PROCESSING_FUNCTION = function(formResult,elementConfig) {
    if(formResult.customLayout) {
        if(formResult.customLayout.cols) {
            try {
                elementConfig.cols = parseInt(formResult.customLayout.cols);
            }
            catch(error) {
                throw Error("Invalid text field size: " + formResult.customLayout.cols);
            }
        }
        if(formResult.customLayout.rows) {
            try {
                elementConfig = parseInt(formResult.customLayout.rows);
            }
            catch(error) {
                throw Error("Invalid text field size: " + formResult.customLayout.rows);
            }
        }
    }

}


TextareaElement.MAKER_ELEMENT_INFO = {
    formInfo: FORM_INFO,
    makerCustomProcessing: MAKER_CUSTOM_PROCESSING_FUNCTION
}