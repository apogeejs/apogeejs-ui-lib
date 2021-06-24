import ConfigurablePanel from "/apogeejs-ui-lib/src/configurablepanel/ConfigurablePanel.js";
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";

/** Custom Element: Entry Type Selector
 * This element should be passed a list of element layouts, or entry types. Based on an external selector 
 * it will display that layout.
 * 
 * This was designed specifically for the Configurable Form Designer. Ordinarily we could just include the external selector
 * element and then a list of desired elements, each with a selctor field. For the designer, this would cause a stack overflow because the
 * layout is recursive.
 * 
 * config format:
 * {
 *       type: "custom",
 *       builderFunction: entryTypeSelectorBuilder,
 *       key: <key>, //the key for this element
 *       childLayouts: childLayouts, //These are the list of layouts for inside the panel
 *       selector: {
 *           parentKey: <parent key>, //the key for the parent element which selects the entry type. The value should be the key for the entry type.
 *           actionFunction: (childElement,parentElement) => {
 *               childElement.setChildKey(parentElement.getValue());
 *           }
 *       }
 *   }
*/
export function entryTypeSelectorBuilder(instance,form,elementInitData) {
    //instance members
    let childKey = null;
    let element = instance.getElement();
    let innerContainer = document.createElement("div");
    innerContainer.style.border = "1px solid rgba(0,0,0,.4)";
    element.appendChild(innerContainer);
    let panel;
    let storedValue;
    
    //element init data field: childLayouts - contains a map of layouts, with the key as key.
    let childLayoutMap = elementInitData.childLayoutMap ? elementInitData.childLayoutMap : {};
    
    //instance methods
    instance.setValueImpl = value => {
        if(panel) panel.setValue(value);
        else storedValue = value;
    }
    instance.getValue = () => {
        if(panel) return panel.getValue();
        else return storedValue;
    }
    instance.getMeta = () => {
        //NOTE: this should add a parent type "object", which is what we do in panel.
        //Maybe there is a risk of this code getting changed in one place only when we want it changed in both.
        let fullMeta = {};
        //copy in the stored meta
        if(this.meta) {
            Object.assign(fullMeta,this.meta);
        }
        //override an parent type to be "object"
        fullMeta.parentType = "object";
        //add the child elements
        fullMeta.childMeta = panel.getMeta();
        return fullMeta;
    }
    instance.setChildKey = newChildKey => {
        if(newChildKey != childKey) {
            childKey = newChildKey;
            //update the internal panel
            
            //store the value from the old panel
            if(panel) {
                storedValue = panel.getValue();
                panel.destroy();
            }
            
            //create the newpanel
            panel = new ConfigurablePanel();
            let childLayout = childLayoutMap[childKey];
            let panelLayout = childLayout ? childLayout : [];
            panel.configureForm(panelLayout);
            
            //set the change and input listeners for the custom element
            panel.addOnChange( () => instance.valueChanged());
            panel.addOnInput( () => instance.inputDone());
            
            if(storedValue !== undefined) {
                panel.setValue(storedValue);
                storedValue = undefined;
            }
            
            //show the new panel
            uiutil.removeAllChildren(innerContainer);
            innerContainer.appendChild(panel.getElement());
        }
    }
    let superDestroy = instance.destroy;
    instance.destroy = () => {
        //use call so "this" is set for this function
        superDestroy.call(instance);
    
        if(panel) panel.destroy();
    }

    instance._postInstantiateInit(elementInitData);
}