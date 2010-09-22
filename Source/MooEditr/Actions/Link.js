/*
---

script: Actions/Link.js

description: Extends MooEditr to insert link with manipulation options.

license: MIT-style license

authors:
- Radovan Lozej

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.Actions

provides: [MooEditr.UI.LinkDialog, MooEditr.Actions.unlink, MooEditr.Actions.link]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Link.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.Link.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | link unlink | toggleview'
    });
  });
  </script>

...
*/

MooEditr.Actions.Settings.link = {
	extensions: ['php', 'cfm', 'cfml', 'php3', 'asp', 'html', 'htm', 'xhtml']
};

// extend the language pack
MooEditr.lang.set({
	removeHyperlink: 'Remove Hyperlink',
	addHyperlink: 'Add Hyperlink',
	selectTextHyperlink: 'Please select the text you wish to hyperlink.',
	enterURL: 'URL:',
	type: 'Type:',
	anchor: 'Anchor:',
	noanchors: 'No anchors found',
	email: 'Email:',
	file: 'File:',
	window: 'Window:',
	selurl: 'URL',
	selfile: 'File',
	selemail: 'Email',
	selanchor: 'Anchor',
	windowsame: 'Same',
	windownew: 'New'
});

MooEditr.UI.LinkDialog = function(editor){
	var html = MooEditr.lang.get('type') + ' <select class="dialog-type"><option value="url">' + MooEditr.lang.get('selurl') + '</option><option value="file">' + MooEditr.lang.get('selfile') + '</option><option value="email">' + MooEditr.lang.get('selemail') + '</option><option value="anchor">' + MooEditr.lang.get('selanchor') + '</option></select>'
	+ ' <span class="type url">' + MooEditr.lang.get('enterURL') + ' <input type="text" class="dialog-url" /> ' + MooEditr.lang.get('window') + ' <select class="dialog-window"><option value="_top">' + MooEditr.lang.get('windowsame') + '</option><option value="_blank">' + MooEditr.lang.get('windownew') + '</option></select></span>'
	+ ' <span class="type anchor" style="display:none;">' + MooEditr.lang.get('anchor') + ' <select class="dialog-anchor"><option value="">' + MooEditr.lang.get('noanchors') + '</option></select></span>'
	+ ' <span class="type email" style="display:none;">' + MooEditr.lang.get('email') + ' <input type="text" class="dialog-email" /></span>'
	+ ' <span class="type file" style="display:none;">' + MooEditr.lang.get('file') + ' <input type="text" class="dialog-file" style="margin-right:0px;" />' + (editor.options.fileManager ? '<input type="button" value="' + MooEditr.lang.get('browse') + '" class="dialog-file-browse browse" />' : '' ) + ' ' + MooEditr.lang.get('window') + ' <select class="dialog-file-window"><option value="_top">' + MooEditr.lang.get('windowsame') + '</option><option value="_blank">' + MooEditr.lang.get('windownew') + '</option></select></span>'
	+ ' <button class="dialog-button dialog-ok-button">' + MooEditr.lang.get('ok') + '</button>'
	+ ' <button class="dialog-button dialog-cancel-button">' + MooEditr.lang.get('cancel') + '</button>';
	var d = new MooEditr.UI.Dialog(html, {
		'class': 'mooeditr-prompt-dialog',
		onOpen: function(e){
			// get a list of anchors in the body text
			var matches = editor.getContent().toString().match(/(<a[^>]+name=["'])([^"']+)(["'])/g);
			if (matches){
				matches = matches.join(',').match(/name=['"][^'"]+/g);
				matches.sort();
			}
            var sel = this.el.getElement('select.dialog-anchor').empty();
            if (matches){
                for(i=0;i<matches.length;i++) { 
                    var val = matches[i].replace(/(name=)(['"])(.+)/,'$3');
                    sel.adopt(new Element('option', { value: val, html: val })); 
                };
            } else {
                sel.adopt(new Element('option', { value: '-1', html: 'No anchors found' }));
            }
            // update values
            var node = editor.selection.getNode();
            if (node.get('tag') == 'a'){
            	if (node.getProperty('href') != ''){
            		var href = node.getProperty('href').trim();
            		if (href.substr(0,1) == '#'){
            			value = 'anchor';
            			this.el.getElement('select.dialog-anchor').set('value',href.substr(1));	
            		} else if (href.substr(0,7) == 'mailto:'){
            			value = 'email';
            			this.el.getElement('input.dialog-email').set('value',href.substr(7));	
            		} else if (href.split('.').length > 1 && !MooEditr.Actions.Settings.link.extensions.contains(href.split('.')[1])){
            			value = 'file';
            			this.el.getElement('input.dialog-file').set('value',href);
            			if (node.getProperty('target')) this.el.getElement('input.dialog-file-window').set('value',node.getProperty('target'));	
            		} else {
            			value = 'url';
            			this.el.getElement('input.dialog-url').set('value',href);	
            			if (node.getProperty('target')) this.el.getElement('input.dialog-window').set('value',node.getProperty('target'));
            		}
            		this.el.getElement('select.dialog-type').set('value',value);
            		this.el.getElement('select.dialog-type').fireEvent('change');
            	}
            } else {
            	this.el.getElement('select.dialog-type').set('value','url');
            	this.el.getElement('select.dialog-type').fireEvent('change');
            	this.el.getElement('input.dialog-url').set('value','');
            	this.el.getElement('select.dialog-window').set('value','');
            	this.el.getElement('select.dialog-anchor').set('value','');		
            	this.el.getElement('input.dialog-email').set('value','');	
            	this.el.getElement('input.dialog-file').set('value','');	
            	this.el.getElement('select.dialog-file-window').set('value','');
            }
		},
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')){
				this.close();
			} else if (button.hasClass('dialog-ok-button')){
				this.close();
				if (this.el.getElement('span.url').getStyle('display') != 'none'){
					url = this.el.getElement('input.dialog-url').get('value').trim();
					target = this.el.getElement('select.dialog-window').get('value');
				} else if (this.el.getElement('span.anchor').getStyle('display') != 'none'){
					url = '#' + this.el.getElement('select.dialog-anchor').get('value');
					target = '_top';
				} else if (this.el.getElement('span.file').getStyle('display') != 'none'){
					url = this.el.getElement('input.dialog-file').get('value');
					target = this.el.getElement('select.dialog-file-window').get('value');
				} else {
					url = 'mailto:' + this.el.getElement('input.dialog-email').get('value').trim();
					target = '_top';
				}
				var node = editor.selection.getNode(); 
				// stops empty paragraph issues
				var ctnt = editor.selection.getContent().replace(/<p><\/p>/g, '');
				var el = (node.get('tag') == 'a') ? node : new Element('a', { html: ctnt });
				el.setProperty('href',url);
				if(target != '_top') el.setProperty('target',target);
				var div = new Element('div').adopt(el);
				editor.selection.insertContent(div.get('html')); 
			} else if (button.hasClass('browse')){
                e.stop();
                
				// define callback function for file manager
				callback = function(args){
				
                    // only if we are an image, allows the same file manager function for multiple file types
                    if (args.properties && args.properties.url){
						this.el.getElement('.dialog-file').set('value', args.properties.url);
						(function(){ this.el.getElement('input.dialog-file').focus(); }.delay(100,this));
                    } else {
                        MooEditr.lang.get('noImageGiven');	
                    }
				
				}
			
				// call file manager, passing 2 args, first that we are looking for a file, second our callback function
				editor.options.fileManager.attempt(['file', callback], this);
			}
		}
	});
	
	$(d).getElement('select.dialog-type').addEvent('change',function(e){
		d.el.getElements('span.type').setStyle('display','none');
		d.el.getElement('span.'+d.el.getElement('select.dialog-type').get('value')).setStyle('display','inline');
	}.bind(this));

	return d;

};

MooEditr.Actions.extend({

	unlink: {
		title: MooEditr.lang.get('removeHyperlink')
	},
	
	link: {
		title: MooEditr.lang.get('addHyperlink'),
		mode:'text',
		states: function(node, button){
			if (node.get('tag') == 'a'){
				if (node.getProperty('href')){
					button.el.addClass('onActive');
				}
			}
		},
		dialogs: {
			alert: MooEditr.UI.AlertDialog.pass(MooEditr.lang.get('selectTextHyperlink')),
			prompt: function(editor){ return MooEditr.UI.LinkDialog(editor) }
		},
		command: function() {
			if (this.selection.isCollapsed()){
				this.dialogs.link.alert.open();
			} else {
				this.dialogs.link.prompt.open();
			}
		}
    }
    	
});