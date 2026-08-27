$uri = 'http://localhost:3456'

for ($i = 0; $i -lt 60; $i++) {
  try {
    $null = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 2
    Start-Process $uri
    exit 0
  } catch {
    Start-Sleep -Seconds 1
  }
}

Write-Host ""
Write-Host "Nao foi possivel conectar ao servidor em $uri"
Write-Host "Verifique a janela do servidor (ABRIR-SITE.bat) por erros."
Write-Host ""
pause
