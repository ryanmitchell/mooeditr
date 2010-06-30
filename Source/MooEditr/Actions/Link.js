// extend the language pack
MooEditr.lang.set({
	removeHyperlink: 'Remove Hyperlink',
	addHyperlink: 'Add Hyperlink',
	selectTextHyperlink: 'Please select the text you wish to hyperlink.',
	enterURL: 'Enter URL'
});

MooEditr.Actions.extend({
	
	unlink: {
		title: MooEditr.lang.get('removeHyperlink')
	},

	link: {
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
			var dialogs = this.dialogs.link;
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
	}
	
});