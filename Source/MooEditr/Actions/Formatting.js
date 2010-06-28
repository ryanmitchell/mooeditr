/*
---

script: Actions/Formatting.js

description: Basic formatting buttons

license: MIT-style license

authors:
- Lim Chee Aun
- Ryan Mitchell

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.UI.MenuList

provides: 
- MooEditr.Actions.bold
- MooEditr.Actions.italic
- MooEditr.Actions.underline
- MooEditr.Actions.strikethrough
- MooEditr.Actions.formatBlock
- MooEditr.Actions.justifyleft
- MooEditr.Actions.justifyright
- MooEditr.Actions.justifycenter
- MooEditr.Actions.justifyfull
- MooEditr.Actions.removeformat

...
*/

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
	blockFormatting: 'Block Formatting',
	paragraph: 'Paragraph',
	heading1: 'Heading 1',
	heading2: 'Heading 2',
	heading3: 'Heading 3',
	heading4: 'Heading 4',
	heading5: 'Heading 5',
	heading6: 'Heading 6',
	alignLeft: 'Align Left',
	alignRight: 'Align Right',
	alignCenter: 'Align Center',
	alignJustify: 'Align Justify',
	removeFormatting: 'Remove Formatting'
});

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

	formatBlock: {
		title: MooEditr.lang.get('blockFormatting'),
		type: 'menu-list',
		options: {
			list: [
				{text: MooEditr.lang.get('paragraph'), value: 'p'},
				{text: MooEditr.lang.get('heading1'), value: 'h1', style: 'font-size:24px; font-weight:bold;'},
				{text: MooEditr.lang.get('heading2'), value: 'h2', style: 'font-size:18px; font-weight:bold;'},
				{text: MooEditr.lang.get('heading3'), value: 'h3', style: 'font-size:14px; font-weight:bold;'},
				{text: MooEditr.lang.get('heading4'), value: 'h4', style: 'font-size:12px; font-weight:bold;'},
				{text: MooEditr.lang.get('heading5'), value: 'h5', style: 'font-size:10px; font-weight:bold;'},
				{text: MooEditr.lang.get('heading6'), value: 'h6', style: 'font-size:8px; font-weight:bold;'}
			]
		},
		states: {
			tags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
		},
		command: function(menulist, name){
			var argument = '<' + name + '>';
			this.focus();
			this.execute('formatBlock', false, argument);
		}
	},
	
	justifyleft:{
		title: MooEditr.lang.get('alignLeft'),
		states: {
			css: {'text-align': 'left'}
		}
	},
	
	justifyright:{
		title: MooEditr.lang.get('alignRight'),
		states: {
			css: {'text-align': 'right'}
		}
	},
	
	justifycenter:{
		title: MooEditr.lang.get('alignCenter'),
		states: {
			tags: ['center'],
			css: {'text-align': 'center'}
		}
	},
	
	justifyfull:{
		title: MooEditr.lang.get('alignJustify'),
		states: {
			css: {'text-align': 'justify'}
		}
	},
	
	removeformat: {
		title: MooEditr.lang.get('removeFormatting')
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
	}
});
