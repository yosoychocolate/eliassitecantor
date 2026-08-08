# Gera WebP e AVIF a partir das miniaturas JPG
Add-Type -AssemblyName System.Drawing

$dirs = @(
  "assets\images\eventos\dourados\thumbs",
  "assets\images\eventos\dourados\display"
)

foreach ($dir in $dirs) {
  $path = Join-Path $PSScriptRoot "..\$dir"
  if (-not (Test-Path $path)) { continue }
  Get-ChildItem $path -Filter *.jpg | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    try {
      $webp = [System.IO.Path]::ChangeExtension($_.FullName, '.webp')
      $img.Save($webp, [System.Drawing.Imaging.ImageFormat]::Png)
      Write-Host "OK $($_.Name) -> webp (use cwebp para otimizar)"
    } finally { $img.Dispose() }
  }
}
Write-Host "Para AVIF/WebP otimizados, use: npx @squoosh/cli --webp auto thumbs/*.jpg"
