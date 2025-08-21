Write-Host "🚀 EJECUTANDO TODAS LAS PRUEBAS K6 EN PARALELO" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green

# Función para ejecutar k6 en background
function Start-K6Test {
    param(
        [string]$TestName,
        [string]$TestFile,
        [string]$Options = ""
    )
    
    Write-Host "Iniciando $TestName..." -ForegroundColor Yellow
    
    $scriptBlock = {
        param($file, $opts, $name)
        $result = k6 run $opts $file 2>&1
        return @{
            Name = $name
            Output = $result
            ExitCode = $LASTEXITCODE
        }
    }
    
    return Start-Job -ScriptBlock $scriptBlock -ArgumentList $TestFile, $Options, $TestName
}

# Iniciar todas las pruebas en paralelo
Write-Host "Iniciando pruebas en paralelo..." -ForegroundColor Cyan

$jobs = @()

# Prueba 1: Performance optimizado
$jobs += Start-K6Test -TestName "Performance General" -TestFile "tests\k6\performance-optimized.js" -Options "--quiet"

# Prueba 2: Usuarios Ramp
$jobs += Start-K6Test -TestName "Usuarios Ramp" -TestFile "tests\k6\scenarios\usuarios-ramp-optimized.js" -Options "--vus 3 --duration 30s --quiet"

# Prueba 3: Todos los escenarios simultáneos
$jobs += Start-K6Test -TestName "Todos los Escenarios" -TestFile "tests\k6\all-scenarios.js" -Options "--quiet"

Write-Host "Esperando que terminen todas las pruebas..." -ForegroundColor Yellow

# Esperar y mostrar resultados
foreach ($job in $jobs) {
    $result = Receive-Job -Job $job -Wait
    Write-Host ""
    Write-Host "=== RESULTADO: $($result.Name) ===" -ForegroundColor Green
    Write-Host $result.Output
    
    if ($result.ExitCode -eq 0) {
        Write-Host "✅ $($result.Name) - EXITOSO" -ForegroundColor Green
    } else {
        Write-Host "❌ $($result.Name) - FALLO (Exit Code: $($result.ExitCode))" -ForegroundColor Red
    }
    
    Remove-Job -Job $job
}

Write-Host ""
Write-Host "🎉 TODAS LAS PRUEBAS PARALELAS COMPLETADAS" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
