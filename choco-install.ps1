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
    [string[]]$argList = @("-ExecutionPolicy","Bypass", $MyInvocation.ScriptName, "-doit", "-installType", $installType)#, "-config", $config)
    if ($config -ne $null) {
        $argList += @("-config", $config)
    }
    Start-Process powershell.exe -Verb runAs -ArgumentList ($argList)
}

switch ($installType.ToLower()) {
    "install" { 
        if ($doit) {
            install
        } else {
            $configFilename = [IO.Path]::ChangeExtension($MyInvocation.MyCommand.Path, "json")
            $configuration = (Get-Content -Raw -Encoding UTF8 $configFileName) | ConvertFrom-Json
            if ($configuration.lists -eq $null) {
                Write-Error "No configurations defined! (name = 'lists', value array of names)"
                exit 1
            }
            if ()
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
