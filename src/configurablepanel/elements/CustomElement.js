import ConfigurableElement from "/apogeejs-ui-lib/src/configurablepanel/ConfigurableElement.js";

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
export default class CustomElement extends ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        elementInitData.builderFunction(this,form,elementInitData);
    }

}

CustomElement.TYPE_NAME = "custom";