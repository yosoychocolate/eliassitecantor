# Gera miniaturas leves para a galeria Dourados
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$base = Join-Path $PSScriptRoot '..\assets\images\eventos\dourados'
$srcDir = (Resolve-Path $base).Path
$thumbDir = Join-Path $srcDir 'thumbs'
$displayDir = Join-Path $srcDir 'display'

New-Item -ItemType Directory -Force -Path $thumbDir, $displayDir | Out-Null

function Save-Jpeg($bitmap, $path, [int]$quality) {
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]$quality
  )
  $bitmap.Save($path, $encoder, $encParams)
  $encParams.Dispose()
}

function Resize-And-Save($srcPath, $destPath, [int]$maxWidth, [int]$quality) {
  $img = [System.Drawing.Image]::FromFile($srcPath)
  try {
    if ($img.Width -le $maxWidth) {
      Save-Jpeg $img $destPath $quality
      return
    }
    $ratio = $maxWidth / $img.Width
    $newW = $maxWidth
    $newH = [int][Math]::Round($img.Height * $ratio)
    $bmp = New-Object System.Drawing.Bitmap $newW, $newH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $newW, $newH)
    $g.Dispose()
    Save-Jpeg $bmp $destPath $quality
    $bmp.Dispose()
  } finally {
    $img.Dispose()
  }
}

$files = @(
  'DSC00050.jpg','DSC00030.jpg','DSC00032.jpg','DSC00014.jpg','DSC00015.jpg',
  'DSC00001.jpg','DSC00008.jpg','DSC00010.jpg','DSC00012.jpg','DSC00005.jpg',
  'DSC00070.jpg','DSC00040.jpg','DSC00055.jpg','DSC09910.jpg','DSC09855.jpg',
  'DSC09935.jpg','DSC09964.jpg','DSC09972.jpg','DSC09971.jpg','DSC09903.jpg',
  'DSC00140.jpg','DSC00090.jpg','DSC00100.jpg','DSC09870.jpg','DSC09925.jpg',
  'DSC09980.jpg','DSC00020.jpg','DSC00021.jpg','DSC09960.jpg','DSC09946.jpg'
)

foreach ($file in $files) {
  $src = Join-Path $srcDir $file
  if (-not (Test-Path $src)) {
    Write-Warning "Ausente: $file"
    continue
  }
  Resize-And-Save $src (Join-Path $thumbDir $file) 480 78
  Resize-And-Save $src (Join-Path $displayDir $file) 1280 82
  Write-Host "OK $file"
}

# Hero otimizado
$heroSrc = Join-Path $srcDir 'DSC00030.jpg'
$heroDest = Join-Path $srcDir 'hero-dourados.jpg'
if (Test-Path $heroSrc) {
  Resize-And-Save $heroSrc $heroDest 1600 85
  Write-Host 'OK hero-dourados.jpg'
}

Write-Host 'Concluido.'
