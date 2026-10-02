@echo off
echo ===================================================
echo             EASY DEPLOYMENT PREPARATION
echo ===================================================
echo.
echo 1. Building React frontend for production...
cd frontend
call npm run build
cd ..
echo.
echo ===================================================
echo Production build completed successfully!
echo.
echo NEXT SIMPLE STEPS TO GET YOUR LIVE WEBSITE LINK:
echo 1. Create a free account on https://render.com
echo 2. Upload your project to GitHub
echo 3. Click "New Web Service" on Render and select your project
echo ===================================================
pause
