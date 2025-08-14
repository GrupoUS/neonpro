@echo off
echo Limpando cache do Next.js...
rmdir /s /q .next 2>nul
echo Cache limpo!

echo Reinstalando dependencias...
npm install

echo Iniciando servidor...
npm run dev

pause