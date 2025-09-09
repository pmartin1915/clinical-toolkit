@echo off
echo 🔧 Setting up Clinical Wizard DEBUG build environment...
set PATH=%PATH%;C:\Users\perry\.cargo\bin

echo ✅ Testing Rust installation...
rustc --version
cargo --version

echo 🚀 Starting Clinical Wizard DEBUG build (uses less memory)...
npx tauri build --debug --verbose

echo ✅ Build completed!
pause