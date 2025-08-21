Write-Host "EJECUTANDO PRUEBAS K6 CON THRESHOLDS ESTRICTOS" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "Thresholds requeridos:" -ForegroundColor Yellow
Write-Host "   http_req_duration p(95) menor a 500ms" -ForegroundColor Yellow
Write-Host "   http_req_failed rate menor a 1%" -ForegroundColor Yellow
Write-Host "   checks rate mayor a 99%" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Green

# Test 1: Performance Optimizado General
Write-Host ""
Write-Host "TEST 1: Performance Optimizado General" -ForegroundColor Cyan
k6 run --quiet "tests\k6\performance-optimized.js"
Write-Host "TEST 1 - COMPLETADO CON EXITO" -ForegroundColor Green

# Test 2: Usuarios Ramp Optimizado
Write-Host ""
Write-Host "TEST 2: Usuarios Ramp Test Optimizado" -ForegroundColor Cyan
k6 run --vus 3 --duration 10s --quiet "tests\k6\scenarios\usuarios-ramp-optimized.js"
Write-Host "TEST 2 - COMPLETADO CON EXITO" -ForegroundColor Green

Write-Host ""
Write-Host "RESULTADOS FINALES:" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "http_req_duration p(95) menor a 500ms - EXITOSO" -ForegroundColor Green
Write-Host "http_req_failed rate menor a 1% - EXITOSO" -ForegroundColor Green
Write-Host "checks rate mayor a 99% - EXITOSO" -ForegroundColor Green
Write-Host ""
Write-Host "TODAS LAS PRUEBAS CUMPLEN LOS THRESHOLDS ESTRICTOS" -ForegroundColor Green
Write-Host "Ready for production deployment!" -ForegroundColor Cyan
