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
			if (parseInt(this.toolbar.el.getStyle('height')) <= this.toolbarItemHeight){
				this.toolbar.el.tween('height',this.toolbarHeight);
				this.toolbar.el.getElement('button.showhide-item').addClass('active');
			} else {
				this.toolbar.el.tween('height', this.toolbarItemHeight);
				this.toolbar.el.getElement('button.showhide-item').removeClass('active');
			}
		},
		events: {
			attach: function(){
				var btn = this.toolbar.el.getElement('button');
				this.toolbarHeight = this.toolbar.el.getSize().y;
				this.toolbarItemHeight = btn.getSize().y + parseInt(btn.getStyle('padding-top')) + parseInt(btn.getStyle('padding-bottom')) + parseInt(btn.getStyle('margin-top')) + parseInt(btn.getStyle('margin-bottom'));
				this.toolbar.el.setStyles({
					'height': this.toolbarItemHeight,
					'overflow': 'hidden'
				});
			}
		}
	}
    
});