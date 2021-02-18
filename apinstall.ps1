Param (
    [Parameter(Mandatory, HelpMessage="Values: install | upgrade")]
    [ValidateSet("install","upgrade")]
    [string]$installType,

    [string]$config,

    [switch]
    [bool]$doit = $false
)

function loadConfiguration() {
    $configFilename = [IO.Path]::ChangeExtension($MyInvocation.ScriptName, "json")
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
    $configuration
}

function Get-Value($src, $dflt) {
    if ($src -eq $null) { return $dflt }
    return $src
}

function UpdateList($packages, $package) {
    foreach ($pkg in $packages) {
        if ($pkg.name -eq $package.name) {
            $pkg.version = Get-Value $package.version $pkg.version
            $pkg.ignore = Get-Value $package.ignore $pkg.ignore
            return $true
        }
    }
    return $false
}

function Get-PackageSet([string]$setName) {
    $pSets = @{}
    $configuration.packageSets.psobject.properties | Foreach { $pSets[$_.Name] = $_.Value }
    $currentPackages = @()
    $currentSet = $pSets[$setName]
    while ($currentSet -ne $null) {
        foreach ($pkg in $currentSet) {
            if ($pkg -is [string]) {
                $p = @{
                    name = $pkg
                    isPackageSet = $false
                    ignore = $false
                    version = ""
                }
                if (-not (UpdateList $currentPackages $p)) { $currentPackages += $p }
            } else {
                $p = @{
                    name = $pkg.name
                    isPackageSet = Get-Value $pkg.isPackageSet $false
                    ignore = Get-Value $pkg.ignore $false
                    version = Get-Value $pkg.version ""
                }
                if ($p.isPackageSet) {
                    $subPackages = Get-PackageSet $p.name
                    foreach ($sp in $subPackages) {
                        if ($p.ignore -eq $true) {
                            $sp.ignore = $true
                        }
                        if (-not (UpdateList $currentPackages $sp)) { $currentPackages += $sp }
                    }
                } else {
                    if (-not (UpdateList $currentPackages $p)) { $currentPackages += $p }
                }
            }
        }
        $currentSet = $null
    }
    $currentPackages
}

function CreateXml($packages) {
    $xmlFilename = [IO.Path]::Combine((Get-Location), "packages.config")
    $cmt = (" Config '{0}' created on {1:yyyy-MM-dd HH:mm:ss} " -f $config, (Get-Date))
    [xml]$xml = [xml]::new()
    $xml.AppendChild($xml.CreateXmlDeclaration("1.0", "UTF-8", "yes")) | Out-Null
    $xml.AppendChild($Xml.CreateComment($cmt)) | Out-Null
    [System.Xml.XmlElement]$root = $xml.CreateElement("packages")
    $xml.AppendChild($root) | Out-Null
    foreach ($pkg in $packages) {
        if ($pkg.ignore) { continue }
        [System.Xml.XmlElement]$p = $xml.CreateElement("package")
        $p.SetAttribute("id", $pkg.name)
        if (-not [string]::IsNullOrEmpty($pkg.version)) {
            $p.SetAttribute("version", $pkg.version)
        }
        $root.AppendChild($p) | Out-Null
    }
    $xml.Save($xmlFilename)
}

function  install {
    Write-Host	("Installing config {0}..." -f $config)  

    $configuration = loadConfiguration
    $packages = Get-PackageSet $config
    $tmpDir = [IO.Path]::Combine($env:TEMP, [guid]::NewGuid())
    if (-not (Test-Path $tmpDir)) { 
        New-Item -ItemType Directory -Path $tmpDir | Out-Null
    }
    Push-Location $tmpDir 
    CreateXml $packages
    iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1')) 
    choco upgrade chocolatey
    choco install 'choco-packages.config' -y
    Pop-Location
    Remove-Item $tmpDir -Recurse

    Write-Host "Hit Enter to finish"
	Read-Host
}

function upgrade() {
    Write-Host "Upgrading all packages"

    [string[]]$packages = choco list --local
    for ($i = 1; $i -lt $packages.length - 1; $i++) {
        $package = $packages[$i].Split(" ")[0]
        #Write-Host "choco upgrade -y $package"
        choco upgrade -y $package
    }
	Write-Host "Hit Enter to finish"
	Read-Host
}

function elevate() {
    Write-Host "Elevate process."
    [string[]]$argList = @("-ExecutionPolicy","Bypass", $MyInvocation.ScriptName, "-doit", "-installType", $installType)
    if (-not [string]::IsNullOrEmpty($config)) {
        $argList += @("-config", $config)
    }
    Start-Process powershell.exe -Verb runAs -ArgumentList $argList
}

switch ($installType.ToLower()) {
    "install" { 
        if ($doit) {
            install
        } else {
            $configuration = loadConfiguration
            elevate
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
