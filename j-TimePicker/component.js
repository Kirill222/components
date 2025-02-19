COMPONENT('timepicker', function(self, config) {

	var cls = 'ui-timepicker';
	var cls2 = '.' + cls;
	var bindedevents = false;
	var timeout = 0;
	var is;

	self.readonly();
	self.singleton();
	self.nocompile && self.nocompile();

	self.make = function() {

		self.aclass(cls + ' hidden');
		self.append('<div class="{0}-hours"><i class="ti ti-chevron-up"></i><input type="text" maxlength="2" /><i class="ti ti-chevron-down"></i></div><div class="{0}-minutes"><i class="ti ti-chevron-up"></i><input type="text" maxlength="2" /><i class="ti ti-chevron-down"></i></div><div class="{0}-seconds hidden"><i class="ti ti-chevron-up"></i><input type="text" maxlength="2" /><i class="ti ti-chevron-down"></i></div><div class="{0}-ampm hidden"><i class="ti ti-chevron-up"></i><span>AM</span><i class="ti ti-chevron-down"></i></div>'.format(cls));

		var fn = function(e) {
			if (is && (e.type !== 'keydown' || e.which === 27))
				self.hide(1);
		};

		self.on('reflow', fn);
		self.on('scroll', fn);
		self.on('resize', fn);

		self.event('keydown', 'input', function(e) {
			var code = e.which;

			if (code === 38 || code === 40) {
				e.preventDefault();
				$(this).parent().find('.ti-chevron-' + (code === 38 ? 'up' : 'down')).trigger('click');
				return;
			}

			if (code === 13 || code === 27) {
				self.hide(1);
				return;
			}

			if ((code === 9 || code === 8 || code === 37 || code === 39 || code === 27 || (code > 47 && code < 58))) {
				if (code > 47 || code === 8)
					self.update();
			} else
				e.preventDefault();
		});

		self.event('click', 'i', function() {

			var el = $(this);
			var parent = el.parent();
			var cls = parent.attr('class');
			var up = el.hclass('ti-chevron-up');
			var type = cls.substring(cls.lastIndexOf('-') + 1);
			var val;

			switch (type) {
				case 'hours':
				case 'minutes':
				case 'seconds':
					var input = parent.find('input');
					val = +input.val();

					if (up)
						val++;
					else
						val--;

					if (val < 0) {
						if (type === 'hours')
							val = self.opt.ampm ? 12 : 23;
						else
							val = 59;
					} else {
						if (type === 'hours') {
							if (self.opt.ampm) {
								if (val > 12)
									val = 0;
							} else if (val > 23)
								val = 0;
						} else {
							if (val > 59)
								val = 0;
						}
					}

					val = val.toString();
					input.val(self.opt.ampm ? val : (val.length > 1 ? val : ('0' + val)));
					break;
				case 'ampm':
					var span = self.find('span');
					val = span.text().toLowerCase();
					if (val === 'am')
						val = 'PM';
					else
						val = 'AM';
					span.html(val);
					break;
			}

			self.update();
		});

		self.update = function() {
			setTimeout2(self.ID, function() {

				var current = self.opt.current;
				var h = +(self.find(cls2 + '-hours input').val() || '0');
				var m = +(self.find(cls2 + '-minutes input').val() || '0');
				var s = +(self.find(cls2 + '-seconds input').val() || '0');
				var ampm = +self.find(cls2 + '-ampm span').html().toLowerCase();

				if (!self.opt.seconds)
					s = 0;

				if (ampm === 'pm')
					h += 12;

				current.setHours(h);
				current.setMinutes(m);
				current.setSeconds(s);

				if (self.opt.callback)
					self.opt.callback(current);
				else if (self.opt.path)
					SET(self.opt.path, current);

			}, 500);
		};

		self.event('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
		});

		self.bindevents = function() {
			if (!bindedevents) {
				bindedevents = true;
				$(document).on('click', fn);
				$(W).on('scroll', fn).on('keydown', fn);
			}
		};

		self.unbindevents = function() {
			if (bindedevents) {
				bindedevents = false;
				$(document).off('click', fn);
				$(W).off('scroll', fn).off('keydown', fn);
			}
		};
	};

	self.show = self.toggle = function(opt) {

		var el = opt.element;
		if (el instanceof jQuery)
			el = el[0];

		if (self.target === el) {
			self.hide(0);
			return;
		}

		var value = opt.value || opt.date || opt.time || NOW;

		if (typeof(value) === 'string') {
			opt.path = value;
			value = GET(value);
		}

		var count = 0;

		if (opt.ampm == null)
			opt.ampm = !!config.ampm;

		if (opt.seconds == null)
			opt.seconds = !!config.seconds;

		self.find(cls2 + '-seconds').tclass('hidden', !opt.seconds);
		self.find(cls2 + '-ampm').tclass('hidden', !opt.ampm);

		if (opt.seconds)
			count++;

		if (opt.ampm)
			count++;

		var ampm = opt.ampm;

		self.find(cls2 + '-hours input').val(value.format(ampm ? '!H' : 'HH'));
		self.find(cls2 + '-minutes input').val(value.format(ampm ? 'm' : 'mm'));
		self.find(cls2 + '-seconds input').val(value.format(ampm ? 's' : 'ss'));
		self.find(cls2 + '-ampm span').html(value.format('a').toUpperCase());

		opt.current = value;
		self.target = el;
		self.opt = opt;
		self.bindevents();

		el = $(el);
		var off = el.offset();

		if (opt.offsetX)
			off.left += opt.offsetX;

		if (opt.offsetY)
			off.top += opt.offsetY;

		off.top += el.innerHeight() + 12;
		self.element.css(off);
		self.rclass2(cls + '-').tclass(cls + '-' + count).rclass('hidden').aclass(cls + '-visible', 100);
		clearTimeout(timeout);

		setTimeout(function() {
			is = true;
		}, 500);
	};

	self.hide = function(sleep) {
		if (!is)
			return;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			self.unbindevents();

			if (self.opt) {
				self.opt.close && self.opt.close();
				self.opt.close = null;
			}

			self.rclass(cls + '-visible').aclass('hidden');
			self.target = null;
			is = false;
		}, sleep ? sleep : 100);
	};

});