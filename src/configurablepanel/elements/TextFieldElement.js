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

TextFieldElement.FORM_INFO = {
	"type": "textField",
	"label": "Text Field",
	"customLayout": [
		{
			"type": "panel",
			"formData": [
				{
					"type": "textField",
					"label": "Size in pixels: ",
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

TextFieldElement.makerCustomProcessing = function(formResult,elementConfig) {
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

