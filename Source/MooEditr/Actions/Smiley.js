/*
---

script: Actions/Smiley.js

description: Extends MooEditr to insert smiley/emoticons.

license: MIT-style license

authors:
- Olivier Refalo

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.UI.ButtonOverlay
# - MooEditr.Actions

provides: [MooEditr.Actions.smiley]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Smiley.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.UI.ButtonOverlay.js"></script>
  <script src="MooEditr.Smiley.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | smiley | toggleview'
    });
  });
  </script>

...
*/

MooEditr.Actions.Settings.smiley = {
	imagesPath: '../../Assets/MooEditr/Smiley/',
	smileys: ['angryface', 'blush', 'gasp', 'grin', 'halo', 'lipsaresealed', 'smile', 'undecided', 'wink'],
	fileExt: '.png'
};

MooEditr.lang.set({
	insertSmiley: 'Insert Smiley'
});

MooEditr.Actions.smiley = {
	type: 'button-overlay',
	title: MooEditr.lang.get('insertSmiley'),
	options: {
		overlaySize: {x: 'auto'},
		overlayHTML: (function(){
			var settings = MooEditr.Actions.Settings.smiley;
			var html = '';
			settings.smileys.each(function(s){
				html += '<img src="'+ settings.imagesPath + s + settings.fileExt + '" alt="" class="smiley-image">'; 
			});
			return html;
		})()
	},
	command: function(buttonOverlay, e){
		var el = e.target;
		if (el.tagName.toLowerCase() != 'img') return;
		var src = $(el).get('src');
		var content = '<img style="border:0;" class="smiley" src="' + src + '" alt="">';
		this.selection.insertContent(content);
	},
	events: {
		attach: function(editor){
			if (Browser.Engine.trident){
				// addListener instead of addEvent, because controlselect is a native event in IE
				editor.doc.addListener('controlselect', function(e){
					var el = e.target;
					if (el.tagName.toLowerCase() != 'img') return;
					if (!$(el).hasClass('smiley')) return;
					e.preventDefault();
				});
			}
		},
		editorMouseDown: function(e, editor){
			var el = e.target;
			var isSmiley = (el.tagName.toLowerCase() == 'img') && $(el).hasClass('smiley');
			$try(function(){
				editor.doc.execCommand('enableObjectResizing', false, !isSmiley);
			});
		}
	}
};
