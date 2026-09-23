$data = Get-Content "C:\bottle-server-kiraye\animated_gifts_list.json" | ConvertFrom-Json
$outDir = "C:\bottle-server-kiraye\animated_gift_icons"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$i = 0
foreach ($item in $data) {
  if ($item.icon) {
    $i++
    $safeName = ($item.name -replace '[\\/:*?"<>|]', '_')
    $outFile = Join-Path $outDir ($item.gift_id.ToString() + "_" + $safeName + ".png")
    try {
      Invoke-WebRequest -Uri $item.icon -OutFile $outFile -TimeoutSec 15
      Write-Host "Endirildi ($i/$($data.Count)):" $item.name
    } catch {
      Write-Host "XETA:" $item.name "-" $_.Exception.Message
    }
  }
}
Compress-Archive -Path "$outDir\*" -DestinationPath "C:\bottle-server-kiraye\animasiyali_hediyye_ikonlari.zip" -Force
Write-Host "ZIP HAZIRDIR: C:\bottle-server-kiraye\animasiyali_hediyye_ikonlari.zip"
