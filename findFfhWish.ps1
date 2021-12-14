
$url = "https://gewinnspiel-ticker.de/aktuell/"
$regex = "([0-2][0-9]:[0-5][0-9]\s+Uhr).+?<strong>([^<]+).+?<strong>([^<]+)"

$resp = $null
$resp = Invoke-WebRequest $url

if ($resp.StatusCode -eq 200) {
    $content = $resp.Content.Replace("`n", "").Replace("`r","")
    if ($content -match $regex) {
        $name = $Matches[3].Trim()
        $wish = $Matches[2].Trim()
        $time = $Matches[1].Trim()

        if ($name.ToLower().Contains("luschnitz")) {
            $msg = ("{0}: {1}: {2}" -f $time, $name, $wish)
            $msg += "`n`nAnrufen: +49 (69) 19725"
            $cred = Import-Clixml -Path "gmx.xml"
            $sendMailParams = @{ 
	            From = 'oliver.luschnitz@gmx.de'; 
	            To = 'oliver.luschnitz@gmail.com'; 
	            Subject = 'FFH Wunsch'; 
	            Body = $msg; 
	            SMTPServer = 'mail.gmx.com'; 
	            Port = 587; 
	            UseSsl = $true; 
	            Credential = $cred;
                Encoding = [System.Text.Encoding]::UTF8;
            }

            Send-MailMessage @sendMailParams
        }
    }
} else {
    "Fehler"
}
