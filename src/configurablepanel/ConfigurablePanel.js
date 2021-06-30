import ConfigurablePanelConstants from "/apogeejs-ui-lib/src/configurablepanel/ConfigurablePanelConstants.js";
import ConfigurableFormDesigner from  "/apogeejs-ui-lib/src/configurablepanel/ConfigurableFormDesigner.js";
import {BASIC_CHILD_LAYOUT_TEMPLATE,basicCompleteChildListLayout} from "./elements/PanelElement.js"; 
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";
import ErrorElement from "/apogeejs-ui-lib/src/configurablepanel/elements/ErrorElement.js";


/** This is a panel with forma elements that can be configured using a javascript object.
 * 
 * @class 
 */
export default class ConfigurablePanel {
    
    constructor() {
        this.elementObjects = [];
        this.layouts = [];
        this.panelDomElement = this.createPanelDomElement(ConfigurablePanel.PANEL_CLASS_NORMAL); 
    }

    configureForm(formInitData) {
        //first create form
        this.createForm(formInitData);
        //selectors must be initialized after complete form is created
        this.populateSelectors();
    }
    
    createForm(formInitData) {
        
        //TEMPORARY - legacy check correction----------------------
        if((formInitData)&&(formInitData.constructor == Array)) {
            formInitData = {layout:formInitData};
        }
        //---------------------------------------------------------
        
        //check for an invalid input
        if(formInitData === apogeeutil.INVALID_VALUE) {
            formInitData = ConfigurablePanel.getErrorMessageLayoutInfo("Form Data Unavailable");
        }
        else if((!formInitData)||(!formInitData.layout)||(formInitData.layout.constructor != Array)) {
            formInitData = ConfigurablePanel.getErrorMessageLayoutInfo("Invalid form layout!");
        }
        
        //clear data
        uiutil.removeAllChildren(this.panelDomElement);
        this.elementObjects = [];
        
        try {
            //create elements     
            formInitData.layout.forEach(elementInitData => this.addToPanel(elementInitData));

            // //add selectors
            // this.elementObjects.forEach(elementObject => {
            //     elementObject.initSelector();
            // }); 

            //additional init
            if(formInitData.onChange) {
                this.addOnChange(formInitData.onChange);
            }

            if(formInitData.onSubmitInfo) {
                this.addSubmit(formInitData.onSubmitInfo.onSubmit,
                    formInitData.onSubmitInfo.onCancel,
                    formInitData.onSubmitInfo.submitLabel,
                    formInitData.onSubmitInfo.cancelLabel);
            }

            if(formInitData.disabled) {
                this.setDisabled(true);
            }
        }
        catch(error) {
            var errorMsg = "Error in panel: " + error.message ? error.message : error ? error.toString() : "Unknown";
            if(error.stack) console.error(error.stack);
            
            //display an error layout
            //but only try this once. If the error layout throws an error jsut continue
            if(!formInitData.isErrorLayout) {
                var errorLayoutInfo = ConfigurablePanel.getErrorMessageLayoutInfo(errorMsg);
                this.configureForm(errorLayoutInfo);
            }
        }
    }

    /** This returns the meta value for the panel. */
    getMeta() {
        //create the meta value
        let meta = {};
        this.elementObjects.forEach(elementObject => {
            let childMeta = elementObject.getMeta();
            let childKey = elementObject.getKey();
            if((childMeta)&&(childKey)) {
                meta[childKey] = childMeta;
            }
        })
        return meta;
    }

    /** This method returns the data value object for this given panel. */
    getValue() {
        var formValue = {};
        var addValue = elementObject => {
            if(elementObject.getState() != ConfigurablePanelConstants.STATE_INACTIVE) {
                var elementValue = elementObject.getValue();
                if((elementValue !== undefined)&&(elementValue !== elementObject.getExcludeValue())) {
                    var key = elementObject.getKey();
                    formValue[key] = elementValue;
                }
            }
        }
        this.elementObjects.forEach(addValue);
        return formValue;
    }
    
    /** This method returns the data value object for this given panel. */
    setValue(formValue) {
        for(var key in formValue) {
            var entry = this.getEntry(key);
            if(entry) {
                entry.setValue(formValue[key]);
            }
        }
    }
    
    getElement() {
        return this.panelDomElement;
    }
    
    getChildEntries() {
        return this.elementObjects;
    }

    /** This element will give focus to the first element which can hold the focus. */
    giveFocus() {   
        for(let i = 0; i < this.elementObjects.length; i++) {
            let element = this.elementObjects[i];
            if(element.giveFocus()) return true;
        }
        return false;
    }
    
    /** This is an alternate way to add a submit entry to the form. This is useful
     * if the layout has no other handlers in it and is a pure JSON object. This 
     * will then separate out any handlers from the layout. */
    addSubmit(onSubmit,
            onCancel,
            optionalSubmitLabel = ConfigurablePanelConstants.DEFAULT_SUBMIT_LABEL,
            optionalCancelLabel = ConfigurablePanelConstants.DEFAULT_CANCEL_LABEL) {
                
        var data = {};
        data.type = "submit";
        if(onSubmit) {
            data.onSubmit = onSubmit;
            data.submitLabel = optionalSubmitLabel;
        }
        if(onCancel) {
            data.onCancel = onCancel;
            data.cancelLabel = optionalCancelLabel;
        }
        
        this.addToPanel(data);
    }
    
    //takes a handler onChange(formValue,form)
    addOnChange(onChange) {
        let onChildChange = (childValue,form) => {
            var formValue = this.getValue();
            onChange(formValue,form);
        }
        this.elementObjects.forEach( elementObject => elementObject.addOnChange(onChildChange));
    }

    addOnInput(onInput) {
        let onChildInput = (childValue,form) => {
            var formValue = this.getValue();
            onInput(formValue,form);
        }
        this.elementObjects.forEach( elementObject => elementObject.addOnInput(onChildInput));
    }
    
    setDisabled(isDisabled) {
        this.elementObjects.forEach( elementObject => {
            if(elementObject._setDisabled) {
                elementObject._setDisabled(isDisabled);
            }
        });
    }

    destroy() {
        this.elementObjects.forEach( elementObject => {
            elementObject.destroy();
        });
        this.elementObjects = [];
        this.layouts.forEach( layout => {
            layout.destroy();
        });
        this.layouts = [];
        this.panelDomElement = null; 
    }

    //------------------
    // Entry interface
    //------------------

    /** This method returns the ConfigurableElement for the given key. */
    getEntry(key) {
        return this.elementObjects.find(elementObject => elementObject.getKey() == key);
    }

    /** This gets an entry from the given path, where the path is an array of keys. 
     * Start index is the index of the key for this element. If it is omitted the value is
     * assumed to be 0.
    */
    getEntryFromPath(path,startIndex) {
        if(startIndex === undefined) startIndex = 0;
        if(startIndex >= path.length) {
            //invalid path
            return 0;
        }

        let childKey = path[startIndex];
        let childElement = this.getEntry(childKey);
        if(startIndex === path.length - 1) {
            return childElement;
        }
        else {
            if(childElement.getEntryFromPath) {
                //this means we can look up children from this element
                return childElement.getEntryFromPath(path,startIndex+1);
            }
            else {
                //invalid path
                return undefined;
            }
        }
    }

    setParentForm(form) {
        this.parentForm = form;
    }

    getBaseForm() {
        return this.parentForm ? this.parentForm.getBaseForm() : this;
    }

    /** This method is called during configuration to populate the selectors of the form. */
    populateSelectors() {
        this.elementObjects.forEach(elementObject => elementObject.populateSelectors());
    }

    //=================================
    // Private methods
    //=================================
    
    /** This creates the container element for the panel. */
    createPanelDomElement(containerClassName) {
        var panelDomElement = document.createElement("div");
        panelDomElement.className = containerClassName;
        //explicitly remove margin and padding
        panelDomElement.style.margin = "0px";
        panelDomElement.style.padding = "0px";
        return panelDomElement;
    }
    
    /** this is called internally to add an element to the panel. */
    addToPanel(elementInitData) {
        let elementObject;

        try {
            elementObject = ConfigurablePanel.instantiateConfigurableType(this,elementInitData);
        }
        catch(error) {
            //create an error element if there is an error
            elementObject = new ErrorElement(this,elementInitData,error);
        }

        //add the dome element for the container
        var domElement = elementObject.getElement();
        if(domElement) {
            this.panelDomElement.appendChild(domElement);
        }

        if(elementObject.elementType == "ConfigurableElement") {
            //add all child elements from this container to the child element list
            this.elementObjects.push(elementObject);  
        }
        else if(elementObject.elementType == "ConfigurableLayoutContainer") {
            this.layouts.push(elementObject);
        }
    }

    /** This method is called by a child layout container to pass children element objects to the form.  */
    insertChildElement(configurableElement) {
        this.elementObjects.push(configurableElement);
    }

    //=================================
    // Static Public Methods
    //=================================

    /** This method can be used to generate an error message layout. */
    static getErrorMessageLayoutInfo(errorMsg) {
        var layout = [];
        var entry = {};
        entry.type = "htmlDisplay";
        entry.html = "<em style='color:red'>" + errorMsg + "</em>";
        layout.push(entry);
        return {"layout":layout, "isErrorLayout": true};
    }

    //=================================
    // Element Management (Public and private)
    //=================================
    
    /** This method is used to register configurable elements with the panel */
    static addConfigurableElement(elementClass) {
        var type = elementClass.TYPE_NAME;
        ConfigurablePanel.elementMap[type] = elementClass;
    }

    static removeConfigurableElement(elementClass) {
        var type = elementClass.TYPE_NAME;
        delete ConfigurablePanel.elementMap[type];
    }

    static instantiateConfigurableType(form,elementInitData) {
        var type = elementInitData.type;
        if(!type) {
            throw new Error("Type not found for configurable form entry!");
        }
        
        var constructor = ConfigurablePanel.elementMap[type];
        if(!constructor) {
            throw new Error("Type not found for configurable element: " + type);
        }

        return new constructor(form,elementInitData);
    }

    //=================================
    // Form Designer (Public and private)
    //=================================
    
    static initDesigner() {
        //construct the designerElementInfoArray from the element classes
        let designerElementInfoArray = [];
        for(let elementType in ConfigurablePanel.elementMap) {
            let elementClass = ConfigurablePanel.elementMap[elementType];
            let classDesignerElementInfoArray = elementClass.DESIGNER_ELEMENT_ARRAY;
            if(classDesignerElementInfoArray) {
                designerElementInfoArray.push(...classDesignerElementInfoArray);
            }
        }
        //add the top level elements from here
        designerElementInfoArray.push(...ConfigurablePanel.DESIGNER_ELEMENT_ARRAY);

        //sort the elements alphabetically
        designerElementInfoArray.sort( (e1,e2) => {
            let key1 = ConfigurablePanel._getOrderKey(e1);
            let key2 = ConfigurablePanel._getOrderKey(e2);
            if (key1 > key2) return 1;
            else if(key1 < key2) return -1;
            else return 0;
        })

        ConfigurablePanel.configurableFormDesigner = new ConfigurableFormDesigner(designerElementInfoArray,ConfigurablePanel.TOP_LEVEL_FORM_INFO);

    }

    /** This is the sort order to display the elements in the form desigener.
     * 1) sort by type: element, collection, layout
     * 2) sort by designerElementInfo.orderKey if present, otherwise the element display label
     * 
     * The orderKey is provided to allow overriding the label intended fro cases where a single element
     * has multiple options and you want to order these options in a specific way, such as putting the 
     * default or simple option first, even if the label is not first alphabetically.
     */
    static _getOrderKey(designerElementInfo) {
        let orderPrefix;
        let orderBody;
        switch(designerElementInfo.category) {
            case "layout":
                orderPrefix = 3;
                break;
            case "collection":
                if(designerElementInfo.isTopLevelLayout) orderPrefix = 4; //these won't be shown anyway 
                else orderPrefix = 2;
                break;
            case "element": 
            default:
                orderPrefix = 1;
                break;
        }

        if(designerElementInfo.orderKey) orderBody = designerElementInfo.orderBody;
        else if(designerElementInfo.formInfo.label) orderBody = designerElementInfo.orderBody;
        else orderBody = designerElementInfo.uniqueKey;

        return orderPrefix + "|" + orderBody;
    }

    static getFormDesignerLayout(formDesignerFlags) {
        if(!formDesignerFlags) formDesignerFlags = {};
        if(ConfigurablePanel.configurableFormDesigner) {
            return ConfigurablePanel.configurableFormDesigner.getFormDesignerLayout(formDesignerFlags);
        }
        else {
            //return error for layout
            getErrorMessageLayoutInfo("Form designer has not been initialized!");
        }
    }

    static getGeneratedFormLayout(generatorFormResult) {
        if(ConfigurablePanel.configurableFormDesigner) {
            return ConfigurablePanel.configurableFormDesigner.getOutputFormLayout(generatorFormResult)
        }
        else {
            //return error for layout
            getErrorMessageLayoutInfo("Generated layout not available. Form designer has not been initialized!");
        }
    }
}

//static fields
ConfigurablePanel.elementMap = {};
ConfigurablePanel.designerElementInfoMap = {};

ConfigurablePanel.PANEL_CLASS_NORMAL = "apogee_configurablePanelBody";

//This is displayed if there is an invalid layout passed in
ConfigurablePanel.INVALID_INIT_DATA = {
    layout: [
        {
            type: "heading",
            text: "INVALID FORM LAYOUT!",
            level: 4
        }
    ]
}

ConfigurablePanel.EMPTY_LAYOUT = {
    layout: []
}

//form generator
ConfigurablePanel.configurableFormDesigner = null;

//============================
// Form Designer Data
//============================

const DATA_FORM_INFO = {
    "uniqueKey": "topLevelDataPanel",
	"type": "panel",
	"label": "Form Designer",
	"designerFlags": [
        "supressShowHide"
    ],
    "childLayoutTemplate": BASIC_CHILD_LAYOUT_TEMPLATE
}

const DATA_DESIGNER_ELEMENT_INFO = {
    category: "collection",
    flags : {
		"submit": [false,undefined]
	},
    orderKey: DATA_FORM_INFO.label,
    isTopLevelLayout: true,
    formInfo: DATA_FORM_INFO,
    completeChildListLayout: basicCompleteChildListLayout 
}

const ACTION_FORM_INFO = {
    "uniqueKey": "topLevelDataPanel",
	"type": "panel",
	"label": "Form Designer",
	"designerFlags": [
        "supressShowHide",
        "hasSubmit"
    ],
    "childLayoutTemplate": BASIC_CHILD_LAYOUT_TEMPLATE
}

const ACTION_DESIGNER_ELEMENT_INFO = {
    category: "collection",
    flags : {
		"submit": [true]
	},
    orderKey: ACTION_FORM_INFO.label,
    isTopLevelLayout: true,
    formInfo: ACTION_FORM_INFO,
    completeChildListLayout: basicCompleteChildListLayout 
}

ConfigurablePanel.DESIGNER_ELEMENT_ARRAY = [DATA_DESIGNER_ELEMENT_INFO, ACTION_DESIGNER_ELEMENT_INFO];


