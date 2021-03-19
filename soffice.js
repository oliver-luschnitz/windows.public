// start LibreOffice
var shell = WScript.CreateObject("WScript.Shell");
var soffice = shell.ExpandEnvironmentStrings("\"%ProgramFiles%\\LibreOffice\\program\\soffice.exe\"");
shell.run(soffice);
