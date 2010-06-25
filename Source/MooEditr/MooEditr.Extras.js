/*
---

script: MooEditr.Extras.js

description: Extends MooEditr to include more (simple) toolbar buttons.

license: MIT-style license

authors:
- Lim Chee Aun
- Ryan Mitchell

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.UI.MenuList

provides: 
- MooEditr.Actions.formatBlock
- MooEditr.Actions.justifyleft
- MooEditr.Actions.justifyright
- MooEditr.Actions.justifycenter
- MooEditr.Actions.justifyfull
- MooEditr.Actions.removeformat
- MooEditr.Actions.insertHorizontalRule

...
*/

MooEditr.lang.set({
	blockFormatting: 'Block Formatting',
	paragraph: 'Paragraph',
	heading1: 'Heading 1',
	heading2: 'Heading 2',
	heading3: 'Heading 3',
	alignLeft: 'Align Left',
	alignRight: 'Align Right',
	alignCenter: 'Align Center',
	alignJustify: 'Align Justify',
	removeFormatting: 'Remove Formatting',
	insertHorizontalRule: 'Insert Horizontal Rule'
});

MooEditr.Actions.extend({

	formatBlock: {
		title: MooEditr.lang.get('blockFormatting'),
		type: 'menu-list',
		options: {
			list: [
				{text: MooEditr.lang.get('paragraph'), value: 'p'},
				{text: MooEditr.lang.get('heading1'), value: 'h1', style: 'font-size:24px; font-weight:bold;'},
				{text: MooEditr.lang.get('heading2'), value: 'h2', style: 'font-size:18px; font-weight:bold;'},
				{text: MooEditr.lang.get('heading3'), value: 'h3', style: 'font-size:14px; font-weight:bold;'}
			]
		},
		states: {
			tags: ['p', 'h1', 'h2', 'h3']
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
	
	insertHorizontalRule: {
		title: MooEditr.lang.get('insertHorizontalRule'),
		states: {
			tags: ['hr']
		},
		command: function(){
			this.selection.insertContent('<hr>');
		}
	}

});
