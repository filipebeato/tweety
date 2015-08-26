# Tweety Firefox Add-on

(On development...)

Tweety is a novel, tailored, and secure system for privacy in Twitter, based on tweakable blockciphers and Sponge functions. Tweety guarantees semantic security while complying with the commonly imposed space restrictions and allowing limited targeted advertisement.

The hashtag allows users to filter information and at the same time re-randomize the ciphertext.


# Requirements

- Firefox 38+

- JPM (https://www.npmjs.com/package/jpm)



# Run, Test, and Pack

run: jpm run tweety / to run on a specific firefox profile: jpm run -p [profile_name] tweety 

test: jpm test tweety

pack xpi: jpm xpi



# Generate Documentation

jsdoc: http://usejsdoc.org/