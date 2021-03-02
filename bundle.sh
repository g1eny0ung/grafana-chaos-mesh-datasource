VERSION=$1

echo "Bundled Version: $VERSION"
echo "Start build..."
echo

yarn build

echo "Bundling..."
echo

cp -r dist g1eny0ung-chaosmesh-datasource
zip -r g1eny0ung-chaosmesh-datasource-$VERSION.zip g1eny0ung-chaosmesh-datasource -x "*.DS_Store*"
