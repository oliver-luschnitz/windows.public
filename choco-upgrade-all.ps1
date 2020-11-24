Param(
    [switch]
    [bool]$doit = $false
)

function elevate() {
    Write-Host "Elevate process."
    [string[]]$argList = @("Set-ExecutionPolicy","Bypass","-Scope","Process",";","& " + $MyInvocation.ScriptName, "-doit")
    Start-Process powershell.exe -Verb runAs -ArgumentList ($argList)
}

function upgrade() {
    Write-Host "Upgrading all packages"

    [string[]]$packages = choco list --local
    for ($i = 1; $i -lt $packages.length - 1; $i++) {
        $package = $packages[$i].Split(" ")[0]
        choco upgrade -y $package
    }
	Write-Host "Hit Enter to finish"
	Read-Host
}

if ($doit) {
    upgrade
} else {
    elevate
}

