/*
---

script: Actions/Image.js

description: Extends MooEditr to insert image with manipulation options.

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
  <link rel="stylesheet" href="MooEditr.Image.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.Image.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | image | toggleview'
    });
  });
  </script>

...
*/

MooEditr.lang.set({
	imageAlt: 'alt',
	imageClass: 'class',
	imageAlign: 'align',
	imageAlignNone: 'none',
	imageAlignLeft: 'left',
	imageAlignCenter: 'center',
	imageAlignRight: 'right',
	imageWidth: 'width',
	imageHeight: 'height',
	imageConstrain: 'constrain',
	addEditImage: 'Add/Edit Image',
	enterImageURL: 'Image URL:',
	browse: 'Browse',
	noImageGiven: 'Please choose an image!'
});

MooEditr.UI.ImageDialog = function(editor){
	var html = '<form>' + MooEditr.lang.get('enterImageURL') + ' <input type="text" class="dialog-url validate[\'required\']" value="" size="15">'
		+ (editor.options.fileManager ? '<button class="dialog-button dialog-browse-button">' + MooEditr.lang.get('browse') + '</button> ' : '' )
		+ MooEditr.lang.get('imageWidth') + ' <input type="text" class="dialog-width validate[\'required\',\'digit\']" value="" size="4"><input type="hidden" class="dialog-width-hidden" value=""> '
		+ MooEditr.lang.get('imageHeight') + ' <input type="text" class="dialog-height validate[\'required\',\'digit\']" value="" size="4"><input type="hidden" class="dialog-height-hidden" value=""> '
		+ MooEditr.lang.get('imageConstrain') +'<input type="checkbox" class="dialog-constrain" /><br />'
		+ MooEditr.lang.get('imageAlt') + ' <input type="text" class="dialog-alt validate[\'required\']" value="" size="8"> '
		+ MooEditr.lang.get('imageAlign') + ' <select class="dialog-align">'
			+ '<option>' + MooEditr.lang.get('imageAlignNone') + '</option>'
			+ '<option>' + MooEditr.lang.get('imageAlignLeft') + '</option>'
			+ '<option>' + MooEditr.lang.get('imageAlignCenter') + '</option>'
			+ '<option>' + MooEditr.lang.get('imageAlignRight') + '</option>'
		+ '</select> '
		+ MooEditr.lang.get('imageClass') + ' <input type="text" class="dialog-class" value="" size="8"> '
		+ '<button class="dialog-button dialog-ok-button">' + MooEditr.lang.get('ok') + '</button> '
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditr.lang.get('cancel') + '</button></form>';
		
	var dialog = new MooEditr.UI.Dialog(html, {
		'class': 'MooEditr-image-dialog',
		onOpen: function(){
			var input = this.el.getElement('.dialog-url');
			var node = editor.selection.getNode();
			if (node.get('tag') == 'img' && !node.hasClass('mooeditr-visual-aid')){
				this.el.getElement('.dialog-url').set('value', node.get('src'));
				this.el.getElement('.dialog-alt').set('value', node.get('alt'));
				this.el.getElement('.dialog-class').set('value', node.className);
				this.el.getElement('.dialog-align').set('value', node.get('align'));
				this.el.getElement('.dialog-width').set('value', node.get('width'));
				this.el.getElement('.dialog-width-hidden').set('value', node.get('width'));
				this.el.getElement('.dialog-height').set('value', node.get('height'));
				this.el.getElement('.dialog-height-hidden').set('value', node.get('height'));
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
				errors = this.validateField(this.el.getElement('input.dialog-url'));
				
				// do we proceed?
				if (errors.length > 0){
					errormsg = 'Please choose an image';
					this.el.getElement('input.dialog-url').focus();
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
					errors = this.validateField(this.el.getElement('input.dialog-alt'));
					
					// do we proceed?
					if (errors.length > 0){
						errormsg = 'Please enter fallback text';
						this.el.getElement('input.dialog-alt').focus();
					}
				
				}
				
				// do we have errors?
				if (errors.length < 1){
				
					// close window
					this.close();
			
					var node = editor.selection.getNode();
					if (node.get('tag') == 'img'){
						node.set('src', this.el.getElement('.dialog-url').get('value').trim());
						node.set('alt', this.el.getElement('.dialog-alt').get('value').trim());
						node.className = this.el.getElement('.dialog-class').get('value').trim();
						node.set('align', this.el.getElement('.dialog-align').get('value'));
						node.set('width', parseInt(this.el.getElement('.dialog-width').get('value')));
						node.set('height', parseInt(this.el.getElement('.dialog-height').get('value')));
					} else {
						var div = new Element('div');
						new Element('img', {
							src: this.el.getElement('.dialog-url').get('value').trim(),
							alt: this.el.getElement('.dialog-alt').get('value').trim(),
							'class': this.el.getElement('.dialog-class').get('value').trim(),
							align: this.el.getElement('.dialog-align').get('value'),
							width: parseInt(this.el.getElement('.dialog-width').get('value')),
							height: parseInt(this.el.getElement('.dialog-height').get('value'))
						}).inject(div);
						editor.selection.insertContent(div.get('html'));
					}
				
				} else {
					alert(errormsg);
				}
				
			} else if (button.hasClass('dialog-browse-button')){

				// define callback function for file manager
				callback = function(args){
				
				    // only if we are an image, allows the same file manager function for multiple file types
				    if (args.type == 'image' && args.properties){
				            
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
						MooEditr.lang.get('noImageGiven');	
				    }
				
				}
			
				// call file manager, passing 2 args, first that we are looking for an image, second our callback function
				editor.options.fileManager.attempt(['image', callback], this);
			
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

MooEditr.Actions.image = {
	title: MooEditr.lang.get('addEditImage'),
	states: function(sel, button) {
		if(sel.get('tag') == 'img') {
			if(!sel.hasClass('mooeditr-visual-aid')) {
				button.el.addClass('onActive');
			}
		}
	},
	options: {
		shortcut: 'm'
	},
	dialogs: {
		prompt: function(editor){
			return MooEditr.UI.ImageDialog(editor);
		}
	},
	command: function(){
		this.dialogs.image.prompt.open();
	}
};
