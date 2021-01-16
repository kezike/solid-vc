#!/bin/sh

data=`cat $2`
OIFS=$IFS

# Extract relative file name
IFS='/'
fileNamePartsOne=($2)
fileNameNumPartsOne=${#fileNamePartsOne[@]}
fileNameOne=${fileNamePartsOne[fileNameNumPartsOne-1]}

# Extract file name and file extension
IFS='.'
fileNamePartsTwo=($fileNameOne)
fileNameNumPartsTwo=${#fileNamePartsTwo[@]}
fileName=${fileNamePartsTwo[0]}
fileExt=${fileNamePartsTwo[1]}
IFS=$OIFS

# Supported MIME Types
n3Mime='text/n3'
ttlMime='text/turtle'
xmlMime='application/rdf+xml'
nquadsMime='application/n-quads'
ntriplesMime='application/n-triples'
jsonldMime='application/ld+json'
jsonMime='application/json' # // TODO - Currently unsupported by Solid Tabulator
htmlMime='text/html'
plainMime='text/plain'

# Supported file extensions
n3Ext='n3'
ttlExt='ttl'
xmlMimeOneExt='xml'
xmlMimeTwoExt='rdf'
nquadsOneExt='nq'
nquadsTwoExt='n4'
ntriplesExt='nt'
jsonldExt='jsonld'
jsonExt='json'
htmlExt='html'
plainExt='txt'

# Determine appropriate MIME Type
mimeType=''
case $fileExt in
    $n3Ext) mimeType=$n3Mime
    ;;
    $ttlExt) mimeType=$ttlMime
    ;;
    $xmlMimeOneExt) mimeType=$xmlMime
    ;;
    $xmlMimeTwoExt) mimeType=$xmlMime
    ;;
    $nquadsOneExt) mimeType=$nquadsMime
    ;;
    $nquadsTwoExt) mimeType=$nquadsMime
    ;;
    $ntriplesExt) mimeType=$ntriplesMime
    ;;
    $jsonldExt) mimeType=$jsonldMime
    ;;
    $jsonExt) mimeType=$jsonMime # TODO - Currently unsupported by Solid Tabulator
    ;;
    $htmlExt) mimeType=$htmlMime # TODO - Currently unsupported by Solid Tabulator
    ;;
    *) mimeType=$plainMime
    ;;
esac

# Submit appropriately configured POST request
curl -Lv -H "Content-Type: $mimeType" -H "Slug: $fileName" -b cookies.txt --data-raw "$data" -X POST $1
