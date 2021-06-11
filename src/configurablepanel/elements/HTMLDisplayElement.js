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
// Form Maker Data
//------------------------

const FORM_INFO = {
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
	"makerFlags": [
		"hasSelector"
	]
}

const MAKER_CUSTOM_PROCESSING_FUNCTION = function(formResult,elementConfig) {
    if((formResult.customLayout)&&(formResult.customLayout.html)) {
        elementConfig.html = formResult.customLayout.html;
    }    
}

HTMLDisplayElement.MAKER_ELEMENT_INFO = {
    formInfo: FORM_INFO,
	makerCustomProcessing: MAKER_CUSTOM_PROCESSING_FUNCTION
}




