// NOTE: For Mozilla Firefox Extensions Uint64 and Int64 is available using ctypes: 
// Uint64: https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes/js-ctypes_reference/UInt64
// int64: https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes/js-ctypes_reference/Int64


/**
 *  int 64bit operations
 *
 * @param {number} low  The low (signed) 32 bits of the long.
 * @param {number} high  The high (signed) 32 bits of the long.
 * @constructor
 */
var i64 = module.exports = i64 || function(low, high) {
  /**
   * lower bits
   * @type {number}
   * @private
   */
  this.l = low | 0;  // force 32 signed bits.

  /**
   * higher bits
   * @type {number}
   * @private
   */
  this.h = high | 0;  // force 32 signed bits.
};



i64.fromBits = function(low, high) {
    return new i64(low, high);
};


i64.fromBytes = function(b0, b1, b2, b3, b4, b5, b6, b7){
    return new i64(((b4 & 0xFF) << 24) | ((b5 & 0xFF) << 16) | ((b6 & 0xFF) << 8) | (b7 & 0xFF), ((b0 & 0xFF) << 24) | ((b1 & 0xFF) << 16) | ((b2 & 0xFF) << 8) | (b3 & 0xFF));
};



i64.prototype.toBytes = function(){
    return [ ((this.h >>> 24) & 0xFF) , ((this.h >>> 16) & 0xFF) , ((this.h >>> 8) & 0xFF) , ((this.h >>> 0) & 0xFF) , ((this.l >>> 24) & 0xFF) , ((this.l >>> 16) & 0xFF) , ((this.l >>> 8) & 0xFF) , ((this.l >>> 0) & 0xFF) ];
};


i64.prototype.add64 = function(value) { 
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var x48 = this.h >>> 16;
    var x32 = this.h & 0xFFFF;
    var x16 = this.l >>> 16;
    var x00 = this.l & 0xFFFF;

    var y48 = value.h >>> 16;
    var y32 = value.h & 0xFFFF;
    var y16 = value.l >>> 16;
    var y00 = value.l & 0xFFFF;

    var z48 = 0, z32 = 0, z16 = 0, z00 = 0;
    z00 += x00 + y00;
    z16 += z00 >>> 16;
    z00 &= 0xFFFF;
    z16 += x16 + y16;
    z32 += z16 >>> 16;
    z16 &= 0xFFFF;
    z32 += x32 + y32;
    z48 += z32 >>> 16;
    z32 &= 0xFFFF;
    z48 += x48 + y48;
    z48 &= 0xFFFF;
    return i64.fromBits((z16 << 16) | z00, (z48 << 16) | z32);

};


i64.prototype.sub64 = function(value) {
    var l = ((~value.l) >>> 0) + 1;
    var h = (~value.h) >>> 0;
    if(l > 0xffffffff) {
        ++h;
    }
    return this.add64({l: l >>> 0, h: h >>> 0});
};


i64.prototype.xor64 = function(value) {
    return i64.fromBits((this.l ^ value.l) >>> 0, (this.h ^ value.h) >>> 0);
};


i64.prototype.or64 = function(value) {
    return i64.fromBits(this.l | value.l, this.h | value.h);
};


i64.prototype.shiftL64 = function(value) {
    value &= 63;
    if (value == 0) {
        return this;
    } else {
        var low = this.l;
        if (value < 32) {
            var high = (this.h << value) | (low >>> (32 - value));
            return i64.fromBits(low<<value, high);
        } else {
            return i64.fromBits(0, low << (value - 32));
        }
    }
};


i64.prototype.shiftR64 = function(value) {
    value &= 63;
    if (value == 0) {
        return this;
    } else {
        var high = this.h;
        if (value < 32) {
            var low = (this.l >>> value) | (high << (32 - value));
            return i64.fromBits(low, high >> value);
        } else {
            return i64.fromBits(high >> (value - 32), high >= 0 ? 0 : -1);
        }
    }
};


i64.prototype.UshiftR64 = function(value) {
    value &= 63;
    if (value == 0) {
        return this;
    } else {
        var high = this.h;
        if (value < 32) {
            var low = this.l;
            return i64.fromBits((low >>> value | (high << (32 - value))), (high >>> value));
        } else if (value == 32) {
            return i64.fromBits(high, 0);
        } else {
            return i64.fromBits(high >>> (value - 32), 0);
        }
    }
};


/**
*   Rotate Operation (note that in some architectures this is given by hardware and macros)
*
*   @param x.rotate(by value)
*   @public
*/

i64.prototype.rotateL64 = function(value) {
    var temp = this.UshiftR64(64-value);
    return this.shiftL64(value).or64(temp);
}

i64.prototype.rotateR64 = function(value) {
    var temp = this.shiftL64(64-value);
    return this.UshiftR64(value).or64(temp);
}



i64.xor64Block = function(x,y) {
    for(var i =0; i < x.length; i++) {
        x[i] = (x[i].xor64(y[i]));
    }
    return x;
};


i64.blocksToBytes = function(blocks){
    return [].concat.apply([], (blocks.map(function(block){
            return i64.arrayToBytes(block);
        })));
}


i64.arrayToBytes = function(value) {
    return value.map(function(elem){
            return elem.toBytes();
        }).reduce(function(a, b){
                return a.concat(b);
        }
    );
};


i64.bytesToBlocksSize = function(bytes,size){
    var blocks = [];
    var bytes_size = (size/8); 
    for(var i=0; i < bytes.length; i += bytes_size){
        blocks.push(i64.fillArray(bytes.slice(i, i + bytes_size),size));
    }
    return blocks;
}


i64.fillArray = function(array,size){
    var bytes_size = (size/8); 
    while(array.length % bytes_size) 
        array.push(0);
    return array;
}

i64.bytesToBlocks = function(value) {
    return i64.bytesToBlocksSize(value,1024).map(function(block){return i64.bytesToArray(block);});
}


i64.bytesToArray = function(byteArray){
    var ints = [];
    for(var i = 0; i * 8 < byteArray.length; i++){
        var bytes = [];
        for(var j = 0; j < 8; j++){
            var k = i * 8 + j;
            bytes[j] = (k >= byteArray.length) ? 0 : byteArray[k];
        }
        ints[i] = i64.fromBytes(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]);
    }
    return ints;
}
