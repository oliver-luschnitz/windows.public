function IniSection () {

}

function IniFile(name) {
	this.name=name;
	this.Sections =  [];
	
}

var f = new IniFile("Hallo");
WScript.echo(f.name);
