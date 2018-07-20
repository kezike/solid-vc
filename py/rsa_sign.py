import sys
import json
import codecs
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
from base64 import b64encode, b64decode

def sign_msg(msg_loc, priv_loc, sig_loc):
    '''
    param: priv_loc - Path to private key
    param: msg_loc - Path to data
    param: sig_loc - Path to signature
    return: base64 encoded signature
    '''
    
    privValue = open(priv_loc, "r").read()
    rsakey = RSA.importKey(privValue)
    signer = PKCS1_v1_5.new(rsakey)
    digest = SHA256.new()

    msgValue = open(msg_loc, "r").read()
    digest.update(codecs.encode(json.dumps(msgValue)))
    signature = b64encode(signer.sign(digest))

    sigFile = open(sig_loc, "wb")
    sigFile.write(signature)
    sigFile.close()
    return signature

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Please include private key path, data path, and signature path in that order!")
    else:
        signature = sign_msg(sys.argv[1], sys.argv[2], sys.argv[3])
        print("signature: " + str(signature))