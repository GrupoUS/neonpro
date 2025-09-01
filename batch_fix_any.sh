#!/bin/bash
# Batch fix script for any → unknown
for file in ; do
    echo "Processing: "
    sed -i "s/: any/: unknown/g" ""
    sed -i "s/as any/as unknown/g" ""
    sed -i "s/<any>/<unknown>/g" ""
    sed -i "s/Promise<any>/Promise<unknown>/g" ""
    sed -i "s/Array<any>/Array<unknown>/g" ""
    sed -i "s/Record<string, any>/Record<string, unknown>/g" ""
    sed -i "s/Map<string, any>/Map<string, unknown>/g" ""
    sed -i "s/LRUCache<string, any>/LRUCache<string, unknown>/g" ""
done
