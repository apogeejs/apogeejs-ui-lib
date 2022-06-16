import ConfigurablePanel from "/apogeejs-ui-lib/src/configurablepanel/ConfigurablePanel.js";
import uiutil from "/apogeejs-ui-lib/src/uiutil.js";
//import dialogMgr from "/apogeejs-ui-lib/src/window/dialogMgr.js";

/** This method shows a configurable dialog. The layout object
 * defines the form content for the dialog. The on submit
 * function is called when submit is pressed. The on submit function should
 * return true or false, indicating whether of not to close the dialog. */
export function showConfigurableDialog(layout,onSubmitFunction,optionalOnCancelFunction) {

    //var dialog = dialogMgr.createDialog({"movable":true});
    let dialog = document.createElement("dialog")

    let panel = new ConfigurablePanel();
    panel.configureForm(layout);

    let onCancel = function() {
        if(optionalOnCancelFunction) optionalOnCancelFunction();
        //dialogMgr.closeDialog(dialog);
        dialog.close();
        //document.body.removeChild(dialog);
    }
    //submit
    let onSubmit = function(formValue) {
        //submit data
        var closeDialog = onSubmitFunction(formValue);
        if(closeDialog) {
            //dialogMgr.closeDialog(dialog);
            dialog.close();
            //document.body.removeChild(dialog);
        }
    }

    panel.addSubmit(onSubmit,onCancel);
    
    //show dialog
    //dialog.setContent(panel.getElement(),uiutil.SIZE_WINDOW_TO_CONTENT);
    //dialogMgr.showDialog(dialog);
    dialog.appendChild(panel.getElement())
    document.body.appendChild(dialog)
    dialog.showModal()

    //give focus to the panel
    panel.giveFocus();
}
    
    