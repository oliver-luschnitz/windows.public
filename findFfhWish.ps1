
$url = "https://gewinnspiel-ticker.de/"
#$regex = "([0-2][0-9]:[0-5][0-9]\s+Uhr).+?<strong>([^<]+).+?<strong>([^<]+)"
$regexFfh = "id=""competition-ffh-wuensch-dir-was-2022""><div class=""time-entry""><b>([^<]+).+?<strong>([^<]+).+?<strong>([^<]+).+?<strong>([^<]+)"
$regexAB = "id=""competition-antenne-deine-rechnung-2022""><div class=""time-entry""><b>([^<]+).+?<strong>([^<]+).+?<strong>([^<]+).+?<strong>([^<]+)"

$resp = $null
$Error.Clear()
$resp = Invoke-WebRequest $url

function SendWish($comp, $tel, $nr) {
    $name = $Matches[3].Trim()
    $wish = $Matches[2].Trim()
    $time = $Matches[1].Trim()
    $from = $Matches[4].Trim()
    $Matches.Clear()

    $msg = ""
    $msg += ("Comp:  {0}`n" -f $comp)
    $msg += ("Date:  {0:yyyy-MM-dd}`n" -f $(Get-Date))
    $msg += ("Time:  {0}`n" -f $time)
    $msg += ("Wisch: {0}`n" -f $wish)
    $msg += ("Name:  {0}`n" -f $name)
    $msg += ("From:  {0}`n" -f $from)
    $msg

    $tmp = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "ffhwishps1-$nr.txt")
    $old = (Get-Content -Path $tmp)
    $old = [string]::Join("`n", $old)

    if ($old -ne $msg) {
        #[System.Windows.MessageBox]::Show($msg, "FFH Wunsch", 0, [System.Windows.MessageBoxImage]::Information) | Out-Null
        $msg | Out-File -FilePath $tmp

        #if ($name.ToLower().Contains("luschnitz")) {
            $msg += "`n`nAnrufen: $tel"
            $cred = Import-Clixml -Path "gmx.xml"
            $sendMailParams = @{ 
	            From = 'oliver.luschnitz@gmx.de'; 
	            To = 'oliver.luschnitz@gmail.com'; 
	            Subject = "$comp [$env:COMPUTERNAME]"; 
	            Body = $msg; 
	            SMTPServer = 'mail.gmx.com'; 
	            Port = 587; 
	            UseSsl = $true; 
	            Credential = $cred;
                Encoding = [System.Text.Encoding]::UTF8;
            }

            Send-MailMessage @sendMailParams
        #}
    }
}

if ($resp -ne $null) {
    if ($resp.StatusCode -eq 200) {
        $content = $resp.Content.Replace("`n", "").Replace("`r","")
        #$content | Out-File -FilePath "C:\Users\Oliver Luschnitz\Desktop\gst.txt"
        if ($content -match $regexFfh) {  
            SendWish "FFH Wünsch Dir Was"  "+49 (69) 19725"  "ffh"
        }
        if ($content -match $regexAB) {  
            SendWish "Antenne Bayern Deine Rechnung"  "+49 (800) 994-1000"  "ab"
        }
    } else {
        "Fehler $resp.StatusCode"
    }
} else {
    $cred = Import-Clixml -Path "gmx.xml"
    $sendMailParams = @{ 
	    From = 'oliver.luschnitz@gmx.de'; 
	    To = 'oliver.luschnitz@gmail.com'; 
	    Subject = 'Gewinnspielticker - Fehler'; 
	    Body = ($Error | Out-String); 
	    SMTPServer = 'mail.gmx.com'; 
	    Port = 587; 
	    UseSsl = $true; 
	    Credential = $cred;
        Encoding = [System.Text.Encoding]::UTF8;
    }

    Send-MailMessage @sendMailParams
}

