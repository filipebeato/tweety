# Encoding random bitstrings to 2 byte unicode
from bitstring import *
#import unicodedata
import random

def eleven_to_utf(b):
    temp_0 = '0b110'
    temp_1 = '10'
    first, sec = b.unpack('bin:5,bin:6')
    utf = BitArray(temp_0+first+temp_1+sec)
    utf = utf.bin[2:]
    return utf

def utf_to_eleven(c):
    result = c.bin[5:10]+c.bin[12:]
    #print BitStream(result), len(c.bin)
    return BitStream(bin=result)


def utf_to_eleven_final(c):
    end = c.rfind('0b1')
    
    del c[end[0]:]
    print c
    return c

in_bits = 11 # how many bits we process at a time
size = 2L
#r = 3235827L # #random bits
r = random.getrandbits(size*88) 

# ENCODING #

x = BitStream(hex(r)[:-1])

print x.bin, bin(r), x
## TODO. Padding
# padding with 10* to a multiple of in_bits*4 for hexing..
#x.append('0b1')
#while len(x)%(in_bits*4) != 0:
#    x.append('0b0')
#print len(x)
#y = Bits(temp)
#print x.hex

chunks = []
# Cut to 11 bit chunks
for i in x.cut(11):
    chunks.append(i)
# convert to valid utf-8 two byte bitstrings
test = []
for j in chunks:
    test.append('{0:x}'.format(int(eleven_to_utf(j),2)))
# Form the final string
final =''
for t in test:
    print t.decode('hex').decode('utf-8')
    t = t.decode('hex').decode('utf-8')
    final = final + t
# print the utf-8 encoded string as unicode points    
#print final.decode('hex').decode('utf-8')
print final

# DECODING #
# Assume valid hex encoding of the final string as utf-8


#binary = BitArray(hex=final)
#chars = []
#for i in binary.cut(16):
#    chars.append(BitArray(i))
#num = BitStream()
#for k in chars:
#    num.append(utf_to_eleven(k))
#for k in range(len(chars)-1):
#    num.append(utf_to_eleven(chars[k]))

#num.append(utf_to_eleven_final(chars[-1]))
#print len(num.bin), num.bin, num, num == x


