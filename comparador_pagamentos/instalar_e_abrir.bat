@echo off
echo ========================================
echo  Comparador de Pagamentos - Multipark
echo  A instalar dependencias...
echo ========================================
echo.

pip install pandas openpyxl customtkinter --quiet

echo.
echo Dependencias instaladas! A abrir aplicacao...
echo.

python "%~dp0comparador_pagamentos.py"

pause
