/*
---

script: MooEditr.js

description: Class for creating a WYSIWYG editor, for contentEditable-capable browsers.

license: MIT-style license

authors:
- Lim Chee Aun
- Radovan Lozej
- Ryan Mitchell
- Olivier Refalo
- T.J. Leahy

requires:
  core/1.2.4:
  - Events
  - Options
  - Element.Event
  - Element.Style
  - Element.Dimensions
  - Selectors

inspiration:
- Forked from MooEditable (http://github.com/cheeaun/mooeditable)

provides: [MooEditr, MooEditr.Selection, MooEditr.UI, MooEditr.Actions]

...
*/

(function(){

this.MooEditr = new Class({

	Implements: [Events, Options],
	
	blockEls: /^(H[1-6]|HR|P|DIV|ADDRESS|PRE|FORM|TABLE|LI|OL|UL|TD|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|SCRIPT|NOSCRIPT|STYLE)$/i,
	protectRegex: /<(script|noscript|style)[\u0000-\uFFFF]*?<\/(script|noscript|style)>/g,
		
	options: {
		toolbar: true,
		cleanup: true,
		paragraphise: true,
		xhtml : true,
		semantics : true,
		actions: 'formatBlock cssStyles | bold italic underline strikethrough | justifycenter justifyfull justifyleft justifyright | insertunorderedlist insertorderedlist indent outdent | removeformat | undo redo | link unlink | image | showhide * flash video audio | forecolor | inserthtml | charmap | anchor | pagebreak | wordpaste | inserthorizontalrule | tableadd tableedit tablerowadd tablerowedit tablerowspan tablerowsplit tablerowdelete tablecoladd tablecoledit tablecolspan tablecolsplit tablecoldelete',
		handleSubmit: true,
		handleLabel: true,
		disabled: false,
		baseCSS: 'html{ height: 100%; cursor: text; } body{ font-family: sans-serif; }',
		extraCSS: '',
		externalCSS: '',
		html: '<!DOCTYPE html><html><head><meta charset=UTF-8">{BASEHREF}<style>{BASECSS} {EXTRACSS}</style>{EXTERNALCSS}</head><body></body></html>',
		rootElement: 'p',
		baseURL: '',
		toggleTabs: true,
		resizable: true,
		resizeLimits: false, // see limit option on MooTools More Drag class
		fileManager: null // function for handling files
	},

	initialize: function(el, options){
		this.setOptions(options);
		this.textarea = document.id(el);
		this.textarea.store('MooEditr', this);
		this.actions = this.options.actions.clean().split(' ');
		this.keys = {};
		this.dialogs = {};
		this.protectedElements = [];
		this.cssStyles = [];
		this.customUndo = false;
		this.actions.each(function(action){
			var act = MooEditr.Actions[action];
			if (!act) return;
			if (act.options){
				var key = act.options.shortcut;
				if (key) this.keys[key] = action;
			}
			if (act.dialogs){
				Object.each(act.dialogs, function(dialog, name){
					dialog = dialog.attempt(this);
					dialog.name = action + ':' + name;
					if (typeOf(this.dialogs[action]) != 'object') this.dialogs[action] = {};
					this.dialogs[action][name] = dialog;
				}, this);
			}
			if (act.events){
				Object.each(act.events, function(fn, event){
					this.addEvent(event, fn);
				}, this);
			}
		}.bind(this));
		this.render();
	},
	
	toElement: function(){
		return this.textarea;
	},
	
	render: function(){
		var self = this;
		
		// Dimensions
		var dimensions = this.textarea.getSize();
		
		// Build the container
		this.container = new Element('div', {
			id: (this.textarea.id) ? this.textarea.id + '-mooeditr-container' : null,
			'class': 'mooeditr-container',
			styles: {
				width: dimensions.x
			}
		});

		// Override all textarea styles
		this.textarea.addClass('mooeditr-textarea').setStyle('height', dimensions.y);
		
		// Build the iframe
		this.iframe = new IFrame({
			'class': 'mooeditr-iframe',
			frameBorder: 0,
			src: 'javascript:""', // Workaround for HTTPs warning in IE6/7
			styles: {
				height: dimensions.y
			}
		});
		
		// do we want html/code tabs?
		if (this.options.toggleTabs){
		
			this.tabbar = new Element('div', { html: '<ul><li class="active"><a href="#html">HTML</a></li><li><a href="#code">Code</a></li></ul>' }).addClass('mooeditr-tabbar');
			
			self = this;
			this.tabbar.getElements('a').addEvent('click', function(ev){
			
				if (ev) ev.stop();
								
				this.getParent('ul').getElements('li').removeClass('active');
				this.getParent('li').addClass('active');
				
				if (this.get('href').indexOf('#html') != -1){
					self.toggleView('textarea');
				} else {
					self.toggleView('iframe');			
				}
							
			});
		
		}
		
		// resizable? requires Drag from more
		if (this.options.resizable){
			this.dragHandle = new Element('div').addClass('mooeditr-draghandle');		
		}
		
		// setup toolbar
		this.toolbar = new MooEditr.UI.Toolbar({
			onItemAction: function(){
				var args = Array.from(arguments);
				var item = args[0];
				self.action(item.name, args);
			}
		});
		this.attach.delay(1, this);
		
		// Update the event for textarea's corresponding labels
		if (this.options.handleLabel && this.textarea.get('id')){
			document.id(document.body).getElements('label[for="'+this.textarea.get('id')+'"]')
			.addEvent('click', function(e){
				if (self.mode != 'iframe') return;
				e.preventDefault();
				self.focus();
			});
		}

		// Update & cleanup content before submit
		if (this.options.handleSubmit){
			this.form = this.textarea.getParent('form');
			if (!this.form) return;
			this.form.addEvent('submit', function(){
				if (self.mode == 'iframe') self.saveContent();
			});
		}
		
		this.fireEvent('render', this);
	},

	attach: function(){
		var self = this;

		// Assign view mode
		this.mode = 'iframe';
		
		// Editor iframe state
		this.editorDisabled = false;

		// Put textarea inside container
		this.container.wraps(this.textarea);

		this.textarea.setStyle('display', 'none');
		
		this.iframe.setStyle('display', '').inject(this.textarea, 'before');
				
		Object.each(this.dialogs, function(action, name){
			Object.each(action, function(dialog){
				document.id(dialog).inject(self.iframe, 'before');
				var range;
				dialog.addEvents({
					open: function(){
						range = self.selection.getRange();
						self.editorDisabled = true;
						self.toolbar.disable(name);
						self.fireEvent('dialogOpen', this);
					},
					close: function(){
						self.toolbar.enable();
						self.editorDisabled = false;
						self.focus();
						if (range) self.selection.setRange(range);
						self.fireEvent('dialogClose', this);
					}
				});
			});
		});

		// contentWindow and document references
		this.win = this.iframe.contentWindow;
		this.doc = this.win.document;
		
		// Deal with weird quirks on Gecko
		if (Browser.firefox) this.doc.designMode = 'On';	
			
		// Build the content of iframe
		var docHTML = this.options.html.substitute({
			BASECSS: this.options.baseCSS,
			EXTRACSS: this.options.extraCSS,
			EXTERNALCSS: (this.options.externalCSS) ? '<link rel="stylesheet" href="' + this.options.externalCSS + '">': '',
			BASEHREF: (this.options.baseURL) ? '<base href="' + this.options.baseURL + '" />': ''
		});
		this.doc.open();
		this.doc.write(docHTML);
		this.doc.close();

		// Turn on Design Mode
		// IE fired load event twice if designMode is set
		(Browser.ie) ? this.doc.body.contentEditable = true : this.doc.designMode = 'On';

		// Mootoolize window, document and body
		Object.append(this.win, new Window);
		Object.append(this.doc, new Document);
		if (Browser.Element){
			var winElement = this.win.Element.prototype;
			for (var method in Element){ // methods from Element generics
				if (!method.test(/^[A-Z]|\$|prototype|mooEditable/)){
					winElement[method] = Element.prototype[method];
				}
			}
		} else {
			document.id(this.doc.body);
		}
						
		this.setContent(this.textarea.get('value'));

		// Bind all events
		this.doc.addEvents({
			mouseup: this.editorMouseUp.bind(this),
			mousedown: this.editorMouseDown.bind(this),
			mouseover: this.editorMouseOver.bind(this),
			mouseout: this.editorMouseOut.bind(this),
			mouseenter: this.editorMouseEnter.bind(this),
			mouseleave: this.editorMouseLeave.bind(this),
			contextmenu: this.editorContextMenu.bind(this),
			click: this.editorClick.bind(this),
			dblclick: this.editorDoubleClick.bind(this),
			keypress: this.editorKeyPress.bind(this),
			keyup: this.editorKeyUp.bind(this),
			keydown: this.editorKeyDown.bind(this),
			focus: this.editorFocus.bind(this),
			blur: this.editorBlur.bind(this)
		});
		this.win.addEvents({
			focus: this.editorFocus.bind(this),
			blur: this.editorBlur.bind(this)
		});
		['cut', 'copy', 'paste'].each(function(event){
			self.doc.body.addListener(event, self['editor' + event.capitalize()].bind(self));
		});
		this.textarea.addEvent('keypress', this.textarea.retrieve('MooEditr:textareaKeyListener', this.keyListener.bind(this)));
		
		// Fix window focus event not firing on Firefox 2
		if (Browser.firefox2) this.doc.addEvent('focus', function(){
			self.win.fireEvent('focus').focus();
		});

		// styleWithCSS, not supported in IE and Opera
		if (!Browser.ie && !Browser.opera){
			var styleCSS = function(){
				self.execute('styleWithCSS', false, false);
				self.doc.removeEvent('focus', styleCSS);
			};
			this.win.addEvent('focus', styleCSS);
		}

		if (this.options.toolbar){
			document.id(this.toolbar).inject(this.container, 'top');
			this.toolbar.render(this.actions);
		}
		
		if (this.options.toggleTabs){
			this.tabbar.setStyle('display', '').inject(this.container, 'top');
		}
		
		if (this.options.resizable){
			try {
				this.dragHandle.inject(this.container, 'top');
				this.iframe.makeResizable({ handle: this.dragHandle, limit: this.options.resizeLimits });
			} catch (e){
				throw 'Resizable required the Drag class from MooTools More';
			}
		}
		
		//if (!this.doc.queryCommandSupported('undo')){
		//	if (console) console.log('Initiate custom undo/redo stack');
		//	this.customUndo = true;
		//}
		
		if (this.options.disabled) this.disable();

		// initialize selection api
		this.selection = new MooEditr.Selection(this.win, this.doc);
		
		// save old content
		this.oldContent = this.getContent();
		
		// parse CSS styles
		Array.each(this.doc.styleSheets, function(ss){
						
			try {
				if (ss.cssRules || ss.rules){
					it = ss.cssRules ? ss.cssRules : ss.rules;
					Array.each(it, function(rule){
						var rules = rule.selectorText.split(',');
						for(var c=0; c<rules.length; c++){
							rules[c] = rules[c].trim();
							if((rules[c].indexOf(':') == -1) && (rules[c].toLowerCase().indexOf('mooeditr') == -1)){
														
								if(rule.selectorText.indexOf('.') != -1){
									var cssEl = rules[c].substring(0, rule.selectorText.indexOf('.'));
									var cssCl = rules[c].substring(rule.selectorText.indexOf('.') + 1);
									this.cssStyles.push({ el: cssEl.split(' '), classname: cssCl });
								}
								
							}
						}
					}, this);
				}
			} catch(e){
				// firefox doesn't give us the cssRules of <link> elements, any workaround?
			}
			
		}, this);
						
		this.fireEvent('attach', this);
		
		return this;
	},
	
	detach: function(){
		this.saveContent();
		this.textarea.setStyle('display', '').removeClass('MooEditr-textarea').inject(this.container, 'before');
		this.textarea.removeEvent('keypress', this.textarea.retrieve('MooEditr:textareaKeyListener'));
		this.container.dispose();
		this.fireEvent('detach', this);
		return this;
	},
	
	enable: function(){
		this.editorDisabled = false;
		this.toolbar.enable();
		return this;
	},
	
	disable: function(){
		this.editorDisabled = true;
		this.toolbar.disable();
		return this;
	},
	
	editorFocus: function(e){
		this.oldContent = '';
		this.fireEvent('editorFocus', [e, this]);
	},
	
	editorBlur: function(e){
		this.oldContent = this.saveContent().getContent();
		this.fireEvent('editorBlur', [e, this]);
	},
	
	editorMouseUp: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		if (this.options.toolbar) this.checkStates();
		
		this.fireEvent('editorMouseUp', [e, this]);
	},
	
	editorMouseDown: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorMouseDown', [e, this]);
	},
	
	editorMouseOver: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorMouseOver', [e, this]);
	},
	
	editorMouseOut: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorMouseOut', [e, this]);
	},
	
	editorMouseEnter: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		if (this.oldContent && this.getContent() != this.oldContent){
			this.focus();
			this.fireEvent('editorPaste', [e, this]);
		}
		
		this.fireEvent('editorMouseEnter', [e, this]);
	},
	
	editorMouseLeave: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorMouseLeave', [e, this]);
	},
	
	editorContextMenu: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorContextMenu', [e, this]);
	},
	
	editorClick: function(e){
		// make images selectable and draggable in webkit
		if (Browser.safari || Browser.chrome){
			var el = e.target;
			if (Element.get(el, 'tag') == 'img'){
			
				// safari doesnt like dragging locally linked images
				if (this.options.baseURL){
					if (el.getProperty('src').indexOf('http://') == -1){
						el.setProperty('src', this.options.baseURL + el.getProperty('src'));
					}
				}
			
				this.selection.selectNode(el);
				this.checkStates();
			}
		}
		
		this.fireEvent('editorClick', [e, this]);
	},
	
	editorDoubleClick: function(e){
		this.fireEvent('editorDoubleClick', [e, this]);
	},
	
	editorKeyPress: function(e){
		
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.keyListener(e);
		
		this.fireEvent('editorKeyPress', [e, this]);
	},
	
	editorKeyUp: function(e){
			
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		var c = e.code;
		// 33-36 = pageup, pagedown, end, home; 45 = insert
		if (this.options.toolbar && (/^enter|left|up|right|down|delete|backspace$/i.test(e.key) || (c >= 33 && c <= 36) || c == 45 || e.meta || e.control)){
			if (Browser.ie6){ // Delay for less cpu usage when you are typing
				clearTimeout(this.checkStatesDelay);
				this.checkStatesDelay = this.checkStates.delay(500, this);
			} else {
				this.checkStates();
			}
		}
		
		this.fireEvent('editorKeyUp', [e, this]);
	},
	
	editorKeyDown: function(e){
		
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		if (e.key == 'enter'){
			if (this.options.paragraphise){
				if (e.shift && (Browser.safari || Browser.chrome)){
					var s = this.selection;
					var r = s.getRange();
					
					// Insert BR element
					var br = this.doc.createElement('br');
					r.insertNode(br);
					
					// Place caret after BR
					r.setStartAfter(br);
					r.setEndAfter(br);
					s.getSelection().setSingleRange(r);
					
					// Could not place caret after BR then insert an nbsp entity and move the caret
					if (s.getSelection().focusNode == br.previousSibling){
						var nbsp = this.doc.createTextNode('\u00a0');
						var p = br.parentNode;
						var ns = br.nextSibling;
						(ns) ? p.insertBefore(nbsp, ns) : p.appendChild(nbsp);
						s.selectNode(nbsp);
						s.collapse(1);
					}
					
					// work out line height for scrolling
					var lh = parseInt(document.id(r.startContainer).getStyle('line-height'));
					if (isNaN(lh)) lh = parseInt(document.id(r.startContainer).getStyle('font-size')) * 1.15;
																														
					// Scroll to new position, scrollIntoView can't be used due to bug: http://bugs.webkit.org/show_bug.cgi?id=16117
					this.win.scrollTo(0, this.win.getScroll().y + lh);
					
					e.preventDefault();
					
				} else if (Browser.firefox || Browser.safari || Browser.chrome){
					var node = this.selection.getNode();
					var isBlock = Element.getParents(node).include(node).some(function(el){
						return el.nodeName.test(this.blockEls);
					}, this);
					if (!isBlock) this.execute('insertparagraph');
				}
			} else {
				if (Browser.ie){
					var r = this.selection.getRange();
					var node = this.selection.getNode();
					if (r && node.get('tag') != 'li'){
						this.selection.insertContent('<br>');
						this.selection.collapse(false);
					}
					e.preventDefault();
				}
			}
		}
		
		if (Browser.opera){
			var ctrlmeta = e.control || e.meta;
			if (ctrlmeta && e.key == 'x'){
				this.fireEvent('editorCut', [e, this]);
			} else if (ctrlmeta && e.key == 'c'){
				this.fireEvent('editorCopy', [e, this]);
			} else if ((ctrlmeta && e.key == 'v') || (e.shift && e.code == 45)){
				this.fireEvent('editorPaste', [e, this]);
			}
		}
		
		this.fireEvent('editorKeyDown', [e, this]);
	},
	
	editorCut: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorCut', [e, this]);
	},
	
	editorCopy: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorCopy', [e, this]);
	},
	
	editorPaste: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorPaste', [e, this]);
	},
	
	keyListener: function(e){
		var key = (Browser.Platform.mac) ? e.meta : e.control;
		if (!key || !this.keys[e.key]) return;
		e.preventDefault();
		var item = this.toolbar.getItem(this.keys[e.key]);
		item.action(e);
	},

	focus: function(){
		(this.mode == 'iframe' ? this.win : this.textarea).focus();
		this.fireEvent('focus', this);
		return this;
	},

	action: function(command, args){
		var action = MooEditr.Actions[command];
		if (action.command && typeOf(action.command) == 'function'){
			action.command.run(args, this);
		} else {
			this.focus();
			this.execute(command, false, args);
			if (this.mode == 'iframe') this.checkStates();
		}
	},

	execute: function(command, param1, param2){
		if (this.busy) return;
		this.busy = true;
		this.doc.execCommand(command, param1, param2);
		this.saveContent();
		this.busy = false;
		return false;
	},

	toggleView: function(mode){
		this.fireEvent('beforeToggleView', this);
		if (mode) this.mode = mode;
		if (this.mode == 'textarea'){
			this.mode = 'iframe';
			this.iframe.setStyle('display', '');
			if (this.options.toggleTabs){
				this.toolbar.el.setStyle('display', 'block');
			}
			this.setContent(this.textarea.value);
			this.textarea.setStyle('display', 'none');
		} else {
			this.saveContent();
			this.mode = 'textarea';
			this.textarea.setStyle('display', '');
			if (this.options.toggleTabs){
				this.textarea.setStyle('height', this.iframe.getSize().y + this.toolbar.el.getSize().y - 3);
				this.toolbar.el.setStyle('display', 'none');
			} else {
				this.textarea.setStyle('height', this.iframe.getSize().y - 3);
			}
			this.iframe.setStyle('display', 'none');
		}
		this.fireEvent('toggleView', this);
		this.focus.delay(10, this);
		return this;
	},

	getContent: function(){
		var protect = this.protectedElements;
		var html = this.doc.body.get('html').replace(/<!-- MooEditr:protect:([0-9]+) -->/g, function(a, b){
			return protect[parseInt(b)];
		});
		return this.cleanup(this.ensureRootElement(html));
	},

	setContent: function(content){
		var protect = this.protectedElements;
		content = content.replace(this.protectRegex, function(a){
			protect.push(a);
			return '<!-- MooEditr:protect:' + (protect.length-1) + ' -->';
		});
		this.doc.body.set('html', this.ensureRootElement(content));
		return this;
	},

	saveContent: function(){
		if (this.mode == 'iframe'){
			this.textarea.set('value', this.getContent());
		}
		return this;
	},
	
	ensureRootElement: function(val){
		if (this.options.rootElement){
			var el = new Element('div', {html: val.trim()});
			var start = -1;
			var create = false;
			var html = '';
			var length = el.childNodes.length;
			for (var i=0; i<length; i++){
				var childNode = el.childNodes[i];
				var nodeName = childNode.nodeName;
				if (!nodeName.test(this.blockEls) && nodeName !== '#comment'){
					if (nodeName === '#text'){
						if (childNode.nodeValue.trim()){
							if (start < 0) start = i;
							html += childNode.nodeValue;
						}
					} else {
						if (start < 0) start = i;
						html += new Element('div').adopt($(childNode).clone(true, true)).get('html');
					}
				} else {
					create = true;
				}
				if (i == (length-1)) create = true;
				if (start >= 0 && create){
					var newel = new Element(this.options.rootElement, {html: html});
					el.replaceChild(newel, el.childNodes[start]);
					for (var k=start+1; k<i; k++){ 
						el.removeChild(el.childNodes[k]);
						length--;
						i--;
						k--;
					}
					start = -1;
					create = false;
					html = '';
				}
			}
			val = el.get('html').replace(/\n\n/g, '');
		}
		return val;
	},

	checkStates: function(){
	
		try {
		
			// get selection range
			var element = this.selection.getNode();
		
			if (!element) return;
						
			if (typeOf(element) != 'element') return;
			
			Object.each(this.actions, function(action){
				var item = this.toolbar.getItem(action);
				if (!item) return;
				item.deactivate();
	
				var states = MooEditr.Actions[action]['states'];
				if (!states) return;
				
				// custom checkState
				if (typeOf(states) == 'function'){
					states.attempt([document.id(element), item], this);
					return;
				}
				
				try{
					if (this.doc.queryCommandState(action)){
						item.activate();
						return;
					}
				} catch(e){}
				
				if (states.tags){
					var el = element;
					do {
						var tag = el.tagName.toLowerCase();
						if (states.tags.contains(tag)){
							item.activate(tag);
							break;
						}
					}
					while ((el = Element.getParent(el)) != null);
				}
	
				if (states.css){
					var el = element;
					do {
						var found = false;
						for (var prop in states.css){
							var css = states.css[prop];
							if (el.style[prop.camelCase()].contains(css)){
								item.activate(css);
								found = true;
							}
						}
						if (found || el.tagName.test(this.blockEls)) break;
					}
					while ((el = Element.getParent(el)) != null);
				}
			}.bind(this));
			
		} catch(e){
			return;
		}
	},

	cleanup: function(source){
		if (!this.options.cleanup) return source.trim();
		
		do {
			var oSource = source;
			
			// replace base URL references: ie localize links
			if (this.options.baseURL){
				source = source.replace('="' + this.options.baseURL, '="');	
			}

			// Webkit cleanup
			source = source.replace(/<br class\="webkit-block-placeholder">/gi, "<br />");
			source = source.replace(/<span class="Apple-style-span">(.*)<\/span>/gi, '$1');
			source = source.replace(/ class="Apple-style-span"/gi, '');
			source = source.replace(/<span style="">/gi, '');

			// Remove padded paragraphs
			source = source.replace(/<p>\s*<br ?\/?>\s*<\/p>/gi, '<p>\u00a0</p>');
			source = source.replace(/<p>(&nbsp;|\s)*<\/p>/gi, '<p>\u00a0</p>');
			if (!this.options.semantics){
				source = source.replace(/\s*<br ?\/?>\s*<\/p>/gi, '</p>');
			}

			// Replace improper BRs (only if XHTML : true)
			if (this.options.xhtml){
				source = source.replace(/<br>/gi, "<br />");
			}

			if (this.options.semantics){
				//remove divs from <li>
				if (Browser.ie){
					source = source.replace(/<li>\s*<div>(.+?)<\/div><\/li>/g, '<li>$1</li>');
				}
				//remove stupid apple divs
				if (Browser.safari || Browser.chrome){
					source = source.replace(/^([\w\s]+.*?)<div>/i, '<p>$1</p><div>');
					source = source.replace(/<div>(.+?)<\/div>/ig, '<p>$1</p>');
				}

				//<p> tags around a list will get moved to after the list
				if (!Browser.ie){
					//not working properly in safari?
					source = source.replace(/<p>[\s\n]*(<(?:ul|ol)>.*?<\/(?:ul|ol)>)(.*?)<\/p>/ig, '$1<p>$2</p>');
					source = source.replace(/<\/(ol|ul)>\s*(?!<(?:p|ol|ul|img).*?>)((?:<[^>]*>)?\w.*)$/g, '</$1><p>$2</p>');
				}

				source = source.replace(/<br[^>]*><\/p>/g, '</p>'); // remove <br>'s that end a paragraph here.
				source = source.replace(/<p>\s*(<img[^>]+>)\s*<\/p>/ig, '$1\n'); // if a <p> only contains <img>, remove the <p> tags

				//format the source
				source = source.replace(/<p([^>]*)>(.*?)<\/p>(?!\n)/g, '<p$1>$2</p>\n'); // break after paragraphs
				source = source.replace(/<\/(ul|ol|p)>(?!\n)/g, '</$1>\n'); // break after </p></ol></ul> tags
				source = source.replace(/><li>/g, '>\n\t<li>'); // break and indent <li>
				source = source.replace(/([^\n])<\/(ol|ul)>/g, '$1\n</$2>'); //break before </ol></ul> tags
				source = source.replace(/([^\n])<img/ig, '$1\n<img'); // move images to their own line
				source = source.replace(/^\s*$/g, ''); // delete empty lines in the source code (not working in opera)
			}

			// Remove leading and trailing BRs
			source = source.replace(/<br ?\/?>$/gi, '');
			source = source.replace(/^<br ?\/?>/gi, '');

			// Remove useless BRs
			if (this.options.paragraphise) source = source.replace(/(h[1-6]|p|div|address|pre|li|ol|ul|blockquote|center|dl|dt|dd)><br ?\/?>/gi, '$1>');
			
			// Remove BRs right before the end of blocks
			source = source.replace(/<br ?\/?>\s*<\/(h1|h2|h3|h4|h5|h6|li|p)/gi, '</$1');

			// Semantic conversion
			source = source.replace(/<span style="font-weight: bold;">(.*)<\/span>/gi, '<strong>$1</strong>');
			source = source.replace(/<span style="font-style: italic;">(.*)<\/span>/gi, '<em>$1</em>');
			source = source.replace(/<b\b[^>]*>(.*?)<\/b[^>]*>/gi, '<strong>$1</strong>');
			source = source.replace(/<i\b[^>]*>(.*?)<\/i[^>]*>/gi, '<em>$1</em>');
			source = source.replace(/<u\b[^>]*>(.*?)<\/u[^>]*>/gi, '<span style="text-decoration: underline;">$1</span>');
			source = source.replace(/<strong><span style="font-weight: normal;">(.*)<\/span><\/strong>/gi, '$1');
			source = source.replace(/<em><span style="font-weight: normal;">(.*)<\/span><\/em>/gi, '$1');
			source = source.replace(/<span style="text-decoration: underline;"><span style="font-weight: normal;">(.*)<\/span><\/span>/gi, '$1');
			source = source.replace(/<strong style="font-weight: normal;">(.*)<\/strong>/gi, '$1');
			source = source.replace(/<em style="font-weight: normal;">(.*)<\/em>/gi, '$1');

			// Replace uppercase element names with lowercase
			source = source.replace(/<[^> ]*/g, function(match){return match.toLowerCase();});

			// Replace uppercase attribute names with lowercase
			source = source.replace(/<[^>]*>/g, function(match){
				   match = match.replace(/ [^=]+=/g, function(match2){return match2.toLowerCase();});
				   return match;
			});

			// Put quotes around unquoted attributes
			source = source.replace(/<[^!][^>]*>/g, function(match){
				   match = match.replace(/( [^=]+=)([^"][^ >]*)/g, "$1\"$2\"");
				   return match;
			});

			//make img tags xhtml compatible <img>,<img></img> -> <img/>
			if (this.options.xhtml){
				source = source.replace(/<img([^>]+)(\s*[^\/])>(<\/img>)*/gi, '<img$1$2 />');
			}
			
			//remove double <p> tags and empty <p> tags
			source = source.replace(/<p>(?:\s*)<p>/g, '<p>');
			source = source.replace(/<\/p>\s*<\/p>/g, '</p>');
			
			// Replace <br>s inside <pre> automatically added by some browsers
			source = source.replace(/<pre[^>]*>.*?<\/pre>/gi, function(match){
				return match.replace(/<br ?\/?>/gi, '\n');
			});
			
			// empty p's need &nbsp;
			source = source.replace(/<p([^>]*)>(\s?)<\/p>/g, '<p$1>&nbsp;</p>'); // break after paragraphs

			// Final trim
			source = source.trim();
		}
		while (source != oSource);

		return source;
	}

});

// Avoiding MooTools.lang dependency
// Wrapper functions to be used internally and for plugins, defaults to en-US
var phrases = {};
MooEditr.lang = {
	
	set: function(members){
		if (MooTools.lang) MooTools.lang.set('en-US', 'MooEditr', members);
		$extend(phrases, members);
	},
	
	get: function(key){
		if (MooTools.lang) return MooTools.lang.get('MooEditr', key);
		return key ? phrases[key] : '';
	}
	
};

MooEditr.lang.set({
	ok: 'OK',
	cancel: 'Cancel'
});

MooEditr.UI = {};

MooEditr.Actions = { 

	bold: {
		title: MooEditr.lang.get('bold'),
		options: {
			shortcut: 'b'
		},
		states: {
			tags: ['b', 'strong'],
			css: {'font-weight': 'bold'}
		},
		events: {
			beforeToggleView: function(){
				if(Browser.firefox){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<strong([^>]*)>/gi, '<b$1>').replace(/<\/strong>/gi, '</b>');
					if (value != newValue) this.textarea.set('value', newValue);
				}
			},
			attach: function(){
				if(Browser.firefox){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<strong([^>]*)>/gi, '<b$1>').replace(/<\/strong>/gi, '</b>');
					if (value != newValue){
						this.textarea.set('value', newValue);
						this.setContent(newValue);
					}
				}
			}
		}
	}

};
MooEditr.Actions.Settings = { };

Element.Properties.MooEditr = {

	get: function(options){
		return this.retrieve('MooEditr');
	}

};

Element.implement({

	mooEditr: function(o){
		var me = this.get('MooEditr');
		if (!me){
			me = new MooEditr(this, o);
			this.store('MooEditr', me);
		}
		return me;
	}

});

})();
