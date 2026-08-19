param(
  [int]$Start = 0,
  [int]$Count = 5
)

$ErrorActionPreference = "Stop"
$mediaRoot = Join-Path $PSScriptRoot "..\public\games"

$games = @(
  @{ Slug = "ff7-remake"; AppId = 1462040 },
  @{ Slug = "ff7-rebirth"; AppId = 2909400 },
  @{ Slug = "persona-5-royal"; AppId = 1687950 },
  @{ Slug = "nier-automata"; AppId = 524220 },
  @{ Slug = "sultans-game"; AppId = 3117820 },
  @{ Slug = "baldurs-gate-3"; AppId = 1086940 },
  @{ Slug = "black-myth-wukong"; AppId = 2358720 },
  @{ Slug = "expedition-33"; AppId = 1903340 },
  @{ Slug = "wuchang"; AppId = 2277560 },
  @{ Slug = "smt-vv"; AppId = 1875830 },
  @{ Slug = "metaphor"; AppId = 2679460 },
  @{ Slug = "re4-remake"; AppId = 2050650 },
  @{ Slug = "stellar-blade"; AppId = 3489700 },
  @{ Slug = "rise-tomb-raider"; AppId = 391220 },
  @{ Slug = "ff16"; AppId = 2515020 },
  @{ Slug = "split-fiction"; AppId = 2001120 },
  @{ Slug = "detroit"; AppId = 1222140 },
  @{ Slug = "re-requiem"; AppId = 3764200 },
  @{ Slug = "crimson-desert"; AppId = 3321460 },
  @{ Slug = "tomb-raider-2013"; AppId = 203160 },
  @{ Slug = "pragmata"; AppId = 3357650 },
  @{ Slug = "re-village"; AppId = 1196590 },
  @{ Slug = "re2-remake"; AppId = 883710 },
  @{ Slug = "re7"; AppId = 418370 },
  @{ Slug = "it-takes-two"; AppId = 1426210 },
  @{ Slug = "miside"; AppId = 2527500 },
  @{ Slug = "love-is-all-around"; AppId = 2322560 },
  @{ Slug = "dying-light"; AppId = 239140 },
  @{ Slug = "re3-remake"; AppId = 952060 },
  @{ Slug = "balatro"; AppId = 2379780 }
)

function Save-RemoteFile {
  param([string]$Url, [string]$Destination)

  if ((Test-Path -LiteralPath $Destination) -and ((Get-Item -LiteralPath $Destination).Length -gt 5000)) {
    return $true
  }

  $temporary = "$Destination.download"
  for ($attempt = 1; $attempt -le 3; $attempt++) {
    try {
      Invoke-WebRequest -Uri $Url -OutFile $temporary -Headers @{ "User-Agent" = "Mozilla/5.0" } -TimeoutSec 40
      if ((Get-Item -LiteralPath $temporary).Length -le 5000) {
        throw "Downloaded file is unexpectedly small"
      }
      Move-Item -LiteralPath $temporary -Destination $Destination -Force
      return $true
    } catch {
      if ($attempt -eq 3) {
        Write-Warning "$Destination : $($_.Exception.Message)"
      } else {
        Start-Sleep -Milliseconds (600 * $attempt)
      }
    }
  }

  if (Test-Path -LiteralPath $temporary) {
    Remove-Item -LiteralPath $temporary -Force
  }
  return $false
}

New-Item -ItemType Directory -Path $mediaRoot -Force | Out-Null
$selectedGames = $games | Select-Object -Skip $Start -First $Count

foreach ($game in $selectedGames) {
  $folder = Join-Path $mediaRoot $game.Slug
  New-Item -ItemType Directory -Path $folder -Force | Out-Null

  try {
    $endpoint = "https://store.steampowered.com/api/appdetails?appids=$($game.AppId)&l=english&cc=us"
    $response = Invoke-RestMethod -Uri $endpoint -Headers @{ "User-Agent" = "Mozilla/5.0" } -TimeoutSec 40
    $entry = $response.PSObject.Properties.Value | Select-Object -First 1
    if (-not $entry.success) {
      throw "Steam did not return media data"
    }

    $data = $entry.data
    [void](Save-RemoteFile -Url $data.header_image -Destination (Join-Path $folder "cover.jpg"))

    $shotNumber = 1
    foreach ($screenshot in ($data.screenshots | Select-Object -First 3)) {
      [void](Save-RemoteFile -Url $screenshot.path_thumbnail -Destination (Join-Path $folder "shot-$shotNumber.jpg"))
      $shotNumber++
    }

    $imageCount = (Get-ChildItem -LiteralPath $folder -File -Filter "*.jpg").Count
    Write-Output "$($game.Slug) - $imageCount images"
  } catch {
    Write-Warning "$($game.Slug) : $($_.Exception.Message)"
  }
}
