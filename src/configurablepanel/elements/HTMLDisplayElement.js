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

HTMLDisplayElement.FORM_INFO = {
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

HTMLDisplayElement.makerCustomProcessing = function(formResult,elementConfig) {
    if((formResult.customLayout)&&(formResult.customLayout.html)) {
        elementConfig.html = formResult.customLayout.html;
    }    
}




