import ConfigurablePanel from "/apogeejs-ui-lib/src/configurablepanel/ConfigurablePanel.js";
import CheckboxElement from "/apogeejs-ui-lib/src/configurablepanel/elements/CheckboxElement.js";
import CheckboxGroupElement from "/apogeejs-ui-lib/src/configurablepanel/elements/CheckboxGroupElement.js";
import ColorPickerElement from "/apogeejs-ui-lib/src/configurablepanel/elements/ColorPickerElement.js";
import CustomElement from "/apogeejs-ui-lib/src/configurablepanel/elements/CustomElement.js";
import DropdownElement from "/apogeejs-ui-lib/src/configurablepanel/elements/DropdownElement.js";
//import ExtendedDropdownElement from "/apogeejs-ui-lib/src/configurablepanel/elements/ExtendedDropdownElement.js"
import HeadingElement from "/apogeejs-ui-lib/src/configurablepanel/elements/HeadingElement.js";
import HTMLDisplayElement from "/apogeejs-ui-lib/src/configurablepanel/elements/HTMLDisplayElement.js";
import InvisibleElement from "/apogeejs-ui-lib/src/configurablepanel/elements/InvisibleElement.js";
import ListElement from "/apogeejs-ui-lib/src/configurablepanel/elements/ListElement.js";
import PanelElement from "/apogeejs-ui-lib/src/configurablepanel/elements/PanelElement.js";
import RadioGroupElement from "/apogeejs-ui-lib/src/configurablepanel/elements/RadioGroupElement.js";
import SliderElement from "/apogeejs-ui-lib/src/configurablepanel/elements/SliderElement.js";
import SpacerElement from "/apogeejs-ui-lib/src/configurablepanel/elements/SpacerElement.js";
import SubmitElement from "/apogeejs-ui-lib/src/configurablepanel/elements/SubmitElement.js";
import TextareaElement from "/apogeejs-ui-lib/src/configurablepanel/elements/TextareaElement.js";
import TextFieldElement from "/apogeejs-ui-lib/src/configurablepanel/elements/TextFieldElement.js";

import DesignerListEntryElement from "/apogeejs-ui-lib/src/configurablepanel/elements/DesignerListEntryElement.js";

import HorizontalLayout from "/apogeejs-ui-lib/src/configurablepanel/elements/HorizontalLayout.js";
import ShowHideLayout from "/apogeejs-ui-lib/src/configurablepanel/elements/ShowHideLayout.js";

ConfigurablePanel.addConfigurableElement(CheckboxElement);
ConfigurablePanel.addConfigurableElement(CheckboxGroupElement);
ConfigurablePanel.addConfigurableElement(ColorPickerElement);
ConfigurablePanel.addConfigurableElement(CustomElement);
ConfigurablePanel.addConfigurableElement(DropdownElement);
//ConfigurablePanel.addConfigurableElement(ExtendedDropdownElement);
ConfigurablePanel.addConfigurableElement(HeadingElement);
ConfigurablePanel.addConfigurableElement(HTMLDisplayElement);
ConfigurablePanel.addConfigurableElement(InvisibleElement);
ConfigurablePanel.addConfigurableElement(ListElement);
ConfigurablePanel.addConfigurableElement(PanelElement);
ConfigurablePanel.addConfigurableElement(RadioGroupElement);
ConfigurablePanel.addConfigurableElement(SliderElement);
ConfigurablePanel.addConfigurableElement(SpacerElement);
ConfigurablePanel.addConfigurableElement(SubmitElement);
ConfigurablePanel.addConfigurableElement(TextareaElement);
ConfigurablePanel.addConfigurableElement(TextFieldElement);

ConfigurablePanel.addConfigurableElement(DesignerListEntryElement);

ConfigurablePanel.addConfigurableElement(HorizontalLayout);
ConfigurablePanel.addConfigurableElement(ShowHideLayout);

//initialize the form designer
ConfigurablePanel.initDesigner();