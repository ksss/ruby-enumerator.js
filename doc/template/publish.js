/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
	publish.conf = {  // trailing slash expected for dirs
		ext:         ".html",
		outDir:      JSDOC.opt.d || SYS.pwd+"../out/jsdoc/",
		templatesDir: JSDOC.opt.t || SYS.pwd+"../templates/jsdoc/",
	};

	Link.symbolSet = symbolSet;
	
	// create the required templates
	try {
		var classTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"class.tmpl");
	} catch(e) {
		print("Couldn't create the required templates: "+e);
		quit();
	}
	
	// get an array version of the symbolset, useful for filtering
	var symbols = symbolSet.toArray();
	
	// get a list of all the classes in the symbolset
	var classes = symbols.filter(isaClass);

	// create each of the class pages
	for (var i = 0, len = classes.length; i < len; i++) {
		var symbol = classes[i];
		if (symbol.name === '_global_') continue;

		symbol.events = symbol.getEvents();   // 1 order matters
		symbol.methods = symbol.getMethods(); // 2

		Link.currentSymbol= symbol;
		var output = "";
		output = classTemplate.process(symbol);

		IO.saveFile(publish.conf.outDir, symbol.alias + publish.conf.ext, output);
	}
}

var indent = '  ';

// make link
function href (name) {
	var str = name.split(/[#\.]/);
	return str[0] + publish.conf.ext + '#' + name;
}

// some ustility filters
function isaClass($) {
	if ($.name === '_global_') return false;
	return ($.is("CONSTRUCTOR") || $.isNamespace)
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
	}
}

/** Pull in the contents of an external file at the given path. */
function include(path) {
	var path = publish.conf.templatesDir+path;
	return IO.readFile(path);
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
	if (!params) return "()";
	var signature = "("
	+
	params.filter(
		function($) {
			return $.name.indexOf(".") == -1; // don't show config params in signature
		}
	).map(
		function($) {
			return $.name;
		}
	).join(", ")
	+
	")";
	return signature;
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
	str = str.replace(/\{@link ([^} ]+) ?\}/gi,
		function(match, symbolName) {
			return new Link().toSymbol(symbolName);
		}
	);
	
	return str;
}

