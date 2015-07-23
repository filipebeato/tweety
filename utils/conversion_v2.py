# Another look at conversion of random data to valid utf-8

# Package requirements: 
# ---------------------------------------------------------
# 
#   * bitstring: pip install bitstring
# 
# ---------------------------------------------------------


import random
from bitstring import *

# ENCODING #
def encode(val,bitsperchar,numchars):
    b = BitStream(hex(val)[:-1])
    # print len(b)

    # Padding
    if len(b) != bitsperchar*numchars:
        for k in range((bitsperchar*numchars)-len(b)):
            b.prepend('0b0')
    # Get characters from Unicode table and make a string    
    chunks = ''
    for i in b.cut(bitsperchar):
        chunks+= unichr(int(i.bin[2:],2))
        # print hex(int(i.bin[2:],2))
    print chunks
    # Encode the string in utf-8
    utf = chunks.encode('utf-8')
    # Check that the two strings match
    print utf.decode('utf-8')
    print chunks == utf.decode('utf-8')
    return utf


# DECODING #
def decode(val,bitsperchar,numchars):
    chars= []
    # Get the Unicode code point of each character from the string.
    # Notice that you need to decode the characters first.
    for i in val.decode('utf-8'):
        chars.append(ord(i))
        #print ord(i)
        
    # Reconstruct the original bitstream from the Unicode code points
    bits = BitStream()
    for i in chars:
        if len(bin(i)) == (bitsperchar +2):
            bits.append(BitStream(bin(i)))
        else:
            temp = BitStream(bin(i))
            for j in range((bitsperchar+2)-len(bin(i))):
                temp.prepend('0b0')
            # print len(temp.bin)
            bits.append(temp)
    return bits    


if __name__ == '__main__':
    # Parameters #
    bitsperchar = 16 # How many bits in one utf-8 character do we want
    numchars = 140 # Number of characters

    # Testing #
    r = random.getrandbits(bitsperchar*numchars)
    # print hex(r)#, bin(r)
    bits = decode(encode(r,bitsperchar,numchars),bitsperchar,numchars)
    # Check that the reconstructed bitstring is equal to the original
    print int(bits.hex[2:],16) == r
    