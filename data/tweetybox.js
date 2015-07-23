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
        alert(text)
        textArea.value = '';
    }
}, false);

self.port.on("show", function onShow() {
    textArea.focus();
});


var tweetyPwdButton = document.getElementById("tweetypwdbox-button");
tweetyPwdButton.addEventListener('click', function onclick(event) {
    var tweetypwdBox = document.getElementById("tweetpwdbox");
    if(tweetypwdBox.type == "password") {
        tweetypwdBox.type = "text";
        tweetyPwdButton.style.backgroundImage = 'url("imgs/pwdnotshow-icon-16.png")';
    } else {
        tweetypwdBox.type = "password";
        tweetyPwdButton.style.backgroundImage = 'url("imgs/pwdshow-icon-16.png")';
    }
});



var tweetyitButton = document.getElementById("tweetyit-button");
tweetyitButton.addEventListener('click', function onclick(event) {
    if(textArea.value.length > 0)
        alert(textArea.value)
});






