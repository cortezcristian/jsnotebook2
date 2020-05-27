cat package.json|jq .version | awk '{print "{ \"version\": "$1" }"}' > public/json/version.json
