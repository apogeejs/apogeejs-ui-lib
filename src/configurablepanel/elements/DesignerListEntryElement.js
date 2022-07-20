import ConfigurableElement from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableElement.js"
import ConfigurablePanel from "/apogeejs-ui-lib/src/configurablepanel/ConfigurablePanel.js"
import PanelElement from "/apogeejs-ui-lib/src/configurablepanel/elements/PanelElement.js"
import uiutil from "/apogeejs-ui-lib/src/uiutil.js"

/** This is a custom configurable element.
 * It elementInfoData should contain the entries:
 * - type - this should be the value "custom"
 * - key - this is the standard element key
 * - builderFunction - this is a function that takes the instance as an argument, as well as the form object and
 * the elementInitData. It should have two features - it should be programmed like the constructor of a
 * normal configurable element extension and it should assign the desired instance functions (since they are not 
 * added as in a normal class implementation)
 * 
 * @class 
 */
export default class DesignerListEntryElement extends ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData)

        this.panel = null
        this.panelLayout = null
        this.storedValue = null
        this.childKey = null
        this.innerContainer = document.createElement("div")
        this.innerContainer.style.border = "1px solid rgba(0,0,0,.4)"

        let element = this.getElement()
        element.appendChild(this.innerContainer)

        this.childLayoutMap = elementInitData.childLayoutMap ? elementInitData.childLayoutMap : {};
        
        this._postInstantiateInit(elementInitData)
    }

    //instance methods
    setValueImpl(value) {
        if(this.panel) this.panel.setValue(value);
        else this.storedValue = value;
    }

    getValue() {
        if(this.panel) return this.panel.getValue();
        else return this.storedValue;
    }

    setChildKey(newChildKey) {
        if(newChildKey != this.childKey) {
            this.childKey = newChildKey;
            //update the internal panel
            
            //store the value from the old panel
            if(this.panel) {
                this.storedValue = this.panel.getValue();
                this.panel.destroy();
            }
            
            //create the newpanel
            this.panel = new ConfigurablePanel();
            let childLayout = this.childLayoutMap[this.childKey];
            this.panelLayout = childLayout ? childLayout : [];
            this.panel.configureForm(this.panelLayout);
            
            //set the change and input listeners for the custom element
            this.panel.addOnChange( () => this.valueChanged());
            this.panel.addOnInput( () => this.inputDone());
            
            if(this.storedValue !== undefined) {
                this.panel.setValue(this.storedValue);
                this.storedValue = undefined;
            }
            
            //show the new panel
            uiutil.removeAllChildren(this.innerContainer);
            this.innerContainer.appendChild(this.panel.getElement());
        }
    }

    destroy() {
        if(this.panel) {
            this.panel.destroy()
            this.panel = null
        }

        super.destroy()
    
        
    }

    /** This gets a code expression to return the value of the element given by the value and layout. */
    static createValueCodeText(value,layout,containerValue) {
        let entryType = containerValue.key
        let panelLayoutFormData = layout.childLayoutMap[entryType]
        let panelLayout = {
            type: "panel",
            formData: panelLayoutFormData,
            key: "dummy"
        }
        return PanelElement.createValueCodeText(value,panelLayout,containerValue)
    }

}

DesignerListEntryElement.TYPE_NAME = "designerListEntry";


