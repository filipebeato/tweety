/**
 * @fileOverview Tweety Binary Convertor 
 * @author <a href="mailto:filipe.beato@esat.kuleuven.be">Filipe Beato</a>
 * @author <a href="mailto:kimmo.halunen@vtt.fi">Kimmo Halunen</a>
 * @version 0.01
 *
 */

function tweetyBinaryEncoder(data) {
    // convert random bits into binary strin

    // convert each 2bytes into unicode

    // convert unicode to utf-8
    str = str.replace(/\r\n/g, '\n');
    var utf8 = [], p = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            utf8[p++] = c;
        } else if (c < 2048) {
            utf8[p++] = (c >> 6) | 192;
            utf8[p++] = (c & 63) | 128;
        } else {
            utf8[p++] = (c >> 12) | 224;
            utf8[p++] = ((c >> 6) & 63) | 128;
            utf8[p++] = (c & 63) | 128;
        }
    }
    return utf8;
}

function tweetyBinaryDecoder() {




}


exports.encode = tweetyBinaryEncoder;
exports.decode = tweetyBinaryDecoder;