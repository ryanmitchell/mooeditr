MooEditr
===========

An advanced web-based WYSIWYG editor, written in [MooTools](http://mootools.net/).
Forked from <a href="http://cheeaun.github.com/mooeditable/">MooEditable</a>.

Features
--------

* Clean interface
* Customizable buttons
* Tango icons
* Lightweight
* Fully degradable when Javascript disabled
* Works in Internet Explorer 6/7/8, Firefox 2/3, Opera 9/10 and Safari 3/4

How to Use
----------

There are two ways. Note that `textarea-1` is the `id` of a `textarea` element. This is the simple one:

	#JS
	$('textarea-1').mooEditr();

And this is the classic one:

	#JS
	new MooEditr('textarea-1');
