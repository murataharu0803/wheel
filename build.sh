pnpm vite build
pnpm bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile dist/wheel --minify
pnpm bun build --compile --target=bun-windows-x64 ./src/index.ts --outfile dist/wheel.exe --minify

zip -r9 dist/windows-x64.zip dist/wheel.exe build
zip -r9 dist/linux-x64.zip dist/wheel build
