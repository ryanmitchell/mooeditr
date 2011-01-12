/*
---

script: Actions/Anchor.js

description: Extends MooEditr to add inserting an anchor.

license: MIT-style license

authors:
- Radovan Lozej

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.Actions

provides: [MooEditr.UI.AnchorDialog, MooEditr.Actions.anchor]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Anchor.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.Anchor.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | anchor | toggleview'
    });
  });
  </script>

...
*/

MooEditr.Actions.Settings.anchor = {
	imageFile: '../../Assets/MooEditr/Other/anchor.png'
};

MooEditr.lang.set({
	insertanchor: 'Insert anchor',
	name: 'Name:'
});

MooEditr.UI.AnchorDialog = function(editor){
	var html = '<form>' + MooEditr.lang.get('name') + ' <input class="dialog-name validate[\'required\']" type="text" />'
	+ '<button class="dialog-button dialog-ok-button">' + MooEditr.lang.get('ok') + '</button>'
	+ '<button class="dialog-button dialog-cancel-button">' + MooEditr.lang.get('cancel') + '</button></form>';
	return new MooEditr.UI.Dialog(html, {
		'class': 'mooeditable-prompt-dialog',
		onOpen: function(){
			var node = editor.selection.getNode();
			if (node.get('tag') == 'a'){
				this.el.getElement('input.dialog-name').set('value',node.getProperty('name'));	
			}
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
				errors = this.validateField(this.el.getElement('input.dialog-name'));
				
				// do we proceed?
				if (errors.length > 0){
					alert('Please enter a name');
					this.el.getElement('input.dialog-name').focus();
				} else {

					this.close();
					var node = editor.selection.getNode();
					if(node.get('tag') == 'a'){
						node.setProperty('name',this.el.getElement('input.dialog-name').get('value'));
					} else {
						var div = new Element('div').set('html', '<a name="' + this.el.getElement('input.dialog-name').get('value') + '">'+ editor.selection.getContent() +'</a>');
						editor.selection.insertContent(div.get('html'));
					}	
				
				}			
			}
		}
	});

};

MooEditr.Actions.extend({
	
	anchor: {
		title: MooEditr.lang.get('insertanchor'),
		mode:'text',
		states: function(node, button){
			if (node.get('tag') == 'a'){
				if (node.getProperty('name')){
					button.el.addClass('onActive');
				}
			}
		},
		dialogs: {
			prompt: function(editor){ return MooEditr.UI.AnchorDialog(editor) }
		},
		command: function() {
			this.dialogs.anchor.prompt.open();
		},
		events: {
			render: function(){
				this.options.extraCSS = 'a[name]{ display:inline-block; padding-left:13px; border:1px dashed red; background: url('
					+ MooEditr.Actions.Settings.anchor.imageFile + ')  #ffffcc no-repeat; }'
					+ this.options.extraCSS;
			}
		}
    }	
});