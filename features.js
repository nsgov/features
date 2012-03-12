/** features.js		*	@author David Nordlund		*	© 2012 Province of Nova Scotia	**/
var Features = {
	init: function() {	// Find Feature boxes & set up transitions.
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
	Box: function(tag, i) { this.init(tag, i); }
}

Features.Box.prototype = {
	idx: 0,	// index of current feature
	timer: 0,
	busy: false,
	init: function(tag, boxId) {
		var list = Features.byClass.get(tag, 'feature');
		this.length = list.length;
		if (this.length < 2)	// only setup bells & whistles if box has multiple features
			return;
		this.tag = tag;
		var jslink = 'javascript:Features.box['+boxId+'].';
		var defaultduration = tag.getAttribute('defaultduration') || 9;
		var dots = document.createElement('ol');
		dots.setAttribute("aria-hidden", "true");
		this.createCallbacks(this);
		this.feature = new Array(this.length);
		for (var i=0, f=list[0]; i < this.length; f=list[++i]) {
			this.feature[i] = {
				tag: f,
				dot: dots.appendChild(document.createElement('li')).appendChild(document.createElement('a')),
				photo: Features.byClass.get(f, 'featurePhoto')[0],
				duration: (f.getAttribute('duration') || defaultduration) * 1000
			}
			this.feature[i].dot.onfocus = this.wait;
			for (var a=f.getElementsByTagName('a'), j=a.length; j--; a[j].onfocus=this.focused, a[j].onblur=this.blurred);
			i && (f.className+=' hiddenFeature');
		}
		for (var btn=[{t:'Back',f:'back'}, {t:'Next',f:'next'}], i=2, b; i && (b=btn[--i]); a.href=jslink+b.f+'();') {
			var a = document.createElement('a');
			a.className = 'feature'+b.t+'Btn';
			a.setAttribute("aria-hidden", "true");
			a.appendChild(document.createTextNode(b.t));
			tag.appendChild(a).onfocus = this.wait;
		}
		var bullet = "•"; bullet.length==1 || (bullet = '*');
		for (var i=this.length, a, t; i-- && (a=this.feature[i].dot); a.href=jslink+'jump('+i+')') {
			a.appendChild(document.createTextNode(bullet));
			t = Features.byClass.get(this.feature[i].tag,'featureTitle');
			if (t.length) a.setAttribute("title", t[0].getAttribute("title"));
		}
		tag.appendChild(dots).className = 'featuresIndex';
		this.feature[0].dot.className = 'featureIndex';
		tag.className += ' jsFeatures';
		tag.onmouseover = this.wait;
		this.wait();
	},
	next: function() { var i=this.getNext(); this.transition(i?"Next":"Wrap", i); },
	back: function() { this.transition(this.idx?"Back":"WrapBack", this.getBack()); },
	jump: function(i) { this.transition("Jump", i); },
	createCallbacks: function(box) {
		box.auto = function() { box.timer=0; var i=box.getNext(); box.transition(i?"Auto":"Cycle", i); };
		box.trans = {
			old: 0, next: 0, name: '',
			set: function(transname, old_idx, next_idx) {
				if (!box.busy) {
					box.timer && window.clearTimeout(box.timer);
					this.old=box.feature[old_idx], this.next=box.feature[next_idx], this.name=transname;
					Features.transitioner.set(box, this);
					return (box.busy = true);
				}
				return false;
			},
			go: function() { Features.transitioner.go(box, box.trans); },
			end: function() {
				box.tag.className = 'features jsFeatures';
				(box.trans.next!=box.trans.old) && (box.trans.old.tag.className = 'feature hiddenFeature');
				box.busy = false;
				box.wait();
			}
		};
		box.wait = function() {
			box.timer && window.clearTimeout(box.timer);
			var d=box.feature[box.idx].duration;
			box.timer = d && window.setTimeout(box.auto, Math.max(d, 1000)) || 0;
		}
		box.focused = function() {
			var i=box.length, f=this;
			for (; f && !f.className.match(/^feature\b/); f=f.parentNode)
				if (f.className=="featureLinks") f.className += ' featureLinksFocused';
			while((i--) && (box.feature[i].tag!=f)); // set i = feature # with focused link
			(i!=box.idx) && box.jump(i) || box.wait();
		},
		box.blurred = function() {(this.className=="featureLink")&&(this.parentNode.parentNode.className='featureLinks');}
	},
	getNext: function() { return (this.idx + 1) % this.length; },
	getBack: function() { return (this.idx + this.length - 1) % this.length; },
	transition: function(transname, idx) {
		if (this.trans.set(transname, this.idx, idx)) {
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
	CSS: {	// for browsers with Transitions
		set: function(box, t) {
			box.tag.className = 'features jsFeatures featuresTransition'+t.name;
			t.next.tag.className = 'feature featureTransitionIn feature'+t.name+'In';
			window.setTimeout(t.go, 30);
		},
		go: function(box, t) {
			box.tag.className += ' featuresTransition';
			t.old.tag.className = 'feature featureTransitionOut feature'+t.name+'Out';
			t.next.tag.className = 'feature';
			window.setTimeout(t.end, 1001);
		}
	},
	StopMotion: {	// for old browsers without Transitions
		init: function() {
			var s = this.stops = 24, c = this.curve = new Array(s);
			for (var d=100/(s*s); s--; c[s] = Math.floor(d*s*s));
			return this;
		},
		set: function(box, t) {
			var p = t.next.photo.style;
			p.left = p.top = 0;
			switch (t.name) {
				case "Back": case "WrapBack": p.left = '-100%'; break;
				case "Jump": p.top = '80%'; break;
				default: p.left = '100%';
			}
			t.next.tag.className = 'feature';
			t.remaining = this.stops;
			t.interval = window.setInterval(t.go, Math.floor(800 / this.stops));
		},
		go: function(box, t) {
			var i = --t.remaining, oldphoto = t.old.photo.style, newphoto = t.next.photo.style;
			switch (t.name) {
				case "Back": case "WrapBack":
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
