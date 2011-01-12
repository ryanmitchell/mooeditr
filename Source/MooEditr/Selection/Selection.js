/*
---

script: Selection/Selection.js

description: Selection class, abstraction of rangy functionality

license: MIT-style license

*/

MooEditr.Selection = new Class({

	initialize: function(win, doc){
		this.win = win;
		this.doc = doc;
		
		// init rangy
		rangy.init();
		this.rangy = rangy;
	},

	getSelection: function(){
		this.win.focus();
		return this.rangy.getSelection(this.win);
	},

	getRange: function(){
		var s = this.getSelection();

		if (!s) return null;
	
		return s.getRangeAt(0);
	},

	setRange: function(range){
		var s = this.getSelection();
		s.setSingleRange(range);
	},

	selectNode: function(node, collapse){
		try {
			var r = this.rangy.createRange(this.windoc);
			r.selectNode(el);
			this.rangy.getSelection(this.win).setSingleRange(r);
			return true;
		} catch(e){
			return false;
		}
	},

	isCollapsed: function(){
		var r = this.getRange();
		if (r.item) return false;
		return r.collapsed;
	},

	collapse: function(toStart){
		var r = this.getRange();
		r.collapse(toStart);
	},

	getContent: function(){
		var r = this.getRange();
		var body = new Element('body');

		if (this.isCollapsed()) return '';

		body.appendChild(r.cloneContents());

		var content = body.get('html');
		return content;
	},

	getText : function(){
		var r = this.getRange();
		return this.isCollapsed() ? '' : r.toString();
	},

	getNode: function(){
		try {
	
			// get range
			var r = this.getRange();
			if (!r) throw 'No range could be made';
						
			// get first node
			var element = r.getNodes()[0].parentNode;
			
			return document.id(element);
		
		} catch(e){
			return;
		}
	},

	insertContent: function(content){
		try {
			var r = this.getRange();
			r.deleteContents();
			var n = r.createContextualFragment(content);
			r.insertNode(n);
		} catch(e){
		
		}
	}

});
