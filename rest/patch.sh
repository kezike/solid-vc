#!/bin/sh

# curl -v 'Content-Type':'application/rcvefesparql-update' -H "Accept: text/n3" -b cookies.txt --data-urlencode "Delete { <#lgr> <http://dig.csail.mit.edu/2018/svc#locked> 0 } . Add { <#lgr> <http://dig.csail.mit.edu/2018/svc#locked> 1 . } ." -X PATCH $1

curl -v 'Content-Type':'application/rcvefesparql-update' -H "Accept: text/n3" -b cookies.txt --data-raw "PREFIX dc: <http://purl.org/dc/elements/1.1/> INSERT DATA { <http://example/book1> dc:title 'A new book' ; dc:creator 'A.N.Other' . }" -X PATCH $1
