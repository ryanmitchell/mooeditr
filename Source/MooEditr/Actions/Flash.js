/*
---

script: Actions/Flash.js

description: Extends MooEditr to insert a flash file

license: MIT-style license

authors:
- Radovan Lozej

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.Actions

provides: [MooEditr.UI.ImageDialog, MooEditr.Actions.image]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Flash.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.Flash.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | flash | toggleview'
    });
  });
  </script>

...
*/

MooEditr.lang.set({
	flashWmode: 'wMode',
	flashWidth: 'width',
	flashHeight: 'height',
	flashConstrain: 'constrain',
	addEditFlash: 'Add/Edit Flash',
	enterFlashURL: 'SWF URL:',
	browse: 'Browse',
	noFileGiven: 'Please choose an file!'
});

MooEditr.UI.FlashDialog = function(editor){
	var html = '<form>' + MooEditr.lang.get('enterFlashURL') + ' <input type="text" class="dialog-url" value="" size="15">'
		+ (editor.options.fileManager ? '<button class="dialog-button dialog-browse-button">' + MooEditr.lang.get('browse') + '</button> ' : '' )
		+ MooEditr.lang.get('flashWidth') + ' <input type="text" class="dialog-width" value="" size="4"><input type="hidden" class="dialog-width-hidden" value=""> '
		+ MooEditr.lang.get('flashHeight') + ' <input type="text" class="dialog-height" value="" size="4"><input type="hidden" class="dialog-height-hidden" value=""> '
		+ MooEditr.lang.get('flashConstrain') + '<input type="checkbox" class="dialog-constrain" /><br />'
		+ MooEditr.lang.get('flashWmode') + ' <select class="dialog-wmode">'
			+ '<option>window</option>'
			+ '<option>opaque</option>'
			+ '<option>transparent</option>'
		+ '</select> '
		+ '<button class="dialog-button dialog-ok-button">' + MooEditr.lang.get('ok') + '</button> '
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditr.lang.get('cancel') + '</button></form>';
		
	var dialog = new MooEditr.UI.Dialog(html, {
		'class': 'MooEditr-flash-dialog',
		onOpen: function(){
			var input = this.el.getElement('.dialog-url');
			var node = editor.selection.getNode();
			if (node.get('tag') == 'img' && node.hasClass('mooeditr-flash')){
			
				// get replacement id
				var replaceid = parseInt(node.getProperty('id').replace('mooeditr-flash-replacement-',''));
				
				// do we have a replacement?
				if (editor.flashReplacements.length >= replaceid-1){
				
					// get it
					var replaced = editor.flashReplacements[replaceid];
					
					// element-ize it
					var child = new Element('div',{ html: replaced }).getChildren()[0];
					
					// set values
					if (child.getElement('param[name="movie"]')) this.el.getElement('.dialog-url').set('value', child.getElement('param[name="movie"]').getProperty('value'));
					if (child.getElement('param[name="wmode"]')) this.el.getElement('.dialog-wmode').set('value', child.getElement('param[name="wmode"]').getProperty('value'));
					this.el.getElement('.dialog-width').set('value', node.get('width'));
					this.el.getElement('.dialog-width-hidden').set('value', node.get('width'));
					this.el.getElement('.dialog-height').set('value', node.get('height'));
					this.el.getElement('.dialog-height-hidden').set('value', node.get('height'));	
					
				}
			}
			this.el.getElement('.dialog-constrain').set('checked', true);
			(function(){
				input.focus();
				input.select();
			}).delay(10);
		},
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')){
				this.close();
			} else if (button.hasClass('dialog-ok-button')){
				this.close();
				
                // create flash object
                var obj = new Element('div',{
                    html: '<object width="'+this.el.getElement('.dialog-width').get('value')+'" height="'+this.el.getElement('.dialog-height').get('value')+'"><param name="movie" value="' + this.el.getElement('.dialog-url').get('value') + '"></param><param name="wmode" value="' + this.el.getElement('.dialog-wmode').get('value') + '"></param><embed src="'+this.el.getElement('.dialog-url').get('value')+'" width="'+this.el.getElement('.dialog-width').get('value')+'" height="'+this.el.getElement('.dialog-height').get('value')+'" wmode="' + this.el.getElement('.dialog-wmode').get('value') + '"></embed></object>'
                });
                                        
                // add to replacement bank
                editor.flashReplacements.push(obj.get('html'));
                
                // insert image instead of flash
                editor.selection.insertContent('<img class="mooeditr-visual-aid mooeditr-flash" width="'+this.el.getElement('.dialog-width').get('value')+'" height="'+this.el.getElement('.dialog-height').get('value')+'" id="mooeditr-flash-replacement-'+(editor.flashReplacements.length - 1)+'" />');
                
                // reset values
                this.el.getElement('.dialog-url').set('value','');
                this.el.getElement('.dialog-width').set('value','');
                this.el.getElement('.dialog-height').set('value','');
                this.el.getElement('.dialog-wmode').set('value','');

			} else if (button.hasClass('dialog-browse-button')){

				// define callback function for file manager
				callback = function(args){
				
				    // only if we are an image, allows the same file manager function for multiple file types
				    if (args.type == 'flash' && args.properties){
				            
				        // do we have src 
						if (args.properties.url){ 
							this.el.getElement('.dialog-url').set('value', args.properties.url);
						}
						
						// do we have width
						if (args.properties.width){ 
							this.el.getElement('.dialog-width').set('value', args.properties.width);
							this.el.getElement('.dialog-width-hidden').set('value', args.properties.width);
						}
						
						// do we have height 
						if (args.properties.height){ 
							this.el.getElement('.dialog-height').set('value', args.properties.height);
							this.el.getElement('.dialog-height-hidden').set('value', args.properties.height);
						}
				        
						this.el.getElement('.dialog-url').focus();
				
				    } else {
						MooEditr.lang.get('noFileGiven');	
				    }
				
				}
			
				// call file manager, passing 2 args, first that we are looking for flash, second our callback function
				editor.options.fileManager.attempt(['flash', callback], this);
			
			}
		}
	});
	
	// constrain function
	constrain = function(e){
		var html = this.getParent('div');
		if (html.getElement('.dialog-constrain').checked){
		
			var target = $(e.target);
		
			if (target.hasClass('.dialog-height')){
				var val = html.getElement('.dialog-height-hidden').get('value');
				if ((val != '') && (val > 0)){
					var ratio = html.getElement('.dialog-width').get('value') / (isNaN(val) ? 1 : val);
					val = Math.floor(ratio*target.get('value'));
					html.getElement('.dialog-width').set('value',isNaN(val) ? 0 : val);
				}
			} else {
				var val = html.getElement('.dialog-width-hidden').get('value');
				if ((val != '') && (val > 0)){
					var ratio = html.getElement('.dialog-height').get('value') / (isNaN(val) ? 1 : val);
					val = Math.floor(ratio*target.get('value'));
					html.getElement('.dialog-height').set('value',isNaN(val) ? 0 : val);
				}
			}
			
		}
		html.getElement('.dialog-height-hidden').set('value', html.getElement('.dialog-height').get('value'));
		html.getElement('.dialog-width-hidden').set('value', html.getElement('.dialog-width').get('value'));
	};
	
	// add blur events
	$(dialog).getElement('.dialog-width').addEvent('blur', constrain);
	$(dialog).getElement('.dialog-height').addEvent('blur', constrain);
	
	return dialog;
};

MooEditr.Actions.extend({
	
	flash: {
		title: MooEditr.lang.get('addEditFlash'),
		states: function(sel, button) {
			if(sel.get('tag') == 'img') {
				if(sel.hasClass('mooeditr-visual-aid') && sel.hasClass('mooeditr-flash')) {
					button.el.addClass('onActive');
				}
			}
		},
		options: {
			shortcut: 'f'
		},
		dialogs: {
			prompt: function(editor){
				return MooEditr.UI.FlashDialog(editor);
			}
		},
		command: function(){
			this.dialogs.flash.prompt.open();
		},
        events: {
            attach: function(){ 
            
            	// set up a flash replacements array
            	this.flashReplacements = new Array(); 
            	
            	// get content
                var s = this.getContent();
                var replacementCount = 0;
                var matches;
                
                // replace all objects with image placeholder
                matches = s.match(/<object([^>]*)>([\s\S]*)<\/object>/gi);
                if (matches){
                    matches.each(function(e){ 
                    	if (e.indexOf('name="movie"') != -1){
	                        var obj = new Element('div', { html: e }).getChildren()[0];
	                        this.flashReplacements[replacementCount] = e;
	                        s = s.replace(e, '<img class="mooeditr-visual-aid mooeditr-flash" id="mooeditr-flash-replacement-'+replacementCount+'" width="'+obj.getProperty("width")+'" height="'+obj.getProperty("height")+'" />');
	                        replacementCount++; 
	                        delete obj;
                        }
                    },this);
                }
                
                // set content
                this.setContent(s);
            },
            beforeToggleView: function() {
            
            	// moving from iframe to textarea
                if(this.mode == 'iframe') {
                
                	// get content
                    var s = this.getContent();
                    
                    // replace image placeholders with actual elements
                    var matches = s.match(/<img([^>]*)id="mooeditr-flash-replacement-([^\"]*)"([^>]*)>/gi);
                    if (matches){
                        matches.each(function(e){
                        
                            // create a div element, make image its child, then get child
                            var img = new Element('div', {html: e}).getChildren('img')[0];	                                                                        
                        
                        	// get replacement
                        	var replacement = this.flashReplacements[parseInt(img.getProperty('id').replace('mooeditr-flash-replacement-',''))];
								
							// do we have a replacement?
							if (replacement){ 
							                                             
	                            // replace img with actual form element
	                            s = s.replace(e, replacement);
                            
                            }
                            
                        },this);
                    }
                    
                    // set content
                    this.setContent(s);
                    
                } else {
                	// moving from textarea to iframe
                
                	// get content
                    var s = this.textarea.get('value');
                    
                    // reset replacements
                    this.flashReplacements = Array();
                    var replacementCount = 0;
                    var matches;
                    
                    // replace all objects with image placeholder
                    matches = s.match(/<object([^>]*)>([\s\S]*)<\/object>/gi);
                    if (matches){
	                    matches.each(function(e){ 
	                    	if (e.indexOf('name="movie"') != -1){
		                        var obj = new Element('div', { html: e }).getChildren()[0];
		                        this.flashReplacements[replacementCount] = e;
		                        s = s.replace(e, '<img class="mooeditr-visual-aid mooeditr-flash" id="mooeditr-flash-replacement-'+replacementCount+'" width="'+obj.getProperty("width")+'" height="'+obj.getProperty("height")+'" />');
		                        replacementCount++; 
		                        delete obj;
	                        }
	                    },this);
                    }
                    
                    // set content
                    this.textarea.set('value',s);
                }
            }
        }
	}
	
});
