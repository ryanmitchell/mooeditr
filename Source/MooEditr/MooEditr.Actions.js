/*
---

script: MooEditr.Actions.js

description: Basic action set

license: MIT-style license

*/

MooEditr.Actions.extend({

	bold: {
		title: MooEditr.lang.get('bold'),
		options: {
			shortcut: 'b'
		},
		states: {
			tags: ['b', 'strong'],
			css: {'font-weight': 'bold'}
		},
		events: {
			beforeToggleView: function(){
				if(Browser.Engine.gecko){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<strong([^>]*)>/gi, '<b$1>').replace(/<\/strong>/gi, '</b>');
					if (value != newValue) this.textarea.set('value', newValue);
				}
			},
			attach: function(){
				if(Browser.Engine.gecko){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<strong([^>]*)>/gi, '<b$1>').replace(/<\/strong>/gi, '</b>');
					if (value != newValue){
						this.textarea.set('value', newValue);
						this.setContent(newValue);
					}
				}
			}
		}
	},
	
	italic: {
		title: MooEditr.lang.get('italic'),
		options: {
			shortcut: 'i'
		},
		states: {
			tags: ['i', 'em'],
			css: {'font-style': 'italic'}
		},
		events: {
			beforeToggleView: function(){
				if (Browser.Engine.gecko){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<embed([^>]*)>/gi, '<tmpembed$1>')
						.replace(/<em([^>]*)>/gi, '<i$1>')
						.replace(/<tmpembed([^>]*)>/gi, '<embed$1>')
						.replace(/<\/em>/gi, '</i>');
					if (value != newValue) this.textarea.set('value', newValue);
				}
			},
			attach: function(){
				if (Browser.Engine.gecko){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<embed([^>]*)>/gi, '<tmpembed$1>')
						.replace(/<em([^>]*)>/gi, '<i$1>')
						.replace(/<tmpembed([^>]*)>/gi, '<embed$1>')
						.replace(/<\/em>/gi, '</i>');
					if (value != newValue){
						this.textarea.set('value', newValue);
						this.setContent(newValue);
					}
				}
			}
		}
	},
	
	underline: {
		title: MooEditr.lang.get('underline'),
		options: {
			shortcut: 'u'
		},
		states: {
			tags: ['u'],
			css: {'text-decoration': 'underline'}
		}
	},
	
	strikethrough: {
		title: MooEditr.lang.get('strikethrough'),
		options: {
			shortcut: 's'
		},
		states: {
			tags: ['s', 'strike'],
			css: {'text-decoration': 'line-through'}
		}
	},
	
	insertunorderedlist: {
		title: MooEditr.lang.get('unorderedList'),
		states: {
			tags: ['ul']
		}
	},
	
	insertorderedlist: {
		title: MooEditr.lang.get('orderedList'),
		states: {
			tags: ['ol']
		}
	},
	
	indent: {
		title: MooEditr.lang.get('indent'),
		states: {
			tags: ['blockquote']
		}
	},
	
	outdent: {
		title: MooEditr.lang.get('outdent')
	},
	
	undo: {
		title: MooEditr.lang.get('undo'),
		options: {
			shortcut: 'z'
		}
	},
	
	redo: {
		title: MooEditr.lang.get('redo'),
		options: {
			shortcut: 'y'
		}
	},
	
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
				if (urlRegex.test(text)) prompt.el.getElement('.dialog-input').set('value', text);
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
	}
	
});

// extend the language pack
MooEditr.lang.set({
	bold: 'Bold',
	italic: 'Italic',
	underline: 'Underline',
	strikethrough: 'Strikethrough',
	unorderedList: 'Unordered List',
	orderedList: 'Ordered List',
	indent: 'Indent',
	outdent: 'Outdent',
	undo: 'Undo',
	redo: 'Redo',
	removeHyperlink: 'Remove Hyperlink',
	addHyperlink: 'Add Hyperlink',
	selectTextHyperlink: 'Please select the text you wish to hyperlink.',
	enterURL: 'Enter URL',
	enterImageURL: 'Enter image URL',
	addImage: 'Add Image',
	toggleView: 'Toggle View'
});