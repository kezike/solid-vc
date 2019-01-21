#!/usr/bin/env python

#############################################################################
## Solid Verifiable Credentials Command Line Tool
##
#############################################################################

"""
Usage:
  ./svc-cli [options] issue <SUBJECT_ID> <CREDENTIAL_FILE>
  ./svc-cli [options] request <ISSUER_ID> <CREDENTIAL_REQEUST_FILE>
  ./svc-cli [options] respond <REQUEST_ID>
  ./svc-cli [options] review <MY_ID>
  ./svc-cli [options] verify <CREDENTIAL_ID>
  ./svc-cli (-h | --help)
  ./svc-cli (-v | --version)

Options:
  -a --accept    Accept credential request
  -r --reject    Reject credential request
  --timeout NUM  HTTP request timeout (secs) [default: 120].
  -o OUTPUT      Output file for svc commands
  -h --help      Display usage and options
  -v --version   Display version
"""

import os
import sys
import time

import requests

from docopt import docopt
args = docopt(__doc__, version='1.0')

g_output = args["-o"]

try:
  g_timeout = int(args["--timeout"])
  if g_timeout < 0: raise RuntimeError
except:
  print >>sys.stderr, \
  "ERROR: invalid --timeout argument; must be a number >= 0"
  sys.exit(1)

#===========================================================================
# MAIN
#===========================================================================

def get_inbox(target):
    return "https://kezike.solid.community/inbox"

#---------------------------------------------------------------------------

data = {}
headers = {}

if args["issue"]:
  g_subject_id = args["<SUBJECT_ID>"]
  g_subject_inbox = get_inbox(g_subject_id)
  g_cred_fn = args["<CREDENTIAL_FILE>"]
  g_cred_file = open(g_cred_fn, "r")
  g_cred_str = g_cred_file.read();
  g_cred_file.close()
  data = g_cred_str
  headers["content-type"] = "text/plain"
  r = requests.post(g_subject_inbox, headers=headers, data=data)
elif args["request"]:
  g_issuer_id = args["<ISSUER_ID>"]
  g_cred_req_fn = args["<CREDENTIAL_REQEUST_FILE>"]
elif args["respond"]:
  g_accept = args["-a"]
  g_reject = args["-r"]
elif args["review"]:
  g_my_id = args["<MY_ID>"]
  g_inbox = get_inbox(g_my_id)
elif args["verify"]:
  g_cred_id = args["<CREDENTIAL_ID>"]

if g_output:
  print("Writing output to %s..." % g_output)
  out = open(g_output, "wb")
  out.write(r.content)
  out.close()
  print("Successfully wrote output to %s!" % g_output)
else:
  print(r.content)

"""
print("URL: " + r.url)
print("HTTP response code: " + str(r.status_code))
print("HTTP response body: " + r.text)
print

result = r.json()

if result["result"] == "error":
   print("request error: " + result["message"])
   sys.exit(1)

if args["mons"]:
   print_mons(result, "ipv4")
   print_mons(result, "ipv6")
   for category in ["by_continent", "by_country", "by_orgtype"]:
      print_category_mons(result, category)

elif args["trace"] or args["ping"]:
   print("result ID: {}".format(result["result_id"]))

elif args["get"]:
   print("request status: " + result["status"])

   start_date = time.ctime(result["start_timestamp"])
   print("measurement submission date: " + start_date)

   if result["status"] == "completed":
      for k in ["values", "errors"]:
         print(k + ":")
         for mon, v in result[k].iteritems():
            print("  {} = {}".format(mon, v))
            print
"""
