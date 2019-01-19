#!/bin/sh

#!/bin/bash
 
s_param=""
t_param=""
while [ -n "$1" ]; do # while loop starts 
    case "$1" in
        # -a) echo "-a option passed" ;;
        -s) # SLUG (name of remote resource)
            s_param="$2"
            echo "-s option passed, with value $s_param"
            shift
            ;;
        -t) # MIME (eg. text/plain, application/json, text/plain, etc.)
            t_param="$2"
            echo "-t option passed, with value $t_param"
            shift
            ;;
        --)
            shift # The double dash makes them parameters
            break
            ;;
        *) echo "Option $1 not recognized" ;;
    esac
    shift
done
                                                                                         
total=1
for param in "$@"; do
    echo "#$total: $param"
    total=$(($total + 1))
done

data=`cat $2`
echo $data
OIFS=$IFS
IFS='/'
fileNamePartsOne=($2)
fileNameNumPartsOne=${#fileNamePartsOne[@]}
fileNameOne=${fileNamePartsOne[fileNameNumPartsOne-1]}
echo fileNameOne: $fileNameOne
echo fileNameNumPartsOne: $fileNameNumPartsOne
IFS='.'
fileNamePartsTwo=($fileNameOne)
fileNameNumPartsTwo=${#fileNamePartsTwo[@]}
fileName=${fileNamePartsTwo[0]}
fileExt=${fileNamePartsTwo[1]}
IFS=$OIFS
echo fileName: $fileName
echo fileExt: $fileExt
# curl -v -H "Content-Type: $3" -H "Slug: $fileName" -b cookies.txt --data-raw "$data" -X POST $1
