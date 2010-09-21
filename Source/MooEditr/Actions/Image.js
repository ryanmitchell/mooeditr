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
	addEditImage: 'Add/Edit Image',
	enterImageURL: 'Image URL:',
	browse: 'Browse',
	noImageGiven: 'Please choose an image!'
});

MooEditr.UI.ImageDialog = function(editor){
	var html = MooEditr.lang.get('enterImageURL') + ' <input type="text" class="dialog-url" value="" size="15">'
		+ (editor.options.fileManager ? '<button class="dialog-button dialog-browse-button">' + MooEditr.lang.get('browse') + '</button> ' : '' )
		+ MooEditr.lang.get('imageAlt') + ' <input type="text" class="dialog-alt" value="" size="8"> '
		+ MooEditr.lang.get('imageClass') + ' <input type="text" class="dialog-class" value="" size="8"> '
		+ MooEditr.lang.get('imageAlign') + ' <select class="dialog-align">'
			+ '<option>' + MooEditr.lang.get('imageAlignNone') + '</option>'
			+ '<option>' + MooEditr.lang.get('imageAlignLeft') + '</option>'
			+ '<option>' + MooEditr.lang.get('imageAlignCenter') + '</option>'
			+ '<option>' + MooEditr.lang.get('imageAlignRight') + '</option>'
		+ '</select> '
		+ '<button class="dialog-button dialog-ok-button">' + MooEditr.lang.get('ok') + '</button> '
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditr.lang.get('cancel') + '</button>';
		
	return new MooEditr.UI.Dialog(html, {
		'class': 'MooEditr-image-dialog',
		onOpen: function(){
			var input = this.el.getElement('.dialog-url');
			var node = editor.selection.getNode();
			if (node.get('tag') == 'img'){
				this.el.getElement('.dialog-url').set('value', node.get('src'));
				this.el.getElement('.dialog-alt').set('value', node.get('alt'));
				this.el.getElement('.dialog-class').set('value', node.className);
				this.el.getElement('.dialog-align').set('value', node.get('align'));
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
				this.close();
				var node = editor.selection.getNode();
				if (node.get('tag') == 'img'){
					node.set('src', this.el.getElement('.dialog-url').get('value').trim());
					node.set('alt', this.el.getElement('.dialog-alt').get('value').trim());
					node.className = this.el.getElement('.dialog-class').get('value').trim();
					node.set('align', this.el.getElement('.dialog-align').get('value'));
				} else {
					var div = new Element('div');
					new Element('img', {
						src: this.el.getElement('.dialog-url').get('value').trim(),
						alt: this.el.getElement('.dialog-alt').get('value').trim(),
						'class': this.el.getElement('.dialog-class').get('value').trim(),
						align: this.el.getElement('.dialog-align').get('value')
					}).inject(div);
					editor.selection.insertContent(div.get('html'));
				}
			} else if (button.hasClass('dialog-browse-button')){

				// define callback function for file manager
				callback = function(args){
				
                    // only if we are an image
                    if (args.type == 'image' && args.properties){
                            
                        // do we have src 
                        if (args.properties.url){ 
                    		this.el.getElement('.img-input').set('value', args.properties.url);
                        }
                        
                        // do we have width 
                        if (args.properties.width){ 
                            this.el.getElement('input.img-input-width').set('value', args.properties.width);
							this.el.getElement('input.img-input-width-hidden').set('value', args.properties.width);
                        }

                        // do we have height 
                        if (args.properties.height){ 
                            this.el.getElement('input.img-input-height').set('value', args.properties.height);
							this.el.getElement('input.img-input-height-hidden').set('value', args.properties.height);
                        }
                        
                        this.el.getElement('.img-input').focus();

                    } else {
                        MooEditr.lang.get('noImageGiven');	
                    }
				
				}
			
				// call file manager, passing 2 args, first that we are looking for an image, second our callback function
				editor.options.fileManager.attempt(['image', callback], this);
			
			}
		}
	});
};

MooEditr.Actions.extend({
	
	image: {
		title: MooEditr.lang.get('addEditImage'),
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
	}
	
});
