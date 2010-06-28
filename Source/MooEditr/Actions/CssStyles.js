/*
---

script: Actions/Formatting.js

description: Basic formatting buttons

license: MIT-style license

authors:
- Lim Chee Aun
- Ryan Mitchell

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.UI.MenuList

provides: 
- MooEditr.Actions.cssStyles

...
*/


MooEditr.lang.set({
	cssStyles: 'Choose a style',
	noCssStyles: 'No styles available',
	chooseCssStyle: 'Choose style'
});

MooEditr.Actions.extend({

	cssStyles: {
		title: MooEditr.lang.get('cssStyles'),
		type: 'menu-list',
		options: {
			list: [
				{text: MooEditr.lang.get('noCssStyles'), value: '-1'}
			]
		},
		states: function(node, self){
					
			if (this.cssStyles.length > 0){
			
				// empty select
				self.el.empty();
							
				// loop over styles and add them, if appropriate
				$each(this.cssStyles, function(style) {
																				
					// found?
					var found = false;
	                            				
					// temp holder
					var temp = node;
					
					for(i=style.el.length-1;i>=0;i--) {
										
						var styletagid,styletagtag,styletagclass = '';
						
						// split tag down into parts
						styletagtemp = style.el[i].split('.');
						if(styletagtemp.length > 0) styletagclass = styletagtemp[1];
						styletagtag = styletagtemp[0];
						styletagtemp = styletagtag.split('#');
						if(styletagtemp.length > 0) styletagid = styletagtemp[1];
						else styletagtag = styletagtemp[0]; // if this is '', then we only have id
						
						// check for match
						if ((temp.get('tag').toLowerCase() == styletagtag) || (styletagtag == '')) {
							if ((temp.get('id') == styletagid) || (styletagid == '')) {
								if ((temp.hasClass(styletagclass)) || (styletagclass == '')) {
									temp = temp.getParent();
								}
							}
						} else {
							break;	
						}
						if(i==0) found = true;
					}
	                									  
					// are we the right tag?
					if (found){
	                					
						// add choose a style if we have no other options elements
						if (self.el.length < 1) self.el.adopt(new Element('option',{ html: MooEditr.lang.get('chooseCssStyle'), value:'' }));
						
						// create option for this style
						var o = new Element('option',{ html:style.classname, value:style.classname });
						
						// select if its already there
						if (node.hasClass(style.classname)) o.setProperty('selected',true);
						
						// add to select list
						self.el.adopt(o);
						
					}
					
				}, this);
								
				// no css styles apply
				if (self.el.getElements('options').length < 1) self.el.adopt(new Element('option',{ html: MooEditr.lang.get('noCssStyles'), value:'-1' }));  
			
			}
	
		},
		command: function(menulist, name){
			if(name == ''){
				this.selection.getNode().className = '';
			} else { 
				this.selection.getNode().className = name;
            }
		},
		events: {
            beforeToggleView: function(){
				if(this.mode=='iframe'){
					var s = this.getContent().replace(/class=""/gi,"");
					this.setContent(s);
                } else {
					var s = this.textarea.get('value').replace(/class=""/gi,"");
					this.textarea.set('value',s);
                }
            }
        }
	}

});
