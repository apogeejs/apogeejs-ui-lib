import ConfigurableElement from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableElement.js";

/** This is an text field element configurable element.
 * 
 * @class 
 */
export default class SpacerElement extends ConfigurableElement {
    constructor(form,elementInitData) {
        //we will hide this element by setting display none. Someone can go ahead 
        //and show it, in which case they will get an empty element with margins.
        //maybe we should have a way to not create the element in the first place.
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        //udpate padding and margin to 0
        containerElement.style.margin = ConfigurableElement.ELEMENT_MARGIN_NONE;
        containerElement.style.padding = ConfigurableElement.ELEMENT_PADDING_NONE;
        
        let spacerElement = document.createElement("div");
        var spacerHeight;
        if(elementInitData.height !== undefined) {
            spacerHeight = elementInitData.height;
        }
        else {
            spacerHeight = SpacerElement.DEFAULT_HEIGHT;
        }
        //this.spacerElement.style.display = "table";
        spacerElement.style.height = spacerHeight + "px";
        
        containerElement.appendChild(spacerElement);
        
        this._postInstantiateInit(elementInitData);
    }
}

//adding this includes the extra space of two margins rather than one,
//so just one pixel has a large effect
SpacerElement.DEFAULT_HEIGHT = 15;

SpacerElement.TYPE_NAME = "spacer";

//------------------------
// Form Designer Data
//------------------------

const FORM_INFO = {
    "uniqueKey": "basicSpacer",
	"type": "spacer",
	"label": "Spacer Element",
	"customLayout": [
		{
			"type": "panel",
			"formData": [
				{
					"type": "textField",
					"label": "Height: ",
					"key": "height"
				}
			],
			"key": "customLayout"
		}
	],
	"designerFlags": [
		"hasSelector"
	]
}

const DESIGNER_CUSTOM_PROCESSING_FUNCTION = function(formResult,elementConfig) {
    if((formResult.customLayout)&&(formResult.customLayout.height)) {
        elementConfig.height = formResult.customLayout.height;
    }    
}


const DESIGNER_ELEMENT_INFO = {
    category: "element",
    orderKey: FORM_INFO.label,
    formInfo: FORM_INFO,
    designerCustomProcessing: DESIGNER_CUSTOM_PROCESSING_FUNCTION
}

SpacerElement.DESIGNER_ELEMENT_ARRAY = [DESIGNER_ELEMENT_INFO];