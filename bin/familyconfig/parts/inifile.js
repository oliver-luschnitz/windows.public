
function IniFile(name) {
	this.Name = name;
	this.Sections = {};
	
	var file = fso.OpenTextFile(name, iomodeForReading, true, fileFormatUnicode);
	var sectionName;
	while (!file.AtEndOfStream) {
		var line = file.ReadLine().trim();
		if (line != "" && !line.startsWith(";")) {
			if (line.startsWith("[") && line.endsWith("]")) {
				sectionName = line.substr(1, line.length - 2).trim();
				this.Sections[sectionName] = {};
			} else if (sectionName) {
				var idx = line.indexOf("=");
				if (idx > 0) {
					var key = line.substr(0, idx).trim();
					var val = line.substr(idx + 1).trim();
					this.Sections[sectionName][key] = val;
				}
			}
		}
	}
	file.close();
	
	this.GetValue = function(section, key, defaultValue) {
		if (!this.Sections[section]) return defaultValue;
		if (!this.Sections[section][key]) return defaultValue;
		return this.Sections[section][key];
	}
	
	this.AddValue = function(section, key, value) {
		section = section.trim();
		key = key.trim();
		value = value.trim();
		if (!this.Sections[section]) this.Sections[section] = {};
		this.Sections[section][key] = value;
	}
	
	this.Save = function(name) {
		if (!name) name = this.Name;
		var file = fso.OpenTextFile(name, iomodeForWriting, true, fileFormatUnicode);
		for (s in this.Sections) {
			file.WriteLine("[{0}]".format(s));
			for (k in this.Sections[s]) {
				file.WriteLine("{0} = {1}".format(k, this.Sections[s][k]));
			}
		}
		file.close();
	}
}
