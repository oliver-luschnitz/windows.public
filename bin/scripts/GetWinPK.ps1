"reading Windows Product Key for $env:COMPUTERNAME..."
$wmi = Get-WmiObject -query 'select * from SoftwareLicensingService'
$PK = $wmi.OA3xOriginalProductKey
"$env:COMPUTERNAME $PK"
"$env:COMPUTERNAME $PK" | Out-File .\Windows_10_ProductKeys.txt -Encoding utf8 -Append
