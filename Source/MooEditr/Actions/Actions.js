/*
---

script: Actions/Actions.js

description: Actions that don't fit elsewhere, most of these will be replaced elswhere, or find new homes

license: MIT-style license

*/

// extend the language pack
MooEditr.lang.set({
	toggleView: 'Toggle View',
	insertHorizontalRule: 'Insert Horizontal Rule'
});

MooEditr.Actions.extend({
	
	toggleview: {
		title: MooEditr.lang.get('toggleView'),
		command: function(){
			(this.mode == 'textarea') ? this.toolbar.enable() : this.toolbar.disable('toggleview');
			this.toggleView();
		}
	},
	
	inserthorizontalrule: {
		title: MooEditr.lang.get('insertHorizontalRule'),
		states: {
			tags: ['hr']
		},
		command: function(){
			this.selection.insertContent('<hr>');
		}
	}
	
});