/*
---

script: Actions/Actions.js

description: Actions that don't fit elsewhere, most of these will be replaced elswhere, or find new homes

license: MIT-style license

*/

MooEditr.Actions.extend({
	
	unlink: {
		title: MooEditr.lang.get('removeHyperlink')
	},

	createlink: {
		title: MooEditr.lang.get('addHyperlink'),
		options: {
			shortcut: 'l'
		},
		states: {
			tags: ['a']
		},
		dialogs: {
			alert: MooEditr.UI.AlertDialog.pass(MooEditr.lang.get('selectTextHyperlink')),
			prompt: function(editor){
				return MooEditr.UI.PromptDialog(MooEditr.lang.get('enterURL'), 'http://', function(url){
					editor.execute('createlink', false, url.trim());
				});
			}
		},
		command: function(){
			var selection = this.selection;
			var dialogs = this.dialogs.createlink;
			if (selection.isCollapsed()){
				var node = selection.getNode();
				if (node.get('tag') == 'a' && node.get('href')){
					selection.selectNode(node);
					var prompt = dialogs.prompt;
					prompt.el.getElement('.dialog-input').set('value', node.get('href'));
					prompt.open();
				} else {
					dialogs.alert.open();
				}
			} else {
				var text = selection.getText();
				var prompt = dialogs.prompt;
				if (this.urlRegex.test(text)) prompt.el.getElement('.dialog-input').set('value', text);
				prompt.open();
			}
		}
	},

	urlimage: {
		title: MooEditr.lang.get('addImage'),
		options: {
			shortcut: 'm'
		},
		dialogs: {
			prompt: function(editor){
				return MooEditr.UI.PromptDialog(MooEditr.lang.get('enterImageURL'), 'http://', function(url){
					editor.execute('insertimage', false, url.trim());
				});
			}
		},
		command: function(){
			this.dialogs.urlimage.prompt.open();
		}
	},

	toggleview: {
		title: MooEditr.lang.get('toggleView'),
		command: function(){
			(this.mode == 'textarea') ? this.toolbar.enable() : this.toolbar.disable('toggleview');
			this.toggleView();
		}
	},
	
	inserthorizontalrule: {
		title: MooEditr.lang.get('insertHorizontalRule'),
		states: {
			tags: ['hr']
		},
		command: function(){
			this.selection.insertContent('<hr>');
		}
	}
	
});

// extend the language pack
MooEditr.lang.set({
	removeHyperlink: 'Remove Hyperlink',
	addHyperlink: 'Add Hyperlink',
	selectTextHyperlink: 'Please select the text you wish to hyperlink.',
	enterURL: 'Enter URL',
	enterImageURL: 'Enter image URL',
	addImage: 'Add Image',
	toggleView: 'Toggle View',
	insertHorizontalRule: 'Insert Horizontal Rule'
});