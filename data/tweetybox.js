/**
 * @fileOverview Tweety Add-On main file 
 * @author <a href="mailto:filipe.beato@esat.kuleuven.be">Filipe Beato</a>
 * @version 0.01
 *
 */
var textArea = document.getElementById("tweetbox");
textArea.addEventListener('keyup', function onkeyup(event) {
    if (event.keyCode == 13) {
        // Remove the newline.
        text = textArea.value.replace(/(\r\n|\n|\r)/gm,"");
        self.port.emit("text-entered", text);
        textArea.value = '';
    }
}, false);
// Listen for the "show" event being sent from the
// main add-on code. It means that the panel's about
// to be shown.
//
// Set the focus to the text area so the user can
// just start typing.
self.port.on("show", function onShow() {
    textArea.focus();
});