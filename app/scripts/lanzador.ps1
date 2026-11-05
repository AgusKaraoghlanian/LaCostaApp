param([switch]$SmokeTest)
$ErrorActionPreference = 'Stop'
trap {
 if ($SmokeTest) { Write-Error $_.Exception.Message; exit 1 }
 Add-Type -AssemblyName System.Windows.Forms
 [void][Windows.Forms.MessageBox]::Show($_.Exception.Message,'Costa a la carta - No se pudo iniciar','OK','Error')
 exit 1
}
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$logRoot = Join-Path $projectRoot '.local\logs'
New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $nodeCommand) { throw 'Falta el runtime Node.js. Este proyecto necesita el asistente inicial antes de usar el motor.' }
$nodePath = $nodeCommand.Source
$nodeMajor = [int]((& $nodePath --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 24) { throw 'Se necesita Node.js 24 o posterior para este motor.' }
if (-not (Get-Command pwsh.exe -ErrorAction SilentlyContinue)) { throw 'Falta PowerShell 7 para proteger la credencial del motor. Hace falta completar la preparacion inicial.' }
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'node_modules\vite\bin\vite.js'))) { throw 'La preparacion inicial de dependencias no esta completa. No se descargaron programas automaticamente.' }
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'node_modules\tesseract.js\dist\worker.min.js'))) { throw 'Faltan las dependencias OCR locales. Hace falta completar la preparacion inicial del proyecto.' }
# Solo copia archivos de las dependencias ya instaladas; no instala ni consulta servicios.
& $nodePath (Join-Path $projectRoot 'scripts\prepare-ocr.mjs') | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron preparar los recursos OCR locales.' }
$owned = @{}
$script:wantMotor = $true
$apiUrl = 'http://127.0.0.1:8787'
$portalUrl = 'http://127.0.0.1:5174'
function Start-LocalComponent([string]$name, [string[]]$arguments) {
 if ($owned.ContainsKey($name) -and -not $owned[$name].HasExited) { return }
 $process = Start-Process -FilePath $nodePath -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logRoot ($name+'.out.log')) -RedirectStandardError (Join-Path $logRoot ($name+'.err.log'))
 $owned[$name] = $process
}
function Stop-LocalComponent([string]$name) {
 if (-not $owned.ContainsKey($name)) { return }
 $process = $owned[$name]
 if (-not $process.HasExited) {
  # Solo el arbol de un proceso creado por esta instancia. Nunca matar por nombre/puerto.
  $actual = Get-CimInstance Win32_Process -Filter ('ProcessId='+$process.Id) -ErrorAction SilentlyContinue
  if ($actual -and $actual.CreationDate -ge $process.StartTime.AddSeconds(-2)) { & "$env:SystemRoot\System32\taskkill.exe" /PID $process.Id /T /F | Out-Null }
 }
 $owned.Remove($name)
}
function Test-Api {
 try { $result = Invoke-RestMethod -Uri ($apiUrl+'/api/v1/health') -TimeoutSec 1; return $result.data.mode -eq 'local' -and $result.data.backend -eq 'd1' } catch { return $false }
}
if ($SmokeTest) {
 [pscustomobject]@{proyecto=$projectRoot;runtime=(& $nodePath --version);dependencias='Preparadas';credencialProtegida=(Test-Path -LiteralPath (Join-Path $projectRoot '.local\device.protected'));apiLocal=(Test-Api);creaRecursosRemotos=$false} | ConvertTo-Json
 exit 0
}
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[Windows.Forms.Application]::EnableVisualStyles()
$form = New-Object Windows.Forms.Form
$form.Text = 'Costa a la carta - Motor'
$form.ClientSize = New-Object Drawing.Size(660,580)
$form.StartPosition = 'CenterScreen'
$form.BackColor = [Drawing.ColorTranslator]::FromHtml('#f7f3eb')
$form.Font = New-Object Drawing.Font('Segoe UI',10)
$form.FormBorderStyle = 'FixedSingle'
$form.MaximizeBox = $false
function Label-At([string]$text,[int]$x,[int]$y,[int]$w,[int]$h) {
 $label=New-Object Windows.Forms.Label; $label.Text=$text; $label.Location=New-Object Drawing.Point($x,$y); $label.Size=New-Object Drawing.Size($w,$h); $form.Controls.Add($label);return $label
}
function Button-At([string]$text,[int]$x,[int]$y,[int]$w,[scriptblock]$action) {
 $button=New-Object Windows.Forms.Button; $button.Text=$text; $button.Location=New-Object Drawing.Point($x,$y); $button.Size=New-Object Drawing.Size($w,40); $button.FlatStyle='Flat';$button.Add_Click($action);$form.Controls.Add($button);return $button
}
$heading=Label-At 'COSTA A LA CARTA' 28 24 600 40
$heading.Font=New-Object Drawing.Font('Segoe UI',20,[Drawing.FontStyle]::Bold)
$null=Label-At 'Tu computadora prepara los analisis y las publicaciones locales.' 30 75 600 44
$connection=Label-At 'Comprobando el sistema local...' 30 128 600 48
$detail=Label-At 'Los datos se conservan dentro de esta carpeta.' 30 180 600 48
$start=Button-At 'Iniciar sistema' 30 238 180 {
 try {
  if (-not (Test-Api)) { Start-LocalComponent 'api' @('scripts/wrangler-local.mjs','dev') }
  try { Invoke-WebRequest -Uri $portalUrl -UseBasicParsing -TimeoutSec 1 | Out-Null } catch { Start-LocalComponent 'portal' @('node_modules/vite/bin/vite.js','--host','127.0.0.1') }
  $detail.Text='Iniciando. La primera puesta en marcha puede tardar unos segundos.'
 } catch { $detail.Text=$_.Exception.Message }
}
$null=Button-At 'Abrir administrador' 230 238 190 { Start-Process ($portalUrl+'/administracion') }
$null=Button-At 'Detener motor' 440 238 180 { $script:wantMotor=$false;Stop-LocalComponent 'motor';$detail.Text='Motor detenido. Sus trabajos quedan guardados para reanudar.' }
$null=Label-At 'Vinculacion (una sola vez)' 30 306 590 28
$code=New-Object Windows.Forms.TextBox;$code.Location=New-Object Drawing.Point(30,340);$code.Size=New-Object Drawing.Size(180,28);$code.MaxLength=8;$code.CharacterCasing='Upper';$form.Controls.Add($code)
$pairButton=Button-At 'Vincular con este codigo' 230 334 260 {
 try {
  if ($code.Text -notmatch '^[A-HJ-NP-Z2-9]{8}$') { $detail.Text='Copia los ocho caracteres desde Configuracion del administrador.';return }
  if (-not (Test-Api)) { $detail.Text='Primero inicia el sistema y espera a que se conecte la API.';return }
  $script:wantMotor=$false;Stop-LocalComponent 'motor'
  Start-LocalComponent 'vinculacion' @('worker/main.ts','--pair',$code.Text)
  $code.Clear();$detail.Text='Vinculando. El codigo se usa una vez; la credencial se guarda protegida por Windows.'
 } catch { $detail.Text=$_.Exception.Message }
}
$null=Button-At 'Reconectar motor' 30 408 180 { if(Test-Api){$script:wantMotor=$true;Stop-LocalComponent 'motor';Start-LocalComponent 'motor' @('worker/main.ts')}else{$detail.Text='La API local esta desconectada. Inicia el sistema primero.'} }
$null=Button-At 'Abrir diagnostico' 230 408 190 { Start-Process explorer.exe -ArgumentList ('"'+$logRoot+'"') }
$null=Button-At 'Cerrar sistema' 440 408 180 { $form.Close() }
$null=Button-At 'Abrir copias' 30 460 180 { $backupFolder=Join-Path $projectRoot '.local\backups';New-Item -ItemType Directory -Path $backupFolder -Force|Out-Null;Start-Process explorer.exe -ArgumentList ('"'+$backupFolder+'"') }
$null=Button-At 'Verificar restauracion' 230 460 190 { $dialog=New-Object Windows.Forms.OpenFileDialog;$dialog.Filter='Copias de Costa a la carta (*.json)|*.json';$dialog.InitialDirectory=Join-Path $projectRoot '.local\backups';if($dialog.ShowDialog() -eq 'OK'){Start-LocalComponent 'restauracion' @('scripts/restaurar-copia.ts',('"'+$dialog.FileName+'"'));$detail.Text='Verificando en una base vacia aislada. La base activa no se reemplaza. Ver resultado en Diagnostico.'} }
$null=Label-At 'Solo entorno local. No crea cuentas, no publica en Internet y no activa costos.' 30 524 600 40
$timer=New-Object Windows.Forms.Timer;$timer.Interval=5000
$timer.Add_Tick({
 $alive=Test-Api
 if($owned.ContainsKey('vinculacion') -and $owned['vinculacion'].HasExited){$script:wantMotor=$owned['vinculacion'].ExitCode -eq 0;Stop-LocalComponent 'motor';$owned.Remove('vinculacion')}
 $connection.Text=if($alive){'API local conectada. Administrador: 127.0.0.1:5174'}else{'Sistema local desconectado. Pulsa Iniciar sistema.'}
 if ($script:wantMotor -and $alive -and (Test-Path -LiteralPath (Join-Path $projectRoot '.local\device.protected'))) {
  if (-not $owned.ContainsKey('motor')) { Start-LocalComponent 'motor' @('worker/main.ts') }
  elseif ($owned['motor'].HasExited) { $script:wantMotor=$false;$detail.Text='El motor se detuvo. Revisa Diagnostico o pulsa Reconectar motor.' }
 }
 $statusPath=Join-Path $projectRoot '.local\engine-status.json'
 if(-not $script:wantMotor){$detail.Text='Motor detenido. Los trabajos quedan guardados. Reconecta o revisa Diagnostico.'}elseif($alive -and (Test-Path -LiteralPath $statusPath)){try{$status=Get-Content -LiteralPath $statusPath -Raw|ConvertFrom-Json;$detail.Text=$status.message}catch{}}
})
$form.Add_FormClosing({$timer.Stop();foreach($name in @($owned.Keys)){Stop-LocalComponent $name}})
$form.Add_Shown({$start.PerformClick();$timer.Start()})
[void]$form.ShowDialog()
