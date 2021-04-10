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

    [System.Collections.Generic.List[string]]$packages = choco list --local
	$packages.RemoveAt(0)
	$packages.RemoveAt($packages.Count - 1)
    for ($i = 0; $i -lt $packages.Count; $i++) {
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

