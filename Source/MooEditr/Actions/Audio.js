/*
---

script: Actions/Audio.js

description: Extends MooEditr to insert an HTML5 audio element

license: MIT-style license

authors:
- Radovan Lozej

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.Actions

provides: [MooEditr.UI.AudioDialog, MooEditr.Actions.audio]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Audio.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.Audio.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | audio | toggleview'
    });
  });
  </script>

...
*/

MooEditr.lang.set({
	audioAutoplay: 'autoplay',
	audioControls: 'controls',
	audioFallback: 'fallback HTML:',
	addEditAudio: 'Add/Edit Audio',
	enterAudioURL: 'Ogg file URL:',
	enterAudioURL2: 'MP3 file URL:',
	browse: 'Browse',
	noFileGiven: 'Please choose an file!'
});

MooEditr.UI.AudioDialog = function(editor){
	var html = '<form>' + MooEditr.lang.get('enterAudioURL') + ' <input type="text" class="dialog-url validate[\'required\']" value="" size="15">'
		+ (editor.options.fileManager ? '<button class="dialog-button dialog-browse-button">' + MooEditr.lang.get('browse') + '</button> ' : '' )
		+ MooEditr.lang.get('enterAudioURL2') + ' <input type="text" class="dialog-url2" value="" size="15">'
		+ (editor.options.fileManager ? '<button class="dialog-button dialog-browse-button2">' + MooEditr.lang.get('browse') + '</button> ' : '' )
		+ MooEditr.lang.get('audioFallback') + ' <input type="text" class="dialog-fallback validate[\'required\']" value="" size="15">'
		+ MooEditr.lang.get('audioAutoplay') + '<input type="checkbox" class="dialog-autoplay" /> '
		+ MooEditr.lang.get('audioControls') + '<input type="checkbox" class="dialog-controls" /> '
		+ '<button class="dialog-button dialog-ok-button">' + MooEditr.lang.get('ok') + '</button> '
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditr.lang.get('cancel') + '</button></form>';
		
	var dialog = new MooEditr.UI.Dialog(html, {
		'class': 'MooEditr-audio-dialog',
		onOpen: function(){
			var input = this.el.getElement('.dialog-url');
			var node = editor.selection.getNode();
			if (node.get('tag') == 'img' && node.hasClass('mooeditr-audio')){
			
				// get replacement id
				var replaceid = parseInt(node.getProperty('id').replace('mooeditr-audio-replacement-',''));
				
				// do we have a replacement?
				if (editor.audioReplacements.length >= replaceid-1){
				
					// get it
					var replaced = editor.audioReplacements[replaceid];
					
					// element-ize it
					var child = new Element('div',{ html: replaced }).getChildren()[0];
					
					// set values
                    this.el.getElement('.dialog-autoplay').set('checked', (child.getProperty('autoplay')=='autoplay') ? true : false);
                    this.el.getElement('.dialog-controls').set('checked', (child.getProperty('controls')=='controls') ? true : false);
					
					// foreach element
					child.getElements('source').each(function(j, i){
						if (i<2){
							if (i==0){
								this.el.getElement('.dialog-url').set('value', j.getProperty('src'));
							} else {
								this.el.getElement('.dialog-url2').set('value', j.getProperty('src'));
							}
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
				errors = this.validateField(this.el.getElement('input.dialog-url'));
				
				// do we proceed?
				if (errors.length > 0){
					errormsg = 'Please choose a file';
					this.el.getElement('input.dialog-url').focus();
				}
				
				// sequential error handling
				if (errors.length < 1){
				
					// validate
					errors = this.validateField(this.el.getElement('input.dialog-fallback'));
					
					// do we proceed?
					if (errors.length > 0){
						errormsg = 'Please enter some fallback text';
						this.el.getElement('input.dialog-fallback').focus();
					}
				
				}

				// no errors
				if (errors.length < 1){
				
					// close window
					this.close();
					
					// create html
					html = '<audio' + ( this.el.getElement('.dialog-controls').get('checked') ? ' controls="controls"' : '' ) + ( this.el.getElement('.dialog-autoplay').get('checked') ? ' autoplay="autoplay"' : '' ) + '>';
					if (this.el.getElement('.dialog-url').get('value').trim() != '')  html += '<source src="' + this.el.getElement('.dialog-url').get('value').trim() + '">';
					if (this.el.getElement('.dialog-url2').get('value').trim() != '')  html += '<source src="' + this.el.getElement('.dialog-url2').get('value').trim() + '">';
					html += this.el.getElement('.dialog-fallback').get('value');
					html += '</audio>'
	                                        
	                // add to replacement bank
	                editor.audioReplacements.push(html);
	                
	                // insert image instead of flash
	                editor.selection.insertContent('<img class="mooeditr-visual-aid mooeditr-audio" width="100" height="20" id="mooeditr-audio-replacement-'+(editor.audioReplacements.length - 1)+'" />');
	                
	                // reset values
	                this.el.getElement('.dialog-url').set('value','');
	                this.el.getElement('.dialog-url2').set('value','');
	                this.el.getElement('.dialog-fallback').set('value','');
	                this.el.getElement('.dialog-autoplay').set('checked', false);
	                this.el.getElement('.dialog-controls').set('checked', true);
                
                } else {
                	alert(errormsg);
                }

			} else if (button.hasClass('dialog-browse-button')){

				// define callback function for file manager
				callback = function(args){
				
				    // only if we are an image, allows the same file manager function for multiple file types
				    if (args.type == 'audio' && args.properties){
				            
				        // do we have src 
						if (args.properties.url){ 
							this.el.getElement('.dialog-url').set('value', args.properties.url);
						}
				        
						this.el.getElement('.dialog-url').focus();
				
				    } else {
						MooEditr.lang.get('noFileGiven');	
				    }
				
				}
			
				// call file manager, passing 2 args, first that we are looking for audio, second our callback function
				editor.options.fileManager.attempt(['audio', callback], this);
			
			} else if (button.hasClass('dialog-browse-button2')){

				// define callback function for file manager
				callback = function(args){
				
				    // only if we are an image, allows the same file manager function for multiple file types
				    if (args.type == 'audio' && args.properties){
				            
				        // do we have src 
						if (args.properties.url){ 
							this.el.getElement('.dialog-url2').set('value', args.properties.url);
						}
				        
						this.el.getElement('.dialog-url2').focus();
				
				    } else {
						MooEditr.lang.get('noFileGiven');	
				    }
				
				}
			
				// call file manager, passing 2 args, first that we are looking for audio, second our callback function
				editor.options.fileManager.attempt(['audio', callback], this);
			
			}
		}
	});
	
	return dialog;
};
	
MooEditr.Actions.audio = {
	title: MooEditr.lang.get('addEditAudio'),
	states: function(sel, button) {
		if(sel.get('tag') == 'img') {
			if(sel.hasClass('mooeditr-visual-aid') && sel.hasClass('mooeditr-audio')) {
				button.el.addClass('onActive');
			}
		}
	},
	options: {
		shortcut: 'f'
	},
	dialogs: {
		prompt: function(editor){
			return MooEditr.UI.AudioDialog(editor);
		}
	},
	command: function(){
		this.dialogs.audio.prompt.open();
	},
    events: {
        attach: function(){ 
        
        	// set up a audio replacements array
        	this.audioReplacements = new Array(); 
        	
        	// get content
            var s = this.getContent();
            var replacementCount = 0;
            var matches;
            
            // replace all audio with image placeholder
           	matches = s.match(/<audio([^>]*)>([\s\S]*)<\/audio>/gi);
            if (matches){
                matches.each(function(e){ 
                    var obj = new Element('div', { html: e }).getChildren()[0];
                    this.audioReplacements[replacementCount] = e;
                    s = s.replace(e, '<img class="mooeditr-visual-aid mooeditr-audio" id="mooeditr-audio-replacement-'+replacementCount+'" width="100" height="20" />');
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
                var matches = s.match(/<img([^>]*)id="mooeditr-audio-replacement-([^\"]*)"([^>]*)>/gi);
                if (matches){
                    matches.each(function(e){
                    
                        // create a div element, make image its child, then get child
                        var img = new Element('div', {html: e}).getChildren('img')[0];	                                                                        
                    
                    	// get replacement
                    	var replacement = this.audioReplacements[parseInt(img.getProperty('id').replace('mooeditr-audio-replacement-',''))];
							
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
                this.audioReplacements = Array();
                var replacementCount = 0;
                var matches;
                
                // replace all objects with image placeholder
           		matches = s.match(/<audio([^>]*)>([\s\S]*)<\/audio>/gi);
                if (matches){
                    matches.each(function(e){ 
                        var obj = new Element('div', { html: e }).getChildren()[0];
                        this.audioReplacements[replacementCount] = e;
                        s = s.replace(e, '<img class="mooeditr-visual-aid mooeditr-audio" id="mooeditr-audio-replacement-'+replacementCount+'" width="100" height="20" />');
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
