#!/bin/sh

die () {
  echo "$1" > /dev/stderr
  exit 1
}

echo "Started build"

# make build directory and copy original files there for preflighting
rm -rf ../build
rm -rf ../simple-rest-client.oex
mkdir ../build
cp -R ../simple-rest-client ../build/
cp -R ../config.xml ../build/
cp -R ../index.html ../build/
cp -R ../options.html  ../build/
cp -R ../options.css ../build/
cp -R ../icon_*.png ../build/

miniJS="jquery-fasthtml.js jquery-jsonviewer.js jquery-xmlviewer.js requester.js beautify/beautify.js beautify/beautify-html.js"
miniCSS="jquery-jsonviewer.css jquery-ui-1.8.9.custom.css jquery-xmlviewer.css style.css"

# minimize JS and CSS
echo "Minimizing JS"
for jsfile in $miniJS
do
 minfile=`basename $jsfile .js`.min.js
 java -jar compiler.jar -js ../build/simple-rest-client/$jsfile > ../build/simple-rest-client/$minfile || die "Failed to minimize JS"
 sed -i -r -e "s|(type=\"text/javascript\" src=\")$jsfile(\")|\1$minfile\2|g" ../build/simple-rest-client/index.html
 rm ../build/simple-rest-client/$jsfile
done

echo "Minimizing CSS"
for cssfile in $miniCSS
do
 minfile=`basename $cssfile .css`.min.css
 java -jar yuicompressor-2.4.2.jar ../build/simple-rest-client/css/$cssfile > ../build/simple-rest-client/css/$minfile && \
    sed -i -e "s|;}|}|g" ../build/simple-rest-client/css/$minfile || die "Failed to minimize CSS"
 sed -i -r -e "s|(type=\"text/css\" href=\"css/)$cssfile(\")|\1$minfile\2|g" ../build/simple-rest-client/index.html
 rm ../build/simple-rest-client/css/$cssfile
done

# remove unused CSS properties on a page-by-page basis
# echo "Removing unused CSS"
# python lesscss.py ../build/index.html || die "Failed to remove unused CSS"

# zipping build to simple-rest-client.oex
echo "Creating ZIP archive for addons.opera.com"
dir=`pwd`
cd ../build/
zip ../simple-rest-client.oex -rq *  || die "Failed to create ZIP"
rm -rf ../build
cd $dir
echo "Done"
