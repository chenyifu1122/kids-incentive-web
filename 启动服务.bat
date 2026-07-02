@echo off
chcp 65001 >nul
title 儿童激励兑现 - 本地服务
echo ============================================
echo   儿童激励兑现 - 本地服务已启动
echo ============================================
echo.
echo   线上地址:   https://nimble-pastelito-3d54e7.netlify.app
echo.
echo   局域网访问: http://192.168.4.230:3456
echo   本机访问:   http://localhost:3456
echo.
echo   关闭此窗口 = 停止服务
echo ============================================
echo.

:: 启动静态文件服务器
serve -s "D:\工作空间\kids-incentive-web\dist" -l 3456

echo.
echo 服务已停止。
pause
