COMPONENT('pages', 'margin:0;delay:220;margintype:offset;scrollbar:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var init = false;

	self.readonly();

	self.configure = function(key, value, init) {
		switch (key) {
			case 'minheight':
			case 'margin':
			case 'marginxs':
			case 'marginsm':
			case 'marginmd':
			case 'marginlg':
				!init && self.resize();
				break;
			case 'selector': // backward compatibility
				config.parent = value;
				self.resize();
				break;
		}
	};

	self.make = function() {
		self.aclass(cls);
		self.element.find('> section').aclass('{0}-section'.format(cls));
		self.aclass('{0} {0}-hidden'.format(cls));
		self.on('resize + resize2', self.resize);
	};

	self.released = function(is) {
		!is && self.resize();
	};

	self.resize = function() {
		setTimeout2(self.ID, self.resizeforce, 50);
	};

	var oldh;
	var oldw;

	self.resizeforce = function() {

		var el = self.parent(config.parent);
		var h = el.height();
		var w = el.width();

		var margin = config.margin;

		if (margin === 'auto')
			margin = self.element[config.margintype]().top;

		if (h === 0 || w === 0) {
			self.$waiting && clearTimeout(self.$waiting);
			self.$waiting = setTimeout(self.resize, 234);
			return;
		}

		if (margin)
			h -= margin;

		if (w === oldw && h === oldh)
			return;

		oldw = w;
		oldh = h;

		var css = {};
		css.height = h;
		css.width = self.width();

		var sections = self.find(cls2 + '-section');
		sections.css(css);

		css.width = undefined;
		self.css(css);

		setTimeout2(self.ID + 'scrollbars', function(sections) {
			for (var tmp of sections)
				tmp.$config && tmp.$config.scroller && tmp.$config.scroller.resize();
		}, 500, null, sections);

		var c = cls + '-hidden';

		self.hclass(c) && self.rclass(c, 100);

		if (!init) {
			self.rclass('invisible', 250);
			init = true;
		}

		self.element.SETTER('*', 'resize');
	};

	var replace = function(cfg, value) {
		return value.replace(/\?/g, cfg.path || cfg.if);
	};

	self.setter = function(value) {

		var hide = null;
		var show = null;
		var cfg;

		var arr = self.find('> section');
		for (var el of arr) {

			if (!el.$config)
				el.$config = el.getAttribute('data-config').parseConfig();

			cfg = el.$config;

			if (value == cfg.if)
				show = $(el);

			if (el.classList.contains(cls + '-visible'))
				hide = $(el);
		}

		if (hide && show && hide[0] === show[0]) {
			cfg = show[0].$config;
			cfg.reload && self.EXEC(replace(cfg, cfg.reload), show);
			return;
		}

		var anim;
		var hfn = null;
		var sfn = null;
		var animdelay = ((config.delay * 2) / 1000);

		if (hide) {
			cfg = hide[0].$config;
			anim = cfg.anim || 'left';
			(function(cfg, anim) {
				hfn = function() {
					hide.rclass(cls + '-visible').css({ transition: 'all ' + animdelay + 's' }).aclass('{0}-hide-{1}'.format(cls, anim), 2);
					cfg.hide && self.EXEC(replace(cfg, cfg.hide), hide);
				};
			})(cfg, anim);
		}

		if (show) {

			cfg = show[0].$config;
			var prev = anim;
			anim = cfg.anim || 'left';
			var delay = anim === prev ? config.delay * 2 : config.delay;

			if (!cfg.init) {

				if (cfg.scrollbar == null)
					cfg.scrollbar = 1;

				if (cfg.scrolltop == null)
					cfg.scrolltop = 1;

				cfg.init = true;

				if (cfg.scrollbar) {
					show.wrapInner('<div class="{0}-scrollbar"></div>'.format(cls));
					cfg.scroller = SCROLLBAR(show.find(cls2 + '-scrollbar'), { parent: show, orientation: 'y', shadow: cfg.scrollbarshadow || config.scrollbarshadow });
				}
			}

			(function(cfg, anim) {
				sfn = function() {
					show.aclass('{0}-hide-{1}'.format(cls, anim));
					cfg.scroller && cfg.scrolltop && cfg.scroller.scrollTop(0);
					setTimeout(function() {
						show.css({ transition: 'all ' + animdelay + 's' }).aclass(cls + '-visible').rclass('hidden invisible');
						show.rclass(cls + '-hide-' + anim, delay);
						cfg.reload && self.EXEC(replace(cfg, cfg.reload), show);
					}, 10);
				};
			})(cfg, anim);

			var run = function(cfg) {
				if (cfg.check) {
					EXEC(replace(cfg, cfg.check), function() {
						hfn && hfn();
						sfn && sfn();
						config.loading && self.EXEC(config.loading, false);
					}, el);
				} else {
					hfn && hfn();
					sfn && sfn();
					config.loading && self.EXEC(config.loading, false);
				}
			};

			if (cfg.url) {
				config.loading && self.EXEC(config.loading, true);
				IMPORT(cfg.url, cfg.scroller ? cfg.scroller.body : show, function() {
					cfg.url = null;
					run(cfg);
				}, true, function(content) {
					var path = cfg.path || cfg.if;
					return content.replace(/~PATH~/g, path).replace(/~ID~/g, cfg.id || '').replace('PLUGIN(function(', 'PLUGIN(\'{0}\', function('.format(path));
				});
			} else
				run(cfg);
		}

	};

});