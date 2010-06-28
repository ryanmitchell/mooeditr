/*
---

script: Actions/Showhide.js

description: Restrict toolbar to one bar, with a show/hide button

license: MIT-style license

*/

MooEditr.Actions.extend({
	
	showhide: {
		title: 'Show/hide',
		mode:'text',
		command: function() {
			if (parseInt(this.toolbar.el.getStyle('height')) <= 28){
				this.toolbar.el.tween('height',this.toolbarHeight);
				this.toolbar.el.getElement('button.showhide-item').addClass('active');
			} else {
				this.toolbar.el.tween('height',28);
				this.toolbar.el.getElement('button.showhide-item').removeClass('active');
			}
		},
		events: {
			attach: function(){
				this.toolbarHeight = this.toolbar.el.getSize().y;
				this.toolbar.el.setStyles({
					'height': 28,
					'overflow': 'hidden'
				});
			}
		}
    }
    
});