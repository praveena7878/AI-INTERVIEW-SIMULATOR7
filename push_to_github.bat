@echo off
echo ===================================================
echo             PUSHING UPDATED CODE TO GITHUB
echo ===================================================
echo.
git add .
git commit -m "Update speed, dynamic questions, welcome voice audio, and deployment config"
git push
echo.
echo ===================================================
echo Done! Your GitHub repository is now fully updated.
echo ===================================================
pause
