import sys
import codecs
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
from base64 import b64encode, b64decode

def gen_key(priv_loc, pub_loc):
    key = RSA.generate(2048)
    privFile = open(priv_loc, "wb")
    privFile.write(key.exportKey("PEM"))
    privFile.close()
    privFile = open(priv_loc, "r")
    privFileMin = open(priv_loc + "_min", "wb")
    privFileLines = privFile.readlines()
    numLines = len(privFileLines)
    privValueMin = ""
    for i in range(numLines):
        if i == 0 or i == numLines - 1:
            continue
        privValueMin += privFileLines[i]
    privFileMin.write(codecs.encode(privValueMin))
    privFileMin.close()
    privFile.close()

    pubFile = open(pub_loc, "wb")
    pubFile.write(key.publickey().exportKey("PEM"))
    pubFile.close()
    pubFile = open(pub_loc, "r")
    pubFileMin = open(pub_loc + "_min", "wb")
    pubFileLines = pubFile.readlines()
    numLines = len(pubFileLines)
    pubValueMin = ""
    for i in range(numLines):
        if i == 0 or i == numLines - 1:
            continue
        pubValueMin += pubFileLines[i]
    pubFileMin.write(codecs.encode(pubValueMin))
    pubFileMin.close()
    pubFile.close()
    return (priv_loc, pub_loc)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Please include private key path and public key path in that order!")
    else:
        keyPair = gen_key(sys.argv[1], sys.argv[2])
        print("keyPair: " + str(keyPair))
