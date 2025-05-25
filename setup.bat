@echo off
echo ===================================================
echo CNC Tools Development Environment Setup
echo ===================================================
echo.
echo This script will help you set up the development environment
echo for both frontend and backend components.
echo.

echo Installing root dependencies...
call yarn install
if %ERRORLEVEL% neq 0 (
    echo Failed to install root dependencies
    exit /b %ERRORLEVEL%
)

echo.
echo Setting up frontend...
cd frontend
call yarn install
if %ERRORLEVEL% neq 0 (
    echo Failed to install frontend dependencies
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo Setting up backend...
cd backend
call yarn install
if %ERRORLEVEL% neq 0 (
    echo Failed to install backend dependencies
    cd ..
    exit /b %ERRORLEVEL%
)

echo Copying backend environment sample...
copy .env.sample .env
cd ..

echo.
echo ===================================================
echo Setup Complete!
echo.
echo To start development:
echo   - Frontend: yarn workspace frontend dev
echo   - Backend:  yarn workspace backend dev:win
echo   - Both:     yarn dev
echo ===================================================
