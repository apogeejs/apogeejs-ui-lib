import ConfigurableElement from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableElement.js";

/** This is a heading element configurable element.
 * 
 * @class 
 */
export default class HTMLDisplayElement extends ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        containerElement.innerHTML = elementInitData.html

        this._postInstantiateInit(elementInitData);
    }

}

HTMLDisplayElement.TYPE_NAME = "htmlDisplay";

//------------------------
// Form Designer Data
//------------------------

const FORM_INFO = {
	"uniqueKey": "basicHtmlDisplay",
	"type": "htmlDisplay",
	"label": "HTML Display",
	"customLayout": [
		{
			"type": "panel",
			"formData": [
				{
					"type": "textarea",
					"label": "HTML: ",
					"key": "html"
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
    if((formResult.customLayout)&&(formResult.customLayout.html)) {
        elementConfig.html = formResult.customLayout.html;
    }   
	else {
		elementConfig.html = "";
	} 
}

const DESIGNER_ELEMENT_INFO = {
	category: "element",
    orderKey: FORM_INFO.label,
    formInfo: FORM_INFO,
	designerCustomProcessing: DESIGNER_CUSTOM_PROCESSING_FUNCTION
}

HTMLDisplayElement.DESIGNER_ELEMENT_ARRAY = [DESIGNER_ELEMENT_INFO];




