COMPONENT('autocomplete', 'height:200', function(self, config) {

	var cls = 'ui-autocomplete';
	var cls2 = '.' + cls;
	var clssel = 'selected';

	var container, old, searchtimeout, searchvalue, blurtimeout, datasource, offsetter, scroller;
	var margin = {};
	var skipmouse = false;
	var is = false;
	var prev;

	self.template = Tangular.compile('<li{{ if index === 0 }} class="' + clssel + '"{{ fi }} data-index="{{ index }}"><span>{{ name }}</span><span>{{ type }}</span></li>');
	self.readonly();
	self.singleton();
	self.nocompile && self.nocompile();

	self.make = function() {

		self.aclass(cls + '-container hidden');
		self.html('<div class="' + cls + '"><ul></ul></div>');

		scroller = self.find(cls2);
		container = self.find('ul');

		self.event('click', 'li', function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (self.opt.callback) {
				var val = datasource[+$(this).attrd('index')];
				if (self.opt.path)
					SET(self.opt.path, val.value === undefined ? val.name : val.value);
				else
					self.opt.callback(val, old);
			}
			self.visible(false);
		});

		self.event('mouseenter mouseleave', 'li', function(e) {
			if (!skipmouse) {
				prev && prev.rclass(clssel);
				prev = $(this).tclass(clssel, e.type === 'mouseenter');
			}
		});

		$(document).on('click', function() {
			is && self.visible(false);
		});

		$(window).on('resize', function() {
			self.resize();
		});

		self.on('scroll', function() {
			is && self.visible(false);
		});
	};

	self.prerender = function(value) {
		self.render(value);
	};

	self.configure = function(name, value) {
		switch (name) {
			case 'height':
				value && scroller.css('max-height', value);
				break;
		}
	};

	function keydown(e) {
		var c = e.which;
		var input = this;

		if (c !== 38 && c !== 40 && c !== 13) {
			if (c !== 8 && c < 32)
				return;
			clearTimeout(searchtimeout);
			searchtimeout = setTimeout(function() {
				var val = input.value || input.innerHTML;
				if (!val)
					return self.render(EMPTYARRAY);
				if (searchvalue === val)
					return;
				searchvalue = val;
				self.resize();
				self.opt.search(val, self.prerender);
			}, 200);
			return;
		}

		if (!datasource || !datasource.length)
			return;

		var current = container.find('.' + clssel);
		if (c === 13) {
			if (prev) {
				prev = null;
				self.visible(false);
				if (current.length) {
					var val = datasource[+current.attrd('index')];
					if (self.opt.callback)
						self.opt.callback(val, old);
					else if (self.opt.path)
						SET(self.opt.path, val.value === undefined ? val.name : val.value);
					e.preventDefault();
					e.stopPropagation();
				}
			}
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		if (current.length) {
			current.rclass(clssel);
			current = c === 40 ? current.next() : current.prev();
		}

		skipmouse = true;
		!current.length && (current = self.find('li:{0}-child'.format(c === 40 ? 'first' : 'last')));
		prev && prev.rclass(clssel);
		prev = current.aclass(clssel);
		var index = +current.attrd('index');
		var h = current.innerHeight();
		var offset = ((index + 1) * h) + (h * 2);
		scroller[0] = offset > config.height ? offset - config.height : 0;
		setTimeout2(self.ID + 'skipmouse', function() {
			skipmouse = false;
		}, 100);
	}

	function blur() {
		clearTimeout(blurtimeout);
		blurtimeout = setTimeout(function() {
			self.visible(false);
		}, 300);
	}

	self.visible = function(visible) {
		clearTimeout(blurtimeout);
		self.tclass('hidden', !visible);
		is = visible;
	};

	self.resize = function() {

		if (!offsetter || !old)
			return;

		var offset = offsetter.offset();
		offset.top += offsetter.height();
		offset.width = offsetter.width();

		if (margin.left)
			offset.left += margin.left;
		if (margin.top)
			offset.top += margin.top;
		if (margin.width)
			offset.width += margin.width;

		self.css(offset);
	};

	self.show = function(opt) {

		clearTimeout(searchtimeout);
		var selector = 'input,[contenteditable]';

		if (opt.input == null)
			opt.input = opt.element;

		if (opt.input.setter)
			opt.input = opt.input.find(selector);
		else
			opt.input = $(opt.input);

		if (opt.input[0].tagName !== 'INPUT' && !opt.input.prop('contenteditable'))
			opt.input = opt.input.find(selector);

		if (opt.element.setter) {
			if (!opt.callback)
				opt.callback = opt.element.path;
			opt.element = opt.element.element;
		}

		if (old) {
			old.removeAttr('autocomplete');
			old.off('blur', blur);
			old.off('keydown', keydown);
		}

		opt.input.on('keydown', keydown);
		opt.input.on('blur', blur);
		opt.input.attr('autocomplete', 'off');

		old = opt.input;
		margin.left = opt.offsetX;
		margin.top = opt.offsetY;
		margin.width = opt.offsetWidth;

		offsetter = $(opt.element);
		self.opt = opt;
		self.resize();
		self.refresh();
		searchvalue = '';
		self.visible(false);
	};

	self.attach = function(input, search, callback, left, top, width) {
		self.attachelement(input, input, search, callback, left, top, width);
	};

	self.attachelement = function(element, input, search, callback, left, top, width) {

		if (typeof(callback) === 'number') {
			width = left;
			left = top;
			top = callback;
			callback = null;
		}

		var opt = {};
		opt.offsetX = left;
		opt.offsetY = top;
		opt.offsetWidth = width;

		if (typeof(callback) === 'string')
			opt.path = callback;
		else
			opt.callback = callback;

		opt.search = search;
		opt.element = input;
		opt.input = input;
		self.show(opt);
	};

	self.render = function(arr) {

		datasource = arr;

		if (!arr || !arr.length) {
			self.visible(false);
			return;
		}

		var builder = [];
		for (var i = 0, length = arr.length; i < length; i++) {
			var obj = arr[i];
			obj.index = i;
			if (!obj.name)
				obj.name = obj.text;
			builder.push(self.template(obj));
		}

		container.empty().append(builder.join(''));
		skipmouse = true;

		setTimeout(function() {
			scroller[0].scrollTop = 0;
			skipmouse = false;
		}, 100);

		prev = container.find('.' + clssel);
		self.visible(true);
	};
});