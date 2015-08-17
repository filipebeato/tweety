/**
 * @fileOverview Tweety Binary Convertor 
 * @author <a href="mailto:filipe.beato@esat.kuleuven.be">Filipe Beato</a>
 * @author <a href="mailto:kimmo.halunen@vtt.fi">Kimmo Halunen</a>
 * @version 0.01
 *
 */

var StringView = require("./stringview.js");

/**
*
* Convert UTF-8 into Uint8ByteArray: To extend see: StringView API 
*
*/
var convert = module.exports = convert || { 

    stringToBytes: function(str) {
        var myString = new StringView(str);
        return StringView.base64ToBytes(myString.toBase64());
    },


    bytesToString: function(buffer) {
        return StringView.makeFromBase64(StringView.bytesToBase64(buffer)).toString();
    },

    bufferToArray: function(buffer) {
        return Array.prototype.slice.call(buffer);
    },

    stringToBase64: function(str) {
        var myString = new StringView(str);
        return myString.toBase64(str));
    },

    base64ToString: function(b64_str) {
        return StringView.makeFromBase64(b64_str).toString();
    },

    printArrayBuffer: function(buffer) {
        console.log("ArrayBuffer: "+bufferToArray(buffer));
    },


};



//  For testing purposes...
var utf8 = {

    stringToUtf8ByteArray: function(str) {
        // TODO(user): Use native implementations if/when available
        str = str.replace(/\r\n/g, '\n');
        var out = [], p = 0;
        for (var i = 0; i < str.length; i++) {
          var c = str.charCodeAt(i);
          if (c < 128) {
            out[p++] = c;
          } else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
          } else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
          }
        }
        return out;
    },

};
