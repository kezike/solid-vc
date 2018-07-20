from socket import socket
import OpenSSL
import codecs
import ssl

if __name__ == "__main__":
    '''
    if len(sys.argv) < 3:
        print("Please include the statement path, certificate host, and certificate port in that order!")
    else:
      statement = sys.argv[1] #ie. /Users/kayodeezike/Documents/MEng/dig/solid-vc/sample_msg_1.json
      certHost = sys.argv[2] # ie. kayodeyezike.com
      certPort = sys.argv[3] # ie. 443
    '''
    statement = input("Enter path to statement: ") #ie. /Users/kayodeezike/Documents/MEng/dig/solid-vc/sample_msg_1.json
    certHost = input("Enter certificate host: ") # ie. kayodeyezike.com
    certPort = int(input("Enter certificate port: ")) # ie. 443
    cert = ssl.get_server_certificate((certHost, certPort))
    x509 = OpenSSL.crypto.load_certificate(OpenSSL.crypto.FILETYPE_PEM, cert)
    print("---CERT---")
    print(cert)
    print("---CERT---")
    print("---PUB_KEY---")
    pubKey = x509.get_pubkey()
    print(pubKey)
    print("---PUB_KEY---")
    print("---SER_NUM---")
    serNum = x509.get_serial_number()
    print(serNum)
    print("---SER_NUM---")
    print("---SIG_ALG---")
    sigAlg = x509.get_signature_algorithm()
    print(sigAlg)
    print(sigAlg.decode("utf-8"))
    print("---SIG_ALG---")
    print("---SUBJECT---")
    subject = x509.get_subject()
    print(subject)
    print("---SUBJECT---")
    print("---DIGEST---")
    digest = x509.digest('MD5')
    print(digest)
    print(digest.decode("utf-8"))
    print("---DIGEST---")
