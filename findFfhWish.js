
var url = "https://ffh-ticker.de/aktuell/";
var regex = new RegExp(/([0-2][0-9]:[0-5][0-9]\s+Uhr).+?<strong>([^<]+).+?<strong>([^<]+)/);

String.prototype.trim = function()
{
    return this.replace(/^\s+|\s+$/g, '');
};

String.prototype.removeNL = function()
{
    return this.replace(/\n|\r/g, '');
};

function doRequest() {
	var xmlHttp = WScript.CreateObject("MSXML2.XMLHTTP");
	xmlHttp.open( "GET", url, false ); // false for synchronous request
	xmlHttp.send( null );
	var response = xmlHttp.responseText;
	if (response !== null) {
		response = response.trim().removeNL();
		var parts = response.match(regex);
		if (parts) {
			// WScript.echo(parts[0]);
			// WScript.echo(parts[1]);
			// WScript.echo(parts[2]);
			// WScript.echo(parts[3].trim());
			var title = "FFH Wünsch Dir was " + parts[1];
			var name = parts[3].trim();
			var text = parts[2].trim() + "\ngewünscht von\n\n" + name;
			var oldName = "";
			var oFso = WScript.CreateObject("Scripting.FileSystemObject");
			var statFile = oFso.GetSpecialFolder(2);
			statFile = oFso.BuildPath(statFile, "ffh-wdw.txt");
			if (oFso.FileExists(statFile)) {
				var f = oFso.OpenTextFile(statFile, 1, false, 0);
				oldName = f.ReadLine();
				f.close();
				// WScript.echo("Old Name: " + oldName);
			}
			if (oldName !== name) {
				// WScript.echo(title);
				// WScript.echo(text);
				oShell = WScript.CreateObject("WScript.shell");
				oShell.Popup(text, 0, title, 0 + 64 + 4096);
				var f = oFso.OpenTextFile(statFile, 2, true, 0);
				f.WriteLine(name);
				f.close();
			}
		} else {
			WScript.echo("Parts is null");
		}
	}
}

doRequest();
