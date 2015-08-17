/**
 * @fileOverview ThreeFish Tweakable Block Cipher
 * 
 * @author <a href="mailto:filipe.beato@esat.kuleuven.be">Filipe Beato</a>
 * @version 0.01
 *
 */


"use strict";

// use 64bit int arithmetic (also available on Mozilla ctypes: Int64 + Uint64)
var i64 = require("./i64.js");
var StringView = require("./stringview.js");

/**
*
*    | block/key size |   #words  |   #rounds |
*    ------------------------------------------   
*    |    256 bits    |     4     |     72    |
*    |    512 bits    |     8     |     72    |
*    |    1024 bits   |     16    |     80    |
*    ------------------------------------------            
*
*    d = # rounds
*    i = word on position i
*    j = #words / 2 
*
*
*    Permutation
*                                    i  
*    #words  |  0  1  2  3  4  5  6  7  8  9  10  11  12  13  14  15  |
*    ------------------------------------------------------------------
*        4   |  0  3  2  1                                            |
*        8   |  2  1  4  7  6  5  0  3                                |
*        16  |  0  9  2  13 6  11 4  15 10 7  12  3   14   5   8   1  |
*    ------------------------------------------------------------------
*
*
*    SubKey rotation
*                                      
* s |  0   1   2   3   4   5   6   7   8   9  10  11  12    13     14    15   |
* -----------------------------------------------------------------------------
* 0 |  0   1   2   3   4   5   6   7   8   9  10  11  12  13+t0  14+t1  15+0  |
* 1 |  1   2   3   4   5   6   7   8   9  10  11  12  13  14+t1  15+t2  16+1  |
* 2 |  2   3   4   5   6   7   8   9  10  11  12  13  14  15+t2  16+t0   0+2  |
* 3 |  3   4   5   6   7   8   9  10  11  12  13  14  15  16+t0   0+t1   1+3  |
* 4 |  4   5   6   7   8   9  10  11  12  13  14  15  16   0+t1   1+t2   2+4  |
* 5 |  5   6   7   8   9  10  11  12  13  14  15  16   0   1+t2   2+t0   3+5  |
* 6 |  6   7   8   9  10  11  12  13  14  15  16   0   1   2+t0   3+t1   4+6  |
* 7 |  7   8   9  10  11  12  13  14  15  16   0   1   2   3+t1   4+t2   5+7  |
* 8 |  8   9  10  11  12  13  14  15  16   0   1   2   3   4+t2   5+t0   6+8  |
* 9 |  9  10  11  12  13  14  15  16   0   1   2   3   4   5+t0   6+t1   7+9  |
*10 | 10  11  12  13  14  15  16   0   1   2   3   4   5   6+t1   7+t2   8+10 |
*11 | 11  12  13  14  15  16   0   1   2   3   4   5   6   7+t2   8+t0   9+11 |
*12 | 12  13  14  15  16   0   1   2   3   4   5   6   7   8+t0   9+t1  10+12 |
*13 | 13  14  15  16   0   1   2   3   4   5   6   7   8   9+t1  10+t2  11+13 |
*14 | 14  15  16   0   1   2   3   4   5   6   7   8   9  10+t2  11+t0  12+14 |
*15 | 15  16   0   1   2   3   4   5   6   7   8   9  10  11+t0  12+t1  13+15 |
*16 | 16   0   1   2   3   4   5   6   7   8   9  10  11  12+t1  13+t2  14+16 |
*17 |  0   1   2   3   4   5   6   7   8   9  10  11  12  13+t2  14+t0  15+17 |
*18 |  1   2   3   4   5   6   7   8   9  10  11  12  13  14+t0  15+t1  16+18 |
*18 |  2   3   4   5   6   7   8   9  10  11  12  13  14  15+t1  16+t2   0+19 |
*20 |  3   4   5   6   7   8   9  10  11  12  13  14  15  16+t2   0+t0   1+20 |
* -----------------------------------------------------------------------------
*
*
*  k[13] = k[s]+t[s mod 3]
*  k[14] = k[s]+t[(s+1) mod 3]
*  k[15] = k[s]+s
*
*
*/


var tfish = module.exports = tfish || { 

    // Pre-Computed Macros for Rotation Tables for R(d,j) version 1.3
    table256: [ [14,16],[52,57],[23,40],[3,5],[25,33],[46,12],[58,22],[32,32] ],
    // table512[d][j] -- d \in [0,7] and j \in [0,3]
    table512: [ [46,36,19,37],[33,27,14,42],[17,49,36,39],[37,44,9,54],[39,30,34,24],[13,50,10,17],[25,29,39,43],[8,35,56,22] ],
    // table1024[d][j] -- d \in [0,7] and j \in [0,7]
    table1024: [ [24,13,8,47,8,17,22,37],[38,19,10,55,49,18,23,52],[33,4,51,13,34,41,59,17],[56,5,20,48,41,47,28,16,25],[41,9,37,31,12,47,44,30],[16,34,56,51,4,53,42,41],[31,44,47,46,19,42,44,25],[9,48,35,52,23,31,37,20] ],

    // pre computed d per round d_mod[i] = d mod 8
    d_mod: [0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7],

    // pre computed subkey mod per round (for i>#nwords-3 add64 tweak and state)
    subkeys: [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,0],[3,4,5,6,7,8,9,10,11,12,13,14,15,16,0,1],[4,5,6,7,8,9,10,11,12,13,14,15,16,0,1,2],[5,6,7,8,9,10,11,12,13,14,15,16,0,1,2,3],[6,7,8,9,10,11,12,13,14,15,16,0,1,2,3,4],[7,8,9,10,11,12,13,14,15,16,0,1,2,3,4,5],[8,9,10,11,12,13,14,15,16,0,1,2,3,4,5,6],[9,10,11,12,13,14,15,16,0,1,2,3,4,5,6,7],[10,11,12,13,14,15,16,0,1,2,3,4,5,6,7,8],[11,12,13,14,15,16,0,1,2,3,4,5,6,7,8,9],[12,13,14,15,16,0,1,2,3,4,5,6,7,8,9,10],[13,14,15,16,0,1,2,3,4,5,6,7,8,9,10,11],[14,15,16,0,1,2,3,4,5,6,7,8,9,10,11,12],[15,16,0,1,2,3,4,5,6,7,8,9,10,11,12,13],[16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,0],[3,4,5,6,7,8,9,10,11,12,13,14,15,16,0,1]],


    /**
    *   General Permutation function for statesize (256,512,1024)
    *
    *   @param object (by ref): input, wordsize: state/64
    *   @return permuted array
    *   @public
    */
    permutation: function(object) {
        var aux = object.words[1];
        if(object.state==256) {
            object.words[1] = object.words[3];
            object.words[3] = aux;            
        }
        else if (object.state==512) {
            aux = object.words[0];
            object.words[0] = object.words[2];
            object.words[2] = object.words[4];
            object.words[4] = object.words[6];
            object.words[6] = aux;            
            aux = object.words[3];
            object.words[3] = object.words[7];
            object.words[7] = aux;
        }
        else {
            object.words[1] = object.words[9];
            object.words[9] = object.words[7];
            object.words[7] = object.words[15];
            object.words[15] = aux;
            aux = object.words[3];
            object.words[3] = object.words[13];
            object.words[13] = object.words[5];
            object.words[5] = object.words[11];
            object.words[11] = aux;
            aux = object.words[4];
            object.words[4] = object.words[6];
            object.words[6] = aux;
            aux = object.words[8];
            object.words[8] = object.words[10];
            object.words[10] = object.words[12];
            object.words[12] = object.words[14];
            object.words[14] = aux;
        }
    },


    permutationInv: function(object) {
        var aux = object.words[1];
        if(object.state==256) {
            object.words[1] = object.words[3];
            object.words[3] = aux;            
        }
        else if (object.state==512) {
            aux = object.words[0];
            object.words[0] = object.words[6];
            object.words[6] = object.words[4];
            object.words[4] = object.words[2];
            object.words[2] = aux;            
            aux = object.words[3];
            object.words[3] = object.words[7];
            object.words[7] = aux;
        }
        else {            
            object.words[1] = object.words[15];
            object.words[15] = object.words[7];
            object.words[7] = object.words[9];
            object.words[9] = aux;                      
            aux = object.words[3];
            object.words[3] = object.words[11];
            object.words[11] = object.words[5];
            object.words[5] = object.words[13];
            object.words[13] = aux;
            aux = object.words[4];
            object.words[4] = object.words[6];
            object.words[6] = aux;
            aux = object.words[8];
            object.words[8] = object.words[14];
            object.words[14] = object.words[12];
            object.words[12] = object.words[10];
            object.words[10] = aux;
        }
    },




    /**
    *   Transforms the key and tweak operation into Nr/4+1 subkeys
    *   @return subkeys array of subkeys
    *   @public
    */
    keyschedule: function(key) {
        // var subkey = [];
        var kw = new i64(0xA9FC1A22, 0x1BD11BDA);
        for (var i = 0; i < 16; i++){
            kw = kw.xor64(key[i]);
        }
        return kw;
    },


    /**
    *   3fish Encrypt Function
    *
    *   @param data: input data, key: secret key, tweak: tweak, wordsize: word size
    *   @return permuted array
    *   @public
    */
    encrypt: function(data, key, tweak, statesize) {
        var rounds = 72;    // normal for 256, 512
        var wordsize = statesize/64;
        if (wordsize > 8) 
            rounds = 80;    // for 1024

        var obj = {
            words: data,
            state: statesize
        };

        // compose the key/subkeys with tweak
        key.push(tfish.keyschedule(key));
        tweak.push(tweak[0].xor64(tweak[1])); // t2 = t1 ^ t2

        // subkey add64ition (0)
        for (var i = 0; i < wordsize-3; i++) {
            obj.words[i] = obj.words[i].add64(key[i]);
        }
        obj.words[wordsize-3] = obj.words[wordsize-3].add64(key[wordsize-3].add64(tweak[0]));
        obj.words[wordsize-2] = obj.words[wordsize-2].add64(key[wordsize-2].add64(tweak[1]));
        obj.words[wordsize-1] = obj.words[wordsize-1].add64(key[wordsize-1]);
        
        // start rounds 
        for (var d = 0, s=1; d < rounds; d+=4, s++){
            for (var l=d; l < d+4; l++) {
                // mix operations
                for(var i=0; i < wordsize; i+=2) {
                    obj.words[i] = obj.words[i].add64(obj.words[i+1]);
                    obj.words[i+1] = obj.words[i+1].rotateL64(tfish.table1024[(l%8)][i/2]);
                    obj.words[i+1] = obj.words[i+1].xor64(obj.words[i]);
                }
                // permutation operation
                tfish.permutation(obj);
            }
            // subkey add64itions 
            for (var i = 0; i < wordsize-3; i++) {
                obj.words[i] = obj.words[i].add64(key[tfish.subkeys[s][i]]);
            }
            obj.words[wordsize-3] = obj.words[wordsize-3].add64(key[tfish.subkeys[s][wordsize-3]].add64(tweak[s%3]));
            obj.words[wordsize-2] = obj.words[wordsize-2].add64(key[tfish.subkeys[s][wordsize-2]].add64(tweak[(s+1)%3]));
            obj.words[wordsize-1] = obj.words[wordsize-1].add64(key[tfish.subkeys[s][wordsize-1]].add64(new i64(s,0)));

        }
        return obj.words;
    },



    /**
    *   3fish Decrypt Function
    *
    *   @param data: input data, key: secret key, tweak: tweak, wordsize: word size
    *   @return plaintext
    *   @public
    */
    decrypt: function(data, key, tweak, statesize) {
        var rounds = 72;    // normal for 256, 512
        var wordsize = statesize/64;
        if (wordsize > 8) 
            rounds = 80;    // for 1024
        var j = wordsize/2;
        var obj = {
            words: data,
            state: statesize
        }

        // compose the key/subkeys with tweak
        key.push(tfish.keyschedule(key));
        tweak.push(tweak[0].xor64(tweak[1])); // t2 = t1 ^ t2

        // start rounds 
        for (var d = rounds, s=(rounds)/4; s > 0; d-=4, s--){

            // subtract subkeys
            for (var i = 0; i < wordsize-3; i++){
                obj.words[i] = obj.words[i].sub64(key[tfish.subkeys[s][i]]);
            }                    
            obj.words[wordsize-3] = obj.words[wordsize-3].sub64(key[tfish.subkeys[s][wordsize-3]].add64(tweak[s%3]));
            obj.words[wordsize-2] = obj.words[wordsize-2].sub64(key[tfish.subkeys[s][wordsize-2]].add64(tweak[(s+1)%3]));
            obj.words[wordsize-1] = obj.words[wordsize-1].sub64(key[tfish.subkeys[s][wordsize-1]].add64(new i64(s,0)));

            // mix operations
            for (var l=d-1; l > d-5; l--) {
                // invert permutation
                tfish.permutationInv(obj);
                for(var i=0; i < wordsize; i+=2) {                   
                    obj.words[i+1] = obj.words[i+1].xor64(obj.words[i]);
                    obj.words[i+1] = obj.words[i+1].rotateR64(tfish.table1024[l%8][i/2]);
                    obj.words[i] = obj.words[i].sub64(obj.words[i+1]);
                }               
            }
        }
        // subkey subtraction
        for (var i = 0; i < wordsize-3; i++) {
            obj.words[i] = obj.words[i].sub64(key[i]);
        }
        obj.words[wordsize-3] = obj.words[wordsize-3].sub64(key[wordsize-3].add64(tweak[0]));
        obj.words[wordsize-2] = obj.words[wordsize-2].sub64(key[wordsize-2].add64(tweak[1]));
        obj.words[wordsize-1] = obj.words[wordsize-1].sub64(key[wordsize-1]);

        // return object with state size and words
        return obj.words;
    },


};






// ==========================================================================
//  FOR Testing purposes....

function test() {
    // tfish.enctest();
    var k = new StringView("This is my password");
    var key = Array.prototype.slice.call(StringView.base64ToBytes(k.toBase64()));
    var dec_key = Array.prototype.slice.call(StringView.base64ToBytes(k.toBase64()));
    // var t = new StringView("tweety");
    // var tweak = Array.prototype.slice.call(StringView.base64ToBytes(t.toBase64()));
    var tweak = [0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00, 0x0F, 0x0E, 0x0D, 0x0C, 0x0B, 0x0A, 0x09, 0x08];
    // pad tweak to 128~bits


    var input = ["This is weirds", "I am very important person and I want to try this out", "Is this a valid value"];

    var _zeroPadd64ing = '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0';

    for(var i=0; i < input.length; i++) {
        console.log("### Encrypt: "+input[i]+"\n");

        var padlen = 32 - (input[i].length % 32);
        var message = input[i];
        if(padlen != 32) {
            message = message + _zeroPadd64ing.substring(0, padlen);
        }
        
        var str = new StringView(input[i])
        var in_bytes = Array.prototype.slice.call(StringView.base64ToBytes(str.toBase64()));
        console.log("\n---------------------------------------------------\n");
        console.log("### Encrypt: "+message);
        var iv = IV1024I64Array();
        
        var enc = encryptBytesCBC(key, tweak, in_bytes, iv);

        console.log("\n---------------------------------------------------\n");
        var dec = decryptBytesCBC(dec_key, tweak, enc);
        var str_dec = StringView.bytesToBase64(dec);
        str_dec = StringView.makeFromBase64(str_dec).toString();
        console.log("### Decrypt Result: ["+str_dec.trim()+"]\n");        
        console.log("\n---------------------------------------------------\n");
    }
}



function testTweety() {
    var k = new StringView("This is my password");
    var key = Array.prototype.slice.call(StringView.base64ToBytes(k.toBase64()));
    var dec_key = Array.prototype.slice.call(StringView.base64ToBytes(k.toBase64()));
    // var t = new StringView("tweety");
    // var tweak = Array.prototype.slice.call(StringView.base64ToBytes(t.toBase64()));
    var tweak = [0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00, 0x0F, 0x0E, 0x0D, 0x0C, 0x0B, 0x0A, 0x09, 0x08];
    // pad tweak to 128~bits

    key = i64.bytesToArray(arrayFillTo1024Bits(key));
    tweak = i64.bytesToArray(tweak);

    var input = ["This is weirds", "I am very important person and I want to try this out", "Is this a valid value"];

    var _zeroPadd64ing = '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0';

    for(var i=0; i < input.length; i++) {
        console.log("### Encrypt: "+input[i]+"\n");       
        var str = new StringView(input[i])
        var in_bytes = Array.prototype.slice.call(StringView.base64ToBytes(str.toBase64()));
        var inpBlocks = i64.bytesToArray(arrayFillTo1024Bits(in_bytes)); 
        console.log("\n---------------------------------------------------\n");
        console.log("### Encrypt: "+str);
        
        var encBlocks = tfish.encrypt(inpBlocks, key, tweak,1024);
        console.log("\n---------------------------------------------------\n");
        
        var dec = tfish.decrypt(encBlocks, key, tweak,1024)
        dec = i64.arrayToBytes(dec);

        var str_dec = StringView.bytesToBase64(dec);
        str_dec = StringView.makeFromBase64(str_dec).toString();
        console.log("### Decrypt Result: ["+str_dec.trim()+"]\n");        
        console.log("\n---------------------------------------------------\n");
    }
}





function arrayFillTo1024Bits(arr){
    // while(arr.length % 128) arr.push(0);
    // return arr;
    return i64.fillArray(arr,1024);
}

function IV1024I64Array(){
    var time = new Date().getTime();
    var IV = [];
    for(var i=0; i < 4; i++){
        IV.push(time & 0xFF);
        time >>= 8;
    }
    do {
        IV.push(Math.floor(Math.random()*256))
    } while(IV.length < 128);
    return i64.bytesToArray(IV);
}




function encryptBytesCBC(keyBytes, tweakBytes, plaintextBytes, iv){
    var key = i64.bytesToArray(arrayFillTo1024Bits(keyBytes));
    var tweak = i64.bytesToArray(tweakBytes);
    var inpBlocks = i64.bytesToBlocks(arrayFillTo1024Bits(plaintextBytes));
    var encBlocks = [tfish.encrypt(iv, key, tweak,1024)];
    // console.log(encBlocks)
    for(var i=0; i < inpBlocks.length; i++){
        encBlocks.push(tfish.encrypt(i64.xor64Block(inpBlocks[i], encBlocks[i]),key, tweak,1024));
    }
    var enc = i64.blocksToBytes(encBlocks);
    return enc;
}

function decryptBytesCBC(keyBytes, tweakBytes, encryptedBytes){
    var key = i64.bytesToArray(arrayFillTo1024Bits(keyBytes));
    var tweak = i64.bytesToArray(tweakBytes);
    var encBlocks = i64.bytesToBlocks(arrayFillTo1024Bits(encryptedBytes));
    var decBlocks = [];
    for(var i=1; i < encBlocks.length; i++){
        decBlocks.push(i64.xor64Block(tfish.decrypt(encBlocks[i], key, tweak,1024), encBlocks[i - 1]));
    }
    return i64.blocksToBytes(decBlocks);
}

// ==========================================================================


// testTweety()
// test();