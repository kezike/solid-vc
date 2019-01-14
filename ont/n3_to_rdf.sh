#!/bin/sh

OIFS=$IFS
IFS='.'
file=($1)
fileName="${file[0]}"
fileExt="${file[1]}"
IFS=$OIFS
rm $fileName.rdf
cwm --n3 $1 --think --rdf > $fileName.rdf
