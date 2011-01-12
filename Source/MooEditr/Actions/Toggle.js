/*
---

script: Actions/Toggle.js

description: Toggle the view

license: MIT-style license

*/

// extend the language pack
MooEditr.lang.set({
	toggleView: 'Toggle View'
});

MooEditr.Actions.toggleview = {
	
	title: MooEditr.lang.get('toggleView'),
	command: function(){
		(this.mode == 'textarea') ? this.toolbar.enable() : this.toolbar.disable('toggleview');
		this.toggleView();
	}
	
};