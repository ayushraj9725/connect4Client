@echo off
echo Starting Client... > client_log.txt
npm run dev >> client_log.txt 2>&1
echo Client Exited with %errorlevel% >> client_log.txt
