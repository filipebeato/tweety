/**
 * @fileOverview Tweety Cipher
 * @author <a href="mailto:filipe.beato@esat.kuleuven.be">Filipe Beato</a>
 * @version 0.01
 *
 */
let {Cc, Ci} = require("chrome");
var i64 = require("./i64.js");
var tfish = require("./3fish.js");
var StringView = require("./stringview.js");


/**
*
* Tweety Cipher
*
*/
var tweetyCipher = module.exports = tweetyCipher || { 


    /**
    *   Tweety encrypt Simple Version 
    *   Using 3Fish, with limit of hashtag to be 128~bits
    *
    *   @param message, hashtab, timestamp, key 
    *   @return result Bytes
    *   @public
    */
    encrypt: function(message,hashtag,timestamp,key) {

        // input bytes
        var in_blocks = i64.bytesToArray(i64.fillArray(input,1024)); 
        // key bytes
        var k = i64.bytesToArray(i64.fillArray(key,1024));
        // timestamp bytes
        var tk = i64.bytesToArray(timestamp);
        // hashtag bytes
        var ht = i64.bytesToArray(i64.fillArray(hashtag,1024));
        var output = tfish.decrypt(in_blocks, k, tk, 1024);
        return output;
    },


    /**
    *   Tweety encrypt Simple Version 
    *   Using 3Fish, with limit of hashtag to be 128~bits
    *
    *   @param message, hashtab, timestamp, key 
    *   @return result Bytes
    *   @public
    */
    decrypt: function(message,hashtag,timestamp,key) {

        // input bytes
        var in_blocks = i64.bytesToArray(i64.fillArray(input,1024)); 
        // key bytes
        var k = i64.bytesToArray(i64.fillArray(key,1024));
        // timestamp bytes
        var tk = i64.bytesToArray(timestamp);
        // hashtag bytes
        var ht = i64.bytesToArray(i64.fillArray(hashtag,1024));
        var output = tfish.decrypt(in_blocks, k, tk, 1024);

        return output;
    },


    /**
    *   Tweety encrypt LRW (extended tweak space) Version 
    *   Using 3Fish, with limit of hashtag to be 128~bits
    *
    *   @param message, hashtab, timestamp, key 
    *   @return result Bytes
    *   @public
    */    
    encryptLRW: function (input, hashtag, timestamp, key) {
        // LRW version

        // input bytes
        var in_blocks = i64.bytesToArray(i64.fillArray(input,1024)); 
        // key bytes
        var k = i64.bytesToArray(i64.fillArray(key,1024));
        // timestamp bytes
        var tk = i64.bytesToArray(timestamp);
        // hashtag bytes
        var ht = i64.bytesToArray(i64.fillArray(hashtag,1024));

        // tfish(in,tk,k) -> xor(ht)-> tfish(in,tk,k)
        var output = tfish.encrypt(in_blocks, k, tk, 1024);
        output = i64.xor64Block(output, ht);
        output = tfish.encrypt(output, k, tk, 1024);

        // return the bytes
        return i64.arrayToBytes(output);           
    },


    /**
    *   Tweety decrypt LRW (extended tweak space) Version 
    *   Using 3Fish, with limit of hashtag to be 128~bits
    *
    *   @param message, hashtab, timestamp, key 
    *   @return result Bytes
    *   @public
    */    
    decryptLRW: function (input, hashtag, timestamp, key) {
        // LRW version

        // input bytes
        var in_blocks = i64.bytesToArray(i64.fillArray(input,1024)); 
        // key bytes
        var k = i64.bytesToArray(i64.fillArray(key,1024));
        // timestamp bytes
        var tk = i64.bytesToArray(timestamp);
        // hashtag bytes
        var ht = i64.bytesToArray(i64.fillArray(hashtag,1024));

        // tfish(in,tk,k) -> xor(ht)-> tfish(in,tk,k)
        var output = tfish.decrypt(in_blocks, k, tk, 1024);
        output = i64.xor64Block(output, ht);
        output = tfish.decrypt(output, k, tk, 1024);

        // return the bytes
        return i64.arrayToBytes(output);           
    },




    /**
    *   hash
    *   @param value, algorithm
    *   @return hash result Bytes
    *   @public
    */    
    hash: function(value) {
        var h = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
        h.init(h.MD5);

        var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);

        // we use UTF-8 here, you can choose other encodings.
        converter.charset = "UTF-8";
        var result = {};
        var data = converter.convertToByteArray(value, result);
        h.update(data, data.length);
        var hash = h.finish(true);
        return hash; // hash is base64 encoded (if finish false: binary)    
    },

};

function toHexStr(value) {
    return ("0" + value.toString(16)).slice(-2);
}


function tweetyTest() {
    var key = new StringView("This is my password");
    key = Array.prototype.slice.call(StringView.base64ToBytes(key.toBase64()));

    var hashtag = new StringView("Hashtag");
    hashtag = Array.prototype.slice.call(StringView.base64ToBytes(hashtag.toBase64()));

    var input = ["This is weirds", "I am very important person and I want to try this out", "Is this a valid value"];
    var tstamp = [0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00, 0x0F, 0x0E, 0x0D, 0x0C, 0x0B, 0x0A, 0x09, 0x08];


    for(var i=0; i < input.length; i++) {
        console.log("\n---------------------------------------------------\n");
        console.log("### Encrypt: "+input[i]);
        var str = new StringView(input[i])
        var in_bytes = Array.prototype.slice.call(StringView.base64ToBytes(str.toBase64()));
        
        var enc = tweetyCipher.encryptLRW(in_bytes,hashtag,tstamp,key)
        console.log("\n---------------------------------------------------\n");
        console.log("### Encryption Result: ["+enc+"]\n");                
        console.log("\n---------------------------------------------------\n");
        var dec = tweetyCipher.decryptLRW(enc,hashtag,tstamp,key)
        var data = StringView.bytesToBase64(dec);
        data = StringView.makeFromBase64(data).toString();
        console.log("### Decryption Result: ["+data+"]\n");
        console.log("\n---------------------------------------------------\n");


        var hash =  tweetyCipher.hash(input[i]);
        var s = [toHexStr(hash.charCodeAt(i)) for (i in hash)].join("");
        console.log("### Hash-Result Result: ["+s+"]\n");
    }
}