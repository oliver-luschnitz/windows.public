Param (
    [Parameter(Mandatory, HelpMessage="Values: install | upgrade")]
    [ValidateSet("install","upgrade")]
    [string]$installType,

    [string]$config,

    [switch]
    [bool]$doit = $false
)

# Set-ExecutionPolicy Bypass -Scope Process -Force
# iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
# choco upgrade chocolatey
# choco install 'choco-packages.config' -y

function loadConfiguration() {

}

function  install {
    Write-Host	("Installing config {0}..." -f $config)   

	Write-Host "Hit Enter to finish"
	Read-Host
}
function upgrade() {
    Write-Host "Upgrading all packages"

    [string[]]$packages = choco list --local
    for ($i = 1; $i -lt $packages.length - 1; $i++) {
        $package = $packages[$i].Split(" ")[0]
        Write-Host "choco upgrade -y $package"
    }
	Write-Host "Hit Enter to finish"
	Read-Host
}

function elevate() {
    Write-Host "Elevate process."
    [string[]]$argList = @("-ExecutionPolicy","Bypass", $MyInvocation.ScriptName, "-doit", "-installType", $installType)
    if ($config -ne $null) {
        $argList += @("-config", $config)
    }
    Start-Process powershell.exe -Verb runAs -ArgumentList ($argList)
}

switch ($installType.ToLower()) {
    "install" { 
        if ($doit) {
            $configFilename = [IO.Path]::ChangeExtension($MyInvocation.MyCommand.Path, "json")
            $configuration = (Get-Content -Raw -Encoding UTF8 $configFileName) | ConvertFrom-Json

            install
        } else {
            $configFilename = [IO.Path]::ChangeExtension($MyInvocation.MyCommand.Path, "json")
            $configuration = (Get-Content -Raw -Encoding UTF8 $configFileName) | ConvertFrom-Json
            if ($configuration.packageSets -eq $null) {
                Write-Error "No package sets defined! (name = 'packageSets', value is an object with named package sets)"
                exit 1
            }
            
            $packageSetNames = Get-Member -InputObject $configuration.packageSets -MemberType NoteProperty | Select-Object -ExpandProperty "Name" 

            if ([string]::IsNullOrEmpty($config) -or (-not $packageSetNames.Contains($config))) {
                Write-Error ("Package set '{0}' is missing or not defined!" -f $config)
                Write-Host -ForegroundColor Red ("You can use one of: {0}" -f [string]::Join(", ", $packageSetNames))
                exit 2
            }
            Write-Host "elevate"
        }
     }
     "upgrade" {
         if ($doit) {
             upgrade
         } else {
             elevate
         }
     }
}
