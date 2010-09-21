/*
---

script: Actions/Wordpaste.js

description: Extends MooEditr with pagebreak plugin

license: MIT-style license

authors:
- Ryan Mitchell

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.Actions

provides: [MooEditr.Actions.wordpaste]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Wordpaste.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.Wordpaste.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | wordpaste | toggleview',
      externalCSS: '../../Assets/MooEditr/Editable.css'
    });
  });
  </script>

...
*/

MooEditr.lang.set({
	wordPaste: 'Paste from word'
});

MooEditr.UI.WordpasteDialog = function(editor){
	var html = 'text <div contenteditable class="wpinput"></div>'
		+ '<button class="dialog-button dialog-ok-button">OK</button> '
		+ '<button class="dialog-button dialog-cancel-button">Cancel</button>';
	return new MooEditr.UI.Dialog(html, {
		'class': 'mooeditr-prompt-dialog',
		onOpen: function(){
			var input = this.el.getElement('div.wpinput').set('html','');
			if (input.focus){
				(function(){
					input.getParent('.mooeditr-ui-dialog').focus();
					input.getNext('.dialog-ok-button').focus();
					input.focus();
				}).delay(10);
			}
		},
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')){
				this.close();
			} else if (button.hasClass('dialog-ok-button')){
			
				// close dialog bar
				this.close();
				
				// get the inserted html
				var str = this.el.getElement('div.wpinput').get('html').trim();
				
				// remove o elements
				str = str.replace(/<o:p>\s*<\/o:p>/g, "");
				str = str.replace(/<o:p>.*?<\/o:p>/g, "&nbsp;");
				
				// remove style
				str = str.replace(/ style="([^"]*)"/gi, '');
				
				// remove classes
				str = str.replace(/ class="([^"]*)"/gi, '');
				
				// remove aligns
				str = str.replace(/ align="([^"]*)"/gi, '');
				
				// remove font tags
				str = str.replace(/<font([^>]*)>/gi, "");
				str = str.replace(/<\/font([^>]*)>/gi, "");
				
				// remove divs
				str = str.replace(/<div([^>]*)>/gi, "");
				str = str.replace(/<\/div([^>]*)>/gi, "");
				
				// remove comments
				str = str.replace(/<!--([^>]*-->)>/gi, "");
				
				// remove any style tags
				str = str.replace(/<style[^>]*>[^<]*<\/style>/gi, "");
				
				// b to strong, i to em
				str = str.replace(/<b>/gi, "<strong>");
				str = str.replace(/<\/b>/gi, "</strong>");
				str = str.replace(/<i>/gi, "<em>");
				str = str.replace(/<\/i>/gi, "</em>");
				
				// a few special characters
				str = str.replace(String.fromCharCode(8220),'"');
				str = str.replace(String.fromCharCode(8221),'"');
				str = str.replace(String.fromCharCode(8216),"\'");
				str = str.replace(String.fromCharCode(8217),"\'");
				str = str.replace(String.fromCharCode(8211),"-");
				str = str.replace(String.fromCharCode(8212),"--");
				str = str.replace(String.fromCharCode(189),"1/2");
				str = str.replace(String.fromCharCode(188),"1/4");
				str = str.replace(String.fromCharCode(190),"3/4");
				str = str.replace(String.fromCharCode(8230),"...");			
				
				// set content
				editor.setContent(editor.cleanup(str.trim()));
				
			}
		}
	});
};

MooEditr.Actions.extend({
	
	wordpaste: {
		title: MooEditr.lang.get('wordPaste'),
		dialogs: {
			prompt: function(editor){
				return MooEditr.UI.WordpasteDialog(editor);
			}
		},
		command: function(){
			this.dialogs.wordpaste.prompt.open();
		},
        events: {
            editorKeyDown: function(e) {
				var key = (Browser.Platform.mac) ? e.meta : e.control;
				if (!key)return;
				if(e.key == 'v'){
					e.stop();
					this.dialogs.wordpaste.prompt.open();
				}            
			}				
        }
	}
		
});
