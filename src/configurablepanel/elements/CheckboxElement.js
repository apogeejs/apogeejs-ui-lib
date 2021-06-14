import ConfigurableElement from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class CheckboxElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        let labelElement = this.getLabelElement(elementInitData);
        if(labelElement) {
            containerElement.appendChild(labelElement);
        }
        
        //checkbox field
        this.checkbox = uiutil.createElement("input",{"type":"checkbox"}); 
        containerElement.appendChild(this.checkbox);

        this.setFocusElement(this.checkbox);
        
        //add dom listeners for events
        this.changeListener = () => {
            this.inputDone();
            this.valueChanged();
        }
        this.checkbox.addEventListener("change",this.changeListener);

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
        return this.checkbox.checked;
    } 

    destroy() {
        super.destroy();

        this.checkbox.removeEventListener("change",this.changeListener);
        this.changeListener = null;

        this.checkbox = null;
    }

    //===================================
    // protected Methods
    //==================================

    /** This method updates the UI value for a given element. */
    setValueImpl(value) {
        this.checkbox.checked = (value === true);
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.checkbox.disabled = isDisabled;
    }
}

CheckboxElement.TYPE_NAME = "checkbox";

//------------------------
// Form Maker Data
//------------------------

const FORM_INFO = {
    "uniqueKey": "basicCheckboxGroup",
	"type": "checkbox",
	"label": "Checkbox",
	"makerFlags": [
		"hasLabel",
		"valueBoolean",
		"hasKey",
		"hasHint",
		"hasHelp",
		"hasSelector"
	]
}

const MAKER_ELEMENT_INFO = {
    category: "element",
    orderKey: FORM_INFO.label,
    formInfo: FORM_INFO
}

CheckboxElement.MAKER_ELEMENT_ARRAY = [MAKER_ELEMENT_INFO];

