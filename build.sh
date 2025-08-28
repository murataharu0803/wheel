pnpm vite build
pnpm bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile dist/wheel --minify
pnpm bun build --compile --target=bun-windows-x64 ./src/index.ts --outfile dist/wheel.exe --minify

rm -rf dist/windows-x64.zip dist/linux-x64.zip
zip -r9 dist/windows-x64.zip dist/wheel.exe build
zip -r9 dist/linux-x64.zip dist/wheel build

rm -rf dist/build
cp -r build dist/build
