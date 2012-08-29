
var FeatureEditor = {
	tags: {},
	deAccentMap: {},
	init: function() {
		var deAccent = {
			'A': ['À', 'Â', 'Á'],   'a': ['à', 'â', 'á'],
			'C': ['Ç'],             'c': ['ç'],
			'E': ['È', 'Ê', 'É'],   'e': ['è', 'ê', 'é'],
			'I': ['Ì', 'Î', 'Í'],   'i': ['ì', 'î', 'í'],
			'O': ['Ò', 'Ô', 'Ó'],   'o': ['ò', 'ô', 'ó'],
			'U': ['Ù', 'Û', 'Ú'],   'u': ['ù', 'û', 'ú']
		}
		var tags = ['title', 'featureID', 'photofilename', 'photolink', 'downloadBtn', 'contentlink', 'lineuplink'], now = new Date();
		for (var i=tags.length, t; i && (t= tags[--i]); this.tags[t] = document.getElementById(t));
		for (var c in deAccent)
			for (var i=deAccent[c].length; i--; this.deAccentMap[deAccent[c][i]] = c);
		this.YYYY_MM_DD = now.getFullYear();
		this.YYYY_MM_DD += '-' + String(now.getMonth() + 101).substring(1);
		this.YYYY_MM_DD += '-' + String(now.getDate()  + 100).substring(1);
		this.id_locked = false;
		this.liveUpdate('title');
		this.liveUpdate('featureID');
		this.tags.title.focus();
	},
	deAccentChar: function( c ) { return FeatureEditor.deAccentMap[c] || c; },
	deAccent: function(text) {
		return String(text).replace(/[\u0080-\u00FF]/g, FeatureEditor.deAccentChar);
	},
	makeIDfromTitle: function(title) {
		var words = FeatureEditor.deAccent(title).split(/\W/),
			newID = [FeatureEditor.YYYY_MM_DD], regex = /^\w+$/,
			maxlen = FeatureEditor.tags.featureID.maxLength || 128;
			longtitle = title.length > (maxlen - 11);
		for (var i=0; i<words.length; i++)
			if (regex.test(words[i]))
				if (!longtitle || words[i].charAt(0).match(/[A-Z]/))	// only use title-case words if title is long
					newID.push(words[i]);
		if (newID.length < 2)
			newID.push('keyword');
		return newID.join('-').substring(0,maxlen);
	},
	updateID: function() {
		var id = FeatureEditor.tags.featureID.value,
		    photolink = FeatureEditor.tags.photolink,
		    contentlink = FeatureEditor.tags.contentlink,
		    lineuplink = FeatureEditor.tags.lineuplink,
			photofilename = id + '.jpg',
			xmlfilename = id + '.xml';
		FeatureEditor.tags.photofilename.innerHTML = photofilename;
		FeatureEditor.tags.downloadBtn.value = 'Download ' + xmlfilename;
		photolink.innerHTML = photolink.href = '../photos/' + photofilename;
		contentlink.innerHTML = contentlink.href = '../content/' + xmlfilename;
		lineuplink.href = 'index.php?add=' + id;
		lineuplink.innerHTML = 'Add ' + id + ' ...';
	},
	liveUpdate: function(fieldID) {
		var events = [];
		var tag = FeatureEditor.tags[fieldID];
		switch (tag.type) {
			case 'radio': case 'checkbox':
				events.push('onclick');
				break;
			default:
				events.push('onchange');
		}
		var browser_supports_oninput = (typeof(window.oninput)!='undefined') // IE < 9 gets fussy if you add an oninput event
		events.push(browser_supports_oninput ? 'oninput' : 'onkeyup');
		for (var i=events.length; i--;)
			tag[events[i]] = FeatureEditor.updated[fieldID];
	},
	updated: {
		title: function() {
			var title = FeatureEditor.tags.title.value, idtag = FeatureEditor.tags.featureID;
			if (!FeatureEditor.id_locked) {
				idtag.value = FeatureEditor.makeIDfromTitle(title);
				FeatureEditor.updateID();
			}
		},
		featureID: function() {
			FeatureEditor.id_locked = true;
			FeatureEditor.updateID();
		}
	}
};

FeatureEditor.init();