/*
---

script: Actions/Table.js

description: Extends MooEditr to insert table with manipulation options.

license: MIT-style license

authors:
- Radovan Lozej
- Ryan Mitchell

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.Actions

provides:
- MooEditr.UI.TableDialog
- MooEditr.Actions.tableadd
- MooEditr.Actions.tableedit
- MooEditr.Actions.tablerowadd
- MooEditr.Actions.tablerowedit
- MooEditr.Actions.tablerowspan
- MooEditr.Actions.tablerowsplit
- MooEditr.Actions.tablerowdelete
- MooEditr.Actions.tablecoladd
- MooEditr.Actions.tablecoledit
- MooEditr.Actions.tablecolspan
- MooEditr.Actions.tablecolsplit
- MooEditr.Actions.tablecoldelete

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Table.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.Table.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | table | toggleview'
    });
  });
  </script>

...
*/

MooEditr.lang.set({
	tableColumns: 'columns',
	tableRows: 'rows',
	tableWidth: 'width',
	tableClass: 'class',
	tableType: 'type',
	tableHeader: 'Header',
	tableCell: 'Cell',
	tableAlign: 'align',
	tableAlignNone: 'none',
	tableAlignCenter: 'center',
	tableAlignRight: 'right',
	tableValign: 'vertical align',
	tableValignNone: 'none',
	tableValignTop: 'top',
	tableValignMiddle: 'middle',
	tableValignBottom: 'bottom',
	addTable: 'Add Table',
	editTable: 'Edit Table',
	addTableRow: 'Add Table Row',
	editTableRow: 'Edit Table Row',
	mergeTableRow: 'Merge Table Row',
	splitTableRow: 'Split Table Row',
	deleteTableRow: 'Delete Table Row',
	addTableCol: 'Add Table Column',
	editTableCol: 'Edit Table Column',
	mergeTableCell: 'Merge Table Cell',
	splitTableCell: 'Split Table Cell',
	deleteTableCol: 'Delete Table Column'
});

MooEditr.UI.TableDialog = function(editor, dialog){
	var html = {
		tableadd: MooEditr.lang.get('tableColumns') + ' <input type="text" class="table-c" value="" size="4"> '
			+ MooEditr.lang.get('tableRows') + ' <input type="text" class="table-r" value="" size="4"> ',
		tableedit: MooEditr.lang.get('tableWidth') + ' <input type="text" class="table-w" value="" size="4"> '
			+ MooEditr.lang.get('tableClass') + ' <input type="text" class="table-c" value="" size="15"> ',
		tablerowedit: MooEditr.lang.get('tableClass') + ' <input type="text" class="table-c" value="" size="15"> '
			+ MooEditr.lang.get('tableType') + ' <select class="table-c-type">'
				+ '<option value="th">' + MooEditr.lang.get('tableHeader') + '</option>'
				+ '<option value="td">' + MooEditr.lang.get('tableCell') + '</option>'
			+ '</select> ',
		tablecoledit: MooEditr.lang.get('tableWidth') + ' <input type="text" class="table-w" value="" size="4"> '
			+ MooEditr.lang.get('tableClass') + ' <input type="text" class="table-c" value="" size="15"> '
			+ MooEditr.lang.get('tableAlign') + ' <select class="table-a">'
				+ '<option>' + MooEditr.lang.get('tableAlignNone') + '</option>'
				+ '<option>' + MooEditr.lang.get('tableAlignLeft') + '</option>'
				+ '<option>' + MooEditr.lang.get('tableAlignCenter') + '</option>'
				+ '<option>' + MooEditr.lang.get('tableAlignRight') + '</option>'
			+ '</select> '
			+ MooEditr.lang.get('tableValign') + ' <select class="table-va">'
				+ '<option>' + MooEditr.lang.get('tableValignNone') + '</option>'
				+ '<option>' + MooEditr.lang.get('tableValignTop') + '</option>'
				+ '<option>' + MooEditr.lang.get('tableValignMiddle') + '</option>'
				+ '<option>' + MooEditr.lang.get('tableValignBottom') + '</option>'
			+ '</select> '
	};
	html[dialog] += '<button class="dialog-button dialog-ok-button">' + MooEditr.lang.get('ok') + '</button>'
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditr.lang.get('cancel') + '</button>';
		
	var action = {
		tableadd: {
			click: function(e){
				var col = this.el.getElement('.table-c').value.toInt();
				var row = this.el.getElement('.table-r').value.toInt();
				if (!(row>0 && col>0)) return;
				var div, table, tbody, ro = [];
				div = new Element('tdiv');
				table = new Element('table').set('border', 0).set('width', '100%').inject(div);
				tbody = new Element('tbody').inject(table);
				for (var r = 0; r<row; r++){
					ro[r] = new Element('tr').inject(tbody, 'bottom');
					for (var c=0; c<col; c++) new Element('td').set('html', '&nbsp;').inject(ro[r], 'bottom');
				}
				editor.selection.insertContent(div.get('html'));
			}
		},
		tableedit: {
			load: function(e){
				var node = editor.selection.getNode().getParent('table');
				this.el.getElement('.table-w').set('value', node.get('width'));
				this.el.getElement('.table-c').set('value', node.className);
			},
			click: function(e){
				var node = editor.selection.getNode().getParent('table');
				node.set('width', this.el.getElement('.table-w').value);
				node.className = this.el.getElement('.table-c').value;
			}
		},
		tablerowedit: {
			load: function(e){
				var node = editor.selection.getNode().getParent('tr');
				this.el.getElement('.table-c').set('value', node.className);
				this.el.getElement('.table-c-type').set('value', editor.selection.getNode().get('tag'));
			},
			click: function(e){
				var node = editor.selection.getNode().getParent('tr');
				node.className = this.el.getElement('.table-c').value;
				node.getElements('td, th').each(function(c){
					if (this.el.getElement('.table-c-type') != c.get('tag')){
						var n = editor.doc.createElement(this.el.getElement('.table-c-type').get('value'));
						$(n).set('html', c.get('html')).replaces(c);
					}
				}, this);
			}
		},
		tablecoledit: {
			load : function(e){
				var node = editor.selection.getNode();
				if (node.get('tag') != 'td') node = node.getParent('td');
				this.el.getElement('.table-w').set('value', node.get('width'));
				this.el.getElement('.table-c').set('value', node.className);
				this.el.getElement('.table-a').set('value', node.get('align'));
				this.el.getElement('.table-va').set('value', node.get('valign'));
			},
			click: function(e){
				var node = editor.selection.getNode();
				if (node.get('tag') != 'td') node = node.getParent('td');
				node.set('width', this.el.getElement('.table-w').value);
				node.className = this.el.getElement('.table-c').value;
				node.set('align', this.el.getElement('.table-a').value);
				node.set('valign', this.el.getElement('.table-va').value);
			}
		}
	};
	
	return new MooEditr.UI.Dialog(html[dialog], {
		'class': 'MooEditr-table-dialog',
		onOpen: function(){
			if (action[dialog].load) action[dialog].load.apply(this);
			var input = this.el.getElement('input');
			(function(){ input.focus(); }).delay(10);
		},
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')){
				this.close();
			} else if (button.hasClass('dialog-ok-button')){
				this.close();
				action[dialog].click.apply(this);
			}
		}
	});
};

MooEditr.Actions.extend({

	tableadd:{
		title: MooEditr.lang.get('addTable'),
		dialogs: {
			prompt: function(editor){
				return MooEditr.UI.TableDialog(editor, 'tableadd');
			}
		},
		command: function(){
			this.dialogs.tableadd.prompt.open();
		}
	},
	
	tableedit:{
		title: MooEditr.lang.get('editTable'),
		dialogs: {
			prompt: function(editor){
				return MooEditr.UI.TableDialog(editor, 'tableedit');
			}
		},
		command: function(){
			if (this.selection.getNode().getParent('table')) this.dialogs.tableedit.prompt.open();
		}
	},
	
	tablerowadd:{
		title: 'Add Row',
		command: function(){
			var node = this.selection.getNode().getParent('tr');
			if (node) node.clone().inject(node, 'after');
		}
	},
	
	tablerowedit:{
		title: MooEditr.lang.get('editTableRow'),
		dialogs: {
			prompt: function(editor){
				return MooEditr.UI.TableDialog(editor, 'tablerowedit');
			}
		},
		command: function(){
			if (this.selection.getNode().getParent('table')) this.dialogs.tablerowedit.prompt.open();
		}
	},
	
	tablerowspan:{
		title: MooEditr.lang.get('mergeTableRow'),
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag') != 'td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex;
				var row = node.getParent().rowIndex;
				if (node.getParent().getParent().childNodes[row+node.rowSpan]){
					node.getParent().getParent().childNodes[row+node.rowSpan].deleteCell(index);
					node.rowSpan++;
				}
			}
		}
	},
	
	tablerowsplit:{
		title: MooEditr.lang.get('splitTableRow'),
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag') != 'td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex;
				var row = node.getParent().rowIndex;
				if (node.getProperty('rowspan')){
					var rows = parseInt(node.getProperty('rowspan'));
					for (i=1; i<rows; i++){
						node.getParent().getParent().childNodes[row+i].insertCell(index);
					}
					node.removeProperty('rowspan');
				}
			}
		},
		states: function(node){
			if (node.get('tag') != 'td') return;
			if (node){
				if (node.getProperty('rowspan') && parseInt(node.getProperty('rowspan')) > 1){
					this.el.addClass('onActive');
				}
			}
		}
	},
	
	tablerowdelete:{
		title: MooEditr.lang.get('deleteTableRow'),
		command: function(){
			var node = this.selection.getNode().getParent('tr');
			if (node) node.getParent().deleteRow(node.rowIndex);
		}
	},
	
	tablecoladd:{
		title: MooEditr.lang.get('addTableCol'),
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag') != 'td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex;
				var len = node.getParent().getParent().childNodes.length;
				for (var i=0; i<len; i++){
					var ref = $(node.getParent().getParent().childNodes[i].childNodes[index]);
					ref.clone().inject(ref, 'after');
				}
			}
		}
	},
	
	tablecoledit:{
		title: MooEditr.lang.get('editTableCol'),
		dialogs: {
			prompt: function(editor){
				return MooEditr.UI.TableDialog(editor, 'tablecoledit');
			}
		},
		command: function(){
			if (this.selection.getNode().getParent('table')) this.dialogs.tablecoledit.prompt.open();
		}
	},
	
	tablecolspan:{
		title: MooEditr.lang.get('mergeTableCell'),
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag')!='td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex + 1;
				if (node.getParent().childNodes[index]){
					node.getParent().deleteCell(index);
					node.colSpan++;
				}
			}
		}
	},
		
	tablecolsplit:{
		title: MooEditr.lang.get('splitTableCell'),
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag')!='td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex + 1;
				if(node.getProperty('colspan')){
					var cols = parseInt(node.getProperty('colspan'));
					for (i=1;i<cols;i++){
						node.getParent().insertCell(index+i);
					}
					node.removeProperty('colspan');
				}
			}
		},
		states: function(node){
			if (node.get('tag')!='td') return;
			if (node){
				if (node.getProperty('colspan') && parseInt(node.getProperty('colspan')) > 1){
					this.el.addClass('onActive');
				}
			}
		}
	},
	
	tablecoldelete:{
		title: MooEditr.lang.get('deleteTableCol'),
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag') != 'td') node = node.getParent('td');
			if (node){
				var len = node.getParent().getParent().childNodes.length;
				var index = node.cellIndex;
				var tt = node.getParent().getParent();
				for (var i=0; i<len; i++) tt.childNodes[i].deleteCell(index);
			}
		}
	}
	
});
