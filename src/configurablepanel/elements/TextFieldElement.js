import ConfigurableElement from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class TextFieldElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        let labelElement = this.getLabelElement(elementInitData);
        if(labelElement) {
            containerElement.appendChild(labelElement);
        }
        
        //text field (maight had password flag)
        var type = (elementInitData.password === true) ? "password" : "text";
        this.inputElement = uiutil.createElement("input",{"type":type});
        containerElement.appendChild(this.inputElement); 
        this.setFocusElement(this.inputElement);
        
        if(elementInitData.size !== undefined) {
            this.inputElement.size = elementInitData.size;
        }

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

    getValue() {
        return this.inputElement.value;
    }  
    
    //===================================
    // protected Methods
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

TextFieldElement.TYPE_NAME = "textField";

//------------------------
// Form Maker Data
//------------------------

const FORM_INFO = {
    "uniqueKey": "basicTextField",
	"type": "textField",
	"label": "Text Field",
	"customLayout": [
		{
			"type": "panel",
			"formData": [
				{
					"type": "textField",
					"label": "Size in Chars: ",
					"key": "size",
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
    let customLayoutResult = formResult.customLayout;
    if(customLayoutResult) {
        if(customLayoutResult.size) {
            try {
                elementConfig.size = parseInt(customLayoutResult.size);
            }
            catch(error) {
                throw Error("Invalid text field size: " + customLayoutResult.size);
            }
        }
    }
}

const MAKER_ELEMENT_INFO = {
    category: "element",
    orderKey: FORM_INFO.label,
    formInfo: FORM_INFO,
    makerCustomProcessing: MAKER_CUSTOM_PROCESSING_FUNCTION,
}

TextFieldElement.MAKER_ELEMENT_ARRAY = [MAKER_ELEMENT_INFO];
