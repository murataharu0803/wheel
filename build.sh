pnpm vite build
pnpm bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile dist/wheel-linux-x64 --minify
pnpm bun build --compile --target=bun-windows-x64 ./src/index.ts --outfile dist/wheel-windows-x64.exe --minify

rm -rf dist/wheel-windows-x64.zip dist/wheel-linux-x64.zip
zip -r9 dist/windows-x64.zip dist/wheel-windows-x64.exe build
zip -r9 dist/linux-x64.zip dist/wheel-linux-x64 build

rm -rf dist/build
cp -r build dist/build
