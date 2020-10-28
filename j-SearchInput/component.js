COMPONENT('searchinput', 'searchicon:fa fa-search;cancelicon:fa fa-times;align:left', function(self, config, cls) {

	var input;
	var icon;
	var prev;

	self.novalidate();

	self.make = function() {

		self.aclass(cls + ' ' + cls + '-' + config.align);
		self.html('<span><i class="{0}"></i></span><div><input type="text" autocomplete="new-password" maxlength="100" placeholder="{1}" data-jc-bind /></div>'.format(config.searchicon, config.placeholder));
		input = self.find('input')[0];
		icon = self.find('i');

		self.event('click', 'span', function() {
			prev && self.set('');
		});

	};

	self.check = function() {
		var is = !!input.value.trim();
		if (is !== prev) {
			icon.rclass().aclass(is ? config.cancelicon : config.searchicon);
			prev = is;
			self.tclass(cls + '-is', is);
		}
	};

	self.setter = function(value) {
		input.value = value || '';
		self.check();
	};

});