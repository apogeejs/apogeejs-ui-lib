export {default as uiutil} from "/apogeejs-ui-lib/src/uiutil.js";

export {default as dialogMgr} from "/apogeejs-ui-lib/src/window/dialogMgr.js";

export {bannerConstants,getBanner,getIconOverlay} from "/apogeejs-ui-lib/src/banner/banner.js"; 
export {default as Tab} from "/apogeejs-ui-lib/src/tabframe/Tab.js";
export {default as TabFrame} from "/apogeejs-ui-lib/src/tabframe/TabFrame.js";
export {default as Menu} from "/apogeejs-ui-lib/src/menu/Menu.js";
export {default as SplitPane} from "/apogeejs-ui-lib/src/splitpane/SplitPane.js";
export {default as TreeControl} from "/apogeejs-ui-lib/src/treecontrol/TreeControl.js";
export {default as TreeEntry} from "/apogeejs-ui-lib/src/treecontrol/TreeEntry.js";
export {default as DisplayAndHeader} from "/apogeejs-ui-lib/src/displayandheader/DisplayAndHeader.js";
export {default as ConfigurablePanel} from "/apogeejs-ui-lib/src/configurablepanel/ConfigurablePanel.js";
export {default as FormResultFunctionGenerator} from "/apogeejs-ui-lib/src/configurablepanel/FormResultFunctionGenerator.js";
export {wrapWithTooltip, getHelpElement} from "/apogeejs-ui-lib/src/tooltip/tooltip.js";

//this loads the standard configurable panel elements
import "/apogeejs-ui-lib/src/configurablepanel/ConfigurablePanelInit.js";

//legacy exports ============================
//these are deprecated interfaces. provided for back compatibility
export {showLegacyConfigurableDialog} from "/apogeejs-ui-lib/src/dialogs/LegacyConfigurableDialog.js";
export {showConfigurableDialog} from "/apogeejs-ui-lib/src/dialogs/ConfigurableDialog.js";
export {showSimpleActionDialog} from "/apogeejs-ui-lib/src/dialogs/SimpleActionDialog.js";
export {getFormResultFunctionBody} from "/apogeejs-ui-lib/src/configurablepanel/FormResultFunctionGenerator.js";
//end legacy exports
//============================================

