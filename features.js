/** features.js		*	@author David Nordlund		*	© 2012 Province of Nova Scotia	**/
var Features = {
	init: function() {	/// Find Feature boxes in a page and set up transitions.
		Features.transitioner = Features.Transitioners.init();
		var boxes = Features.byClass.init().get(document.body, 'features');
		Features.box = new Array(boxes.length);
		for (var i=Features.box.length; i--; Features.box[i] = new Features.Box(boxes[i], i));
	},
	byClass: { // get elements in the DOM by classname
		init: function() { (document.getElementsByClassName) || (this.get = this.find); return this; },
		get: function(root, classname) { return root.getElementsByClassName(classname); },
		find: function(root, classname) { return this.traverse(root, new RegExp('\\b'+classname+'\\b'), []); },
		traverse: function(root, classname, found) {
			for (var n=root.firstChild; n; n=n.nextSibling)
				if (n.nodeType == 1)
					classname.test(n.className) && found.push(n) || this.traverse(n, classname, found);
			return found;
		}
	},
	Box: function(element, i) { this.init(element, i); }	/** @constructor */
}

/** @class Features.Box */
Features.Box.prototype = {
	idx: 0,	// index of current feature within box
	timer: 0,
	init: function(element, boxId) {
		var list = Features.byClass.get(element, 'feature');
		this.length = list.length;
		if (this.length < 2)	// only setup bells & whistles if box has multiple features
			return;
		this.container = element;
		var jslink = 'javascript:Features.box['+boxId+'].';
		var defaultduration = element.getAttribute('defaultduration') || 9;
		var dots = document.createElement('ol');
		this.feature = new Array(this.length);
		for (var i=0, f=list[0]; i < this.length; f=list[++i]) {
			this.feature[i] = {
				element: f,
				dot: dots.appendChild(document.createElement('li')).appendChild(document.createElement('a')),
				photo: Features.byClass.get(f, 'featurePhoto')[0],
				duration: (f.getAttribute('duration') || defaultduration) * 1000
			}
			f.setAttribute("aria-hidden", i?"true":"false");
			i && (f.className += ' hiddenFeature');
		}
		this.createCallbacks();
		for (var btn=[{id:'Back',txt:'Previous'}, {id:'Next',txt:'Next'}], i=btn.length, b; i-- && (b=btn[i]);) {
			var a = document.createElement('a');
			a.className = 'feature'+b.id+'Btn';
			a.appendChild(document.createTextNode(b.txt + " Feature"));
			element.appendChild(a).href = jslink + b.id + '();';
		}
		var dotchar = "•"; dotchar.length==1 || (dotchar = '*');
		for (var i=this.length, a, n; (n = i--) && (a=this.feature[i].dot);) {
			a.appendChild(document.createTextNode(dotchar));
			a.setAttribute("aria-label", "Feature " + n);
			a.setAttribute("title", Features.byClass.get(this.feature[i].element,'featureTitle')[0].getAttribute("title"));
			a.href = jslink + 'Jump('+n+')';
		}
		element.appendChild(dots).className = 'featuresIndex';
		this.feature[0].dot.className = 'featureIndex';
		element.className += ' jsFeatures';
		element.onmouseover = this.wait;
		for (var a=element.getElementsByTagName('a'), i=a.length; i--; a[i].onfocus=this.wait);
		this.wait();
	},
	Next: function() { var i=this.getNext(); this.transition(i?"Next":"Wrap", i); },
	Back: function() { this.transition(this.idx?"Back":"ReverseWrap", this.getBack()); },
	Jump: function(i) { this.transition("Jump", --i); },
	createCallbacks: function() {
		var box=this;
		box.Auto = function() { box.timer=0; var i=box.getNext(); box.transition(i?"Auto":"AutoWrap", i); };
		box.trans = {
			old: 0, next: 0, name: '',
			set: function(transname, old_idx, next_idx) {
				if (box.getBusy()) {
					this.old=box.feature[old_idx], this.next = box.feature[next_idx], this.name = transname;
					Features.transitioner.set(box, this);
					return true;
				}
				return false;
			},
			go: function() { Features.transitioner.go(box, box.trans); },
			end: function() {
				(box.trans.old != box.trans.next) && (box.trans.old.element.className = 'hiddenFeature');
				box.setBusy(false);
				box.wait();
			}
		};
		box.wait = function() {
			box.timer && window.clearTimeout(box.timer);
			var d=box.feature[box.idx].duration;
			box.timer = d && window.setTimeout(box.Auto, Math.max(d, 1000)) || 0;
		}
	},
	getNext: function() { return (this.idx + 1) % this.length; },
	getBack: function() { return (this.idx + this.length - 1) % this.length; },
	setBusy: function(b) { this.container.setAttribute("aria-busy", String(b)); return b; },
	getBusy: function() {
		this.timer && window.clearTimeout(this.timer);
		return (this.container.getAttribute("aria-busy")=='true') ? false : this.setBusy(true);
	},
	transition: function(transname, idx) {
		if (this.trans.set(transname, this.idx, idx)) {
			this.feature[this.idx].element.setAttribute("aria-hidden", "true");
			this.feature[idx].element.setAttribute("aria-hidden", "false");
			this.feature[this.idx].dot.className = '';
			this.feature[idx].dot.className = 'featureIndex';
			this.idx = idx;
		}
	}
}

Features.Transitioners = {
	init: function() {
		var T = ['OT', 'msT', 'MozT', 'WebkitT', 't'];
		for (var t=T.length; t--;) // Detect CSS3 Transition support
			if (typeof(document.body.style[T[t]+'ransition'])=='string')
				return this.CSS;
		return this.StopMotion.init();
	},
	CSS: {	// for browsers that support Transitions
		set: function(box, t) {
			box.container.className = 'features jsFeatures featuresTransition'+t.name;
			t.next.element.className = 'feature featureTransitionIn feature'+t.name+'In';
			window.setTimeout(t.go, 30);
		},
		go: function(box, t) {
			box.container.className += ' featuresTransition';
			t.old.element.className = 'feature featureTransitionOut feature'+t.name+'Out';
			t.next.element.className = 'feature';
			window.setTimeout(t.end, 1001);
		}
	},
	StopMotion: { // for old-fashioned browsers that don't support CSS transitions
		init: function() {
			var s = this.stops = 24, c = this.curve = new Array(s);
			for (var d=100/(s*s); s--; c[s] = Math.floor(d*s*s));
			return this;
		},
		set: function(box, t) {
			var p = t.next.photo.style;
			p.left = p.top = 0;
			switch (t.name) {
				case "Back": case "ReverseWrap": p.left = '-100%'; break;
				case "Jump": p.top = '80%'; break;
				default: p.left = '100%';
			}
			t.next.element.className = 'feature';
			t.remaining = this.stops;
			t.interval = window.setInterval(t.go, Math.floor(800 / this.stops));
		},
		go: function(box, t) {
			var i = --t.remaining, oldphoto = t.old.photo.style, newphoto = t.next.photo.style;
			switch (t.name) {
				case "Back": case "ReverseWrap":
					oldphoto.left = (100 - this.curve[i]) + '%';
					newphoto.left = (-this.curve[i]) + '%';
					break;
				case "Jump":
					oldphoto.top  = (this.curve[i] - 100) + '%';
					newphoto.top  = 0.8 * this.curve[i] + '%';
					break;
				default:
					oldphoto.left = (this.curve[i] - 100) + '%';
					newphoto.left = this.curve[i] + '%';
					break;
			}
			if (!t.remaining) {
				window.clearInterval(t.interval);
				t.end();
			}
		}
	}
}
Features.init();
