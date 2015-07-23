/**
 * @fileOverview Tweety Add-On main file 
 * @author <a href="mailto:filipe.beato@esat.kuleuven.be">Filipe Beato</a>
 * @version 0.01
 *
**/

// Define the dependencies (this can also be done in package.json)
var { ToggleButton } = require("sdk/ui/button/toggle");
var data = require("sdk/self").data;
var convert = require("./convertor.js");
var tweetycipher = require("./tweetycipher.js")


/**
*  Create a Toggle Button
*  @public
*/
var tweetyButton = ToggleButton({
    id: "tweety-toggle-button",
    label: "ToggleTweety",
    icon: {
      "16": data.url("imgs/tweety-icon-16.png"),
      "32": data.url("imgs/tweety-icon-32.png"),
      "64": data.url("imgs/tweety-icon-64.png")
    },
    onChange: handleToggleChange
});


/**
*  Create a Tweety Panel
*  @public
*/
var panel = require("sdk/panel").Panel({
    contentURL: data.url("tweetyPanelbox.html"),
    contentScriptFile: [data.url("tweetybox.js")],
    width: 380,
    height: 200,
    onHide: handleHide
});

/**
*  Create a Toggle Button
*  @public
*/
function handleToggleChange(state) {
  if (state.checked) {
    panel.show({
      position: tweetyButton
    });
  }
}

function handleHide() {
  tweetyButton.state('window', {checked: false});
}