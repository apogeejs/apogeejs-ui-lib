import ConfigurableLayoutContainer from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableLayoutContainer.js";
import {BASIC_CHILD_LAYOUT_TEMPLATE,basicCompleteChildListLayout} from "./PanelElement.js"; 
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";

/** This is a item that can be placed inside a panel container. In the initialization config it has child
 * configurable elements (and configurable layout containers), however any child configurable element is included as a
 * value in the parent panel. The configurable layout containers just holds to organize the DOM elements from its 
 * children.
 * 
 * @class 
 */
export default class ShowHideLayout extends ConfigurableLayoutContainer {
    constructor(form,containerInitData) {
        super(form);

        this.titleElement = null;
        this.bodyElement = null;
        this.control = null;
        this.headingElement = null;

        this.initialized = false;

        this.openedUrl = uiutil.getResourcePath("/opened_bluish.png","ui-lib");
        this.closedUrl = uiutil.getResourcePath("/closed_bluish.png","ui-lib");

        this._initializeContainer(containerInitData);
    }


    //==================================
    //protected methods
    //==================================

    /** This method adds the element to the container. */
    insertElement(elementObject,elementInitData) {
        //add the dom element
        this.bodyElement.appendChild(elementObject.getElement());
    }

    destroy() {
        super.destroy();
        
        this.titleElement = null;
        this.bodyElement = null;
        this.control = null;
        this.headingElement = null;

        this.initialized = false;
    }
    
    //===================================
    // internal Methods
    //==================================

    /** This method intializes the container */
    _initializeContainer(containerInitData) {
        let mainElement = this.getElement();
        
        //heading
        this.headingElement = document.createElement("div");
        this.headingElement.className = "apogee_configurableShowHideHeadingLine";
        mainElement.appendChild(this.headingElement);
        if(containerInitData.heading !== undefined) {
            this.titleElement = document.createElement("span");
            this.titleElement.innerHTML = containerInitData.heading;
            let level;
            if(containerInitData.level !== undefined) {
                level = containerInitData.level;
            }
            else {
                level = 4; //this is should be the level that is the same size as a label
            }
            let titleCssClass = "apogee_configurablePanelHeading_" + level;
            this.titleElement.className = titleCssClass;
            this.headingElement.appendChild(this.titleElement);
        }
        this.control = document.createElement("img");
        this.control.className = "apogee_configurableShowHideControl apogee_configurableElement_hideSelection";
        this.headingElement.appendChild(this.control);
        this.headingElement.onclick = () => this._toggleState();

        //body
        this.bodyElement = document.createElement("div");
        this.bodyElement.className = "apogee_configurableShowHideBody";
        mainElement.appendChild(this.bodyElement); 

        //set the initial open closed state
        let initialIsClosed = (containerInitData.closed === true);
        this._setState(initialIsClosed);

        //add each child to the layout
        if(!Array.isArray(containerInitData.formData)) {
            throw new Error("Improper format for Horizontal layout config. It should have a array named 'formData'");
        }
        containerInitData.formData.forEach(elementInitData => this.addToContainer(elementInitData));

        this.initialized = true;
    }

    _toggleState() {
        if(!this.initialized) return;

        this._setState(!this.isClosed);
    }

    _setState(isClosed) {
        this.isClosed = isClosed;
        if(this.isClosed) {
            this.bodyElement.style.display = "none";
            this.control.src = this.closedUrl;
        }
        else {
            this.bodyElement.style.display = "";
            this.control.src = this.openedUrl;
        }
    }
 
}

ShowHideLayout.TYPE_NAME = "showHideLayout";

//------------------------
// Form Maker Data
//------------------------

const FORM_INFO = {
    "uniqueKey": "basicShowHideLayout",
	"type": "showHideLayout",
	"label": "Show Hide Layout",
    "childLayoutTemplate": BASIC_CHILD_LAYOUT_TEMPLATE,
	"customLayout": [
		{
			"type": "panel",
			"formData": [
				{
					"type": "textField",
					"label": "Text: ",
					"key": "heading"
				},
				{
					"type": "dropdown",
					"label": "Level: ",
					"entries": [
						[
							"Default",
							"default"
						],
						1,
						2,
						3,
						4,
						5,
						6
					],
					"value": "default",
					"key": "level"
				},
				{
					"type": "checkbox",
					"label": "Initially Closed: ",
					"key": "closed"
				}
			],
			"key": "customLayout"
		}
	],
	"makerFlags": []
}

const MAKER_CUSTOM_PROCESSING_FUNCTION = function(formResult,elementConfig) {
    let customLayoutResult = formResult.customLayout;
    if(customLayoutResult) {
        if(customLayoutResult.heading) {
            elementConfig.heading = customLayoutResult.heading;
        }
        if((customLayoutResult.level)&&(customLayoutResult.level != "default")) {
            elementConfig.level = customLayoutResult.level;
        }
        if(customLayoutResult.closed) {
            elementConfig.closed = customLayoutResult.closed;
        }
    }
}

const MAKER_ELEMENT_INFO = {
    category: "layout",
    orderKey: FORM_INFO.label,
    formInfo: FORM_INFO,
    makerCustomProcessing: MAKER_CUSTOM_PROCESSING_FUNCTION,
    completeChildListLayout: basicCompleteChildListLayout
}

ShowHideLayout.MAKER_ELEMENT_ARRAY = [MAKER_ELEMENT_INFO];

