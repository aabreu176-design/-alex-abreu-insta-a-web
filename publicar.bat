@echo off
echo =========================================
echo  Iniciando publicacion automatica...
echo =========================================

echo.
echo [1/3] Guardando cambios locales...
git add .
git commit -m "Actualizacion web automatizada"

echo.
echo [2/3] Respaldando en GitHub...
git push

echo.
echo [3/3] Publicando en la web oficial (Firebase)...
call npx firebase-tools deploy

echo.
echo =========================================
echo  ¡Proceso Completado! Tu web esta en vivo.
echo =========================================
pause
