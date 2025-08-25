pnpm vite build
pnpm bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile dist/wheel --minify --analyze
pnpm bun build --compile --target=bun-windows-x64 ./src/index.ts --outfile dist/wheel.exe --minify --analyze
