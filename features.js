/** features.js		*	@author David Nordlund		*	© 2012 Province of Nova Scotia	**/
var Features = {
	init: function() {	// Find Feature boxes & set up transitions.
		Features.transitioner = Features.Transitioners.init();
		var boxes = Features.byClass.init().get(document.body, 'features');
		Features.box = new Array(boxes.length);
		for (var i=Features.box.length; i--; Features.box[i]=new Features.Box(boxes[i], i));
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
	Box: function(tag, i) { this.init(tag, i, Features.byClass); },
	LOCKS: {FREEZE:1,FOCUS:2,HOVER:4,TRANS:8,PLAYER:16}
}

Features.Box.prototype = {
	idx: 0,	// index of current feature
	timer: 0,
	init: function(tag, boxId, $) {
		var list = $.get(tag, 'feature'), btns = $.get(tag, 'featureControls');
		this.size = list.length;
		if (!this.size) return;
		this.tag = tag;
		this.createCallbacks($);
		this.story = new Array(this.size);
		this.duration = (tag.getAttribute('data-duration')||9)*1000;
		btns = btns.length?btns[0].getElementsByTagName('button'):[];
		for (var i=0,t=list[0]; i<this.size; t=list[++i]) {
			var p=$.get(t, 'featurePhoto')[0], b=$.get(p, 'featurePlayBtn');
			this.story[i] = {tag: t, pic: p, dot: i in btns?btns[i]:{}};
			b.length && (p.onclick = this.play);
			if (this.size>1)
				for (var a=t.getElementsByTagName('a'), j=a.length; j--; a[j].onfocus=this.linkFocus, a[j].onblur=this.linkBlur);
			i && (t.className+=' hiddenFeature');
		}
		for (var i=btns.length, b; i-- && (b=btns[i]); b.onfocus=this.btnFocus, b.onblur=this.btnBlur)
			b.onclick = b.className.length ? this[b.className.substring(7,11).toLowerCase()] : this.jump;
		this.story[0].dot.className = 'featureIndex';
		tag.className += ' jsFeatures';
		tag.getAttribute('data-autostart')=='0' ? this.lock(Features.LOCKS.FREEZE) : this.wait();
	},
	locked: 0, //locked boxes don't transition
	lock: function(key) {(this.locked|= key) && this.stop()},
	unlock: function(key) {(this.locked&=~key) || this.wait()},
	createCallbacks: function($) {
		var LOCK=Features.LOCKS, box=this;
		box.next = function() { var i=box.getNext(); box.transition(i?"Next":"Wrap", i); };
		box.back = function() { box.transition(box.idx?"Back":"WrapBack", box.getBack()); };
		box.auto = function() { box.timer=0; var i=box.getNext(); box.transition(i?"Auto":"Cycle", i); };
		box.jump = function() { for (var i=box.size; i-- && (box.story[i].dot!=this);); box.transition("Jump",i); };
		box.trans = {
			old: 0, next: 0, name: '',
			set: function(transname, old_idx, next_idx) {
				if (!this.name) {
					box.lock(LOCK.TRANS);
					box.unlock(LOCK.FREEZE);
					this.old=box.story[old_idx], this.next=box.story[next_idx], this.name=transname;
					(box.locked&LOCK.PLAYER) && box.delPlayer(this.old);
					Features.transitioner.set(box, this);
					return true;
				}
				return false;
			},
			go: function() { Features.transitioner.go(box, box.trans); },
			end: function() {
				box.tag.className = 'features jsFeatures';
				(box.trans.next!=box.trans.old) && (box.trans.old.tag.className = 'feature hiddenFeature');
				box.trans.name = '';
				box.unlock(LOCK.TRANS);
			}
		}
		box.stop = function() {box.timer && (box.timer=clearTimeout(box.timer))}
		box.wait = function() {box.stop(); var d=box.duration; d && (box.timer=setTimeout(box.auto, d))}
		box.linkFocus = function() {
			var i=box.size, f=this;
			for (; f && !f.className.match(/^feature\b/); f=f.parentNode)
				if (f.className=="featureLinks") f.className += ' featureLinksFocused';
			while((i--) && (box.story[i].tag!=f)); // set i = feature # with focused link
			(i!=box.idx) && box.transition("Jump",i);
			box.lock(LOCK.FOCUS);
		}
		box.linkBlur = function() {
			(this.className=="featureLink")&&(this.parentNode.parentNode.className='featureLinks');
			box.unlock(LOCK.FOCUS);
		}
		box.btnFocus = function() {box.lock(LOCK.FOCUS)}
		box.btnBlur = function() {box.unlock(LOCK.FOCUS)}
		box.tag.onmouseover = function() {box.lock(LOCK.HOVER)}
		box.tag.onmouseout  = function() {box.unlock(LOCK.HOVER)}
		box.play = function() {
			var url = this.href, src, story=box.story[box.idx].tag,
				youtube=url.match(/http:\/\/(www\.)?youtube.com\/watch\?v=([^&]+)/);
			if (box.locked&(LOCK.TRANS|LOCK.PLAYER)) return false;
			if (youtube) src='www.youtube-nocookie.com/embed/'+youtube[2]+'?autoplay=1&rel=0&autohide=1';
			if (!src) return true;
			box.lock(LOCK.PLAYER);
			var i=document.createElement('iframe'), p=$.get(story, 'featurePlayer')[0], c=$.get(story, 'featurePlayerClose')[0];
			story.className+=' featurePlaying';
			c.onclick=box.noplay;
			c.focus();
			i.className='featurePlayerObject';
			p.appendChild(i).setAttribute('src', location.protocol+'//'+src);
			i.style.height = p.clientHeight+'px';
			return false;
		}
		box.noplay = function() {
			var f=box.story[box.idx];
			box.delPlayer(f);
			f.pic.focus();
		}
	},
	getNext: function() { return (this.idx + 1) % this.size; },
	getBack: function() { return (this.idx + this.size - 1) % this.size; },
	transition: function(transname, idx) {
		if (this.trans.set(transname, this.idx, idx)) {
			this.story[this.idx].dot.className = '';
			this.story[idx].dot.className = 'featureIndex';
			this.idx = idx;
		}
	},
	delPlayer: function(story) {
		for (var l=Features.byClass.get(story.tag, 'featurePlayerObject'),i=l.length,o; i-- && (o=l[i]); o.parentNode.removeChild(o));
		story.tag.className = 'feature';
		this.unlock(Features.LOCKS.PLAYER);
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
			setTimeout(t.go, 30);
		},
		go: function(box, t) {
			box.tag.className += ' featuresTransition';
			t.old.tag.className = 'feature featureTransitionOut feature'+t.name+'Out';
			t.next.tag.className = 'feature';
			setTimeout(t.end, 1001);
		}
	},
	StopMotion: {	// for old browsers without Transitions
		init: function() {
			var s = this.stops = 24, c = this.curve = new Array(s);
			for (var d=100/(s*s); s--; c[s] = Math.floor(d*s*s));
			return this;
		},
		set: function(box, t) {
			var p = t.next.pic.style;
			p.left = p.top = 0;
			switch (t.name) {
				case "Back": case "WrapBack": p.left = '-100%'; break;
				case "Jump": p.top = '80%'; break;
				default: p.left = '100%';
			}
			t.next.tag.className = 'feature';
			t.remaining = this.stops;
			t.interval = setInterval(t.go, Math.floor(800 / this.stops));
		},
		go: function(box, t) {
			var i = --t.remaining, oldpic = t.old.pic.style, newpic = t.next.pic.style;
			switch (t.name) {
				case "Back": case "WrapBack":
					oldpic.left = (100 - this.curve[i]) + '%';
					newpic.left = (-this.curve[i]) + '%';
					break;
				case "Jump":
					oldpic.top  = (this.curve[i] - 100) + '%';
					newpic.top  = 0.8 * this.curve[i] + '%';
					break;
				default:
					oldpic.left = (this.curve[i] - 100) + '%';
					newpic.left = this.curve[i] + '%';
					break;
			}
			if (!t.remaining) {
				clearInterval(t.interval);
				t.end();
			}
		}
	}
}
Features.init();
