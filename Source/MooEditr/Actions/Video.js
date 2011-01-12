/*
---

script: Actions/Video.js

description: Extends MooEditr to insert an HTML5 video object

license: MIT-style license

authors:
- Radovan Lozej

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.Actions

provides: [MooEditr.UI.VideoDialog, MooEditr.Actions.image]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Video.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.Video.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | video | toggleview'
    });
  });
  </script>

...
*/

MooEditr.lang.set({
	videoWidth: 'width',
	videoHeight: 'height',
	videoConstrain: 'constrain',
	addEditVideo: 'Add/Edit Video',
	enterPosterURL: 'Poster URL:',
	enterWebMURL: 'Webm Video:',
	enterMP4URL: 'MP4 Video:',
	browse: 'Browse',
	noFileGiven: 'Please choose an file!',
	videoAutoplay: 'autoplay',
	videoControls: 'controls',
	videoFallback: 'fallback HTML:'
});

MooEditr.UI.VideoDialog = function(editor){
	var html = '<form>' + MooEditr.lang.get('enterPosterURL') + ' <input type="text" class="dialog-url" value="" size="15">'
		+ (editor.options.fileManager ? '<button class="dialog-button dialog-browse-button">' + MooEditr.lang.get('browse') + '</button> ' : '' )
		+ MooEditr.lang.get('enterWebMURL') + ' <input type="text" class="dialog-webm validate[\'required\']" value="" size="15">'
		+ (editor.options.fileManager ? '<button class="dialog-button dialog-browse-button">' + MooEditr.lang.get('browse') + '</button> ' : '' )
		+ MooEditr.lang.get('enterMP4URL') + ' <input type="text" class="dialog-mp4" value="" size="15">'
		+ (editor.options.fileManager ? '<button class="dialog-button dialog-browse-button">' + MooEditr.lang.get('browse') + '</button> ' : '' )
		+ MooEditr.lang.get('videoWidth') + ' <input type="text" class="dialog-width validate[\'required\',\'digit\']" value="" size="4"><input type="hidden" class="dialog-width-hidden" value=""> '
		+ MooEditr.lang.get('videoHeight') + ' <input type="text" class="dialog-height validate[\'required\',\'digit\']" value="" size="4"><input type="hidden" class="dialog-height-hidden" value=""> '
		+ MooEditr.lang.get('videoConstrain') + '<input type="checkbox" class="dialog-constrain" />'
		+ MooEditr.lang.get('videoFallback') + ' <input type="text" class="dialog-fallback" value="" size="15">'
		+ MooEditr.lang.get('videoAutoplay') + '<input type="checkbox" class="dialog-autoplay" /> '
		+ MooEditr.lang.get('videoControls') + '<input type="checkbox" class="dialog-controls" /> '
		+ '<button class="dialog-button dialog-ok-button">' + MooEditr.lang.get('ok') + '</button> '
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditr.lang.get('cancel') + '</button></form>';
		
	var dialog = new MooEditr.UI.Dialog(html, {
		'class': 'MooEditr-video-dialog',
		onOpen: function(){
			var input = this.el.getElement('.dialog-url');
			var node = editor.selection.getNode();
			if (node.get('tag') == 'img' && node.hasClass('mooeditr-video')){
			
				// get replacement id
				var replaceid = parseInt(node.getProperty('id').replace('mooeditr-video-replacement-',''));
				
				// do we have a replacement?
				if (editor.videoReplacements.length >= replaceid-1){
				
					// get it
					var replaced = editor.videoReplacements[replaceid];
					
					// element-ize it
					var child = new Element('div',{ html: replaced }).getChildren()[0];
					
					// set values
                    this.el.getElement('.dialog-autoplay').set('checked', (child.getProperty('autoplay')=='autoplay') ? true : false);
                    this.el.getElement('.dialog-controls').set('checked', (child.getProperty('controls')=='controls') ? true : false);
                    this.el.getElement('.dialog-url').set('value', child.getProperty('poster'));
                    this.el.getElement('.dialog-width').set('value', child.getProperty('width'));
                    this.el.getElement('.dialog-width-hidden').set('value', child.getProperty('width'));
                    this.el.getElement('.dialog-height').set('value', child.getProperty('height'));
                    this.el.getElement('.dialog-height-hidden').set('value', child.getProperty('height'));
					
					// foreach element
					child.getElements('source').each(function(j, i){
						if (j.getProperty('type') == 'video/webm'){
							this.el.getElement('.dialog-webm').set('value', j.getProperty('src'));
						} else {
							this.el.getElement('.dialog-mp4').set('value', j.getProperty('src'));
						}
					}, this);
					
					// fallback
					var fb = child.get('html').replace(/<source([^>]*)>/g, '').trim();
					this.el.getElement('.dialog-fallback').set('value', fb);
					
				}
			} else {
				this.el.getElement('.dialog-fallback').set('value', 'Sorry, your browser isn\'t capable of playing this file');
                this.el.getElement('.dialog-autoplay').set('checked', false);
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
			
				// validation errors
				var errors = [];	
				var errormsg = '';
				
				// validate
				errors = this.validateField(this.el.getElement('input.dialog-webm'));
				
				// do we proceed?
				if (errors.length > 0){
					errormsg = 'Please choose a WebM format video';
					this.el.getElement('input.dialog-webm').focus();
				}
				
				// sequential error handling
				if (errors.length < 1){
				
					// validate
					errors = this.validateField(this.el.getElement('input.dialog-width'));
					
					// do we proceed?
					if (errors.length > 0){
						errormsg = 'Please enter a width';
						this.el.getElement('input.dialog-width').focus();
					}
				
				}
				
				// sequential error handling
				if (errors.length < 1){
				
					// validate
					errors = this.validateField(this.el.getElement('input.dialog-height'));
					
					// do we proceed?
					if (errors.length > 0){
						errormsg = 'Please enter a height';
						this.el.getElement('input.dialog-height').focus();
					}
				
				}
				
				// sequential error handling
				if (errors.length < 1){
				
					// validate
					errors = this.validateField(this.el.getElement('input.dialog-fallback'));
					
					// do we proceed?
					if (errors.length > 0){
						errormsg = 'Please enter fallback text';
						this.el.getElement('input.dialog-fallback').focus();
					}
				
				}
				
				// do we have errors?
				if (errors.length < 1){
			
					// close window
					this.close();
					
					// create html
					html = '<video width="' + this.el.getElement('.dialog-width').get('value') + '" height="' + this.el.getElement('.dialog-height').get('value') + '"' + ( this.el.getElement('.dialog-url').get('value').trim() != '' ? ' poster="' + this.el.getElement('.dialog-url').get('value').trim() + '"' : '' ) + ( this.el.getElement('.dialog-controls').get('checked') ? ' controls="controls"' : '' ) + ( this.el.getElement('.dialog-autoplay').get('checked') ? ' autoplay="autoplay"' : '' ) + '>';
					if (this.el.getElement('.dialog-webm').get('value').trim() != '')  html += '<source type="video/webm" src="' + this.el.getElement('.dialog-webm').get('value').trim() + '">';
					if (this.el.getElement('.dialog-mp4').get('value').trim() != '')  html += '<source src="' + this.el.getElement('.dialog-mp4').get('value').trim() + '">';
					html += this.el.getElement('.dialog-fallback').get('value');
					html += '</video>'
	                                        
	                // add to replacement bank
	                editor.videoReplacements.push(html);
	                                
	                // insert image instead of flash
	                editor.selection.insertContent('<img class="mooeditr-visual-aid mooeditr-video" width="'+this.el.getElement('.dialog-width').get('value')+'" height="'+this.el.getElement('.dialog-height').get('value')+'" id="mooeditr-video-replacement-'+(editor.videoReplacements.length - 1)+'"' + ( this.el.getElement('.dialog-url').get('value').trim() != '' ? ' style="background-image:url(' + this.el.getElement('.dialog-url').get('value').trim() + ');"' : '' )+ ' />');
	                
	                // reset values
	                this.el.getElement('.dialog-url').set('value','');
	                this.el.getElement('.dialog-webm').set('value','');
	                this.el.getElement('.dialog-mp4').set('value','');
	                this.el.getElement('.dialog-width').set('value','');
	                this.el.getElement('.dialog-height').set('value','');
	                
	           } else {
	           		alert(errormsg);
	           }

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

MooEditr.Actions.video = {	

	title: MooEditr.lang.get('addEditVideo'),
	states: function(sel, button) {
		if(sel.get('tag') == 'img') {
			if(sel.hasClass('mooeditr-visual-aid') && sel.hasClass('mooeditr-video')) {
				button.el.addClass('onActive');
			}
		}
	},
	options: {
		shortcut: 'f'
	},
	dialogs: {
		prompt: function(editor){
			return MooEditr.UI.VideoDialog(editor);
		}
	},
	command: function(){
		this.dialogs.video.prompt.open();
	},
    events: {
        attach: function(){ 
        
        	// set up a flash replacements array
        	this.videoReplacements = new Array(); 
        	
        	// get content
            var s = this.getContent();
            var replacementCount = 0;
            var matches;
            
            // replace all objects with image placeholder
            matches = s.match(/<video([^>]*)>([\s\S]*)<\/video>/gi);
            if (matches){
                matches.each(function(e){ 
                    var obj = new Element('div', { html: e }).getChildren()[0];
                    this.videoReplacements[replacementCount] = e;
                    poster = '';
                    if (obj.getProperty('poster')) poster = obj.getProperty('poster');
                    s = s.replace(e, '<img class="mooeditr-visual-aid mooeditr-video" id="mooeditr-video-replacement-'+replacementCount+'" width="'+obj.getProperty("width")+'" height="'+obj.getProperty("height")+'"' + ( poster != '' ? ' style="background-image:url(' + poster + ');"' : '' )+ ' />');
                    replacementCount++; 
                    delete obj;
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
                var matches = s.match(/<img([^>]*)id="mooeditr-video-replacement-([^\"]*)"([^>]*)>/gi);
                if (matches){
                    matches.each(function(e){
                    
                        // create a div element, make image its child, then get child
                        var img = new Element('div', {html: e}).getChildren('img')[0];	                                                                        
                    
                    	// get replacement
                    	var replacement = this.videoReplacements[parseInt(img.getProperty('id').replace('mooeditr-video-replacement-',''))];
							
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
                this.videoReplacements = Array();
                var replacementCount = 0;
                var matches;
                
                // replace all objects with image placeholder
                matches = s.match(/<video([^>]*)>([\s\S]*)<\/video>/gi);
                if (matches){
                    matches.each(function(e){ 
                        var obj = new Element('div', { html: e }).getChildren()[0];
                        this.videoReplacements[replacementCount] = e;
                        poster = '';
                        if (obj.getProperty('poster')) poster = obj.getProperty('poster');
                        s = s.replace(e, '<img class="mooeditr-visual-aid mooeditr-video" id="mooeditr-video-replacement-'+replacementCount+'" width="'+obj.getProperty("width")+'" height="'+obj.getProperty("height")+'"' + ( poster != '' ? ' style="background-image:url(' + poster + ');"' : '' )+ ' />');
                        replacementCount++; 
                        delete obj;
                    },this);
                }
                
                // set content
                this.textarea.set('value',s);
            }
        }
    }
};