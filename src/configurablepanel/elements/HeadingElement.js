import ConfigurableElement from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableElement.js";
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";

/** This is a heading element configurable element.
 * 
 * @class 
 */
export default class HeadingElement extends ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        var headingLevel;
        if(elementInitData.level) { 
            headingLevel = elementInitData.level;
        }
        else {
            headingLevel = HeadingElement.DEFAULT_HEADING_LEVEL;
        }
        var headingClass = "apogee_configurablePanelHeading_" + headingLevel;
        
        let headingElement = uiutil.createElement("span",{"className":headingClass,"innerHTML":elementInitData.text});
        headingElement.classList.add("apogee_configurableElement_hideSelection");
        containerElement.appendChild(headingElement);

        this._postInstantiateInit(elementInitData);
    }
}


HeadingElement.DEFAULT_HEADING_LEVEL = 2;

HeadingElement.TYPE_NAME = "heading";

//------------------------
// Form Designer Data
//------------------------

const FORM_INFO = {
	"uniqueKey": "basicHeading",
	"type": "heading",
	"label": "Heading",
	"customLayout": [
		{
			"type": "panel",
			"formData": [
				{
					"type": "textField",
					"label": "Text: ",
					"key": "text"
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
    let customLayoutResult = formResult.customLayout;
    if(customLayoutResult) {
        if(customLayoutResult.text) {
            elementConfig.text = customLayoutResult.text;
        }
		else {
			elementConfig.text = "";
		}
        if((customLayoutResult.level)&&(customLayoutResult.level != "default")) {
            elementConfig.level = customLayoutResult.level;
        }
    }    
}


const DESIGNER_ELEMENT_INFO = {
	category: "element",
    orderKey: FORM_INFO.label,
    formInfo: FORM_INFO,
	designerCustomProcessing: DESIGNER_CUSTOM_PROCESSING_FUNCTION
}

HeadingElement.DESIGNER_ELEMENT_ARRAY = [DESIGNER_ELEMENT_INFO];





