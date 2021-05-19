(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * Glide.js v3.3.0
 * (c) 2013-2019 Jędrzej Chałubek <jedrzej.chalubek@gmail.com> (http://jedrzejchalubek.com/)
 * Released under the MIT License.
 */

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof2(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.Glide = factory();
})(undefined, function () {
  'use strict';

  var defaults = {
    /**
     * Type of the movement.
     *
     * Available types:
     * `slider` - Rewinds slider to the start/end when it reaches the first or last slide.
     * `carousel` - Changes slides without starting over when it reaches the first or last slide.
     *
     * @type {String}
     */
    type: 'slider',

    /**
     * Start at specific slide number defined with zero-based index.
     *
     * @type {Number}
     */
    startAt: 0,

    /**
     * A number of slides visible on the single viewport.
     *
     * @type {Number}
     */
    perView: 1,

    /**
     * Focus currently active slide at a specified position in the track.
     *
     * Available inputs:
     * `center` - Current slide will be always focused at the center of a track.
     * `0,1,2,3...` - Current slide will be focused on the specified zero-based index.
     *
     * @type {String|Number}
     */
    focusAt: 0,

    /**
     * A size of the gap added between slides.
     *
     * @type {Number}
     */
    gap: 10,

    /**
     * Change slides after a specified interval. Use `false` for turning off autoplay.
     *
     * @type {Number|Boolean}
     */
    autoplay: false,

    /**
     * Stop autoplay on mouseover event.
     *
     * @type {Boolean}
     */
    hoverpause: true,

    /**
     * Allow for changing slides with left and right keyboard arrows.
     *
     * @type {Boolean}
     */
    keyboard: true,

    /**
     * Stop running `perView` number of slides from the end. Use this
     * option if you don't want to have an empty space after
     * a slider. Works only with `slider` type and a
     * non-centered `focusAt` setting.
     *
     * @type {Boolean}
     */
    bound: false,

    /**
     * Minimal swipe distance needed to change the slide. Use `false` for turning off a swiping.
     *
     * @type {Number|Boolean}
     */
    swipeThreshold: 80,

    /**
     * Minimal mouse drag distance needed to change the slide. Use `false` for turning off a dragging.
     *
     * @type {Number|Boolean}
     */
    dragThreshold: 120,

    /**
     * A maximum number of slides to which movement will be made on swiping or dragging. Use `false` for unlimited.
     *
     * @type {Number|Boolean}
     */
    perTouch: false,

    /**
     * Moving distance ratio of the slides on a swiping and dragging.
     *
     * @type {Number}
     */
    touchRatio: 0.5,

    /**
     * Angle required to activate slides moving on swiping or dragging.
     *
     * @type {Number}
     */
    touchAngle: 45,

    /**
     * Duration of the animation in milliseconds.
     *
     * @type {Number}
     */
    animationDuration: 400,

    /**
     * Allows looping the `slider` type. Slider will rewind to the first/last slide when it's at the start/end.
     *
     * @type {Boolean}
     */
    rewind: true,

    /**
     * Duration of the rewinding animation of the `slider` type in milliseconds.
     *
     * @type {Number}
     */
    rewindDuration: 800,

    /**
     * Easing function for the animation.
     *
     * @type {String}
     */
    animationTimingFunc: 'cubic-bezier(.165, .840, .440, 1)',

    /**
     * Throttle costly events at most once per every wait milliseconds.
     *
     * @type {Number}
     */
    throttle: 10,

    /**
     * Moving direction mode.
     *
     * Available inputs:
     * - 'ltr' - left to right movement,
     * - 'rtl' - right to left movement.
     *
     * @type {String}
     */
    direction: 'ltr',

    /**
     * The distance value of the next and previous viewports which
     * have to peek in the current view. Accepts number and
     * pixels as a string. Left and right peeking can be
     * set up separately with a directions object.
     *
     * For example:
     * `100` - Peek 100px on the both sides.
     * { before: 100, after: 50 }` - Peek 100px on the left side and 50px on the right side.
     *
     * @type {Number|String|Object}
     */
    peek: 0,

    /**
     * Collection of options applied at specified media breakpoints.
     * For example: display two slides per view under 800px.
     * `{
     *   '800px': {
     *     perView: 2
     *   }
     * }`
     */
    breakpoints: {},

    /**
     * Collection of internally used HTML classes.
     *
     * @todo Refactor `slider` and `carousel` properties to single `type: { slider: '', carousel: '' }` object
     * @type {Object}
     */
    classes: {
      direction: {
        ltr: 'glide--ltr',
        rtl: 'glide--rtl'
      },
      slider: 'glide--slider',
      carousel: 'glide--carousel',
      swipeable: 'glide--swipeable',
      dragging: 'glide--dragging',
      cloneSlide: 'glide__slide--clone',
      activeNav: 'glide__bullet--active',
      activeSlide: 'glide__slide--active',
      disabledArrow: 'glide__arrow--disabled'
    }
  };

  /**
   * Outputs warning message to the bowser console.
   *
   * @param  {String} msg
   * @return {Void}
   */
  function warn(msg) {
    console.error("[Glide warn]: " + msg);
  }

  var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
  };

  var classCallCheck = function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var inherits = function inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof2(superClass)));
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && ((typeof call === 'undefined' ? 'undefined' : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
  };

  /**
   * Converts value entered as number
   * or string to integer value.
   *
   * @param {String} value
   * @returns {Number}
   */
  function toInt(value) {
    return parseInt(value);
  }

  /**
   * Converts value entered as number
   * or string to flat value.
   *
   * @param {String} value
   * @returns {Number}
   */
  function toFloat(value) {
    return parseFloat(value);
  }

  /**
   * Indicates whether the specified value is a string.
   *
   * @param  {*}   value
   * @return {Boolean}
   */
  function isString(value) {
    return typeof value === 'string';
  }

  /**
   * Indicates whether the specified value is an object.
   *
   * @param  {*} value
   * @return {Boolean}
   *
   * @see https://github.com/jashkenas/underscore
   */
  function isObject(value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

    return type === 'function' || type === 'object' && !!value; // eslint-disable-line no-mixed-operators
  }

  /**
   * Indicates whether the specified value is a number.
   *
   * @param  {*} value
   * @return {Boolean}
   */
  function isNumber(value) {
    return typeof value === 'number';
  }

  /**
   * Indicates whether the specified value is a function.
   *
   * @param  {*} value
   * @return {Boolean}
   */
  function isFunction(value) {
    return typeof value === 'function';
  }

  /**
   * Indicates whether the specified value is undefined.
   *
   * @param  {*} value
   * @return {Boolean}
   */
  function isUndefined(value) {
    return typeof value === 'undefined';
  }

  /**
   * Indicates whether the specified value is an array.
   *
   * @param  {*} value
   * @return {Boolean}
   */
  function isArray(value) {
    return value.constructor === Array;
  }

  /**
   * Creates and initializes specified collection of extensions.
   * Each extension receives access to instance of glide and rest of components.
   *
   * @param {Object} glide
   * @param {Object} extensions
   *
   * @returns {Object}
   */
  function mount(glide, extensions, events) {
    var components = {};

    for (var name in extensions) {
      if (isFunction(extensions[name])) {
        components[name] = extensions[name](glide, components, events);
      } else {
        warn('Extension must be a function');
      }
    }

    for (var _name in components) {
      if (isFunction(components[_name].mount)) {
        components[_name].mount();
      }
    }

    return components;
  }

  /**
   * Defines getter and setter property on the specified object.
   *
   * @param  {Object} obj         Object where property has to be defined.
   * @param  {String} prop        Name of the defined property.
   * @param  {Object} definition  Get and set definitions for the property.
   * @return {Void}
   */
  function define(obj, prop, definition) {
    Object.defineProperty(obj, prop, definition);
  }

  /**
   * Sorts aphabetically object keys.
   *
   * @param  {Object} obj
   * @return {Object}
   */
  function sortKeys(obj) {
    return Object.keys(obj).sort().reduce(function (r, k) {
      r[k] = obj[k];

      return r[k], r;
    }, {});
  }

  /**
   * Merges passed settings object with default options.
   *
   * @param  {Object} defaults
   * @param  {Object} settings
   * @return {Object}
   */
  function mergeOptions(defaults, settings) {
    var options = _extends({}, defaults, settings);

    // `Object.assign` do not deeply merge objects, so we
    // have to do it manually for every nested object
    // in options. Although it does not look smart,
    // it's smaller and faster than some fancy
    // merging deep-merge algorithm script.
    if (settings.hasOwnProperty('classes')) {
      options.classes = _extends({}, defaults.classes, settings.classes);

      if (settings.classes.hasOwnProperty('direction')) {
        options.classes.direction = _extends({}, defaults.classes.direction, settings.classes.direction);
      }
    }

    if (settings.hasOwnProperty('breakpoints')) {
      options.breakpoints = _extends({}, defaults.breakpoints, settings.breakpoints);
    }

    return options;
  }

  var EventsBus = function () {
    /**
     * Construct a EventBus instance.
     *
     * @param {Object} events
     */
    function EventsBus() {
      var events = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      classCallCheck(this, EventsBus);

      this.events = events;
      this.hop = events.hasOwnProperty;
    }

    /**
     * Adds listener to the specifed event.
     *
     * @param {String|Array} event
     * @param {Function} handler
     */

    createClass(EventsBus, [{
      key: 'on',
      value: function on(event, handler) {
        if (isArray(event)) {
          for (var i = 0; i < event.length; i++) {
            this.on(event[i], handler);
          }
        }

        // Create the event's object if not yet created
        if (!this.hop.call(this.events, event)) {
          this.events[event] = [];
        }

        // Add the handler to queue
        var index = this.events[event].push(handler) - 1;

        // Provide handle back for removal of event
        return {
          remove: function remove() {
            delete this.events[event][index];
          }
        };
      }

      /**
       * Runs registered handlers for specified event.
       *
       * @param {String|Array} event
       * @param {Object=} context
       */

    }, {
      key: 'emit',
      value: function emit(event, context) {
        if (isArray(event)) {
          for (var i = 0; i < event.length; i++) {
            this.emit(event[i], context);
          }
        }

        // If the event doesn't exist, or there's no handlers in queue, just leave
        if (!this.hop.call(this.events, event)) {
          return;
        }

        // Cycle through events queue, fire!
        this.events[event].forEach(function (item) {
          item(context || {});
        });
      }
    }]);
    return EventsBus;
  }();

  var Glide = function () {
    /**
     * Construct glide.
     *
     * @param  {String} selector
     * @param  {Object} options
     */
    function Glide(selector) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      classCallCheck(this, Glide);

      this._c = {};
      this._t = [];
      this._e = new EventsBus();

      this.disabled = false;
      this.selector = selector;
      this.settings = mergeOptions(defaults, options);
      this.index = this.settings.startAt;
    }

    /**
     * Initializes glide.
     *
     * @param {Object} extensions Collection of extensions to initialize.
     * @return {Glide}
     */

    createClass(Glide, [{
      key: 'mount',
      value: function mount$$1() {
        var extensions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        this._e.emit('mount.before');

        if (isObject(extensions)) {
          this._c = mount(this, extensions, this._e);
        } else {
          warn('You need to provide a object on `mount()`');
        }

        this._e.emit('mount.after');

        return this;
      }

      /**
       * Collects an instance `translate` transformers.
       *
       * @param  {Array} transformers Collection of transformers.
       * @return {Void}
       */

    }, {
      key: 'mutate',
      value: function mutate() {
        var transformers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        if (isArray(transformers)) {
          this._t = transformers;
        } else {
          warn('You need to provide a array on `mutate()`');
        }

        return this;
      }

      /**
       * Updates glide with specified settings.
       *
       * @param {Object} settings
       * @return {Glide}
       */

    }, {
      key: 'update',
      value: function update() {
        var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        this.settings = mergeOptions(this.settings, settings);

        if (settings.hasOwnProperty('startAt')) {
          this.index = settings.startAt;
        }

        this._e.emit('update');

        return this;
      }

      /**
       * Change slide with specified pattern. A pattern must be in the special format:
       * `>` - Move one forward
       * `<` - Move one backward
       * `={i}` - Go to {i} zero-based slide (eq. '=1', will go to second slide)
       * `>>` - Rewinds to end (last slide)
       * `<<` - Rewinds to start (first slide)
       *
       * @param {String} pattern
       * @return {Glide}
       */

    }, {
      key: 'go',
      value: function go(pattern) {
        this._c.Run.make(pattern);

        return this;
      }

      /**
       * Move track by specified distance.
       *
       * @param {String} distance
       * @return {Glide}
       */

    }, {
      key: 'move',
      value: function move(distance) {
        this._c.Transition.disable();
        this._c.Move.make(distance);

        return this;
      }

      /**
       * Destroy instance and revert all changes done by this._c.
       *
       * @return {Glide}
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._e.emit('destroy');

        return this;
      }

      /**
       * Start instance autoplaying.
       *
       * @param {Boolean|Number} interval Run autoplaying with passed interval regardless of `autoplay` settings
       * @return {Glide}
       */

    }, {
      key: 'play',
      value: function play() {
        var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (interval) {
          this.settings.autoplay = interval;
        }

        this._e.emit('play');

        return this;
      }

      /**
       * Stop instance autoplaying.
       *
       * @return {Glide}
       */

    }, {
      key: 'pause',
      value: function pause() {
        this._e.emit('pause');

        return this;
      }

      /**
       * Sets glide into a idle status.
       *
       * @return {Glide}
       */

    }, {
      key: 'disable',
      value: function disable() {
        this.disabled = true;

        return this;
      }

      /**
       * Sets glide into a active status.
       *
       * @return {Glide}
       */

    }, {
      key: 'enable',
      value: function enable() {
        this.disabled = false;

        return this;
      }

      /**
       * Adds cuutom event listener with handler.
       *
       * @param  {String|Array} event
       * @param  {Function} handler
       * @return {Glide}
       */

    }, {
      key: 'on',
      value: function on(event, handler) {
        this._e.on(event, handler);

        return this;
      }

      /**
       * Checks if glide is a precised type.
       *
       * @param  {String} name
       * @return {Boolean}
       */

    }, {
      key: 'isType',
      value: function isType(name) {
        return this.settings.type === name;
      }

      /**
       * Gets value of the core options.
       *
       * @return {Object}
       */

    }, {
      key: 'settings',
      get: function get$$1() {
        return this._o;
      }

      /**
       * Sets value of the core options.
       *
       * @param  {Object} o
       * @return {Void}
       */

      , set: function set$$1(o) {
        if (isObject(o)) {
          this._o = o;
        } else {
          warn('Options must be an `object` instance.');
        }
      }

      /**
       * Gets current index of the slider.
       *
       * @return {Object}
       */

    }, {
      key: 'index',
      get: function get$$1() {
        return this._i;
      }

      /**
       * Sets current index a slider.
       *
       * @return {Object}
       */

      , set: function set$$1(i) {
        this._i = toInt(i);
      }

      /**
       * Gets type name of the slider.
       *
       * @return {String}
       */

    }, {
      key: 'type',
      get: function get$$1() {
        return this.settings.type;
      }

      /**
       * Gets value of the idle status.
       *
       * @return {Boolean}
       */

    }, {
      key: 'disabled',
      get: function get$$1() {
        return this._d;
      }

      /**
       * Sets value of the idle status.
       *
       * @return {Boolean}
       */

      , set: function set$$1(status) {
        this._d = !!status;
      }
    }]);
    return Glide;
  }();

  function Run(Glide, Components, Events) {
    var Run = {
      /**
       * Initializes autorunning of the glide.
       *
       * @return {Void}
       */
      mount: function mount() {
        this._o = false;
      },

      /**
       * Makes glides running based on the passed moving schema.
       *
       * @param {String} move
       */
      make: function make(move) {
        var _this = this;

        if (!Glide.disabled) {
          Glide.disable();

          this.move = move;

          Events.emit('run.before', this.move);

          this.calculate();

          Events.emit('run', this.move);

          Components.Transition.after(function () {
            if (_this.isStart()) {
              Events.emit('run.start', _this.move);
            }

            if (_this.isEnd()) {
              Events.emit('run.end', _this.move);
            }

            if (_this.isOffset('<') || _this.isOffset('>')) {
              _this._o = false;

              Events.emit('run.offset', _this.move);
            }

            Events.emit('run.after', _this.move);

            Glide.enable();
          });
        }
      },

      /**
       * Calculates current index based on defined move.
       *
       * @return {Void}
       */
      calculate: function calculate() {
        var move = this.move,
            length = this.length;
        var steps = move.steps,
            direction = move.direction;

        var countableSteps = isNumber(toInt(steps)) && toInt(steps) !== 0;

        switch (direction) {
          case '>':
            if (steps === '>') {
              Glide.index = length;
            } else if (this.isEnd()) {
              if (!(Glide.isType('slider') && !Glide.settings.rewind)) {
                this._o = true;

                Glide.index = 0;
              }
            } else if (countableSteps) {
              Glide.index += Math.min(length - Glide.index, -toInt(steps));
            } else {
              Glide.index++;
            }
            break;

          case '<':
            if (steps === '<') {
              Glide.index = 0;
            } else if (this.isStart()) {
              if (!(Glide.isType('slider') && !Glide.settings.rewind)) {
                this._o = true;

                Glide.index = length;
              }
            } else if (countableSteps) {
              Glide.index -= Math.min(Glide.index, toInt(steps));
            } else {
              Glide.index--;
            }
            break;

          case '=':
            Glide.index = steps;
            break;

          default:
            warn('Invalid direction pattern [' + direction + steps + '] has been used');
            break;
        }
      },

      /**
       * Checks if we are on the first slide.
       *
       * @return {Boolean}
       */
      isStart: function isStart() {
        return Glide.index === 0;
      },

      /**
       * Checks if we are on the last slide.
       *
       * @return {Boolean}
       */
      isEnd: function isEnd() {
        return Glide.index === this.length;
      },

      /**
       * Checks if we are making a offset run.
       *
       * @param {String} direction
       * @return {Boolean}
       */
      isOffset: function isOffset(direction) {
        return this._o && this.move.direction === direction;
      }
    };

    define(Run, 'move', {
      /**
       * Gets value of the move schema.
       *
       * @returns {Object}
       */
      get: function get() {
        return this._m;
      },

      /**
       * Sets value of the move schema.
       *
       * @returns {Object}
       */
      set: function set(value) {
        var step = value.substr(1);

        this._m = {
          direction: value.substr(0, 1),
          steps: step ? toInt(step) ? toInt(step) : step : 0
        };
      }
    });

    define(Run, 'length', {
      /**
       * Gets value of the running distance based
       * on zero-indexing number of slides.
       *
       * @return {Number}
       */
      get: function get() {
        var settings = Glide.settings;
        var length = Components.Html.slides.length;

        // If the `bound` option is acitve, a maximum running distance should be
        // reduced by `perView` and `focusAt` settings. Running distance
        // should end before creating an empty space after instance.

        if (Glide.isType('slider') && settings.focusAt !== 'center' && settings.bound) {
          return length - 1 - (toInt(settings.perView) - 1) + toInt(settings.focusAt);
        }

        return length - 1;
      }
    });

    define(Run, 'offset', {
      /**
       * Gets status of the offsetting flag.
       *
       * @return {Boolean}
       */
      get: function get() {
        return this._o;
      }
    });

    return Run;
  }

  /**
   * Returns a current time.
   *
   * @return {Number}
   */
  function now() {
    return new Date().getTime();
  }

  /**
   * Returns a function, that, when invoked, will only be triggered
   * at most once during a given window of time.
   *
   * @param {Function} func
   * @param {Number} wait
   * @param {Object=} options
   * @return {Function}
   *
   * @see https://github.com/jashkenas/underscore
   */
  function throttle(func, wait, options) {
    var timeout = void 0,
        context = void 0,
        args = void 0,
        result = void 0;
    var previous = 0;
    if (!options) options = {};

    var later = function later() {
      previous = options.leading === false ? 0 : now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function throttled() {
      var at = now();
      if (!previous && options.leading === false) previous = at;
      var remaining = wait - (at - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = at;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function () {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  }

  var MARGIN_TYPE = {
    ltr: ['marginLeft', 'marginRight'],
    rtl: ['marginRight', 'marginLeft']
  };

  function Gaps(Glide, Components, Events) {
    var Gaps = {
      /**
       * Applies gaps between slides. First and last
       * slides do not receive it's edge margins.
       *
       * @param {HTMLCollection} slides
       * @return {Void}
       */
      apply: function apply(slides) {
        for (var i = 0, len = slides.length; i < len; i++) {
          var style = slides[i].style;
          var direction = Components.Direction.value;

          if (i !== 0) {
            style[MARGIN_TYPE[direction][0]] = this.value / 2 + 'px';
          } else {
            style[MARGIN_TYPE[direction][0]] = '';
          }

          if (i !== slides.length - 1) {
            style[MARGIN_TYPE[direction][1]] = this.value / 2 + 'px';
          } else {
            style[MARGIN_TYPE[direction][1]] = '';
          }
        }
      },

      /**
       * Removes gaps from the slides.
       *
       * @param {HTMLCollection} slides
       * @returns {Void}
      */
      remove: function remove(slides) {
        for (var i = 0, len = slides.length; i < len; i++) {
          var style = slides[i].style;

          style.marginLeft = '';
          style.marginRight = '';
        }
      }
    };

    define(Gaps, 'value', {
      /**
       * Gets value of the gap.
       *
       * @returns {Number}
       */
      get: function get() {
        return toInt(Glide.settings.gap);
      }
    });

    define(Gaps, 'grow', {
      /**
       * Gets additional dimentions value caused by gaps.
       * Used to increase width of the slides wrapper.
       *
       * @returns {Number}
       */
      get: function get() {
        return Gaps.value * (Components.Sizes.length - 1);
      }
    });

    define(Gaps, 'reductor', {
      /**
       * Gets reduction value caused by gaps.
       * Used to subtract width of the slides.
       *
       * @returns {Number}
       */
      get: function get() {
        var perView = Glide.settings.perView;

        return Gaps.value * (perView - 1) / perView;
      }
    });

    /**
     * Apply calculated gaps:
     * - after building, so slides (including clones) will receive proper margins
     * - on updating via API, to recalculate gaps with new options
     */
    Events.on(['build.after', 'update'], throttle(function () {
      Gaps.apply(Components.Html.wrapper.children);
    }, 30));

    /**
     * Remove gaps:
     * - on destroying to bring markup to its inital state
     */
    Events.on('destroy', function () {
      Gaps.remove(Components.Html.wrapper.children);
    });

    return Gaps;
  }

  /**
   * Finds siblings nodes of the passed node.
   *
   * @param  {Element} node
   * @return {Array}
   */
  function siblings(node) {
    if (node && node.parentNode) {
      var n = node.parentNode.firstChild;
      var matched = [];

      for (; n; n = n.nextSibling) {
        if (n.nodeType === 1 && n !== node) {
          matched.push(n);
        }
      }

      return matched;
    }

    return [];
  }

  /**
   * Checks if passed node exist and is a valid element.
   *
   * @param  {Element} node
   * @return {Boolean}
   */
  function exist(node) {
    if (node && node instanceof window.HTMLElement) {
      return true;
    }

    return false;
  }

  var TRACK_SELECTOR = '[data-glide-el="track"]';

  function Html(Glide, Components) {
    var Html = {
      /**
       * Setup slider HTML nodes.
       *
       * @param {Glide} glide
       */
      mount: function mount() {
        this.root = Glide.selector;
        this.track = this.root.querySelector(TRACK_SELECTOR);
        this.slides = Array.prototype.slice.call(this.wrapper.children).filter(function (slide) {
          return !slide.classList.contains(Glide.settings.classes.cloneSlide);
        });
      }
    };

    define(Html, 'root', {
      /**
       * Gets node of the glide main element.
       *
       * @return {Object}
       */
      get: function get() {
        return Html._r;
      },

      /**
       * Sets node of the glide main element.
       *
       * @return {Object}
       */
      set: function set(r) {
        if (isString(r)) {
          r = document.querySelector(r);
        }

        if (exist(r)) {
          Html._r = r;
        } else {
          warn('Root element must be a existing Html node');
        }
      }
    });

    define(Html, 'track', {
      /**
       * Gets node of the glide track with slides.
       *
       * @return {Object}
       */
      get: function get() {
        return Html._t;
      },

      /**
       * Sets node of the glide track with slides.
       *
       * @return {Object}
       */
      set: function set(t) {
        if (exist(t)) {
          Html._t = t;
        } else {
          warn('Could not find track element. Please use ' + TRACK_SELECTOR + ' attribute.');
        }
      }
    });

    define(Html, 'wrapper', {
      /**
       * Gets node of the slides wrapper.
       *
       * @return {Object}
       */
      get: function get() {
        return Html.track.children[0];
      }
    });

    return Html;
  }

  function Peek(Glide, Components, Events) {
    var Peek = {
      /**
       * Setups how much to peek based on settings.
       *
       * @return {Void}
       */
      mount: function mount() {
        this.value = Glide.settings.peek;
      }
    };

    define(Peek, 'value', {
      /**
       * Gets value of the peek.
       *
       * @returns {Number|Object}
       */
      get: function get() {
        return Peek._v;
      },

      /**
       * Sets value of the peek.
       *
       * @param {Number|Object} value
       * @return {Void}
       */
      set: function set(value) {
        if (isObject(value)) {
          value.before = toInt(value.before);
          value.after = toInt(value.after);
        } else {
          value = toInt(value);
        }

        Peek._v = value;
      }
    });

    define(Peek, 'reductor', {
      /**
       * Gets reduction value caused by peek.
       *
       * @returns {Number}
       */
      get: function get() {
        var value = Peek.value;
        var perView = Glide.settings.perView;

        if (isObject(value)) {
          return value.before / perView + value.after / perView;
        }

        return value * 2 / perView;
      }
    });

    /**
     * Recalculate peeking sizes on:
     * - when resizing window to update to proper percents
     */
    Events.on(['resize', 'update'], function () {
      Peek.mount();
    });

    return Peek;
  }

  function Move(Glide, Components, Events) {
    var Move = {
      /**
       * Constructs move component.
       *
       * @returns {Void}
       */
      mount: function mount() {
        this._o = 0;
      },

      /**
       * Calculates a movement value based on passed offset and currently active index.
       *
       * @param  {Number} offset
       * @return {Void}
       */
      make: function make() {
        var _this = this;

        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        this.offset = offset;

        Events.emit('move', {
          movement: this.value
        });

        Components.Transition.after(function () {
          Events.emit('move.after', {
            movement: _this.value
          });
        });
      }
    };

    define(Move, 'offset', {
      /**
       * Gets an offset value used to modify current translate.
       *
       * @return {Object}
       */
      get: function get() {
        return Move._o;
      },

      /**
       * Sets an offset value used to modify current translate.
       *
       * @return {Object}
       */
      set: function set(value) {
        Move._o = !isUndefined(value) ? toInt(value) : 0;
      }
    });

    define(Move, 'translate', {
      /**
       * Gets a raw movement value.
       *
       * @return {Number}
       */
      get: function get() {
        return Components.Sizes.slideWidth * Glide.index;
      }
    });

    define(Move, 'value', {
      /**
       * Gets an actual movement value corrected by offset.
       *
       * @return {Number}
       */
      get: function get() {
        var offset = this.offset;
        var translate = this.translate;

        if (Components.Direction.is('rtl')) {
          return translate + offset;
        }

        return translate - offset;
      }
    });

    /**
     * Make movement to proper slide on:
     * - before build, so glide will start at `startAt` index
     * - on each standard run to move to newly calculated index
     */
    Events.on(['build.before', 'run'], function () {
      Move.make();
    });

    return Move;
  }

  function Sizes(Glide, Components, Events) {
    var Sizes = {
      /**
       * Setups dimentions of slides.
       *
       * @return {Void}
       */
      setupSlides: function setupSlides() {
        var width = this.slideWidth + 'px';
        var slides = Components.Html.slides;

        for (var i = 0; i < slides.length; i++) {
          slides[i].style.width = width;
        }
      },

      /**
       * Setups dimentions of slides wrapper.
       *
       * @return {Void}
       */
      setupWrapper: function setupWrapper(dimention) {
        Components.Html.wrapper.style.width = this.wrapperSize + 'px';
      },

      /**
       * Removes applied styles from HTML elements.
       *
       * @returns {Void}
       */
      remove: function remove() {
        var slides = Components.Html.slides;

        for (var i = 0; i < slides.length; i++) {
          slides[i].style.width = '';
        }

        Components.Html.wrapper.style.width = '';
      }
    };

    define(Sizes, 'length', {
      /**
       * Gets count number of the slides.
       *
       * @return {Number}
       */
      get: function get() {
        return Components.Html.slides.length;
      }
    });

    define(Sizes, 'width', {
      /**
       * Gets width value of the glide.
       *
       * @return {Number}
       */
      get: function get() {
        return Components.Html.root.offsetWidth;
      }
    });

    define(Sizes, 'wrapperSize', {
      /**
       * Gets size of the slides wrapper.
       *
       * @return {Number}
       */
      get: function get() {
        return Sizes.slideWidth * Sizes.length + Components.Gaps.grow + Components.Clones.grow;
      }
    });

    define(Sizes, 'slideWidth', {
      /**
       * Gets width value of the single slide.
       *
       * @return {Number}
       */
      get: function get() {
        return Sizes.width / Glide.settings.perView - Components.Peek.reductor - Components.Gaps.reductor;
      }
    });

    /**
     * Apply calculated glide's dimensions:
     * - before building, so other dimentions (e.g. translate) will be calculated propertly
     * - when resizing window to recalculate sildes dimensions
     * - on updating via API, to calculate dimensions based on new options
     */
    Events.on(['build.before', 'resize', 'update'], function () {
      Sizes.setupSlides();
      Sizes.setupWrapper();
    });

    /**
     * Remove calculated glide's dimensions:
     * - on destoting to bring markup to its inital state
     */
    Events.on('destroy', function () {
      Sizes.remove();
    });

    return Sizes;
  }

  function Build(Glide, Components, Events) {
    var Build = {
      /**
       * Init glide building. Adds classes, sets
       * dimensions and setups initial state.
       *
       * @return {Void}
       */
      mount: function mount() {
        Events.emit('build.before');

        this.typeClass();
        this.activeClass();

        Events.emit('build.after');
      },

      /**
       * Adds `type` class to the glide element.
       *
       * @return {Void}
       */
      typeClass: function typeClass() {
        Components.Html.root.classList.add(Glide.settings.classes[Glide.settings.type]);
      },

      /**
       * Sets active class to current slide.
       *
       * @return {Void}
       */
      activeClass: function activeClass() {
        var classes = Glide.settings.classes;
        var slide = Components.Html.slides[Glide.index];

        if (slide) {
          slide.classList.add(classes.activeSlide);

          siblings(slide).forEach(function (sibling) {
            sibling.classList.remove(classes.activeSlide);
          });
        }
      },

      /**
       * Removes HTML classes applied at building.
       *
       * @return {Void}
       */
      removeClasses: function removeClasses() {
        var classes = Glide.settings.classes;

        Components.Html.root.classList.remove(classes[Glide.settings.type]);

        Components.Html.slides.forEach(function (sibling) {
          sibling.classList.remove(classes.activeSlide);
        });
      }
    };

    /**
     * Clear building classes:
     * - on destroying to bring HTML to its initial state
     * - on updating to remove classes before remounting component
     */
    Events.on(['destroy', 'update'], function () {
      Build.removeClasses();
    });

    /**
     * Remount component:
     * - on resizing of the window to calculate new dimentions
     * - on updating settings via API
     */
    Events.on(['resize', 'update'], function () {
      Build.mount();
    });

    /**
     * Swap active class of current slide:
     * - after each move to the new index
     */
    Events.on('move.after', function () {
      Build.activeClass();
    });

    return Build;
  }

  function Clones(Glide, Components, Events) {
    var Clones = {
      /**
       * Create pattern map and collect slides to be cloned.
       */
      mount: function mount() {
        this.items = [];

        if (Glide.isType('carousel')) {
          this.items = this.collect();
        }
      },

      /**
       * Collect clones with pattern.
       *
       * @return {Void}
       */
      collect: function collect() {
        var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var slides = Components.Html.slides;
        var _Glide$settings = Glide.settings,
            perView = _Glide$settings.perView,
            classes = _Glide$settings.classes;

        var peekIncrementer = +!!Glide.settings.peek;
        var part = perView + peekIncrementer;
        var start = slides.slice(0, part);
        var end = slides.slice(-part);

        for (var r = 0; r < Math.max(1, Math.floor(perView / slides.length)); r++) {
          for (var i = 0; i < start.length; i++) {
            var clone = start[i].cloneNode(true);

            clone.classList.add(classes.cloneSlide);

            items.push(clone);
          }

          for (var _i = 0; _i < end.length; _i++) {
            var _clone = end[_i].cloneNode(true);

            _clone.classList.add(classes.cloneSlide);

            items.unshift(_clone);
          }
        }

        return items;
      },

      /**
       * Append cloned slides with generated pattern.
       *
       * @return {Void}
       */
      append: function append() {
        var items = this.items;
        var _Components$Html = Components.Html,
            wrapper = _Components$Html.wrapper,
            slides = _Components$Html.slides;

        var half = Math.floor(items.length / 2);
        var prepend = items.slice(0, half).reverse();
        var append = items.slice(half, items.length);
        var width = Components.Sizes.slideWidth + 'px';

        for (var i = 0; i < append.length; i++) {
          wrapper.appendChild(append[i]);
        }

        for (var _i2 = 0; _i2 < prepend.length; _i2++) {
          wrapper.insertBefore(prepend[_i2], slides[0]);
        }

        for (var _i3 = 0; _i3 < items.length; _i3++) {
          items[_i3].style.width = width;
        }
      },

      /**
       * Remove all cloned slides.
       *
       * @return {Void}
       */
      remove: function remove() {
        var items = this.items;

        for (var i = 0; i < items.length; i++) {
          Components.Html.wrapper.removeChild(items[i]);
        }
      }
    };

    define(Clones, 'grow', {
      /**
       * Gets additional dimentions value caused by clones.
       *
       * @return {Number}
       */
      get: function get() {
        return (Components.Sizes.slideWidth + Components.Gaps.value) * Clones.items.length;
      }
    });

    /**
     * Append additional slide's clones:
     * - while glide's type is `carousel`
     */
    Events.on('update', function () {
      Clones.remove();
      Clones.mount();
      Clones.append();
    });

    /**
     * Append additional slide's clones:
     * - while glide's type is `carousel`
     */
    Events.on('build.before', function () {
      if (Glide.isType('carousel')) {
        Clones.append();
      }
    });

    /**
     * Remove clones HTMLElements:
     * - on destroying, to bring HTML to its initial state
     */
    Events.on('destroy', function () {
      Clones.remove();
    });

    return Clones;
  }

  var EventsBinder = function () {
    /**
     * Construct a EventsBinder instance.
     */
    function EventsBinder() {
      var listeners = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      classCallCheck(this, EventsBinder);

      this.listeners = listeners;
    }

    /**
     * Adds events listeners to arrows HTML elements.
     *
     * @param  {String|Array} events
     * @param  {Element|Window|Document} el
     * @param  {Function} closure
     * @param  {Boolean|Object} capture
     * @return {Void}
     */

    createClass(EventsBinder, [{
      key: 'on',
      value: function on(events, el, closure) {
        var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        if (isString(events)) {
          events = [events];
        }

        for (var i = 0; i < events.length; i++) {
          this.listeners[events[i]] = closure;

          el.addEventListener(events[i], this.listeners[events[i]], capture);
        }
      }

      /**
       * Removes event listeners from arrows HTML elements.
       *
       * @param  {String|Array} events
       * @param  {Element|Window|Document} el
       * @param  {Boolean|Object} capture
       * @return {Void}
       */

    }, {
      key: 'off',
      value: function off(events, el) {
        var capture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (isString(events)) {
          events = [events];
        }

        for (var i = 0; i < events.length; i++) {
          el.removeEventListener(events[i], this.listeners[events[i]], capture);
        }
      }

      /**
       * Destroy collected listeners.
       *
       * @returns {Void}
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        delete this.listeners;
      }
    }]);
    return EventsBinder;
  }();

  function Resize(Glide, Components, Events) {
    /**
     * Instance of the binder for DOM Events.
     *
     * @type {EventsBinder}
     */
    var Binder = new EventsBinder();

    var Resize = {
      /**
       * Initializes window bindings.
       */
      mount: function mount() {
        this.bind();
      },

      /**
       * Binds `rezsize` listener to the window.
       * It's a costly event, so we are debouncing it.
       *
       * @return {Void}
       */
      bind: function bind() {
        Binder.on('resize', window, throttle(function () {
          Events.emit('resize');
        }, Glide.settings.throttle));
      },

      /**
       * Unbinds listeners from the window.
       *
       * @return {Void}
       */
      unbind: function unbind() {
        Binder.off('resize', window);
      }
    };

    /**
     * Remove bindings from window:
     * - on destroying, to remove added EventListener
     */
    Events.on('destroy', function () {
      Resize.unbind();
      Binder.destroy();
    });

    return Resize;
  }

  var VALID_DIRECTIONS = ['ltr', 'rtl'];
  var FLIPED_MOVEMENTS = {
    '>': '<',
    '<': '>',
    '=': '='
  };

  function Direction(Glide, Components, Events) {
    var Direction = {
      /**
       * Setups gap value based on settings.
       *
       * @return {Void}
       */
      mount: function mount() {
        this.value = Glide.settings.direction;
      },

      /**
       * Resolves pattern based on direction value
       *
       * @param {String} pattern
       * @returns {String}
       */
      resolve: function resolve(pattern) {
        var token = pattern.slice(0, 1);

        if (this.is('rtl')) {
          return pattern.split(token).join(FLIPED_MOVEMENTS[token]);
        }

        return pattern;
      },

      /**
       * Checks value of direction mode.
       *
       * @param {String} direction
       * @returns {Boolean}
       */
      is: function is(direction) {
        return this.value === direction;
      },

      /**
       * Applies direction class to the root HTML element.
       *
       * @return {Void}
       */
      addClass: function addClass() {
        Components.Html.root.classList.add(Glide.settings.classes.direction[this.value]);
      },

      /**
       * Removes direction class from the root HTML element.
       *
       * @return {Void}
       */
      removeClass: function removeClass() {
        Components.Html.root.classList.remove(Glide.settings.classes.direction[this.value]);
      }
    };

    define(Direction, 'value', {
      /**
       * Gets value of the direction.
       *
       * @returns {Number}
       */
      get: function get() {
        return Direction._v;
      },

      /**
       * Sets value of the direction.
       *
       * @param {String} value
       * @return {Void}
       */
      set: function set(value) {
        if (VALID_DIRECTIONS.indexOf(value) > -1) {
          Direction._v = value;
        } else {
          warn('Direction value must be `ltr` or `rtl`');
        }
      }
    });

    /**
     * Clear direction class:
     * - on destroy to bring HTML to its initial state
     * - on update to remove class before reappling bellow
     */
    Events.on(['destroy', 'update'], function () {
      Direction.removeClass();
    });

    /**
     * Remount component:
     * - on update to reflect changes in direction value
     */
    Events.on('update', function () {
      Direction.mount();
    });

    /**
     * Apply direction class:
     * - before building to apply class for the first time
     * - on updating to reapply direction class that may changed
     */
    Events.on(['build.before', 'update'], function () {
      Direction.addClass();
    });

    return Direction;
  }

  /**
   * Reflects value of glide movement.
   *
   * @param  {Object} Glide
   * @param  {Object} Components
   * @return {Object}
   */
  function Rtl(Glide, Components) {
    return {
      /**
       * Negates the passed translate if glide is in RTL option.
       *
       * @param  {Number} translate
       * @return {Number}
       */
      modify: function modify(translate) {
        if (Components.Direction.is('rtl')) {
          return -translate;
        }

        return translate;
      }
    };
  }

  /**
   * Updates glide movement with a `gap` settings.
   *
   * @param  {Object} Glide
   * @param  {Object} Components
   * @return {Object}
   */
  function Gap(Glide, Components) {
    return {
      /**
       * Modifies passed translate value with number in the `gap` settings.
       *
       * @param  {Number} translate
       * @return {Number}
       */
      modify: function modify(translate) {
        return translate + Components.Gaps.value * Glide.index;
      }
    };
  }

  /**
   * Updates glide movement with width of additional clones width.
   *
   * @param  {Object} Glide
   * @param  {Object} Components
   * @return {Object}
   */
  function Grow(Glide, Components) {
    return {
      /**
       * Adds to the passed translate width of the half of clones.
       *
       * @param  {Number} translate
       * @return {Number}
       */
      modify: function modify(translate) {
        return translate + Components.Clones.grow / 2;
      }
    };
  }

  /**
   * Updates glide movement with a `peek` settings.
   *
   * @param  {Object} Glide
   * @param  {Object} Components
   * @return {Object}
   */
  function Peeking(Glide, Components) {
    return {
      /**
       * Modifies passed translate value with a `peek` setting.
       *
       * @param  {Number} translate
       * @return {Number}
       */
      modify: function modify(translate) {
        if (Glide.settings.focusAt >= 0) {
          var peek = Components.Peek.value;

          if (isObject(peek)) {
            return translate - peek.before;
          }

          return translate - peek;
        }

        return translate;
      }
    };
  }

  /**
   * Updates glide movement with a `focusAt` settings.
   *
   * @param  {Object} Glide
   * @param  {Object} Components
   * @return {Object}
   */
  function Focusing(Glide, Components) {
    return {
      /**
       * Modifies passed translate value with index in the `focusAt` setting.
       *
       * @param  {Number} translate
       * @return {Number}
       */
      modify: function modify(translate) {
        var gap = Components.Gaps.value;
        var width = Components.Sizes.width;
        var focusAt = Glide.settings.focusAt;
        var slideWidth = Components.Sizes.slideWidth;

        if (focusAt === 'center') {
          return translate - (width / 2 - slideWidth / 2);
        }

        return translate - slideWidth * focusAt - gap * focusAt;
      }
    };
  }

  /**
   * Applies diffrent transformers on translate value.
   *
   * @param  {Object} Glide
   * @param  {Object} Components
   * @return {Object}
   */
  function mutator(Glide, Components, Events) {
    /**
     * Merge instance transformers with collection of default transformers.
     * It's important that the Rtl component be last on the list,
     * so it reflects all previous transformations.
     *
     * @type {Array}
     */
    var TRANSFORMERS = [Gap, Grow, Peeking, Focusing].concat(Glide._t, [Rtl]);

    return {
      /**
       * Piplines translate value with registered transformers.
       *
       * @param  {Number} translate
       * @return {Number}
       */
      mutate: function mutate(translate) {
        for (var i = 0; i < TRANSFORMERS.length; i++) {
          var transformer = TRANSFORMERS[i];

          if (isFunction(transformer) && isFunction(transformer().modify)) {
            translate = transformer(Glide, Components, Events).modify(translate);
          } else {
            warn('Transformer should be a function that returns an object with `modify()` method');
          }
        }

        return translate;
      }
    };
  }

  function Translate(Glide, Components, Events) {
    var Translate = {
      /**
       * Sets value of translate on HTML element.
       *
       * @param {Number} value
       * @return {Void}
       */
      set: function set(value) {
        var transform = mutator(Glide, Components).mutate(value);

        Components.Html.wrapper.style.transform = 'translate3d(' + -1 * transform + 'px, 0px, 0px)';
      },

      /**
       * Removes value of translate from HTML element.
       *
       * @return {Void}
       */
      remove: function remove() {
        Components.Html.wrapper.style.transform = '';
      }
    };

    /**
     * Set new translate value:
     * - on move to reflect index change
     * - on updating via API to reflect possible changes in options
     */
    Events.on('move', function (context) {
      var gap = Components.Gaps.value;
      var length = Components.Sizes.length;
      var width = Components.Sizes.slideWidth;

      if (Glide.isType('carousel') && Components.Run.isOffset('<')) {
        Components.Transition.after(function () {
          Events.emit('translate.jump');

          Translate.set(width * (length - 1));
        });

        return Translate.set(-width - gap * length);
      }

      if (Glide.isType('carousel') && Components.Run.isOffset('>')) {
        Components.Transition.after(function () {
          Events.emit('translate.jump');

          Translate.set(0);
        });

        return Translate.set(width * length + gap * length);
      }

      return Translate.set(context.movement);
    });

    /**
     * Remove translate:
     * - on destroying to bring markup to its inital state
     */
    Events.on('destroy', function () {
      Translate.remove();
    });

    return Translate;
  }

  function Transition(Glide, Components, Events) {
    /**
     * Holds inactivity status of transition.
     * When true transition is not applied.
     *
     * @type {Boolean}
     */
    var disabled = false;

    var Transition = {
      /**
       * Composes string of the CSS transition.
       *
       * @param {String} property
       * @return {String}
       */
      compose: function compose(property) {
        var settings = Glide.settings;

        if (!disabled) {
          return property + ' ' + this.duration + 'ms ' + settings.animationTimingFunc;
        }

        return property + ' 0ms ' + settings.animationTimingFunc;
      },

      /**
       * Sets value of transition on HTML element.
       *
       * @param {String=} property
       * @return {Void}
       */
      set: function set() {
        var property = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'transform';

        Components.Html.wrapper.style.transition = this.compose(property);
      },

      /**
       * Removes value of transition from HTML element.
       *
       * @return {Void}
       */
      remove: function remove() {
        Components.Html.wrapper.style.transition = '';
      },

      /**
       * Runs callback after animation.
       *
       * @param  {Function} callback
       * @return {Void}
       */
      after: function after(callback) {
        setTimeout(function () {
          callback();
        }, this.duration);
      },

      /**
       * Enable transition.
       *
       * @return {Void}
       */
      enable: function enable() {
        disabled = false;

        this.set();
      },

      /**
       * Disable transition.
       *
       * @return {Void}
       */
      disable: function disable() {
        disabled = true;

        this.set();
      }
    };

    define(Transition, 'duration', {
      /**
       * Gets duration of the transition based
       * on currently running animation type.
       *
       * @return {Number}
       */
      get: function get() {
        var settings = Glide.settings;

        if (Glide.isType('slider') && Components.Run.offset) {
          return settings.rewindDuration;
        }

        return settings.animationDuration;
      }
    });

    /**
     * Set transition `style` value:
     * - on each moving, because it may be cleared by offset move
     */
    Events.on('move', function () {
      Transition.set();
    });

    /**
     * Disable transition:
     * - before initial build to avoid transitioning from `0` to `startAt` index
     * - while resizing window and recalculating dimentions
     * - on jumping from offset transition at start and end edges in `carousel` type
     */
    Events.on(['build.before', 'resize', 'translate.jump'], function () {
      Transition.disable();
    });

    /**
     * Enable transition:
     * - on each running, because it may be disabled by offset move
     */
    Events.on('run', function () {
      Transition.enable();
    });

    /**
     * Remove transition:
     * - on destroying to bring markup to its inital state
     */
    Events.on('destroy', function () {
      Transition.remove();
    });

    return Transition;
  }

  /**
   * Test via a getter in the options object to see
   * if the passive property is accessed.
   *
   * @see https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
   */

  var supportsPassive = false;

  try {
    var opts = Object.defineProperty({}, 'passive', {
      get: function get() {
        supportsPassive = true;
      }
    });

    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {}

  var supportsPassive$1 = supportsPassive;

  var START_EVENTS = ['touchstart', 'mousedown'];
  var MOVE_EVENTS = ['touchmove', 'mousemove'];
  var END_EVENTS = ['touchend', 'touchcancel', 'mouseup', 'mouseleave'];
  var MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];

  function Swipe(Glide, Components, Events) {
    /**
     * Instance of the binder for DOM Events.
     *
     * @type {EventsBinder}
     */
    var Binder = new EventsBinder();

    var swipeSin = 0;
    var swipeStartX = 0;
    var swipeStartY = 0;
    var disabled = false;
    var capture = supportsPassive$1 ? { passive: true } : false;

    var Swipe = {
      /**
       * Initializes swipe bindings.
       *
       * @return {Void}
       */
      mount: function mount() {
        this.bindSwipeStart();
      },

      /**
       * Handler for `swipestart` event. Calculates entry points of the user's tap.
       *
       * @param {Object} event
       * @return {Void}
       */
      start: function start(event) {
        if (!disabled && !Glide.disabled) {
          this.disable();

          var swipe = this.touches(event);

          swipeSin = null;
          swipeStartX = toInt(swipe.pageX);
          swipeStartY = toInt(swipe.pageY);

          this.bindSwipeMove();
          this.bindSwipeEnd();

          Events.emit('swipe.start');
        }
      },

      /**
       * Handler for `swipemove` event. Calculates user's tap angle and distance.
       *
       * @param {Object} event
       */
      move: function move(event) {
        if (!Glide.disabled) {
          var _Glide$settings = Glide.settings,
              touchAngle = _Glide$settings.touchAngle,
              touchRatio = _Glide$settings.touchRatio,
              classes = _Glide$settings.classes;

          var swipe = this.touches(event);

          var subExSx = toInt(swipe.pageX) - swipeStartX;
          var subEySy = toInt(swipe.pageY) - swipeStartY;
          var powEX = Math.abs(subExSx << 2);
          var powEY = Math.abs(subEySy << 2);
          var swipeHypotenuse = Math.sqrt(powEX + powEY);
          var swipeCathetus = Math.sqrt(powEY);

          swipeSin = Math.asin(swipeCathetus / swipeHypotenuse);

          if (swipeSin * 180 / Math.PI < touchAngle) {
            event.stopPropagation();

            Components.Move.make(subExSx * toFloat(touchRatio));

            Components.Html.root.classList.add(classes.dragging);

            Events.emit('swipe.move');
          } else {
            return false;
          }
        }
      },

      /**
       * Handler for `swipeend` event. Finitializes user's tap and decides about glide move.
       *
       * @param {Object} event
       * @return {Void}
       */
      end: function end(event) {
        if (!Glide.disabled) {
          var settings = Glide.settings;

          var swipe = this.touches(event);
          var threshold = this.threshold(event);

          var swipeDistance = swipe.pageX - swipeStartX;
          var swipeDeg = swipeSin * 180 / Math.PI;
          var steps = Math.round(swipeDistance / Components.Sizes.slideWidth);

          this.enable();

          if (swipeDistance > threshold && swipeDeg < settings.touchAngle) {
            // While swipe is positive and greater than threshold move backward.
            if (settings.perTouch) {
              steps = Math.min(steps, toInt(settings.perTouch));
            }

            if (Components.Direction.is('rtl')) {
              steps = -steps;
            }

            Components.Run.make(Components.Direction.resolve('<' + steps));
          } else if (swipeDistance < -threshold && swipeDeg < settings.touchAngle) {
            // While swipe is negative and lower than negative threshold move forward.
            if (settings.perTouch) {
              steps = Math.max(steps, -toInt(settings.perTouch));
            }

            if (Components.Direction.is('rtl')) {
              steps = -steps;
            }

            Components.Run.make(Components.Direction.resolve('>' + steps));
          } else {
            // While swipe don't reach distance apply previous transform.
            Components.Move.make();
          }

          Components.Html.root.classList.remove(settings.classes.dragging);

          this.unbindSwipeMove();
          this.unbindSwipeEnd();

          Events.emit('swipe.end');
        }
      },

      /**
       * Binds swipe's starting event.
       *
       * @return {Void}
       */
      bindSwipeStart: function bindSwipeStart() {
        var _this = this;

        var settings = Glide.settings;

        if (settings.swipeThreshold) {
          Binder.on(START_EVENTS[0], Components.Html.wrapper, function (event) {
            _this.start(event);
          }, capture);
        }

        if (settings.dragThreshold) {
          Binder.on(START_EVENTS[1], Components.Html.wrapper, function (event) {
            _this.start(event);
          }, capture);
        }
      },

      /**
       * Unbinds swipe's starting event.
       *
       * @return {Void}
       */
      unbindSwipeStart: function unbindSwipeStart() {
        Binder.off(START_EVENTS[0], Components.Html.wrapper, capture);
        Binder.off(START_EVENTS[1], Components.Html.wrapper, capture);
      },

      /**
       * Binds swipe's moving event.
       *
       * @return {Void}
       */
      bindSwipeMove: function bindSwipeMove() {
        var _this2 = this;

        Binder.on(MOVE_EVENTS, Components.Html.wrapper, throttle(function (event) {
          _this2.move(event);
        }, Glide.settings.throttle), capture);
      },

      /**
       * Unbinds swipe's moving event.
       *
       * @return {Void}
       */
      unbindSwipeMove: function unbindSwipeMove() {
        Binder.off(MOVE_EVENTS, Components.Html.wrapper, capture);
      },

      /**
       * Binds swipe's ending event.
       *
       * @return {Void}
       */
      bindSwipeEnd: function bindSwipeEnd() {
        var _this3 = this;

        Binder.on(END_EVENTS, Components.Html.wrapper, function (event) {
          _this3.end(event);
        });
      },

      /**
       * Unbinds swipe's ending event.
       *
       * @return {Void}
       */
      unbindSwipeEnd: function unbindSwipeEnd() {
        Binder.off(END_EVENTS, Components.Html.wrapper);
      },

      /**
       * Normalizes event touches points accorting to different types.
       *
       * @param {Object} event
       */
      touches: function touches(event) {
        if (MOUSE_EVENTS.indexOf(event.type) > -1) {
          return event;
        }

        return event.touches[0] || event.changedTouches[0];
      },

      /**
       * Gets value of minimum swipe distance settings based on event type.
       *
       * @return {Number}
       */
      threshold: function threshold(event) {
        var settings = Glide.settings;

        if (MOUSE_EVENTS.indexOf(event.type) > -1) {
          return settings.dragThreshold;
        }

        return settings.swipeThreshold;
      },

      /**
       * Enables swipe event.
       *
       * @return {self}
       */
      enable: function enable() {
        disabled = false;

        Components.Transition.enable();

        return this;
      },

      /**
       * Disables swipe event.
       *
       * @return {self}
       */
      disable: function disable() {
        disabled = true;

        Components.Transition.disable();

        return this;
      }
    };

    /**
     * Add component class:
     * - after initial building
     */
    Events.on('build.after', function () {
      Components.Html.root.classList.add(Glide.settings.classes.swipeable);
    });

    /**
     * Remove swiping bindings:
     * - on destroying, to remove added EventListeners
     */
    Events.on('destroy', function () {
      Swipe.unbindSwipeStart();
      Swipe.unbindSwipeMove();
      Swipe.unbindSwipeEnd();
      Binder.destroy();
    });

    return Swipe;
  }

  function Images(Glide, Components, Events) {
    /**
     * Instance of the binder for DOM Events.
     *
     * @type {EventsBinder}
     */
    var Binder = new EventsBinder();

    var Images = {
      /**
       * Binds listener to glide wrapper.
       *
       * @return {Void}
       */
      mount: function mount() {
        this.bind();
      },

      /**
       * Binds `dragstart` event on wrapper to prevent dragging images.
       *
       * @return {Void}
       */
      bind: function bind() {
        Binder.on('dragstart', Components.Html.wrapper, this.dragstart);
      },

      /**
       * Unbinds `dragstart` event on wrapper.
       *
       * @return {Void}
       */
      unbind: function unbind() {
        Binder.off('dragstart', Components.Html.wrapper);
      },

      /**
       * Event handler. Prevents dragging.
       *
       * @return {Void}
       */
      dragstart: function dragstart(event) {
        event.preventDefault();
      }
    };

    /**
     * Remove bindings from images:
     * - on destroying, to remove added EventListeners
     */
    Events.on('destroy', function () {
      Images.unbind();
      Binder.destroy();
    });

    return Images;
  }

  function Anchors(Glide, Components, Events) {
    /**
     * Instance of the binder for DOM Events.
     *
     * @type {EventsBinder}
     */
    var Binder = new EventsBinder();

    /**
     * Holds detaching status of anchors.
     * Prevents detaching of already detached anchors.
     *
     * @private
     * @type {Boolean}
     */
    var detached = false;

    /**
     * Holds preventing status of anchors.
     * If `true` redirection after click will be disabled.
     *
     * @private
     * @type {Boolean}
     */
    var prevented = false;

    var Anchors = {
      /**
       * Setups a initial state of anchors component.
       *
       * @returns {Void}
       */
      mount: function mount() {
        /**
         * Holds collection of anchors elements.
         *
         * @private
         * @type {HTMLCollection}
         */
        this._a = Components.Html.wrapper.querySelectorAll('a');

        this.bind();
      },

      /**
       * Binds events to anchors inside a track.
       *
       * @return {Void}
       */
      bind: function bind() {
        Binder.on('click', Components.Html.wrapper, this.click);
      },

      /**
       * Unbinds events attached to anchors inside a track.
       *
       * @return {Void}
       */
      unbind: function unbind() {
        Binder.off('click', Components.Html.wrapper);
      },

      /**
       * Handler for click event. Prevents clicks when glide is in `prevent` status.
       *
       * @param  {Object} event
       * @return {Void}
       */
      click: function click(event) {
        if (prevented) {
          event.stopPropagation();
          event.preventDefault();
        }
      },

      /**
       * Detaches anchors click event inside glide.
       *
       * @return {self}
       */
      detach: function detach() {
        prevented = true;

        if (!detached) {
          for (var i = 0; i < this.items.length; i++) {
            this.items[i].draggable = false;

            this.items[i].setAttribute('data-href', this.items[i].getAttribute('href'));

            this.items[i].removeAttribute('href');
          }

          detached = true;
        }

        return this;
      },

      /**
       * Attaches anchors click events inside glide.
       *
       * @return {self}
       */
      attach: function attach() {
        prevented = false;

        if (detached) {
          for (var i = 0; i < this.items.length; i++) {
            this.items[i].draggable = true;

            this.items[i].setAttribute('href', this.items[i].getAttribute('data-href'));
          }

          detached = false;
        }

        return this;
      }
    };

    define(Anchors, 'items', {
      /**
       * Gets collection of the arrows HTML elements.
       *
       * @return {HTMLElement[]}
       */
      get: function get() {
        return Anchors._a;
      }
    });

    /**
     * Detach anchors inside slides:
     * - on swiping, so they won't redirect to its `href` attributes
     */
    Events.on('swipe.move', function () {
      Anchors.detach();
    });

    /**
     * Attach anchors inside slides:
     * - after swiping and transitions ends, so they can redirect after click again
     */
    Events.on('swipe.end', function () {
      Components.Transition.after(function () {
        Anchors.attach();
      });
    });

    /**
     * Unbind anchors inside slides:
     * - on destroying, to bring anchors to its initial state
     */
    Events.on('destroy', function () {
      Anchors.attach();
      Anchors.unbind();
      Binder.destroy();
    });

    return Anchors;
  }

  var NAV_SELECTOR = '[data-glide-el="controls[nav]"]';
  var CONTROLS_SELECTOR = '[data-glide-el^="controls"]';

  function Controls(Glide, Components, Events) {
    /**
     * Instance of the binder for DOM Events.
     *
     * @type {EventsBinder}
     */
    var Binder = new EventsBinder();

    var capture = supportsPassive$1 ? { passive: true } : false;

    var Controls = {
      /**
       * Inits arrows. Binds events listeners
       * to the arrows HTML elements.
       *
       * @return {Void}
       */
      mount: function mount() {
        /**
         * Collection of navigation HTML elements.
         *
         * @private
         * @type {HTMLCollection}
         */
        this._n = Components.Html.root.querySelectorAll(NAV_SELECTOR);

        /**
         * Collection of controls HTML elements.
         *
         * @private
         * @type {HTMLCollection}
         */
        this._c = Components.Html.root.querySelectorAll(CONTROLS_SELECTOR);

        this.addBindings();
      },

      /**
       * Sets active class to current slide.
       *
       * @return {Void}
       */
      setActive: function setActive() {
        for (var i = 0; i < this._n.length; i++) {
          this.addClass(this._n[i].children);
        }
      },

      /**
       * Removes active class to current slide.
       *
       * @return {Void}
       */
      removeActive: function removeActive() {
        for (var i = 0; i < this._n.length; i++) {
          this.removeClass(this._n[i].children);
        }
      },

      /**
       * Toggles active class on items inside navigation.
       *
       * @param  {HTMLElement} controls
       * @return {Void}
       */
      addClass: function addClass(controls) {
        var settings = Glide.settings;
        var item = controls[Glide.index];

        if (item) {
          item.classList.add(settings.classes.activeNav);

          siblings(item).forEach(function (sibling) {
            sibling.classList.remove(settings.classes.activeNav);
          });
        }
      },

      /**
       * Removes active class from active control.
       *
       * @param  {HTMLElement} controls
       * @return {Void}
       */
      removeClass: function removeClass(controls) {
        var item = controls[Glide.index];

        if (item) {
          item.classList.remove(Glide.settings.classes.activeNav);
        }
      },

      /**
       * Adds handles to the each group of controls.
       *
       * @return {Void}
       */
      addBindings: function addBindings() {
        for (var i = 0; i < this._c.length; i++) {
          this.bind(this._c[i].children);
        }
      },

      /**
       * Removes handles from the each group of controls.
       *
       * @return {Void}
       */
      removeBindings: function removeBindings() {
        for (var i = 0; i < this._c.length; i++) {
          this.unbind(this._c[i].children);
        }
      },

      /**
       * Binds events to arrows HTML elements.
       *
       * @param {HTMLCollection} elements
       * @return {Void}
       */
      bind: function bind(elements) {
        for (var i = 0; i < elements.length; i++) {
          Binder.on('click', elements[i], this.click);
          Binder.on('touchstart', elements[i], this.click, capture);
        }
      },

      /**
       * Unbinds events binded to the arrows HTML elements.
       *
       * @param {HTMLCollection} elements
       * @return {Void}
       */
      unbind: function unbind(elements) {
        for (var i = 0; i < elements.length; i++) {
          Binder.off(['click', 'touchstart'], elements[i]);
        }
      },

      /**
       * Handles `click` event on the arrows HTML elements.
       * Moves slider in driection precised in
       * `data-glide-dir` attribute.
       *
       * @param {Object} event
       * @return {Void}
       */
      click: function click(event) {
        event.preventDefault();

        Components.Run.make(Components.Direction.resolve(event.currentTarget.getAttribute('data-glide-dir')));
      }
    };

    define(Controls, 'items', {
      /**
       * Gets collection of the controls HTML elements.
       *
       * @return {HTMLElement[]}
       */
      get: function get() {
        return Controls._c;
      }
    });

    /**
     * Swap active class of current navigation item:
     * - after mounting to set it to initial index
     * - after each move to the new index
     */
    Events.on(['mount.after', 'move.after'], function () {
      Controls.setActive();
    });

    /**
     * Remove bindings and HTML Classes:
     * - on destroying, to bring markup to its initial state
     */
    Events.on('destroy', function () {
      Controls.removeBindings();
      Controls.removeActive();
      Binder.destroy();
    });

    return Controls;
  }

  function Keyboard(Glide, Components, Events) {
    /**
     * Instance of the binder for DOM Events.
     *
     * @type {EventsBinder}
     */
    var Binder = new EventsBinder();

    var Keyboard = {
      /**
       * Binds keyboard events on component mount.
       *
       * @return {Void}
       */
      mount: function mount() {
        if (Glide.settings.keyboard) {
          this.bind();
        }
      },

      /**
       * Adds keyboard press events.
       *
       * @return {Void}
       */
      bind: function bind() {
        Binder.on('keyup', document, this.press);
      },

      /**
       * Removes keyboard press events.
       *
       * @return {Void}
       */
      unbind: function unbind() {
        Binder.off('keyup', document);
      },

      /**
       * Handles keyboard's arrows press and moving glide foward and backward.
       *
       * @param  {Object} event
       * @return {Void}
       */
      press: function press(event) {
        if (event.keyCode === 39) {
          Components.Run.make(Components.Direction.resolve('>'));
        }

        if (event.keyCode === 37) {
          Components.Run.make(Components.Direction.resolve('<'));
        }
      }
    };

    /**
     * Remove bindings from keyboard:
     * - on destroying to remove added events
     * - on updating to remove events before remounting
     */
    Events.on(['destroy', 'update'], function () {
      Keyboard.unbind();
    });

    /**
     * Remount component
     * - on updating to reflect potential changes in settings
     */
    Events.on('update', function () {
      Keyboard.mount();
    });

    /**
     * Destroy binder:
     * - on destroying to remove listeners
     */
    Events.on('destroy', function () {
      Binder.destroy();
    });

    return Keyboard;
  }

  function Autoplay(Glide, Components, Events) {
    /**
     * Instance of the binder for DOM Events.
     *
     * @type {EventsBinder}
     */
    var Binder = new EventsBinder();

    var Autoplay = {
      /**
       * Initializes autoplaying and events.
       *
       * @return {Void}
       */
      mount: function mount() {
        this.start();

        if (Glide.settings.hoverpause) {
          this.bind();
        }
      },

      /**
       * Starts autoplaying in configured interval.
       *
       * @param {Boolean|Number} force Run autoplaying with passed interval regardless of `autoplay` settings
       * @return {Void}
       */
      start: function start() {
        var _this = this;

        if (Glide.settings.autoplay) {
          if (isUndefined(this._i)) {
            this._i = setInterval(function () {
              _this.stop();

              Components.Run.make('>');

              _this.start();
            }, this.time);
          }
        }
      },

      /**
       * Stops autorunning of the glide.
       *
       * @return {Void}
       */
      stop: function stop() {
        this._i = clearInterval(this._i);
      },

      /**
       * Stops autoplaying while mouse is over glide's area.
       *
       * @return {Void}
       */
      bind: function bind() {
        var _this2 = this;

        Binder.on('mouseover', Components.Html.root, function () {
          _this2.stop();
        });

        Binder.on('mouseout', Components.Html.root, function () {
          _this2.start();
        });
      },

      /**
       * Unbind mouseover events.
       *
       * @returns {Void}
       */
      unbind: function unbind() {
        Binder.off(['mouseover', 'mouseout'], Components.Html.root);
      }
    };

    define(Autoplay, 'time', {
      /**
       * Gets time period value for the autoplay interval. Prioritizes
       * times in `data-glide-autoplay` attrubutes over options.
       *
       * @return {Number}
       */
      get: function get() {
        var autoplay = Components.Html.slides[Glide.index].getAttribute('data-glide-autoplay');

        if (autoplay) {
          return toInt(autoplay);
        }

        return toInt(Glide.settings.autoplay);
      }
    });

    /**
     * Stop autoplaying and unbind events:
     * - on destroying, to clear defined interval
     * - on updating via API to reset interval that may changed
     */
    Events.on(['destroy', 'update'], function () {
      Autoplay.unbind();
    });

    /**
     * Stop autoplaying:
     * - before each run, to restart autoplaying
     * - on pausing via API
     * - on destroying, to clear defined interval
     * - while starting a swipe
     * - on updating via API to reset interval that may changed
     */
    Events.on(['run.before', 'pause', 'destroy', 'swipe.start', 'update'], function () {
      Autoplay.stop();
    });

    /**
     * Start autoplaying:
     * - after each run, to restart autoplaying
     * - on playing via API
     * - while ending a swipe
     */
    Events.on(['run.after', 'play', 'swipe.end'], function () {
      Autoplay.start();
    });

    /**
     * Remount autoplaying:
     * - on updating via API to reset interval that may changed
     */
    Events.on('update', function () {
      Autoplay.mount();
    });

    /**
     * Destroy a binder:
     * - on destroying glide instance to clearup listeners
     */
    Events.on('destroy', function () {
      Binder.destroy();
    });

    return Autoplay;
  }

  /**
   * Sorts keys of breakpoint object so they will be ordered from lower to bigger.
   *
   * @param {Object} points
   * @returns {Object}
   */
  function sortBreakpoints(points) {
    if (isObject(points)) {
      return sortKeys(points);
    } else {
      warn('Breakpoints option must be an object');
    }

    return {};
  }

  function Breakpoints(Glide, Components, Events) {
    /**
     * Instance of the binder for DOM Events.
     *
     * @type {EventsBinder}
     */
    var Binder = new EventsBinder();

    /**
     * Holds reference to settings.
     *
     * @type {Object}
     */
    var settings = Glide.settings;

    /**
     * Holds reference to breakpoints object in settings. Sorts breakpoints
     * from smaller to larger. It is required in order to proper
     * matching currently active breakpoint settings.
     *
     * @type {Object}
     */
    var points = sortBreakpoints(settings.breakpoints);

    /**
     * Cache initial settings before overwritting.
     *
     * @type {Object}
     */
    var defaults = _extends({}, settings);

    var Breakpoints = {
      /**
       * Matches settings for currectly matching media breakpoint.
       *
       * @param {Object} points
       * @returns {Object}
       */
      match: function match(points) {
        if (typeof window.matchMedia !== 'undefined') {
          for (var point in points) {
            if (points.hasOwnProperty(point)) {
              if (window.matchMedia('(max-width: ' + point + 'px)').matches) {
                return points[point];
              }
            }
          }
        }

        return defaults;
      }
    };

    /**
     * Overwrite instance settings with currently matching breakpoint settings.
     * This happens right after component initialization.
     */
    _extends(settings, Breakpoints.match(points));

    /**
     * Update glide with settings of matched brekpoint:
     * - window resize to update slider
     */
    Binder.on('resize', window, throttle(function () {
      Glide.settings = mergeOptions(settings, Breakpoints.match(points));
    }, Glide.settings.throttle));

    /**
     * Resort and update default settings:
     * - on reinit via API, so breakpoint matching will be performed with options
     */
    Events.on('update', function () {
      points = sortBreakpoints(points);

      defaults = _extends({}, settings);
    });

    /**
     * Unbind resize listener:
     * - on destroying, to bring markup to its initial state
     */
    Events.on('destroy', function () {
      Binder.off('resize', window);
    });

    return Breakpoints;
  }

  var COMPONENTS = {
    // Required
    Html: Html,
    Translate: Translate,
    Transition: Transition,
    Direction: Direction,
    Peek: Peek,
    Sizes: Sizes,
    Gaps: Gaps,
    Move: Move,
    Clones: Clones,
    Resize: Resize,
    Build: Build,
    Run: Run,

    // Optional
    Swipe: Swipe,
    Images: Images,
    Anchors: Anchors,
    Controls: Controls,
    Keyboard: Keyboard,
    Autoplay: Autoplay,
    Breakpoints: Breakpoints
  };

  var Glide$1 = function (_Core) {
    inherits(Glide$$1, _Core);

    function Glide$$1() {
      classCallCheck(this, Glide$$1);
      return possibleConstructorReturn(this, (Glide$$1.__proto__ || Object.getPrototypeOf(Glide$$1)).apply(this, arguments));
    }

    createClass(Glide$$1, [{
      key: 'mount',
      value: function mount() {
        var extensions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return get(Glide$$1.prototype.__proto__ || Object.getPrototypeOf(Glide$$1.prototype), 'mount', this).call(this, _extends({}, COMPONENTS, extensions));
      }
    }]);
    return Glide$$1;
  }(Glide);

  return Glide$1;
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvanMvbWRsL3N0YXRpYy9qcy9nbGlkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQTs7Ozs7O0FBTUMsV0FBVSxNQUFWLEVBQWtCLE9BQWxCLEVBQTJCO0FBQzFCLFVBQU8sT0FBUCwwQ0FBTyxPQUFQLE9BQW1CLFFBQW5CLElBQStCLE9BQU8sTUFBUCxLQUFrQixXQUFqRCxHQUErRCxPQUFPLE9BQVAsR0FBaUIsU0FBaEYsR0FDQSxPQUFPLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0MsT0FBTyxHQUF2QyxHQUE2QyxPQUFPLE9BQVAsQ0FBN0MsR0FDQyxPQUFPLEtBQVAsR0FBZSxTQUZoQjtBQUdELENBSkEsYUFJUSxZQUFZO0FBQUU7O0FBRXJCLE1BQUksV0FBVztBQUNiOzs7Ozs7Ozs7QUFTQSxVQUFNLFFBVk87O0FBWWI7Ozs7O0FBS0EsYUFBUyxDQWpCSTs7QUFtQmI7Ozs7O0FBS0EsYUFBUyxDQXhCSTs7QUEwQmI7Ozs7Ozs7OztBQVNBLGFBQVMsQ0FuQ0k7O0FBcUNiOzs7OztBQUtBLFNBQUssRUExQ1E7O0FBNENiOzs7OztBQUtBLGNBQVUsS0FqREc7O0FBbURiOzs7OztBQUtBLGdCQUFZLElBeERDOztBQTBEYjs7Ozs7QUFLQSxjQUFVLElBL0RHOztBQWlFYjs7Ozs7Ozs7QUFRQSxXQUFPLEtBekVNOztBQTJFYjs7Ozs7QUFLQSxvQkFBZ0IsRUFoRkg7O0FBa0ZiOzs7OztBQUtBLG1CQUFlLEdBdkZGOztBQXlGYjs7Ozs7QUFLQSxjQUFVLEtBOUZHOztBQWdHYjs7Ozs7QUFLQSxnQkFBWSxHQXJHQzs7QUF1R2I7Ozs7O0FBS0EsZ0JBQVksRUE1R0M7O0FBOEdiOzs7OztBQUtBLHVCQUFtQixHQW5ITjs7QUFxSGI7Ozs7O0FBS0EsWUFBUSxJQTFISzs7QUE0SGI7Ozs7O0FBS0Esb0JBQWdCLEdBaklIOztBQW1JYjs7Ozs7QUFLQSx5QkFB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b0UsRUFBckY7O0FBRUEsZUFBTyxJQUFJLFNBQVMsU0FBVCxDQUFtQixTQUFuQixJQUFnQyxPQUFPLGNBQVAsQ0FBc0IsU0FBUyxTQUEvQixDQUFwQyxFQUErRSxPQUEvRSxFQUF3RixJQUF4RixFQUE4RixJQUE5RixDQUFtRyxJQUFuRyxFQUF5RyxTQUFTLEVBQVQsRUFBYSxVQUFiLEVBQXlCLFVBQXpCLENBQXpHLENBQVA7QUFDRDtBQU5vQixLQUFELENBQXRCO0FBUUEsV0FBTyxRQUFQO0FBQ0QsR0FqQmEsQ0FpQlosS0FqQlksQ0FBZDs7QUFtQkEsU0FBTyxPQUFQO0FBRUQsQ0FybEhBLENBQUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiFcbiAqIEdsaWRlLmpzIHYzLjMuMFxuICogKGMpIDIwMTMtMjAxOSBKxJlkcnplaiBDaGHFgnViZWsgPGplZHJ6ZWouY2hhbHViZWtAZ21haWwuY29tPiAoaHR0cDovL2plZHJ6ZWpjaGFsdWJlay5jb20vKVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICovXG5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbC5HbGlkZSA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgLyoqXG4gICAgICogVHlwZSBvZiB0aGUgbW92ZW1lbnQuXG4gICAgICpcbiAgICAgKiBBdmFpbGFibGUgdHlwZXM6XG4gICAgICogYHNsaWRlcmAgLSBSZXdpbmRzIHNsaWRlciB0byB0aGUgc3RhcnQvZW5kIHdoZW4gaXQgcmVhY2hlcyB0aGUgZmlyc3Qgb3IgbGFzdCBzbGlkZS5cbiAgICAgKiBgY2Fyb3VzZWxgIC0gQ2hhbmdlcyBzbGlkZXMgd2l0aG91dCBzdGFydGluZyBvdmVyIHdoZW4gaXQgcmVhY2hlcyB0aGUgZmlyc3Qgb3IgbGFzdCBzbGlkZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgdHlwZTogJ3NsaWRlcicsXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBhdCBzcGVjaWZpYyBzbGlkZSBudW1iZXIgZGVmaW5lZCB3aXRoIHplcm8tYmFzZWQgaW5kZXguXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHN0YXJ0QXQ6IDAsXG5cbiAgICAvKipcbiAgICAgKiBBIG51bWJlciBvZiBzbGlkZXMgdmlzaWJsZSBvbiB0aGUgc2luZ2xlIHZpZXdwb3J0LlxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICBwZXJWaWV3OiAxLFxuXG4gICAgLyoqXG4gICAgICogRm9jdXMgY3VycmVudGx5IGFjdGl2ZSBzbGlkZSBhdCBhIHNwZWNpZmllZCBwb3NpdGlvbiBpbiB0aGUgdHJhY2suXG4gICAgICpcbiAgICAgKiBBdmFpbGFibGUgaW5wdXRzOlxuICAgICAqIGBjZW50ZXJgIC0gQ3VycmVudCBzbGlkZSB3aWxsIGJlIGFsd2F5cyBmb2N1c2VkIGF0IHRoZSBjZW50ZXIgb2YgYSB0cmFjay5cbiAgICAgKiBgMCwxLDIsMy4uLmAgLSBDdXJyZW50IHNsaWRlIHdpbGwgYmUgZm9jdXNlZCBvbiB0aGUgc3BlY2lmaWVkIHplcm8tYmFzZWQgaW5kZXguXG4gICAgICpcbiAgICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICAgKi9cbiAgICBmb2N1c0F0OiAwLFxuXG4gICAgLyoqXG4gICAgICogQSBzaXplIG9mIHRoZSBnYXAgYWRkZWQgYmV0d2VlbiBzbGlkZXMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdhcDogMTAsXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2Ugc2xpZGVzIGFmdGVyIGEgc3BlY2lmaWVkIGludGVydmFsLiBVc2UgYGZhbHNlYCBmb3IgdHVybmluZyBvZmYgYXV0b3BsYXkuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfEJvb2xlYW59XG4gICAgICovXG4gICAgYXV0b3BsYXk6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogU3RvcCBhdXRvcGxheSBvbiBtb3VzZW92ZXIgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBob3ZlcnBhdXNlOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQWxsb3cgZm9yIGNoYW5naW5nIHNsaWRlcyB3aXRoIGxlZnQgYW5kIHJpZ2h0IGtleWJvYXJkIGFycm93cy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqL1xuICAgIGtleWJvYXJkOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogU3RvcCBydW5uaW5nIGBwZXJWaWV3YCBudW1iZXIgb2Ygc2xpZGVzIGZyb20gdGhlIGVuZC4gVXNlIHRoaXNcbiAgICAgKiBvcHRpb24gaWYgeW91IGRvbid0IHdhbnQgdG8gaGF2ZSBhbiBlbXB0eSBzcGFjZSBhZnRlclxuICAgICAqIGEgc2xpZGVyLiBXb3JrcyBvbmx5IHdpdGggYHNsaWRlcmAgdHlwZSBhbmQgYVxuICAgICAqIG5vbi1jZW50ZXJlZCBgZm9jdXNBdGAgc2V0dGluZy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqL1xuICAgIGJvdW5kOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIE1pbmltYWwgc3dpcGUgZGlzdGFuY2UgbmVlZGVkIHRvIGNoYW5nZSB0aGUgc2xpZGUuIFVzZSBgZmFsc2VgIGZvciB0dXJuaW5nIG9mZiBhIHN3aXBpbmcuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfEJvb2xlYW59XG4gICAgICovXG4gICAgc3dpcGVUaHJlc2hvbGQ6IDgwLFxuXG4gICAgLyoqXG4gICAgICogTWluaW1hbCBtb3VzZSBkcmFnIGRpc3RhbmNlIG5lZWRlZCB0byBjaGFuZ2UgdGhlIHNsaWRlLiBVc2UgYGZhbHNlYCBmb3IgdHVybmluZyBvZmYgYSBkcmFnZ2luZy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ8Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBkcmFnVGhyZXNob2xkOiAxMjAsXG5cbiAgICAvKipcbiAgICAgKiBBIG1heGltdW0gbnVtYmVyIG9mIHNsaWRlcyB0byB3aGljaCBtb3ZlbWVudCB3aWxsIGJlIG1hZGUgb24gc3dpcGluZyBvciBkcmFnZ2luZy4gVXNlIGBmYWxzZWAgZm9yIHVubGltaXRlZC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ8Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBwZXJUb3VjaDogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBNb3ZpbmcgZGlzdGFuY2UgcmF0aW8gb2YgdGhlIHNsaWRlcyBvbiBhIHN3aXBpbmcgYW5kIGRyYWdnaW5nLlxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0b3VjaFJhdGlvOiAwLjUsXG5cbiAgICAvKipcbiAgICAgKiBBbmdsZSByZXF1aXJlZCB0byBhY3RpdmF0ZSBzbGlkZXMgbW92aW5nIG9uIHN3aXBpbmcgb3IgZHJhZ2dpbmcuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRvdWNoQW5nbGU6IDQ1LFxuXG4gICAgLyoqXG4gICAgICogRHVyYXRpb24gb2YgdGhlIGFuaW1hdGlvbiBpbiBtaWxsaXNlY29uZHMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIGFuaW1hdGlvbkR1cmF0aW9uOiA0MDAsXG5cbiAgICAvKipcbiAgICAgKiBBbGxvd3MgbG9vcGluZyB0aGUgYHNsaWRlcmAgdHlwZS4gU2xpZGVyIHdpbGwgcmV3aW5kIHRvIHRoZSBmaXJzdC9sYXN0IHNsaWRlIHdoZW4gaXQncyBhdCB0aGUgc3RhcnQvZW5kLlxuICAgICAqXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgcmV3aW5kOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogRHVyYXRpb24gb2YgdGhlIHJld2luZGluZyBhbmltYXRpb24gb2YgdGhlIGBzbGlkZXJgIHR5cGUgaW4gbWlsbGlzZWNvbmRzLlxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICByZXdpbmREdXJhdGlvbjogODAwLFxuXG4gICAgLyoqXG4gICAgICogRWFzaW5nIGZ1bmN0aW9uIGZvciB0aGUgYW5pbWF0aW9uLlxuICAgICAqXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBhbmltYXRpb25UaW1pbmdGdW5jOiAnY3ViaWMtYmV6aWVyKC4xNjUsIC44NDAsIC40NDAsIDEpJyxcblxuICAgIC8qKlxuICAgICAqIFRocm90dGxlIGNvc3RseSBldmVudHMgYXQgbW9zdCBvbmNlIHBlciBldmVyeSB3YWl0IG1pbGxpc2Vjb25kcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhyb3R0bGU6IDEwLFxuXG4gICAgLyoqXG4gICAgICogTW92aW5nIGRpcmVjdGlvbiBtb2RlLlxuICAgICAqXG4gICAgICogQXZhaWxhYmxlIGlucHV0czpcbiAgICAgKiAtICdsdHInIC0gbGVmdCB0byByaWdodCBtb3ZlbWVudCxcbiAgICAgKiAtICdydGwnIC0gcmlnaHQgdG8gbGVmdCBtb3ZlbWVudC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgZGlyZWN0aW9uOiAnbHRyJyxcblxuICAgIC8qKlxuICAgICAqIFRoZSBkaXN0YW5jZSB2YWx1ZSBvZiB0aGUgbmV4dCBhbmQgcHJldmlvdXMgdmlld3BvcnRzIHdoaWNoXG4gICAgICogaGF2ZSB0byBwZWVrIGluIHRoZSBjdXJyZW50IHZpZXcuIEFjY2VwdHMgbnVtYmVyIGFuZFxuICAgICAqIHBpeGVscyBhcyBhIHN0cmluZy4gTGVmdCBhbmQgcmlnaHQgcGVla2luZyBjYW4gYmVcbiAgICAgKiBzZXQgdXAgc2VwYXJhdGVseSB3aXRoIGEgZGlyZWN0aW9ucyBvYmplY3QuXG4gICAgICpcbiAgICAgKiBGb3IgZXhhbXBsZTpcbiAgICAgKiBgMTAwYCAtIFBlZWsgMTAwcHggb24gdGhlIGJvdGggc2lkZXMuXG4gICAgICogeyBiZWZvcmU6IDEwMCwgYWZ0ZXI6IDUwIH1gIC0gUGVlayAxMDBweCBvbiB0aGUgbGVmdCBzaWRlIGFuZCA1MHB4IG9uIHRoZSByaWdodCBzaWRlLlxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcnxTdHJpbmd8T2JqZWN0fVxuICAgICAqL1xuICAgIHBlZWs6IDAsXG5cbiAgICAvKipcbiAgICAgKiBDb2xsZWN0aW9uIG9mIG9wdGlvbnMgYXBwbGllZCBhdCBzcGVjaWZpZWQgbWVkaWEgYnJlYWtwb2ludHMuXG4gICAgICogRm9yIGV4YW1wbGU6IGRpc3BsYXkgdHdvIHNsaWRlcyBwZXIgdmlldyB1bmRlciA4MDBweC5cbiAgICAgKiBge1xuICAgICAqICAgJzgwMHB4Jzoge1xuICAgICAqICAgICBwZXJWaWV3OiAyXG4gICAgICogICB9XG4gICAgICogfWBcbiAgICAgKi9cbiAgICBicmVha3BvaW50czoge30sXG5cbiAgICAvKipcbiAgICAgKiBDb2xsZWN0aW9uIG9mIGludGVybmFsbHkgdXNlZCBIVE1MIGNsYXNzZXMuXG4gICAgICpcbiAgICAgKiBAdG9kbyBSZWZhY3RvciBgc2xpZGVyYCBhbmQgYGNhcm91c2VsYCBwcm9wZXJ0aWVzIHRvIHNpbmdsZSBgdHlwZTogeyBzbGlkZXI6ICcnLCBjYXJvdXNlbDogJycgfWAgb2JqZWN0XG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBjbGFzc2VzOiB7XG4gICAgICBkaXJlY3Rpb246IHtcbiAgICAgICAgbHRyOiAnZ2xpZGUtLWx0cicsXG4gICAgICAgIHJ0bDogJ2dsaWRlLS1ydGwnXG4gICAgICB9LFxuICAgICAgc2xpZGVyOiAnZ2xpZGUtLXNsaWRlcicsXG4gICAgICBjYXJvdXNlbDogJ2dsaWRlLS1jYXJvdXNlbCcsXG4gICAgICBzd2lwZWFibGU6ICdnbGlkZS0tc3dpcGVhYmxlJyxcbiAgICAgIGRyYWdnaW5nOiAnZ2xpZGUtLWRyYWdnaW5nJyxcbiAgICAgIGNsb25lU2xpZGU6ICdnbGlkZV9fc2xpZGUtLWNsb25lJyxcbiAgICAgIGFjdGl2ZU5hdjogJ2dsaWRlX19idWxsZXQtLWFjdGl2ZScsXG4gICAgICBhY3RpdmVTbGlkZTogJ2dsaWRlX19zbGlkZS0tYWN0aXZlJyxcbiAgICAgIGRpc2FibGVkQXJyb3c6ICdnbGlkZV9fYXJyb3ctLWRpc2FibGVkJ1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogT3V0cHV0cyB3YXJuaW5nIG1lc3NhZ2UgdG8gdGhlIGJvd3NlciBjb25zb2xlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG1zZ1xuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKi9cbiAgZnVuY3Rpb24gd2Fybihtc2cpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiW0dsaWRlIHdhcm5dOiBcIiArIG1zZyk7XG4gIH1cblxuICB2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICB9IDogZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICB9O1xuXG4gIHZhciBjbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gICAgfTtcbiAgfSgpO1xuXG4gIHZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH07XG5cbiAgdmFyIGdldCA9IGZ1bmN0aW9uIGdldChvYmplY3QsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaW5oZXJpdHMgPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgICB9XG5cbiAgICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG4gIH07XG5cbiAgdmFyIHBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4gPSBmdW5jdGlvbiAoc2VsZiwgY2FsbCkge1xuICAgIGlmICghc2VsZikge1xuICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB2YWx1ZSBlbnRlcmVkIGFzIG51bWJlclxuICAgKiBvciBzdHJpbmcgdG8gaW50ZWdlciB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuICBmdW5jdGlvbiB0b0ludCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdmFsdWUgZW50ZXJlZCBhcyBudW1iZXJcbiAgICogb3Igc3RyaW5nIHRvIGZsYXQgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gdG9GbG9hdCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0gIHsqfSAgIHZhbHVlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYW4gb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0gIHsqfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZVxuICAgKi9cbiAgZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YodmFsdWUpO1xuXG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISF2YWx1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1taXhlZC1vcGVyYXRvcnNcbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgbnVtYmVyLlxuICAgKlxuICAgKiBAcGFyYW0gIHsqfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaXNOdW1iZXIodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSAgeyp9IHZhbHVlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIHVuZGVmaW5lZC5cbiAgICpcbiAgICogQHBhcmFtICB7Kn0gdmFsdWVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCc7XG4gIH1cblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhbiBhcnJheS5cbiAgICpcbiAgICogQHBhcmFtICB7Kn0gdmFsdWVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGlzQXJyYXkodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIGluaXRpYWxpemVzIHNwZWNpZmllZCBjb2xsZWN0aW9uIG9mIGV4dGVuc2lvbnMuXG4gICAqIEVhY2ggZXh0ZW5zaW9uIHJlY2VpdmVzIGFjY2VzcyB0byBpbnN0YW5jZSBvZiBnbGlkZSBhbmQgcmVzdCBvZiBjb21wb25lbnRzLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZ2xpZGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGV4dGVuc2lvbnNcbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIGZ1bmN0aW9uIG1vdW50KGdsaWRlLCBleHRlbnNpb25zLCBldmVudHMpIHtcbiAgICB2YXIgY29tcG9uZW50cyA9IHt9O1xuXG4gICAgZm9yICh2YXIgbmFtZSBpbiBleHRlbnNpb25zKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbihleHRlbnNpb25zW25hbWVdKSkge1xuICAgICAgICBjb21wb25lbnRzW25hbWVdID0gZXh0ZW5zaW9uc1tuYW1lXShnbGlkZSwgY29tcG9uZW50cywgZXZlbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm4oJ0V4dGVuc2lvbiBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfbmFtZSBpbiBjb21wb25lbnRzKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbihjb21wb25lbnRzW19uYW1lXS5tb3VudCkpIHtcbiAgICAgICAgY29tcG9uZW50c1tfbmFtZV0ubW91bnQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29tcG9uZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIGdldHRlciBhbmQgc2V0dGVyIHByb3BlcnR5IG9uIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IG9iaiAgICAgICAgIE9iamVjdCB3aGVyZSBwcm9wZXJ0eSBoYXMgdG8gYmUgZGVmaW5lZC5cbiAgICogQHBhcmFtICB7U3RyaW5nfSBwcm9wICAgICAgICBOYW1lIG9mIHRoZSBkZWZpbmVkIHByb3BlcnR5LlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRlZmluaXRpb24gIEdldCBhbmQgc2V0IGRlZmluaXRpb25zIGZvciB0aGUgcHJvcGVydHkuXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiBkZWZpbmUob2JqLCBwcm9wLCBkZWZpbml0aW9uKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgZGVmaW5pdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogU29ydHMgYXBoYWJldGljYWxseSBvYmplY3Qga2V5cy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBvYmpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgZnVuY3Rpb24gc29ydEtleXMob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikuc29ydCgpLnJlZHVjZShmdW5jdGlvbiAociwgaykge1xuICAgICAgcltrXSA9IG9ialtrXTtcblxuICAgICAgcmV0dXJuIHJba10sIHI7XG4gICAgfSwge30pO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyBwYXNzZWQgc2V0dGluZ3Mgb2JqZWN0IHdpdGggZGVmYXVsdCBvcHRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRlZmF1bHRzXG4gICAqIEBwYXJhbSAge09iamVjdH0gc2V0dGluZ3NcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgZnVuY3Rpb24gbWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBzZXR0aW5ncykge1xuICAgIHZhciBvcHRpb25zID0gX2V4dGVuZHMoe30sIGRlZmF1bHRzLCBzZXR0aW5ncyk7XG5cbiAgICAvLyBgT2JqZWN0LmFzc2lnbmAgZG8gbm90IGRlZXBseSBtZXJnZSBvYmplY3RzLCBzbyB3ZVxuICAgIC8vIGhhdmUgdG8gZG8gaXQgbWFudWFsbHkgZm9yIGV2ZXJ5IG5lc3RlZCBvYmplY3RcbiAgICAvLyBpbiBvcHRpb25zLiBBbHRob3VnaCBpdCBkb2VzIG5vdCBsb29rIHNtYXJ0LFxuICAgIC8vIGl0J3Mgc21hbGxlciBhbmQgZmFzdGVyIHRoYW4gc29tZSBmYW5jeVxuICAgIC8vIG1lcmdpbmcgZGVlcC1tZXJnZSBhbGdvcml0aG0gc2NyaXB0LlxuICAgIGlmIChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnY2xhc3NlcycpKSB7XG4gICAgICBvcHRpb25zLmNsYXNzZXMgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdHMuY2xhc3Nlcywgc2V0dGluZ3MuY2xhc3Nlcyk7XG5cbiAgICAgIGlmIChzZXR0aW5ncy5jbGFzc2VzLmhhc093blByb3BlcnR5KCdkaXJlY3Rpb24nKSkge1xuICAgICAgICBvcHRpb25zLmNsYXNzZXMuZGlyZWN0aW9uID0gX2V4dGVuZHMoe30sIGRlZmF1bHRzLmNsYXNzZXMuZGlyZWN0aW9uLCBzZXR0aW5ncy5jbGFzc2VzLmRpcmVjdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdicmVha3BvaW50cycpKSB7XG4gICAgICBvcHRpb25zLmJyZWFrcG9pbnRzID0gX2V4dGVuZHMoe30sIGRlZmF1bHRzLmJyZWFrcG9pbnRzLCBzZXR0aW5ncy5icmVha3BvaW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH1cblxuICB2YXIgRXZlbnRzQnVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCBhIEV2ZW50QnVzIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50c1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIEV2ZW50c0J1cygpIHtcbiAgICAgIHZhciBldmVudHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgRXZlbnRzQnVzKTtcblxuICAgICAgdGhpcy5ldmVudHMgPSBldmVudHM7XG4gICAgICB0aGlzLmhvcCA9IGV2ZW50cy5oYXNPd25Qcm9wZXJ0eTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGxpc3RlbmVyIHRvIHRoZSBzcGVjaWZlZCBldmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBldmVudFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAgICAgKi9cblxuXG4gICAgY3JlYXRlQ2xhc3MoRXZlbnRzQnVzLCBbe1xuICAgICAga2V5OiAnb24nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICAgIGlmIChpc0FycmF5KGV2ZW50KSkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMub24oZXZlbnRbaV0sIGhhbmRsZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZXZlbnQncyBvYmplY3QgaWYgbm90IHlldCBjcmVhdGVkXG4gICAgICAgIGlmICghdGhpcy5ob3AuY2FsbCh0aGlzLmV2ZW50cywgZXZlbnQpKSB7XG4gICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgdGhlIGhhbmRsZXIgdG8gcXVldWVcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5ldmVudHNbZXZlbnRdLnB1c2goaGFuZGxlcikgLSAxO1xuXG4gICAgICAgIC8vIFByb3ZpZGUgaGFuZGxlIGJhY2sgZm9yIHJlbW92YWwgb2YgZXZlbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmV2ZW50c1tldmVudF1baW5kZXhdO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBSdW5zIHJlZ2lzdGVyZWQgaGFuZGxlcnMgZm9yIHNwZWNpZmllZCBldmVudC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gZXZlbnRcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0PX0gY29udGV4dFxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdlbWl0JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBlbWl0KGV2ZW50LCBjb250ZXh0KSB7XG4gICAgICAgIGlmIChpc0FycmF5KGV2ZW50KSkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChldmVudFtpXSwgY29udGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIGV2ZW50IGRvZXNuJ3QgZXhpc3QsIG9yIHRoZXJlJ3Mgbm8gaGFuZGxlcnMgaW4gcXVldWUsIGp1c3QgbGVhdmVcbiAgICAgICAgaWYgKCF0aGlzLmhvcC5jYWxsKHRoaXMuZXZlbnRzLCBldmVudCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDeWNsZSB0aHJvdWdoIGV2ZW50cyBxdWV1ZSwgZmlyZSFcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICBpdGVtKGNvbnRleHQgfHwge30pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIEV2ZW50c0J1cztcbiAgfSgpO1xuXG4gIHZhciBHbGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgZ2xpZGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHNlbGVjdG9yXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gICAgICovXG4gICAgZnVuY3Rpb24gR2xpZGUoc2VsZWN0b3IpIHtcbiAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIEdsaWRlKTtcblxuICAgICAgdGhpcy5fYyA9IHt9O1xuICAgICAgdGhpcy5fdCA9IFtdO1xuICAgICAgdGhpcy5fZSA9IG5ldyBFdmVudHNCdXMoKTtcblxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgdGhpcy5zZXR0aW5ncyA9IG1lcmdlT3B0aW9ucyhkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICB0aGlzLmluZGV4ID0gdGhpcy5zZXR0aW5ncy5zdGFydEF0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGdsaWRlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV4dGVuc2lvbnMgQ29sbGVjdGlvbiBvZiBleHRlbnNpb25zIHRvIGluaXRpYWxpemUuXG4gICAgICogQHJldHVybiB7R2xpZGV9XG4gICAgICovXG5cblxuICAgIGNyZWF0ZUNsYXNzKEdsaWRlLCBbe1xuICAgICAga2V5OiAnbW91bnQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1vdW50JCQxKCkge1xuICAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG5cbiAgICAgICAgdGhpcy5fZS5lbWl0KCdtb3VudC5iZWZvcmUnKTtcblxuICAgICAgICBpZiAoaXNPYmplY3QoZXh0ZW5zaW9ucykpIHtcbiAgICAgICAgICB0aGlzLl9jID0gbW91bnQodGhpcywgZXh0ZW5zaW9ucywgdGhpcy5fZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2FybignWW91IG5lZWQgdG8gcHJvdmlkZSBhIG9iamVjdCBvbiBgbW91bnQoKWAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2UuZW1pdCgnbW91bnQuYWZ0ZXInKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDb2xsZWN0cyBhbiBpbnN0YW5jZSBgdHJhbnNsYXRlYCB0cmFuc2Zvcm1lcnMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtICB7QXJyYXl9IHRyYW5zZm9ybWVycyBDb2xsZWN0aW9uIG9mIHRyYW5zZm9ybWVycy5cbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ211dGF0ZScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gbXV0YXRlKCkge1xuICAgICAgICB2YXIgdHJhbnNmb3JtZXJzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBbXTtcblxuICAgICAgICBpZiAoaXNBcnJheSh0cmFuc2Zvcm1lcnMpKSB7XG4gICAgICAgICAgdGhpcy5fdCA9IHRyYW5zZm9ybWVycztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3YXJuKCdZb3UgbmVlZCB0byBwcm92aWRlIGEgYXJyYXkgb24gYG11dGF0ZSgpYCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogVXBkYXRlcyBnbGlkZSB3aXRoIHNwZWNpZmllZCBzZXR0aW5ncy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3NcbiAgICAgICAqIEByZXR1cm4ge0dsaWRlfVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd1cGRhdGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICAgICAgICB0aGlzLnNldHRpbmdzID0gbWVyZ2VPcHRpb25zKHRoaXMuc2V0dGluZ3MsIHNldHRpbmdzKTtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3N0YXJ0QXQnKSkge1xuICAgICAgICAgIHRoaXMuaW5kZXggPSBzZXR0aW5ncy5zdGFydEF0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZS5lbWl0KCd1cGRhdGUnKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDaGFuZ2Ugc2xpZGUgd2l0aCBzcGVjaWZpZWQgcGF0dGVybi4gQSBwYXR0ZXJuIG11c3QgYmUgaW4gdGhlIHNwZWNpYWwgZm9ybWF0OlxuICAgICAgICogYD5gIC0gTW92ZSBvbmUgZm9yd2FyZFxuICAgICAgICogYDxgIC0gTW92ZSBvbmUgYmFja3dhcmRcbiAgICAgICAqIGA9e2l9YCAtIEdvIHRvIHtpfSB6ZXJvLWJhc2VkIHNsaWRlIChlcS4gJz0xJywgd2lsbCBnbyB0byBzZWNvbmQgc2xpZGUpXG4gICAgICAgKiBgPj5gIC0gUmV3aW5kcyB0byBlbmQgKGxhc3Qgc2xpZGUpXG4gICAgICAgKiBgPDxgIC0gUmV3aW5kcyB0byBzdGFydCAoZmlyc3Qgc2xpZGUpXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdHRlcm5cbiAgICAgICAqIEByZXR1cm4ge0dsaWRlfVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdnbycsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ28ocGF0dGVybikge1xuICAgICAgICB0aGlzLl9jLlJ1bi5tYWtlKHBhdHRlcm4pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIE1vdmUgdHJhY2sgYnkgc3BlY2lmaWVkIGRpc3RhbmNlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkaXN0YW5jZVxuICAgICAgICogQHJldHVybiB7R2xpZGV9XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ21vdmUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmUoZGlzdGFuY2UpIHtcbiAgICAgICAgdGhpcy5fYy5UcmFuc2l0aW9uLmRpc2FibGUoKTtcbiAgICAgICAgdGhpcy5fYy5Nb3ZlLm1ha2UoZGlzdGFuY2UpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIERlc3Ryb3kgaW5zdGFuY2UgYW5kIHJldmVydCBhbGwgY2hhbmdlcyBkb25lIGJ5IHRoaXMuX2MuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7R2xpZGV9XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Rlc3Ryb3knLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuX2UuZW1pdCgnZGVzdHJveScpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFN0YXJ0IGluc3RhbmNlIGF1dG9wbGF5aW5nLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbnxOdW1iZXJ9IGludGVydmFsIFJ1biBhdXRvcGxheWluZyB3aXRoIHBhc3NlZCBpbnRlcnZhbCByZWdhcmRsZXNzIG9mIGBhdXRvcGxheWAgc2V0dGluZ3NcbiAgICAgICAqIEByZXR1cm4ge0dsaWRlfVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdwbGF5JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBwbGF5KCkge1xuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IGZhbHNlO1xuXG4gICAgICAgIGlmIChpbnRlcnZhbCkge1xuICAgICAgICAgIHRoaXMuc2V0dGluZ3MuYXV0b3BsYXkgPSBpbnRlcnZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2UuZW1pdCgncGxheScpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFN0b3AgaW5zdGFuY2UgYXV0b3BsYXlpbmcuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7R2xpZGV9XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3BhdXNlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYXVzZSgpIHtcbiAgICAgICAgdGhpcy5fZS5lbWl0KCdwYXVzZScpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgZ2xpZGUgaW50byBhIGlkbGUgc3RhdHVzLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge0dsaWRlfVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdkaXNhYmxlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNhYmxlKCkge1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIGdsaWRlIGludG8gYSBhY3RpdmUgc3RhdHVzLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge0dsaWRlfVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdlbmFibGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVuYWJsZSgpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgY3V1dG9tIGV2ZW50IGxpc3RlbmVyIHdpdGggaGFuZGxlci5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gIHtTdHJpbmd8QXJyYXl9IGV2ZW50XG4gICAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAgICogQHJldHVybiB7R2xpZGV9XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ29uJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbihldmVudCwgaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9lLm9uKGV2ZW50LCBoYW5kbGVyKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDaGVja3MgaWYgZ2xpZGUgaXMgYSBwcmVjaXNlZCB0eXBlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnaXNUeXBlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc1R5cGUobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy50eXBlID09PSBuYW1lO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgdmFsdWUgb2YgdGhlIGNvcmUgb3B0aW9ucy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ3NldHRpbmdzJyxcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0JCQxKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHZhbHVlIG9mIHRoZSBjb3JlIG9wdGlvbnMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtICB7T2JqZWN0fSBvXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICAsXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCQkMShvKSB7XG4gICAgICAgIGlmIChpc09iamVjdChvKSkge1xuICAgICAgICAgIHRoaXMuX28gPSBvO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdhcm4oJ09wdGlvbnMgbXVzdCBiZSBhbiBgb2JqZWN0YCBpbnN0YW5jZS4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgY3VycmVudCBpbmRleCBvZiB0aGUgc2xpZGVyLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAga2V5OiAnaW5kZXgnLFxuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQkJDEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgY3VycmVudCBpbmRleCBhIHNsaWRlci5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgKi9cbiAgICAgICxcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0JCQxKGkpIHtcbiAgICAgICAgdGhpcy5faSA9IHRvSW50KGkpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgdHlwZSBuYW1lIG9mIHRoZSBzbGlkZXIuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICd0eXBlJyxcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0JCQxKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy50eXBlO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgdmFsdWUgb2YgdGhlIGlkbGUgc3RhdHVzLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Rpc2FibGVkJyxcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0JCQxKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHZhbHVlIG9mIHRoZSBpZGxlIHN0YXR1cy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICovXG4gICAgICAsXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCQkMShzdGF0dXMpIHtcbiAgICAgICAgdGhpcy5fZCA9ICEhc3RhdHVzO1xuICAgICAgfVxuICAgIH1dKTtcbiAgICByZXR1cm4gR2xpZGU7XG4gIH0oKTtcblxuICBmdW5jdGlvbiBSdW4gKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgICB2YXIgUnVuID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBJbml0aWFsaXplcyBhdXRvcnVubmluZyBvZiB0aGUgZ2xpZGUuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgICB0aGlzLl9vID0gZmFsc2U7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogTWFrZXMgZ2xpZGVzIHJ1bm5pbmcgYmFzZWQgb24gdGhlIHBhc3NlZCBtb3Zpbmcgc2NoZW1hLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtb3ZlXG4gICAgICAgKi9cbiAgICAgIG1ha2U6IGZ1bmN0aW9uIG1ha2UobW92ZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmICghR2xpZGUuZGlzYWJsZWQpIHtcbiAgICAgICAgICBHbGlkZS5kaXNhYmxlKCk7XG5cbiAgICAgICAgICB0aGlzLm1vdmUgPSBtb3ZlO1xuXG4gICAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bi5iZWZvcmUnLCB0aGlzLm1vdmUpO1xuXG4gICAgICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcblxuICAgICAgICAgIEV2ZW50cy5lbWl0KCdydW4nLCB0aGlzLm1vdmUpO1xuXG4gICAgICAgICAgQ29tcG9uZW50cy5UcmFuc2l0aW9uLmFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5pc1N0YXJ0KCkpIHtcbiAgICAgICAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bi5zdGFydCcsIF90aGlzLm1vdmUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoX3RoaXMuaXNFbmQoKSkge1xuICAgICAgICAgICAgICBFdmVudHMuZW1pdCgncnVuLmVuZCcsIF90aGlzLm1vdmUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoX3RoaXMuaXNPZmZzZXQoJzwnKSB8fCBfdGhpcy5pc09mZnNldCgnPicpKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9vID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bi5vZmZzZXQnLCBfdGhpcy5tb3ZlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bi5hZnRlcicsIF90aGlzLm1vdmUpO1xuXG4gICAgICAgICAgICBHbGlkZS5lbmFibGUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIENhbGN1bGF0ZXMgY3VycmVudCBpbmRleCBiYXNlZCBvbiBkZWZpbmVkIG1vdmUuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgY2FsY3VsYXRlOiBmdW5jdGlvbiBjYWxjdWxhdGUoKSB7XG4gICAgICAgIHZhciBtb3ZlID0gdGhpcy5tb3ZlLFxuICAgICAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIHZhciBzdGVwcyA9IG1vdmUuc3RlcHMsXG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBtb3ZlLmRpcmVjdGlvbjtcblxuXG4gICAgICAgIHZhciBjb3VudGFibGVTdGVwcyA9IGlzTnVtYmVyKHRvSW50KHN0ZXBzKSkgJiYgdG9JbnQoc3RlcHMpICE9PSAwO1xuXG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICBpZiAoc3RlcHMgPT09ICc+Jykge1xuICAgICAgICAgICAgICBHbGlkZS5pbmRleCA9IGxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0VuZCgpKSB7XG4gICAgICAgICAgICAgIGlmICghKEdsaWRlLmlzVHlwZSgnc2xpZGVyJykgJiYgIUdsaWRlLnNldHRpbmdzLnJld2luZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIEdsaWRlLmluZGV4ID0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjb3VudGFibGVTdGVwcykge1xuICAgICAgICAgICAgICBHbGlkZS5pbmRleCArPSBNYXRoLm1pbihsZW5ndGggLSBHbGlkZS5pbmRleCwgLXRvSW50KHN0ZXBzKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBHbGlkZS5pbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIGlmIChzdGVwcyA9PT0gJzwnKSB7XG4gICAgICAgICAgICAgIEdsaWRlLmluZGV4ID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1N0YXJ0KCkpIHtcbiAgICAgICAgICAgICAgaWYgKCEoR2xpZGUuaXNUeXBlKCdzbGlkZXInKSAmJiAhR2xpZGUuc2V0dGluZ3MucmV3aW5kKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX28gPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgR2xpZGUuaW5kZXggPSBsZW5ndGg7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY291bnRhYmxlU3RlcHMpIHtcbiAgICAgICAgICAgICAgR2xpZGUuaW5kZXggLT0gTWF0aC5taW4oR2xpZGUuaW5kZXgsIHRvSW50KHN0ZXBzKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBHbGlkZS5pbmRleC0tO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIEdsaWRlLmluZGV4ID0gc3RlcHM7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB3YXJuKCdJbnZhbGlkIGRpcmVjdGlvbiBwYXR0ZXJuIFsnICsgZGlyZWN0aW9uICsgc3RlcHMgKyAnXSBoYXMgYmVlbiB1c2VkJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIENoZWNrcyBpZiB3ZSBhcmUgb24gdGhlIGZpcnN0IHNsaWRlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgKi9cbiAgICAgIGlzU3RhcnQ6IGZ1bmN0aW9uIGlzU3RhcnQoKSB7XG4gICAgICAgIHJldHVybiBHbGlkZS5pbmRleCA9PT0gMDtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBDaGVja3MgaWYgd2UgYXJlIG9uIHRoZSBsYXN0IHNsaWRlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgKi9cbiAgICAgIGlzRW5kOiBmdW5jdGlvbiBpc0VuZCgpIHtcbiAgICAgICAgcmV0dXJuIEdsaWRlLmluZGV4ID09PSB0aGlzLmxlbmd0aDtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBDaGVja3MgaWYgd2UgYXJlIG1ha2luZyBhIG9mZnNldCBydW4uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvblxuICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAqL1xuICAgICAgaXNPZmZzZXQ6IGZ1bmN0aW9uIGlzT2Zmc2V0KGRpcmVjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5fbyAmJiB0aGlzLm1vdmUuZGlyZWN0aW9uID09PSBkaXJlY3Rpb247XG4gICAgICB9XG4gICAgfTtcblxuICAgIGRlZmluZShSdW4sICdtb3ZlJywge1xuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBtb3ZlIHNjaGVtYS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAgICovXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX207XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB2YWx1ZSBvZiB0aGUgbW92ZSBzY2hlbWEuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgICAqL1xuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcbiAgICAgICAgdmFyIHN0ZXAgPSB2YWx1ZS5zdWJzdHIoMSk7XG5cbiAgICAgICAgdGhpcy5fbSA9IHtcbiAgICAgICAgICBkaXJlY3Rpb246IHZhbHVlLnN1YnN0cigwLCAxKSxcbiAgICAgICAgICBzdGVwczogc3RlcCA/IHRvSW50KHN0ZXApID8gdG9JbnQoc3RlcCkgOiBzdGVwIDogMFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGVmaW5lKFJ1biwgJ2xlbmd0aCcsIHtcbiAgICAgIC8qKlxuICAgICAgICogR2V0cyB2YWx1ZSBvZiB0aGUgcnVubmluZyBkaXN0YW5jZSBiYXNlZFxuICAgICAgICogb24gemVyby1pbmRleGluZyBudW1iZXIgb2Ygc2xpZGVzLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuICAgICAgICB2YXIgbGVuZ3RoID0gQ29tcG9uZW50cy5IdG1sLnNsaWRlcy5sZW5ndGg7XG5cbiAgICAgICAgLy8gSWYgdGhlIGBib3VuZGAgb3B0aW9uIGlzIGFjaXR2ZSwgYSBtYXhpbXVtIHJ1bm5pbmcgZGlzdGFuY2Ugc2hvdWxkIGJlXG4gICAgICAgIC8vIHJlZHVjZWQgYnkgYHBlclZpZXdgIGFuZCBgZm9jdXNBdGAgc2V0dGluZ3MuIFJ1bm5pbmcgZGlzdGFuY2VcbiAgICAgICAgLy8gc2hvdWxkIGVuZCBiZWZvcmUgY3JlYXRpbmcgYW4gZW1wdHkgc3BhY2UgYWZ0ZXIgaW5zdGFuY2UuXG5cbiAgICAgICAgaWYgKEdsaWRlLmlzVHlwZSgnc2xpZGVyJykgJiYgc2V0dGluZ3MuZm9jdXNBdCAhPT0gJ2NlbnRlcicgJiYgc2V0dGluZ3MuYm91bmQpIHtcbiAgICAgICAgICByZXR1cm4gbGVuZ3RoIC0gMSAtICh0b0ludChzZXR0aW5ncy5wZXJWaWV3KSAtIDEpICsgdG9JbnQoc2V0dGluZ3MuZm9jdXNBdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGVuZ3RoIC0gMTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGRlZmluZShSdW4sICdvZmZzZXQnLCB7XG4gICAgICAvKipcbiAgICAgICAqIEdldHMgc3RhdHVzIG9mIHRoZSBvZmZzZXR0aW5nIGZsYWcuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFJ1bjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY3VycmVudCB0aW1lLlxuICAgKlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAqL1xuICBmdW5jdGlvbiBub3coKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkXG4gICAqIGF0IG1vc3Qgb25jZSBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY1xuICAgKiBAcGFyYW0ge051bWJlcn0gd2FpdFxuICAgKiBAcGFyYW0ge09iamVjdD19IG9wdGlvbnNcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlXG4gICAqL1xuICBmdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gICAgdmFyIHRpbWVvdXQgPSB2b2lkIDAsXG4gICAgICAgIGNvbnRleHQgPSB2b2lkIDAsXG4gICAgICAgIGFyZ3MgPSB2b2lkIDAsXG4gICAgICAgIHJlc3VsdCA9IHZvaWQgMDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24gbGF0ZXIoKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogbm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuXG4gICAgdmFyIHRocm90dGxlZCA9IGZ1bmN0aW9uIHRocm90dGxlZCgpIHtcbiAgICAgIHZhciBhdCA9IG5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IGF0O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAoYXQgLSBwcmV2aW91cyk7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBpZiAocmVtYWluaW5nIDw9IDAgfHwgcmVtYWluaW5nID4gd2FpdCkge1xuICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBwcmV2aW91cyA9IGF0O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICB0aHJvdHRsZWQuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgcHJldmlvdXMgPSAwO1xuICAgICAgdGltZW91dCA9IGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRocm90dGxlZDtcbiAgfVxuXG4gIHZhciBNQVJHSU5fVFlQRSA9IHtcbiAgICBsdHI6IFsnbWFyZ2luTGVmdCcsICdtYXJnaW5SaWdodCddLFxuICAgIHJ0bDogWydtYXJnaW5SaWdodCcsICdtYXJnaW5MZWZ0J11cbiAgfTtcblxuICBmdW5jdGlvbiBHYXBzIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gICAgdmFyIEdhcHMgPSB7XG4gICAgICAvKipcbiAgICAgICAqIEFwcGxpZXMgZ2FwcyBiZXR3ZWVuIHNsaWRlcy4gRmlyc3QgYW5kIGxhc3RcbiAgICAgICAqIHNsaWRlcyBkbyBub3QgcmVjZWl2ZSBpdCdzIGVkZ2UgbWFyZ2lucy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge0hUTUxDb2xsZWN0aW9ufSBzbGlkZXNcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIGFwcGx5OiBmdW5jdGlvbiBhcHBseShzbGlkZXMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNsaWRlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIHZhciBzdHlsZSA9IHNsaWRlc1tpXS5zdHlsZTtcbiAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gQ29tcG9uZW50cy5EaXJlY3Rpb24udmFsdWU7XG5cbiAgICAgICAgICBpZiAoaSAhPT0gMCkge1xuICAgICAgICAgICAgc3R5bGVbTUFSR0lOX1RZUEVbZGlyZWN0aW9uXVswXV0gPSB0aGlzLnZhbHVlIC8gMiArICdweCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlW01BUkdJTl9UWVBFW2RpcmVjdGlvbl1bMF1dID0gJyc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGkgIT09IHNsaWRlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBzdHlsZVtNQVJHSU5fVFlQRVtkaXJlY3Rpb25dWzFdXSA9IHRoaXMudmFsdWUgLyAyICsgJ3B4JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGVbTUFSR0lOX1RZUEVbZGlyZWN0aW9uXVsxXV0gPSAnJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIGdhcHMgZnJvbSB0aGUgc2xpZGVzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7SFRNTENvbGxlY3Rpb259IHNsaWRlc1xuICAgICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICAqL1xuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoc2xpZGVzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzbGlkZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB2YXIgc3R5bGUgPSBzbGlkZXNbaV0uc3R5bGU7XG5cbiAgICAgICAgICBzdHlsZS5tYXJnaW5MZWZ0ID0gJyc7XG4gICAgICAgICAgc3R5bGUubWFyZ2luUmlnaHQgPSAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBkZWZpbmUoR2FwcywgJ3ZhbHVlJywge1xuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBnYXAuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0b0ludChHbGlkZS5zZXR0aW5ncy5nYXApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGVmaW5lKEdhcHMsICdncm93Jywge1xuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIGFkZGl0aW9uYWwgZGltZW50aW9ucyB2YWx1ZSBjYXVzZWQgYnkgZ2Fwcy5cbiAgICAgICAqIFVzZWQgdG8gaW5jcmVhc2Ugd2lkdGggb2YgdGhlIHNsaWRlcyB3cmFwcGVyLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICAgKi9cbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gR2Fwcy52YWx1ZSAqIChDb21wb25lbnRzLlNpemVzLmxlbmd0aCAtIDEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGVmaW5lKEdhcHMsICdyZWR1Y3RvcicsIHtcbiAgICAgIC8qKlxuICAgICAgICogR2V0cyByZWR1Y3Rpb24gdmFsdWUgY2F1c2VkIGJ5IGdhcHMuXG4gICAgICAgKiBVc2VkIHRvIHN1YnRyYWN0IHdpZHRoIG9mIHRoZSBzbGlkZXMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHZhciBwZXJWaWV3ID0gR2xpZGUuc2V0dGluZ3MucGVyVmlldztcblxuICAgICAgICByZXR1cm4gR2Fwcy52YWx1ZSAqIChwZXJWaWV3IC0gMSkgLyBwZXJWaWV3O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQXBwbHkgY2FsY3VsYXRlZCBnYXBzOlxuICAgICAqIC0gYWZ0ZXIgYnVpbGRpbmcsIHNvIHNsaWRlcyAoaW5jbHVkaW5nIGNsb25lcykgd2lsbCByZWNlaXZlIHByb3BlciBtYXJnaW5zXG4gICAgICogLSBvbiB1cGRhdGluZyB2aWEgQVBJLCB0byByZWNhbGN1bGF0ZSBnYXBzIHdpdGggbmV3IG9wdGlvbnNcbiAgICAgKi9cbiAgICBFdmVudHMub24oWydidWlsZC5hZnRlcicsICd1cGRhdGUnXSwgdGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgICAgR2Fwcy5hcHBseShDb21wb25lbnRzLkh0bWwud3JhcHBlci5jaGlsZHJlbik7XG4gICAgfSwgMzApKTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBnYXBzOlxuICAgICAqIC0gb24gZGVzdHJveWluZyB0byBicmluZyBtYXJrdXAgdG8gaXRzIGluaXRhbCBzdGF0ZVxuICAgICAqL1xuICAgIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIEdhcHMucmVtb3ZlKENvbXBvbmVudHMuSHRtbC53cmFwcGVyLmNoaWxkcmVuKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBHYXBzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHNpYmxpbmdzIG5vZGVzIG9mIHRoZSBwYXNzZWQgbm9kZS5cbiAgICpcbiAgICogQHBhcmFtICB7RWxlbWVudH0gbm9kZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGZ1bmN0aW9uIHNpYmxpbmdzKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiBub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgIHZhciBuID0gbm9kZS5wYXJlbnROb2RlLmZpcnN0Q2hpbGQ7XG4gICAgICB2YXIgbWF0Y2hlZCA9IFtdO1xuXG4gICAgICBmb3IgKDsgbjsgbiA9IG4ubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgaWYgKG4ubm9kZVR5cGUgPT09IDEgJiYgbiAhPT0gbm9kZSkge1xuICAgICAgICAgIG1hdGNoZWQucHVzaChuKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICB9XG5cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHBhc3NlZCBub2RlIGV4aXN0IGFuZCBpcyBhIHZhbGlkIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSAge0VsZW1lbnR9IG5vZGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGV4aXN0KG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiBub2RlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxFbGVtZW50KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgVFJBQ0tfU0VMRUNUT1IgPSAnW2RhdGEtZ2xpZGUtZWw9XCJ0cmFja1wiXSc7XG5cbiAgZnVuY3Rpb24gSHRtbCAoR2xpZGUsIENvbXBvbmVudHMpIHtcbiAgICB2YXIgSHRtbCA9IHtcbiAgICAgIC8qKlxuICAgICAgICogU2V0dXAgc2xpZGVyIEhUTUwgbm9kZXMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtHbGlkZX0gZ2xpZGVcbiAgICAgICAqL1xuICAgICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgICB0aGlzLnJvb3QgPSBHbGlkZS5zZWxlY3RvcjtcbiAgICAgICAgdGhpcy50cmFjayA9IHRoaXMucm9vdC5xdWVyeVNlbGVjdG9yKFRSQUNLX1NFTEVDVE9SKTtcbiAgICAgICAgdGhpcy5zbGlkZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLndyYXBwZXIuY2hpbGRyZW4pLmZpbHRlcihmdW5jdGlvbiAoc2xpZGUpIHtcbiAgICAgICAgICByZXR1cm4gIXNsaWRlLmNsYXNzTGlzdC5jb250YWlucyhHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLmNsb25lU2xpZGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZGVmaW5lKEh0bWwsICdyb290Jywge1xuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIG5vZGUgb2YgdGhlIGdsaWRlIG1haW4gZWxlbWVudC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgKi9cbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gSHRtbC5fcjtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIG5vZGUgb2YgdGhlIGdsaWRlIG1haW4gZWxlbWVudC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgKi9cbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KHIpIHtcbiAgICAgICAgaWYgKGlzU3RyaW5nKHIpKSB7XG4gICAgICAgICAgciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iocik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXhpc3QocikpIHtcbiAgICAgICAgICBIdG1sLl9yID0gcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3YXJuKCdSb290IGVsZW1lbnQgbXVzdCBiZSBhIGV4aXN0aW5nIEh0bWwgbm9kZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBkZWZpbmUoSHRtbCwgJ3RyYWNrJywge1xuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIG5vZGUgb2YgdGhlIGdsaWRlIHRyYWNrIHdpdGggc2xpZGVzLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiBIdG1sLl90O1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgbm9kZSBvZiB0aGUgZ2xpZGUgdHJhY2sgd2l0aCBzbGlkZXMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICovXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh0KSB7XG4gICAgICAgIGlmIChleGlzdCh0KSkge1xuICAgICAgICAgIEh0bWwuX3QgPSB0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdhcm4oJ0NvdWxkIG5vdCBmaW5kIHRyYWNrIGVsZW1lbnQuIFBsZWFzZSB1c2UgJyArIFRSQUNLX1NFTEVDVE9SICsgJyBhdHRyaWJ1dGUuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGRlZmluZShIdG1sLCAnd3JhcHBlcicsIHtcbiAgICAgIC8qKlxuICAgICAgICogR2V0cyBub2RlIG9mIHRoZSBzbGlkZXMgd3JhcHBlci5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgKi9cbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gSHRtbC50cmFjay5jaGlsZHJlblswXTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBIdG1sO1xuICB9XG5cbiAgZnVuY3Rpb24gUGVlayAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAgIHZhciBQZWVrID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBTZXR1cHMgaG93IG11Y2ggdG8gcGVlayBiYXNlZCBvbiBzZXR0aW5ncy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBHbGlkZS5zZXR0aW5ncy5wZWVrO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBkZWZpbmUoUGVlaywgJ3ZhbHVlJywge1xuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBwZWVrLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtOdW1iZXJ8T2JqZWN0fVxuICAgICAgICovXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIFBlZWsuX3Y7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB2YWx1ZSBvZiB0aGUgcGVlay5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IHZhbHVlXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUuYmVmb3JlID0gdG9JbnQodmFsdWUuYmVmb3JlKTtcbiAgICAgICAgICB2YWx1ZS5hZnRlciA9IHRvSW50KHZhbHVlLmFmdGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IHRvSW50KHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFBlZWsuX3YgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGRlZmluZShQZWVrLCAncmVkdWN0b3InLCB7XG4gICAgICAvKipcbiAgICAgICAqIEdldHMgcmVkdWN0aW9uIHZhbHVlIGNhdXNlZCBieSBwZWVrLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICAgKi9cbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBQZWVrLnZhbHVlO1xuICAgICAgICB2YXIgcGVyVmlldyA9IEdsaWRlLnNldHRpbmdzLnBlclZpZXc7XG5cbiAgICAgICAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZS5iZWZvcmUgLyBwZXJWaWV3ICsgdmFsdWUuYWZ0ZXIgLyBwZXJWaWV3O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlICogMiAvIHBlclZpZXc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWNhbGN1bGF0ZSBwZWVraW5nIHNpemVzIG9uOlxuICAgICAqIC0gd2hlbiByZXNpemluZyB3aW5kb3cgdG8gdXBkYXRlIHRvIHByb3BlciBwZXJjZW50c1xuICAgICAqL1xuICAgIEV2ZW50cy5vbihbJ3Jlc2l6ZScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgICAgUGVlay5tb3VudCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFBlZWs7XG4gIH1cblxuICBmdW5jdGlvbiBNb3ZlIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gICAgdmFyIE1vdmUgPSB7XG4gICAgICAvKipcbiAgICAgICAqIENvbnN0cnVjdHMgbW92ZSBjb21wb25lbnQuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgICAgdGhpcy5fbyA9IDA7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FsY3VsYXRlcyBhIG1vdmVtZW50IHZhbHVlIGJhc2VkIG9uIHBhc3NlZCBvZmZzZXQgYW5kIGN1cnJlbnRseSBhY3RpdmUgaW5kZXguXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtICB7TnVtYmVyfSBvZmZzZXRcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIG1ha2U6IGZ1bmN0aW9uIG1ha2UoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIG9mZnNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMDtcblxuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcblxuICAgICAgICBFdmVudHMuZW1pdCgnbW92ZScsIHtcbiAgICAgICAgICBtb3ZlbWVudDogdGhpcy52YWx1ZVxuICAgICAgICB9KTtcblxuICAgICAgICBDb21wb25lbnRzLlRyYW5zaXRpb24uYWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIEV2ZW50cy5lbWl0KCdtb3ZlLmFmdGVyJywge1xuICAgICAgICAgICAgbW92ZW1lbnQ6IF90aGlzLnZhbHVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBkZWZpbmUoTW92ZSwgJ29mZnNldCcsIHtcbiAgICAgIC8qKlxuICAgICAgICogR2V0cyBhbiBvZmZzZXQgdmFsdWUgdXNlZCB0byBtb2RpZnkgY3VycmVudCB0cmFuc2xhdGUuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICovXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIE1vdmUuX287XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyBhbiBvZmZzZXQgdmFsdWUgdXNlZCB0byBtb2RpZnkgY3VycmVudCB0cmFuc2xhdGUuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICovXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgICBNb3ZlLl9vID0gIWlzVW5kZWZpbmVkKHZhbHVlKSA/IHRvSW50KHZhbHVlKSA6IDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBkZWZpbmUoTW92ZSwgJ3RyYW5zbGF0ZScsIHtcbiAgICAgIC8qKlxuICAgICAgICogR2V0cyBhIHJhdyBtb3ZlbWVudCB2YWx1ZS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICAgKi9cbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoICogR2xpZGUuaW5kZXg7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBkZWZpbmUoTW92ZSwgJ3ZhbHVlJywge1xuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIGFuIGFjdHVhbCBtb3ZlbWVudCB2YWx1ZSBjb3JyZWN0ZWQgYnkgb2Zmc2V0LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLm9mZnNldDtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZSA9IHRoaXMudHJhbnNsYXRlO1xuXG4gICAgICAgIGlmIChDb21wb25lbnRzLkRpcmVjdGlvbi5pcygncnRsJykpIHtcbiAgICAgICAgICByZXR1cm4gdHJhbnNsYXRlICsgb2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZSAtIG9mZnNldDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIE1ha2UgbW92ZW1lbnQgdG8gcHJvcGVyIHNsaWRlIG9uOlxuICAgICAqIC0gYmVmb3JlIGJ1aWxkLCBzbyBnbGlkZSB3aWxsIHN0YXJ0IGF0IGBzdGFydEF0YCBpbmRleFxuICAgICAqIC0gb24gZWFjaCBzdGFuZGFyZCBydW4gdG8gbW92ZSB0byBuZXdseSBjYWxjdWxhdGVkIGluZGV4XG4gICAgICovXG4gICAgRXZlbnRzLm9uKFsnYnVpbGQuYmVmb3JlJywgJ3J1biddLCBmdW5jdGlvbiAoKSB7XG4gICAgICBNb3ZlLm1ha2UoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBNb3ZlO1xuICB9XG5cbiAgZnVuY3Rpb24gU2l6ZXMgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgICB2YXIgU2l6ZXMgPSB7XG4gICAgICAvKipcbiAgICAgICAqIFNldHVwcyBkaW1lbnRpb25zIG9mIHNsaWRlcy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBzZXR1cFNsaWRlczogZnVuY3Rpb24gc2V0dXBTbGlkZXMoKSB7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuc2xpZGVXaWR0aCArICdweCc7XG4gICAgICAgIHZhciBzbGlkZXMgPSBDb21wb25lbnRzLkh0bWwuc2xpZGVzO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgc2xpZGVzW2ldLnN0eWxlLndpZHRoID0gd2lkdGg7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXR1cHMgZGltZW50aW9ucyBvZiBzbGlkZXMgd3JhcHBlci5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBzZXR1cFdyYXBwZXI6IGZ1bmN0aW9uIHNldHVwV3JhcHBlcihkaW1lbnRpb24pIHtcbiAgICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUud2lkdGggPSB0aGlzLndyYXBwZXJTaXplICsgJ3B4JztcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIGFwcGxpZWQgc3R5bGVzIGZyb20gSFRNTCBlbGVtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgIHZhciBzbGlkZXMgPSBDb21wb25lbnRzLkh0bWwuc2xpZGVzO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgc2xpZGVzW2ldLnN0eWxlLndpZHRoID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS53aWR0aCA9ICcnO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBkZWZpbmUoU2l6ZXMsICdsZW5ndGgnLCB7XG4gICAgICAvKipcbiAgICAgICAqIEdldHMgY291bnQgbnVtYmVyIG9mIHRoZSBzbGlkZXMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAgICovXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIENvbXBvbmVudHMuSHRtbC5zbGlkZXMubGVuZ3RoO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGVmaW5lKFNpemVzLCAnd2lkdGgnLCB7XG4gICAgICAvKipcbiAgICAgICAqIEdldHMgd2lkdGggdmFsdWUgb2YgdGhlIGdsaWRlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiBDb21wb25lbnRzLkh0bWwucm9vdC5vZmZzZXRXaWR0aDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGRlZmluZShTaXplcywgJ3dyYXBwZXJTaXplJywge1xuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIHNpemUgb2YgdGhlIHNsaWRlcyB3cmFwcGVyLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiBTaXplcy5zbGlkZVdpZHRoICogU2l6ZXMubGVuZ3RoICsgQ29tcG9uZW50cy5HYXBzLmdyb3cgKyBDb21wb25lbnRzLkNsb25lcy5ncm93O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGVmaW5lKFNpemVzLCAnc2xpZGVXaWR0aCcsIHtcbiAgICAgIC8qKlxuICAgICAgICogR2V0cyB3aWR0aCB2YWx1ZSBvZiB0aGUgc2luZ2xlIHNsaWRlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiBTaXplcy53aWR0aCAvIEdsaWRlLnNldHRpbmdzLnBlclZpZXcgLSBDb21wb25lbnRzLlBlZWsucmVkdWN0b3IgLSBDb21wb25lbnRzLkdhcHMucmVkdWN0b3I7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBcHBseSBjYWxjdWxhdGVkIGdsaWRlJ3MgZGltZW5zaW9uczpcbiAgICAgKiAtIGJlZm9yZSBidWlsZGluZywgc28gb3RoZXIgZGltZW50aW9ucyAoZS5nLiB0cmFuc2xhdGUpIHdpbGwgYmUgY2FsY3VsYXRlZCBwcm9wZXJ0bHlcbiAgICAgKiAtIHdoZW4gcmVzaXppbmcgd2luZG93IHRvIHJlY2FsY3VsYXRlIHNpbGRlcyBkaW1lbnNpb25zXG4gICAgICogLSBvbiB1cGRhdGluZyB2aWEgQVBJLCB0byBjYWxjdWxhdGUgZGltZW5zaW9ucyBiYXNlZCBvbiBuZXcgb3B0aW9uc1xuICAgICAqL1xuICAgIEV2ZW50cy5vbihbJ2J1aWxkLmJlZm9yZScsICdyZXNpemUnLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICAgIFNpemVzLnNldHVwU2xpZGVzKCk7XG4gICAgICBTaXplcy5zZXR1cFdyYXBwZXIoKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjYWxjdWxhdGVkIGdsaWRlJ3MgZGltZW5zaW9uczpcbiAgICAgKiAtIG9uIGRlc3RvdGluZyB0byBicmluZyBtYXJrdXAgdG8gaXRzIGluaXRhbCBzdGF0ZVxuICAgICAqL1xuICAgIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIFNpemVzLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFNpemVzO1xuICB9XG5cbiAgZnVuY3Rpb24gQnVpbGQgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgICB2YXIgQnVpbGQgPSB7XG4gICAgICAvKipcbiAgICAgICAqIEluaXQgZ2xpZGUgYnVpbGRpbmcuIEFkZHMgY2xhc3Nlcywgc2V0c1xuICAgICAgICogZGltZW5zaW9ucyBhbmQgc2V0dXBzIGluaXRpYWwgc3RhdGUuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgICBFdmVudHMuZW1pdCgnYnVpbGQuYmVmb3JlJyk7XG5cbiAgICAgICAgdGhpcy50eXBlQ2xhc3MoKTtcbiAgICAgICAgdGhpcy5hY3RpdmVDbGFzcygpO1xuXG4gICAgICAgIEV2ZW50cy5lbWl0KCdidWlsZC5hZnRlcicpO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgYHR5cGVgIGNsYXNzIHRvIHRoZSBnbGlkZSBlbGVtZW50LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHR5cGVDbGFzczogZnVuY3Rpb24gdHlwZUNsYXNzKCkge1xuICAgICAgICBDb21wb25lbnRzLkh0bWwucm9vdC5jbGFzc0xpc3QuYWRkKEdsaWRlLnNldHRpbmdzLmNsYXNzZXNbR2xpZGUuc2V0dGluZ3MudHlwZV0pO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgYWN0aXZlIGNsYXNzIHRvIGN1cnJlbnQgc2xpZGUuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgYWN0aXZlQ2xhc3M6IGZ1bmN0aW9uIGFjdGl2ZUNsYXNzKCkge1xuICAgICAgICB2YXIgY2xhc3NlcyA9IEdsaWRlLnNldHRpbmdzLmNsYXNzZXM7XG4gICAgICAgIHZhciBzbGlkZSA9IENvbXBvbmVudHMuSHRtbC5zbGlkZXNbR2xpZGUuaW5kZXhdO1xuXG4gICAgICAgIGlmIChzbGlkZSkge1xuICAgICAgICAgIHNsaWRlLmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5hY3RpdmVTbGlkZSk7XG5cbiAgICAgICAgICBzaWJsaW5ncyhzbGlkZSkuZm9yRWFjaChmdW5jdGlvbiAoc2libGluZykge1xuICAgICAgICAgICAgc2libGluZy5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzZXMuYWN0aXZlU2xpZGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyBIVE1MIGNsYXNzZXMgYXBwbGllZCBhdCBidWlsZGluZy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICByZW1vdmVDbGFzc2VzOiBmdW5jdGlvbiByZW1vdmVDbGFzc2VzKCkge1xuICAgICAgICB2YXIgY2xhc3NlcyA9IEdsaWRlLnNldHRpbmdzLmNsYXNzZXM7XG5cbiAgICAgICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LnJlbW92ZShjbGFzc2VzW0dsaWRlLnNldHRpbmdzLnR5cGVdKTtcblxuICAgICAgICBDb21wb25lbnRzLkh0bWwuc2xpZGVzLmZvckVhY2goZnVuY3Rpb24gKHNpYmxpbmcpIHtcbiAgICAgICAgICBzaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3Nlcy5hY3RpdmVTbGlkZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDbGVhciBidWlsZGluZyBjbGFzc2VzOlxuICAgICAqIC0gb24gZGVzdHJveWluZyB0byBicmluZyBIVE1MIHRvIGl0cyBpbml0aWFsIHN0YXRlXG4gICAgICogLSBvbiB1cGRhdGluZyB0byByZW1vdmUgY2xhc3NlcyBiZWZvcmUgcmVtb3VudGluZyBjb21wb25lbnRcbiAgICAgKi9cbiAgICBFdmVudHMub24oWydkZXN0cm95JywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgICBCdWlsZC5yZW1vdmVDbGFzc2VzKCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdW50IGNvbXBvbmVudDpcbiAgICAgKiAtIG9uIHJlc2l6aW5nIG9mIHRoZSB3aW5kb3cgdG8gY2FsY3VsYXRlIG5ldyBkaW1lbnRpb25zXG4gICAgICogLSBvbiB1cGRhdGluZyBzZXR0aW5ncyB2aWEgQVBJXG4gICAgICovXG4gICAgRXZlbnRzLm9uKFsncmVzaXplJywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgICBCdWlsZC5tb3VudCgpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogU3dhcCBhY3RpdmUgY2xhc3Mgb2YgY3VycmVudCBzbGlkZTpcbiAgICAgKiAtIGFmdGVyIGVhY2ggbW92ZSB0byB0aGUgbmV3IGluZGV4XG4gICAgICovXG4gICAgRXZlbnRzLm9uKCdtb3ZlLmFmdGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgQnVpbGQuYWN0aXZlQ2xhc3MoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBCdWlsZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENsb25lcyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAgIHZhciBDbG9uZXMgPSB7XG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBwYXR0ZXJuIG1hcCBhbmQgY29sbGVjdCBzbGlkZXMgdG8gYmUgY2xvbmVkLlxuICAgICAgICovXG4gICAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcblxuICAgICAgICBpZiAoR2xpZGUuaXNUeXBlKCdjYXJvdXNlbCcpKSB7XG4gICAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuY29sbGVjdCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogQ29sbGVjdCBjbG9uZXMgd2l0aCBwYXR0ZXJuLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIGNvbGxlY3Q6IGZ1bmN0aW9uIGNvbGxlY3QoKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogW107XG4gICAgICAgIHZhciBzbGlkZXMgPSBDb21wb25lbnRzLkh0bWwuc2xpZGVzO1xuICAgICAgICB2YXIgX0dsaWRlJHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3MsXG4gICAgICAgICAgICBwZXJWaWV3ID0gX0dsaWRlJHNldHRpbmdzLnBlclZpZXcsXG4gICAgICAgICAgICBjbGFzc2VzID0gX0dsaWRlJHNldHRpbmdzLmNsYXNzZXM7XG5cblxuICAgICAgICB2YXIgcGVla0luY3JlbWVudGVyID0gKyEhR2xpZGUuc2V0dGluZ3MucGVlaztcbiAgICAgICAgdmFyIHBhcnQgPSBwZXJWaWV3ICsgcGVla0luY3JlbWVudGVyO1xuICAgICAgICB2YXIgc3RhcnQgPSBzbGlkZXMuc2xpY2UoMCwgcGFydCk7XG4gICAgICAgIHZhciBlbmQgPSBzbGlkZXMuc2xpY2UoLXBhcnQpO1xuXG4gICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihwZXJWaWV3IC8gc2xpZGVzLmxlbmd0aCkpOyByKyspIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXJ0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2xvbmUgPSBzdGFydFtpXS5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIGNsb25lLmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5jbG9uZVNsaWRlKTtcblxuICAgICAgICAgICAgaXRlbXMucHVzaChjbG9uZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGVuZC5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBfY2xvbmUgPSBlbmRbX2ldLmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgX2Nsb25lLmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5jbG9uZVNsaWRlKTtcblxuICAgICAgICAgICAgaXRlbXMudW5zaGlmdChfY2xvbmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBBcHBlbmQgY2xvbmVkIHNsaWRlcyB3aXRoIGdlbmVyYXRlZCBwYXR0ZXJuLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIGFwcGVuZDogZnVuY3Rpb24gYXBwZW5kKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLml0ZW1zO1xuICAgICAgICB2YXIgX0NvbXBvbmVudHMkSHRtbCA9IENvbXBvbmVudHMuSHRtbCxcbiAgICAgICAgICAgIHdyYXBwZXIgPSBfQ29tcG9uZW50cyRIdG1sLndyYXBwZXIsXG4gICAgICAgICAgICBzbGlkZXMgPSBfQ29tcG9uZW50cyRIdG1sLnNsaWRlcztcblxuXG4gICAgICAgIHZhciBoYWxmID0gTWF0aC5mbG9vcihpdGVtcy5sZW5ndGggLyAyKTtcbiAgICAgICAgdmFyIHByZXBlbmQgPSBpdGVtcy5zbGljZSgwLCBoYWxmKS5yZXZlcnNlKCk7XG4gICAgICAgIHZhciBhcHBlbmQgPSBpdGVtcy5zbGljZShoYWxmLCBpdGVtcy5sZW5ndGgpO1xuICAgICAgICB2YXIgd2lkdGggPSBDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGggKyAncHgnO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBwZW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChhcHBlbmRbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgcHJlcGVuZC5sZW5ndGg7IF9pMisrKSB7XG4gICAgICAgICAgd3JhcHBlci5pbnNlcnRCZWZvcmUocHJlcGVuZFtfaTJdLCBzbGlkZXNbMF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgaXRlbXMubGVuZ3RoOyBfaTMrKykge1xuICAgICAgICAgIGl0ZW1zW19pM10uc3R5bGUud2lkdGggPSB3aWR0aDtcbiAgICAgICAgfVxuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFJlbW92ZSBhbGwgY2xvbmVkIHNsaWRlcy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gdGhpcy5pdGVtcztcblxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5yZW1vdmVDaGlsZChpdGVtc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZGVmaW5lKENsb25lcywgJ2dyb3cnLCB7XG4gICAgICAvKipcbiAgICAgICAqIEdldHMgYWRkaXRpb25hbCBkaW1lbnRpb25zIHZhbHVlIGNhdXNlZCBieSBjbG9uZXMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAgICovXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIChDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGggKyBDb21wb25lbnRzLkdhcHMudmFsdWUpICogQ2xvbmVzLml0ZW1zLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFwcGVuZCBhZGRpdGlvbmFsIHNsaWRlJ3MgY2xvbmVzOlxuICAgICAqIC0gd2hpbGUgZ2xpZGUncyB0eXBlIGlzIGBjYXJvdXNlbGBcbiAgICAgKi9cbiAgICBFdmVudHMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIENsb25lcy5yZW1vdmUoKTtcbiAgICAgIENsb25lcy5tb3VudCgpO1xuICAgICAgQ2xvbmVzLmFwcGVuZCgpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQXBwZW5kIGFkZGl0aW9uYWwgc2xpZGUncyBjbG9uZXM6XG4gICAgICogLSB3aGlsZSBnbGlkZSdzIHR5cGUgaXMgYGNhcm91c2VsYFxuICAgICAqL1xuICAgIEV2ZW50cy5vbignYnVpbGQuYmVmb3JlJywgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKEdsaWRlLmlzVHlwZSgnY2Fyb3VzZWwnKSkge1xuICAgICAgICBDbG9uZXMuYXBwZW5kKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2xvbmVzIEhUTUxFbGVtZW50czpcbiAgICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGJyaW5nIEhUTUwgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICAgKi9cbiAgICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICBDbG9uZXMucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gQ2xvbmVzO1xuICB9XG5cbiAgdmFyIEV2ZW50c0JpbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSBFdmVudHNCaW5kZXIgaW5zdGFuY2UuXG4gICAgICovXG4gICAgZnVuY3Rpb24gRXZlbnRzQmluZGVyKCkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBFdmVudHNCaW5kZXIpO1xuXG4gICAgICB0aGlzLmxpc3RlbmVycyA9IGxpc3RlbmVycztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGV2ZW50cyBsaXN0ZW5lcnMgdG8gYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8QXJyYXl9IGV2ZW50c1xuICAgICAqIEBwYXJhbSAge0VsZW1lbnR8V2luZG93fERvY3VtZW50fSBlbFxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjbG9zdXJlXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbnxPYmplY3R9IGNhcHR1cmVcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuXG5cbiAgICBjcmVhdGVDbGFzcyhFdmVudHNCaW5kZXIsIFt7XG4gICAgICBrZXk6ICdvbicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb24oZXZlbnRzLCBlbCwgY2xvc3VyZSkge1xuICAgICAgICB2YXIgY2FwdHVyZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogZmFsc2U7XG5cbiAgICAgICAgaWYgKGlzU3RyaW5nKGV2ZW50cykpIHtcbiAgICAgICAgICBldmVudHMgPSBbZXZlbnRzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRzW2ldXSA9IGNsb3N1cmU7XG5cbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50c1tpXSwgdGhpcy5saXN0ZW5lcnNbZXZlbnRzW2ldXSwgY2FwdHVyZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIGV2ZW50IGxpc3RlbmVycyBmcm9tIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheX0gZXZlbnRzXG4gICAgICAgKiBAcGFyYW0gIHtFbGVtZW50fFdpbmRvd3xEb2N1bWVudH0gZWxcbiAgICAgICAqIEBwYXJhbSAge0Jvb2xlYW58T2JqZWN0fSBjYXB0dXJlXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICBrZXk6ICdvZmYnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9mZihldmVudHMsIGVsKSB7XG4gICAgICAgIHZhciBjYXB0dXJlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcblxuICAgICAgICBpZiAoaXNTdHJpbmcoZXZlbnRzKSkge1xuICAgICAgICAgIGV2ZW50cyA9IFtldmVudHNdO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50c1tpXSwgdGhpcy5saXN0ZW5lcnNbZXZlbnRzW2ldXSwgY2FwdHVyZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBEZXN0cm95IGNvbGxlY3RlZCBsaXN0ZW5lcnMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Rlc3Ryb3knLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmxpc3RlbmVycztcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIEV2ZW50c0JpbmRlcjtcbiAgfSgpO1xuXG4gIGZ1bmN0aW9uIFJlc2l6ZSAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAgIC8qKlxuICAgICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgICAqL1xuICAgIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG5cbiAgICB2YXIgUmVzaXplID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBJbml0aWFsaXplcyB3aW5kb3cgYmluZGluZ3MuXG4gICAgICAgKi9cbiAgICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogQmluZHMgYHJlenNpemVgIGxpc3RlbmVyIHRvIHRoZSB3aW5kb3cuXG4gICAgICAgKiBJdCdzIGEgY29zdGx5IGV2ZW50LCBzbyB3ZSBhcmUgZGVib3VuY2luZyBpdC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgICAgICBCaW5kZXIub24oJ3Jlc2l6ZScsIHdpbmRvdywgdGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIEV2ZW50cy5lbWl0KCdyZXNpemUnKTtcbiAgICAgICAgfSwgR2xpZGUuc2V0dGluZ3MudGhyb3R0bGUpKTtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBVbmJpbmRzIGxpc3RlbmVycyBmcm9tIHRoZSB3aW5kb3cuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICAgIEJpbmRlci5vZmYoJ3Jlc2l6ZScsIHdpbmRvdyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBiaW5kaW5ncyBmcm9tIHdpbmRvdzpcbiAgICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIHJlbW92ZSBhZGRlZCBFdmVudExpc3RlbmVyXG4gICAgICovXG4gICAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgUmVzaXplLnVuYmluZCgpO1xuICAgICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBSZXNpemU7XG4gIH1cblxuICB2YXIgVkFMSURfRElSRUNUSU9OUyA9IFsnbHRyJywgJ3J0bCddO1xuICB2YXIgRkxJUEVEX01PVkVNRU5UUyA9IHtcbiAgICAnPic6ICc8JyxcbiAgICAnPCc6ICc+JyxcbiAgICAnPSc6ICc9J1xuICB9O1xuXG4gIGZ1bmN0aW9uIERpcmVjdGlvbiAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAgIHZhciBEaXJlY3Rpb24gPSB7XG4gICAgICAvKipcbiAgICAgICAqIFNldHVwcyBnYXAgdmFsdWUgYmFzZWQgb24gc2V0dGluZ3MuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gR2xpZGUuc2V0dGluZ3MuZGlyZWN0aW9uO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFJlc29sdmVzIHBhdHRlcm4gYmFzZWQgb24gZGlyZWN0aW9uIHZhbHVlXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdHRlcm5cbiAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICAgKi9cbiAgICAgIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUocGF0dGVybikge1xuICAgICAgICB2YXIgdG9rZW4gPSBwYXR0ZXJuLnNsaWNlKDAsIDEpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzKCdydGwnKSkge1xuICAgICAgICAgIHJldHVybiBwYXR0ZXJuLnNwbGl0KHRva2VuKS5qb2luKEZMSVBFRF9NT1ZFTUVOVFNbdG9rZW5dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXR0ZXJuO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIENoZWNrcyB2YWx1ZSBvZiBkaXJlY3Rpb24gbW9kZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uXG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgICAqL1xuICAgICAgaXM6IGZ1bmN0aW9uIGlzKGRpcmVjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gZGlyZWN0aW9uO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIEFwcGxpZXMgZGlyZWN0aW9uIGNsYXNzIHRvIHRoZSByb290IEhUTUwgZWxlbWVudC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBhZGRDbGFzczogZnVuY3Rpb24gYWRkQ2xhc3MoKSB7XG4gICAgICAgIENvbXBvbmVudHMuSHRtbC5yb290LmNsYXNzTGlzdC5hZGQoR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy5kaXJlY3Rpb25bdGhpcy52YWx1ZV0pO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFJlbW92ZXMgZGlyZWN0aW9uIGNsYXNzIGZyb20gdGhlIHJvb3QgSFRNTCBlbGVtZW50LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbiByZW1vdmVDbGFzcygpIHtcbiAgICAgICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LnJlbW92ZShHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLmRpcmVjdGlvblt0aGlzLnZhbHVlXSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGRlZmluZShEaXJlY3Rpb24sICd2YWx1ZScsIHtcbiAgICAgIC8qKlxuICAgICAgICogR2V0cyB2YWx1ZSBvZiB0aGUgZGlyZWN0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICAgKi9cbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gRGlyZWN0aW9uLl92O1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgdmFsdWUgb2YgdGhlIGRpcmVjdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG4gICAgICAgIGlmIChWQUxJRF9ESVJFQ1RJT05TLmluZGV4T2YodmFsdWUpID4gLTEpIHtcbiAgICAgICAgICBEaXJlY3Rpb24uX3YgPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3YXJuKCdEaXJlY3Rpb24gdmFsdWUgbXVzdCBiZSBgbHRyYCBvciBgcnRsYCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDbGVhciBkaXJlY3Rpb24gY2xhc3M6XG4gICAgICogLSBvbiBkZXN0cm95IHRvIGJyaW5nIEhUTUwgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICAgKiAtIG9uIHVwZGF0ZSB0byByZW1vdmUgY2xhc3MgYmVmb3JlIHJlYXBwbGluZyBiZWxsb3dcbiAgICAgKi9cbiAgICBFdmVudHMub24oWydkZXN0cm95JywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgICBEaXJlY3Rpb24ucmVtb3ZlQ2xhc3MoKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW91bnQgY29tcG9uZW50OlxuICAgICAqIC0gb24gdXBkYXRlIHRvIHJlZmxlY3QgY2hhbmdlcyBpbiBkaXJlY3Rpb24gdmFsdWVcbiAgICAgKi9cbiAgICBFdmVudHMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIERpcmVjdGlvbi5tb3VudCgpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQXBwbHkgZGlyZWN0aW9uIGNsYXNzOlxuICAgICAqIC0gYmVmb3JlIGJ1aWxkaW5nIHRvIGFwcGx5IGNsYXNzIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAqIC0gb24gdXBkYXRpbmcgdG8gcmVhcHBseSBkaXJlY3Rpb24gY2xhc3MgdGhhdCBtYXkgY2hhbmdlZFxuICAgICAqL1xuICAgIEV2ZW50cy5vbihbJ2J1aWxkLmJlZm9yZScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgICAgRGlyZWN0aW9uLmFkZENsYXNzKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gRGlyZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZmxlY3RzIHZhbHVlIG9mIGdsaWRlIG1vdmVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IEdsaWRlXG4gICAqIEBwYXJhbSAge09iamVjdH0gQ29tcG9uZW50c1xuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuICBmdW5jdGlvbiBSdGwgKEdsaWRlLCBDb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8qKlxuICAgICAgICogTmVnYXRlcyB0aGUgcGFzc2VkIHRyYW5zbGF0ZSBpZiBnbGlkZSBpcyBpbiBSVEwgb3B0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSAge051bWJlcn0gdHJhbnNsYXRlXG4gICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICAgKi9cbiAgICAgIG1vZGlmeTogZnVuY3Rpb24gbW9kaWZ5KHRyYW5zbGF0ZSkge1xuICAgICAgICBpZiAoQ29tcG9uZW50cy5EaXJlY3Rpb24uaXMoJ3J0bCcpKSB7XG4gICAgICAgICAgcmV0dXJuIC10cmFuc2xhdGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJhbnNsYXRlO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBnbGlkZSBtb3ZlbWVudCB3aXRoIGEgYGdhcGAgc2V0dGluZ3MuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gR2xpZGVcbiAgICogQHBhcmFtICB7T2JqZWN0fSBDb21wb25lbnRzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGZ1bmN0aW9uIEdhcCAoR2xpZGUsIENvbXBvbmVudHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLyoqXG4gICAgICAgKiBNb2RpZmllcyBwYXNzZWQgdHJhbnNsYXRlIHZhbHVlIHdpdGggbnVtYmVyIGluIHRoZSBgZ2FwYCBzZXR0aW5ncy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRyYW5zbGF0ZVxuICAgICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAgICovXG4gICAgICBtb2RpZnk6IGZ1bmN0aW9uIG1vZGlmeSh0cmFuc2xhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZSArIENvbXBvbmVudHMuR2Fwcy52YWx1ZSAqIEdsaWRlLmluZGV4O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBnbGlkZSBtb3ZlbWVudCB3aXRoIHdpZHRoIG9mIGFkZGl0aW9uYWwgY2xvbmVzIHdpZHRoLlxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IEdsaWRlXG4gICAqIEBwYXJhbSAge09iamVjdH0gQ29tcG9uZW50c1xuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuICBmdW5jdGlvbiBHcm93IChHbGlkZSwgQ29tcG9uZW50cykge1xuICAgIHJldHVybiB7XG4gICAgICAvKipcbiAgICAgICAqIEFkZHMgdG8gdGhlIHBhc3NlZCB0cmFuc2xhdGUgd2lkdGggb2YgdGhlIGhhbGYgb2YgY2xvbmVzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSAge051bWJlcn0gdHJhbnNsYXRlXG4gICAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICAgKi9cbiAgICAgIG1vZGlmeTogZnVuY3Rpb24gbW9kaWZ5KHRyYW5zbGF0ZSkge1xuICAgICAgICByZXR1cm4gdHJhbnNsYXRlICsgQ29tcG9uZW50cy5DbG9uZXMuZ3JvdyAvIDI7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGdsaWRlIG1vdmVtZW50IHdpdGggYSBgcGVla2Agc2V0dGluZ3MuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gR2xpZGVcbiAgICogQHBhcmFtICB7T2JqZWN0fSBDb21wb25lbnRzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGZ1bmN0aW9uIFBlZWtpbmcgKEdsaWRlLCBDb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8qKlxuICAgICAgICogTW9kaWZpZXMgcGFzc2VkIHRyYW5zbGF0ZSB2YWx1ZSB3aXRoIGEgYHBlZWtgIHNldHRpbmcuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtICB7TnVtYmVyfSB0cmFuc2xhdGVcbiAgICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgbW9kaWZ5OiBmdW5jdGlvbiBtb2RpZnkodHJhbnNsYXRlKSB7XG4gICAgICAgIGlmIChHbGlkZS5zZXR0aW5ncy5mb2N1c0F0ID49IDApIHtcbiAgICAgICAgICB2YXIgcGVlayA9IENvbXBvbmVudHMuUGVlay52YWx1ZTtcblxuICAgICAgICAgIGlmIChpc09iamVjdChwZWVrKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZSAtIHBlZWsuYmVmb3JlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB0cmFuc2xhdGUgLSBwZWVrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgZ2xpZGUgbW92ZW1lbnQgd2l0aCBhIGBmb2N1c0F0YCBzZXR0aW5ncy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBHbGlkZVxuICAgKiBAcGFyYW0gIHtPYmplY3R9IENvbXBvbmVudHNcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgZnVuY3Rpb24gRm9jdXNpbmcgKEdsaWRlLCBDb21wb25lbnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8qKlxuICAgICAgICogTW9kaWZpZXMgcGFzc2VkIHRyYW5zbGF0ZSB2YWx1ZSB3aXRoIGluZGV4IGluIHRoZSBgZm9jdXNBdGAgc2V0dGluZy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRyYW5zbGF0ZVxuICAgICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAgICovXG4gICAgICBtb2RpZnk6IGZ1bmN0aW9uIG1vZGlmeSh0cmFuc2xhdGUpIHtcbiAgICAgICAgdmFyIGdhcCA9IENvbXBvbmVudHMuR2Fwcy52YWx1ZTtcbiAgICAgICAgdmFyIHdpZHRoID0gQ29tcG9uZW50cy5TaXplcy53aWR0aDtcbiAgICAgICAgdmFyIGZvY3VzQXQgPSBHbGlkZS5zZXR0aW5ncy5mb2N1c0F0O1xuICAgICAgICB2YXIgc2xpZGVXaWR0aCA9IENvbXBvbmVudHMuU2l6ZXMuc2xpZGVXaWR0aDtcblxuICAgICAgICBpZiAoZm9jdXNBdCA9PT0gJ2NlbnRlcicpIHtcbiAgICAgICAgICByZXR1cm4gdHJhbnNsYXRlIC0gKHdpZHRoIC8gMiAtIHNsaWRlV2lkdGggLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cmFuc2xhdGUgLSBzbGlkZVdpZHRoICogZm9jdXNBdCAtIGdhcCAqIGZvY3VzQXQ7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGRpZmZyZW50IHRyYW5zZm9ybWVycyBvbiB0cmFuc2xhdGUgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gR2xpZGVcbiAgICogQHBhcmFtICB7T2JqZWN0fSBDb21wb25lbnRzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGZ1bmN0aW9uIG11dGF0b3IgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgICAvKipcbiAgICAgKiBNZXJnZSBpbnN0YW5jZSB0cmFuc2Zvcm1lcnMgd2l0aCBjb2xsZWN0aW9uIG9mIGRlZmF1bHQgdHJhbnNmb3JtZXJzLlxuICAgICAqIEl0J3MgaW1wb3J0YW50IHRoYXQgdGhlIFJ0bCBjb21wb25lbnQgYmUgbGFzdCBvbiB0aGUgbGlzdCxcbiAgICAgKiBzbyBpdCByZWZsZWN0cyBhbGwgcHJldmlvdXMgdHJhbnNmb3JtYXRpb25zLlxuICAgICAqXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqL1xuICAgIHZhciBUUkFOU0ZPUk1FUlMgPSBbR2FwLCBHcm93LCBQZWVraW5nLCBGb2N1c2luZ10uY29uY2F0KEdsaWRlLl90LCBbUnRsXSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgLyoqXG4gICAgICAgKiBQaXBsaW5lcyB0cmFuc2xhdGUgdmFsdWUgd2l0aCByZWdpc3RlcmVkIHRyYW5zZm9ybWVycy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRyYW5zbGF0ZVxuICAgICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAgICovXG4gICAgICBtdXRhdGU6IGZ1bmN0aW9uIG11dGF0ZSh0cmFuc2xhdGUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBUUkFOU0ZPUk1FUlMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgdHJhbnNmb3JtZXIgPSBUUkFOU0ZPUk1FUlNbaV07XG5cbiAgICAgICAgICBpZiAoaXNGdW5jdGlvbih0cmFuc2Zvcm1lcikgJiYgaXNGdW5jdGlvbih0cmFuc2Zvcm1lcigpLm1vZGlmeSkpIHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZSA9IHRyYW5zZm9ybWVyKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpLm1vZGlmeSh0cmFuc2xhdGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YXJuKCdUcmFuc2Zvcm1lciBzaG91bGQgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gb2JqZWN0IHdpdGggYG1vZGlmeSgpYCBtZXRob2QnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJhbnNsYXRlO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBUcmFuc2xhdGUgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgICB2YXIgVHJhbnNsYXRlID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHZhbHVlIG9mIHRyYW5zbGF0ZSBvbiBIVE1MIGVsZW1lbnQuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgICB2YXIgdHJhbnNmb3JtID0gbXV0YXRvcihHbGlkZSwgQ29tcG9uZW50cykubXV0YXRlKHZhbHVlKTtcblxuICAgICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIC0xICogdHJhbnNmb3JtICsgJ3B4LCAwcHgsIDBweCknO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFJlbW92ZXMgdmFsdWUgb2YgdHJhbnNsYXRlIGZyb20gSFRNTCBlbGVtZW50LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS50cmFuc2Zvcm0gPSAnJztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0IG5ldyB0cmFuc2xhdGUgdmFsdWU6XG4gICAgICogLSBvbiBtb3ZlIHRvIHJlZmxlY3QgaW5kZXggY2hhbmdlXG4gICAgICogLSBvbiB1cGRhdGluZyB2aWEgQVBJIHRvIHJlZmxlY3QgcG9zc2libGUgY2hhbmdlcyBpbiBvcHRpb25zXG4gICAgICovXG4gICAgRXZlbnRzLm9uKCdtb3ZlJywgZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgIHZhciBnYXAgPSBDb21wb25lbnRzLkdhcHMudmFsdWU7XG4gICAgICB2YXIgbGVuZ3RoID0gQ29tcG9uZW50cy5TaXplcy5sZW5ndGg7XG4gICAgICB2YXIgd2lkdGggPSBDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGg7XG5cbiAgICAgIGlmIChHbGlkZS5pc1R5cGUoJ2Nhcm91c2VsJykgJiYgQ29tcG9uZW50cy5SdW4uaXNPZmZzZXQoJzwnKSkge1xuICAgICAgICBDb21wb25lbnRzLlRyYW5zaXRpb24uYWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIEV2ZW50cy5lbWl0KCd0cmFuc2xhdGUuanVtcCcpO1xuXG4gICAgICAgICAgVHJhbnNsYXRlLnNldCh3aWR0aCAqIChsZW5ndGggLSAxKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBUcmFuc2xhdGUuc2V0KC13aWR0aCAtIGdhcCAqIGxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChHbGlkZS5pc1R5cGUoJ2Nhcm91c2VsJykgJiYgQ29tcG9uZW50cy5SdW4uaXNPZmZzZXQoJz4nKSkge1xuICAgICAgICBDb21wb25lbnRzLlRyYW5zaXRpb24uYWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIEV2ZW50cy5lbWl0KCd0cmFuc2xhdGUuanVtcCcpO1xuXG4gICAgICAgICAgVHJhbnNsYXRlLnNldCgwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIFRyYW5zbGF0ZS5zZXQod2lkdGggKiBsZW5ndGggKyBnYXAgKiBsZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gVHJhbnNsYXRlLnNldChjb250ZXh0Lm1vdmVtZW50KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSB0cmFuc2xhdGU6XG4gICAgICogLSBvbiBkZXN0cm95aW5nIHRvIGJyaW5nIG1hcmt1cCB0byBpdHMgaW5pdGFsIHN0YXRlXG4gICAgICovXG4gICAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgVHJhbnNsYXRlLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRyYW5zbGF0ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIFRyYW5zaXRpb24gKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgICAvKipcbiAgICAgKiBIb2xkcyBpbmFjdGl2aXR5IHN0YXR1cyBvZiB0cmFuc2l0aW9uLlxuICAgICAqIFdoZW4gdHJ1ZSB0cmFuc2l0aW9uIGlzIG5vdCBhcHBsaWVkLlxuICAgICAqXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdmFyIGRpc2FibGVkID0gZmFsc2U7XG5cbiAgICB2YXIgVHJhbnNpdGlvbiA9IHtcbiAgICAgIC8qKlxuICAgICAgICogQ29tcG9zZXMgc3RyaW5nIG9mIHRoZSBDU1MgdHJhbnNpdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAqL1xuICAgICAgY29tcG9zZTogZnVuY3Rpb24gY29tcG9zZShwcm9wZXJ0eSkge1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcblxuICAgICAgICBpZiAoIWRpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3BlcnR5ICsgJyAnICsgdGhpcy5kdXJhdGlvbiArICdtcyAnICsgc2V0dGluZ3MuYW5pbWF0aW9uVGltaW5nRnVuYztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcm9wZXJ0eSArICcgMG1zICcgKyBzZXR0aW5ncy5hbmltYXRpb25UaW1pbmdGdW5jO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFNldHMgdmFsdWUgb2YgdHJhbnNpdGlvbiBvbiBIVE1MIGVsZW1lbnQuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtTdHJpbmc9fSBwcm9wZXJ0eVxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0eSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJ3RyYW5zZm9ybSc7XG5cbiAgICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUudHJhbnNpdGlvbiA9IHRoaXMuY29tcG9zZShwcm9wZXJ0eSk7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyB2YWx1ZSBvZiB0cmFuc2l0aW9uIGZyb20gSFRNTCBlbGVtZW50LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogUnVucyBjYWxsYmFjayBhZnRlciBhbmltYXRpb24uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBhZnRlcjogZnVuY3Rpb24gYWZ0ZXIoY2FsbGJhY2spIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSwgdGhpcy5kdXJhdGlvbik7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogRW5hYmxlIHRyYW5zaXRpb24uXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgZW5hYmxlOiBmdW5jdGlvbiBlbmFibGUoKSB7XG4gICAgICAgIGRpc2FibGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5zZXQoKTtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBEaXNhYmxlIHRyYW5zaXRpb24uXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgZGlzYWJsZTogZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuc2V0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGRlZmluZShUcmFuc2l0aW9uLCAnZHVyYXRpb24nLCB7XG4gICAgICAvKipcbiAgICAgICAqIEdldHMgZHVyYXRpb24gb2YgdGhlIHRyYW5zaXRpb24gYmFzZWRcbiAgICAgICAqIG9uIGN1cnJlbnRseSBydW5uaW5nIGFuaW1hdGlvbiB0eXBlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuXG4gICAgICAgIGlmIChHbGlkZS5pc1R5cGUoJ3NsaWRlcicpICYmIENvbXBvbmVudHMuUnVuLm9mZnNldCkge1xuICAgICAgICAgIHJldHVybiBzZXR0aW5ncy5yZXdpbmREdXJhdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXR0aW5ncy5hbmltYXRpb25EdXJhdGlvbjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFNldCB0cmFuc2l0aW9uIGBzdHlsZWAgdmFsdWU6XG4gICAgICogLSBvbiBlYWNoIG1vdmluZywgYmVjYXVzZSBpdCBtYXkgYmUgY2xlYXJlZCBieSBvZmZzZXQgbW92ZVxuICAgICAqL1xuICAgIEV2ZW50cy5vbignbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIFRyYW5zaXRpb24uc2V0KCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlIHRyYW5zaXRpb246XG4gICAgICogLSBiZWZvcmUgaW5pdGlhbCBidWlsZCB0byBhdm9pZCB0cmFuc2l0aW9uaW5nIGZyb20gYDBgIHRvIGBzdGFydEF0YCBpbmRleFxuICAgICAqIC0gd2hpbGUgcmVzaXppbmcgd2luZG93IGFuZCByZWNhbGN1bGF0aW5nIGRpbWVudGlvbnNcbiAgICAgKiAtIG9uIGp1bXBpbmcgZnJvbSBvZmZzZXQgdHJhbnNpdGlvbiBhdCBzdGFydCBhbmQgZW5kIGVkZ2VzIGluIGBjYXJvdXNlbGAgdHlwZVxuICAgICAqL1xuICAgIEV2ZW50cy5vbihbJ2J1aWxkLmJlZm9yZScsICdyZXNpemUnLCAndHJhbnNsYXRlLmp1bXAnXSwgZnVuY3Rpb24gKCkge1xuICAgICAgVHJhbnNpdGlvbi5kaXNhYmxlKCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgdHJhbnNpdGlvbjpcbiAgICAgKiAtIG9uIGVhY2ggcnVubmluZywgYmVjYXVzZSBpdCBtYXkgYmUgZGlzYWJsZWQgYnkgb2Zmc2V0IG1vdmVcbiAgICAgKi9cbiAgICBFdmVudHMub24oJ3J1bicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIFRyYW5zaXRpb24uZW5hYmxlKCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdHJhbnNpdGlvbjpcbiAgICAgKiAtIG9uIGRlc3Ryb3lpbmcgdG8gYnJpbmcgbWFya3VwIHRvIGl0cyBpbml0YWwgc3RhdGVcbiAgICAgKi9cbiAgICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICBUcmFuc2l0aW9uLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFRyYW5zaXRpb247XG4gIH1cblxuICAvKipcbiAgICogVGVzdCB2aWEgYSBnZXR0ZXIgaW4gdGhlIG9wdGlvbnMgb2JqZWN0IHRvIHNlZVxuICAgKiBpZiB0aGUgcGFzc2l2ZSBwcm9wZXJ0eSBpcyBhY2Nlc3NlZC5cbiAgICpcbiAgICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vV0lDRy9FdmVudExpc3RlbmVyT3B0aW9ucy9ibG9iL2doLXBhZ2VzL2V4cGxhaW5lci5tZCNmZWF0dXJlLWRldGVjdGlvblxuICAgKi9cblxuICB2YXIgc3VwcG9ydHNQYXNzaXZlID0gZmFsc2U7XG5cbiAgdHJ5IHtcbiAgICB2YXIgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0UGFzc2l2ZScsIG51bGwsIG9wdHMpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0ZXN0UGFzc2l2ZScsIG51bGwsIG9wdHMpO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciBzdXBwb3J0c1Bhc3NpdmUkMSA9IHN1cHBvcnRzUGFzc2l2ZTtcblxuICB2YXIgU1RBUlRfRVZFTlRTID0gWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddO1xuICB2YXIgTU9WRV9FVkVOVFMgPSBbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXTtcbiAgdmFyIEVORF9FVkVOVFMgPSBbJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJywgJ21vdXNldXAnLCAnbW91c2VsZWF2ZSddO1xuICB2YXIgTU9VU0VfRVZFTlRTID0gWydtb3VzZWRvd24nLCAnbW91c2Vtb3ZlJywgJ21vdXNldXAnLCAnbW91c2VsZWF2ZSddO1xuXG4gIGZ1bmN0aW9uIFN3aXBlIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gICAgLyoqXG4gICAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAgICovXG4gICAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcblxuICAgIHZhciBzd2lwZVNpbiA9IDA7XG4gICAgdmFyIHN3aXBlU3RhcnRYID0gMDtcbiAgICB2YXIgc3dpcGVTdGFydFkgPSAwO1xuICAgIHZhciBkaXNhYmxlZCA9IGZhbHNlO1xuICAgIHZhciBjYXB0dXJlID0gc3VwcG9ydHNQYXNzaXZlJDEgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlO1xuXG4gICAgdmFyIFN3aXBlID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBJbml0aWFsaXplcyBzd2lwZSBiaW5kaW5ncy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICAgIHRoaXMuYmluZFN3aXBlU3RhcnQoKTtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBIYW5kbGVyIGZvciBgc3dpcGVzdGFydGAgZXZlbnQuIENhbGN1bGF0ZXMgZW50cnkgcG9pbnRzIG9mIHRoZSB1c2VyJ3MgdGFwLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KGV2ZW50KSB7XG4gICAgICAgIGlmICghZGlzYWJsZWQgJiYgIUdsaWRlLmRpc2FibGVkKSB7XG4gICAgICAgICAgdGhpcy5kaXNhYmxlKCk7XG5cbiAgICAgICAgICB2YXIgc3dpcGUgPSB0aGlzLnRvdWNoZXMoZXZlbnQpO1xuXG4gICAgICAgICAgc3dpcGVTaW4gPSBudWxsO1xuICAgICAgICAgIHN3aXBlU3RhcnRYID0gdG9JbnQoc3dpcGUucGFnZVgpO1xuICAgICAgICAgIHN3aXBlU3RhcnRZID0gdG9JbnQoc3dpcGUucGFnZVkpO1xuXG4gICAgICAgICAgdGhpcy5iaW5kU3dpcGVNb3ZlKCk7XG4gICAgICAgICAgdGhpcy5iaW5kU3dpcGVFbmQoKTtcblxuICAgICAgICAgIEV2ZW50cy5lbWl0KCdzd2lwZS5zdGFydCcpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogSGFuZGxlciBmb3IgYHN3aXBlbW92ZWAgZXZlbnQuIENhbGN1bGF0ZXMgdXNlcidzIHRhcCBhbmdsZSBhbmQgZGlzdGFuY2UuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gICAgICAgKi9cbiAgICAgIG1vdmU6IGZ1bmN0aW9uIG1vdmUoZXZlbnQpIHtcbiAgICAgICAgaWYgKCFHbGlkZS5kaXNhYmxlZCkge1xuICAgICAgICAgIHZhciBfR2xpZGUkc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncyxcbiAgICAgICAgICAgICAgdG91Y2hBbmdsZSA9IF9HbGlkZSRzZXR0aW5ncy50b3VjaEFuZ2xlLFxuICAgICAgICAgICAgICB0b3VjaFJhdGlvID0gX0dsaWRlJHNldHRpbmdzLnRvdWNoUmF0aW8sXG4gICAgICAgICAgICAgIGNsYXNzZXMgPSBfR2xpZGUkc2V0dGluZ3MuY2xhc3NlcztcblxuXG4gICAgICAgICAgdmFyIHN3aXBlID0gdGhpcy50b3VjaGVzKGV2ZW50KTtcblxuICAgICAgICAgIHZhciBzdWJFeFN4ID0gdG9JbnQoc3dpcGUucGFnZVgpIC0gc3dpcGVTdGFydFg7XG4gICAgICAgICAgdmFyIHN1YkV5U3kgPSB0b0ludChzd2lwZS5wYWdlWSkgLSBzd2lwZVN0YXJ0WTtcbiAgICAgICAgICB2YXIgcG93RVggPSBNYXRoLmFicyhzdWJFeFN4IDw8IDIpO1xuICAgICAgICAgIHZhciBwb3dFWSA9IE1hdGguYWJzKHN1YkV5U3kgPDwgMik7XG4gICAgICAgICAgdmFyIHN3aXBlSHlwb3RlbnVzZSA9IE1hdGguc3FydChwb3dFWCArIHBvd0VZKTtcbiAgICAgICAgICB2YXIgc3dpcGVDYXRoZXR1cyA9IE1hdGguc3FydChwb3dFWSk7XG5cbiAgICAgICAgICBzd2lwZVNpbiA9IE1hdGguYXNpbihzd2lwZUNhdGhldHVzIC8gc3dpcGVIeXBvdGVudXNlKTtcblxuICAgICAgICAgIGlmIChzd2lwZVNpbiAqIDE4MCAvIE1hdGguUEkgPCB0b3VjaEFuZ2xlKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgQ29tcG9uZW50cy5Nb3ZlLm1ha2Uoc3ViRXhTeCAqIHRvRmxvYXQodG91Y2hSYXRpbykpO1xuXG4gICAgICAgICAgICBDb21wb25lbnRzLkh0bWwucm9vdC5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuZHJhZ2dpbmcpO1xuXG4gICAgICAgICAgICBFdmVudHMuZW1pdCgnc3dpcGUubW92ZScpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogSGFuZGxlciBmb3IgYHN3aXBlZW5kYCBldmVudC4gRmluaXRpYWxpemVzIHVzZXIncyB0YXAgYW5kIGRlY2lkZXMgYWJvdXQgZ2xpZGUgbW92ZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIGVuZDogZnVuY3Rpb24gZW5kKGV2ZW50KSB7XG4gICAgICAgIGlmICghR2xpZGUuZGlzYWJsZWQpIHtcbiAgICAgICAgICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcblxuICAgICAgICAgIHZhciBzd2lwZSA9IHRoaXMudG91Y2hlcyhldmVudCk7XG4gICAgICAgICAgdmFyIHRocmVzaG9sZCA9IHRoaXMudGhyZXNob2xkKGV2ZW50KTtcblxuICAgICAgICAgIHZhciBzd2lwZURpc3RhbmNlID0gc3dpcGUucGFnZVggLSBzd2lwZVN0YXJ0WDtcbiAgICAgICAgICB2YXIgc3dpcGVEZWcgPSBzd2lwZVNpbiAqIDE4MCAvIE1hdGguUEk7XG4gICAgICAgICAgdmFyIHN0ZXBzID0gTWF0aC5yb3VuZChzd2lwZURpc3RhbmNlIC8gQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoKTtcblxuICAgICAgICAgIHRoaXMuZW5hYmxlKCk7XG5cbiAgICAgICAgICBpZiAoc3dpcGVEaXN0YW5jZSA+IHRocmVzaG9sZCAmJiBzd2lwZURlZyA8IHNldHRpbmdzLnRvdWNoQW5nbGUpIHtcbiAgICAgICAgICAgIC8vIFdoaWxlIHN3aXBlIGlzIHBvc2l0aXZlIGFuZCBncmVhdGVyIHRoYW4gdGhyZXNob2xkIG1vdmUgYmFja3dhcmQuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MucGVyVG91Y2gpIHtcbiAgICAgICAgICAgICAgc3RlcHMgPSBNYXRoLm1pbihzdGVwcywgdG9JbnQoc2V0dGluZ3MucGVyVG91Y2gpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKENvbXBvbmVudHMuRGlyZWN0aW9uLmlzKCdydGwnKSkge1xuICAgICAgICAgICAgICBzdGVwcyA9IC1zdGVwcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQ29tcG9uZW50cy5SdW4ubWFrZShDb21wb25lbnRzLkRpcmVjdGlvbi5yZXNvbHZlKCc8JyArIHN0ZXBzKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChzd2lwZURpc3RhbmNlIDwgLXRocmVzaG9sZCAmJiBzd2lwZURlZyA8IHNldHRpbmdzLnRvdWNoQW5nbGUpIHtcbiAgICAgICAgICAgIC8vIFdoaWxlIHN3aXBlIGlzIG5lZ2F0aXZlIGFuZCBsb3dlciB0aGFuIG5lZ2F0aXZlIHRocmVzaG9sZCBtb3ZlIGZvcndhcmQuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MucGVyVG91Y2gpIHtcbiAgICAgICAgICAgICAgc3RlcHMgPSBNYXRoLm1heChzdGVwcywgLXRvSW50KHNldHRpbmdzLnBlclRvdWNoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChDb21wb25lbnRzLkRpcmVjdGlvbi5pcygncnRsJykpIHtcbiAgICAgICAgICAgICAgc3RlcHMgPSAtc3RlcHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIENvbXBvbmVudHMuUnVuLm1ha2UoQ29tcG9uZW50cy5EaXJlY3Rpb24ucmVzb2x2ZSgnPicgKyBzdGVwcykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXaGlsZSBzd2lwZSBkb24ndCByZWFjaCBkaXN0YW5jZSBhcHBseSBwcmV2aW91cyB0cmFuc2Zvcm0uXG4gICAgICAgICAgICBDb21wb25lbnRzLk1vdmUubWFrZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIENvbXBvbmVudHMuSHRtbC5yb290LmNsYXNzTGlzdC5yZW1vdmUoc2V0dGluZ3MuY2xhc3Nlcy5kcmFnZ2luZyk7XG5cbiAgICAgICAgICB0aGlzLnVuYmluZFN3aXBlTW92ZSgpO1xuICAgICAgICAgIHRoaXMudW5iaW5kU3dpcGVFbmQoKTtcblxuICAgICAgICAgIEV2ZW50cy5lbWl0KCdzd2lwZS5lbmQnKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIEJpbmRzIHN3aXBlJ3Mgc3RhcnRpbmcgZXZlbnQuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgYmluZFN3aXBlU3RhcnQ6IGZ1bmN0aW9uIGJpbmRTd2lwZVN0YXJ0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5zd2lwZVRocmVzaG9sZCkge1xuICAgICAgICAgIEJpbmRlci5vbihTVEFSVF9FVkVOVFNbMF0sIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIF90aGlzLnN0YXJ0KGV2ZW50KTtcbiAgICAgICAgICB9LCBjYXB0dXJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5kcmFnVGhyZXNob2xkKSB7XG4gICAgICAgICAgQmluZGVyLm9uKFNUQVJUX0VWRU5UU1sxXSwgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgX3RoaXMuc3RhcnQoZXZlbnQpO1xuICAgICAgICAgIH0sIGNhcHR1cmUpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogVW5iaW5kcyBzd2lwZSdzIHN0YXJ0aW5nIGV2ZW50LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHVuYmluZFN3aXBlU3RhcnQ6IGZ1bmN0aW9uIHVuYmluZFN3aXBlU3RhcnQoKSB7XG4gICAgICAgIEJpbmRlci5vZmYoU1RBUlRfRVZFTlRTWzBdLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgY2FwdHVyZSk7XG4gICAgICAgIEJpbmRlci5vZmYoU1RBUlRfRVZFTlRTWzFdLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgY2FwdHVyZSk7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogQmluZHMgc3dpcGUncyBtb3ZpbmcgZXZlbnQuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgYmluZFN3aXBlTW92ZTogZnVuY3Rpb24gYmluZFN3aXBlTW92ZSgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgQmluZGVyLm9uKE1PVkVfRVZFTlRTLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgdGhyb3R0bGUoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgX3RoaXMyLm1vdmUoZXZlbnQpO1xuICAgICAgICB9LCBHbGlkZS5zZXR0aW5ncy50aHJvdHRsZSksIGNhcHR1cmUpO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFVuYmluZHMgc3dpcGUncyBtb3ZpbmcgZXZlbnQuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgdW5iaW5kU3dpcGVNb3ZlOiBmdW5jdGlvbiB1bmJpbmRTd2lwZU1vdmUoKSB7XG4gICAgICAgIEJpbmRlci5vZmYoTU9WRV9FVkVOVFMsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCBjYXB0dXJlKTtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBCaW5kcyBzd2lwZSdzIGVuZGluZyBldmVudC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBiaW5kU3dpcGVFbmQ6IGZ1bmN0aW9uIGJpbmRTd2lwZUVuZCgpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgQmluZGVyLm9uKEVORF9FVkVOVFMsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBfdGhpczMuZW5kKGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogVW5iaW5kcyBzd2lwZSdzIGVuZGluZyBldmVudC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICB1bmJpbmRTd2lwZUVuZDogZnVuY3Rpb24gdW5iaW5kU3dpcGVFbmQoKSB7XG4gICAgICAgIEJpbmRlci5vZmYoRU5EX0VWRU5UUywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIpO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIE5vcm1hbGl6ZXMgZXZlbnQgdG91Y2hlcyBwb2ludHMgYWNjb3J0aW5nIHRvIGRpZmZlcmVudCB0eXBlcy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAgICAgICAqL1xuICAgICAgdG91Y2hlczogZnVuY3Rpb24gdG91Y2hlcyhldmVudCkge1xuICAgICAgICBpZiAoTU9VU0VfRVZFTlRTLmluZGV4T2YoZXZlbnQudHlwZSkgPiAtMSkge1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBldmVudC50b3VjaGVzWzBdIHx8IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIEdldHMgdmFsdWUgb2YgbWluaW11bSBzd2lwZSBkaXN0YW5jZSBzZXR0aW5ncyBiYXNlZCBvbiBldmVudCB0eXBlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICAqL1xuICAgICAgdGhyZXNob2xkOiBmdW5jdGlvbiB0aHJlc2hvbGQoZXZlbnQpIHtcbiAgICAgICAgdmFyIHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3M7XG5cbiAgICAgICAgaWYgKE1PVVNFX0VWRU5UUy5pbmRleE9mKGV2ZW50LnR5cGUpID4gLTEpIHtcbiAgICAgICAgICByZXR1cm4gc2V0dGluZ3MuZHJhZ1RocmVzaG9sZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXR0aW5ncy5zd2lwZVRocmVzaG9sZDtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBFbmFibGVzIHN3aXBlIGV2ZW50LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICAgKi9cbiAgICAgIGVuYWJsZTogZnVuY3Rpb24gZW5hYmxlKCkge1xuICAgICAgICBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgICAgIENvbXBvbmVudHMuVHJhbnNpdGlvbi5lbmFibGUoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBEaXNhYmxlcyBzd2lwZSBldmVudC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAgICovXG4gICAgICBkaXNhYmxlOiBmdW5jdGlvbiBkaXNhYmxlKCkge1xuICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG5cbiAgICAgICAgQ29tcG9uZW50cy5UcmFuc2l0aW9uLmRpc2FibGUoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIGNvbXBvbmVudCBjbGFzczpcbiAgICAgKiAtIGFmdGVyIGluaXRpYWwgYnVpbGRpbmdcbiAgICAgKi9cbiAgICBFdmVudHMub24oJ2J1aWxkLmFmdGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LmFkZChHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLnN3aXBlYWJsZSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgc3dpcGluZyBiaW5kaW5nczpcbiAgICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIHJlbW92ZSBhZGRlZCBFdmVudExpc3RlbmVyc1xuICAgICAqL1xuICAgIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIFN3aXBlLnVuYmluZFN3aXBlU3RhcnQoKTtcbiAgICAgIFN3aXBlLnVuYmluZFN3aXBlTW92ZSgpO1xuICAgICAgU3dpcGUudW5iaW5kU3dpcGVFbmQoKTtcbiAgICAgIEJpbmRlci5kZXN0cm95KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gU3dpcGU7XG4gIH1cblxuICBmdW5jdGlvbiBJbWFnZXMgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgICAvKipcbiAgICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgICAqXG4gICAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICAgKi9cbiAgICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuXG4gICAgdmFyIEltYWdlcyA9IHtcbiAgICAgIC8qKlxuICAgICAgICogQmluZHMgbGlzdGVuZXIgdG8gZ2xpZGUgd3JhcHBlci5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICAgIHRoaXMuYmluZCgpO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIEJpbmRzIGBkcmFnc3RhcnRgIGV2ZW50IG9uIHdyYXBwZXIgdG8gcHJldmVudCBkcmFnZ2luZyBpbWFnZXMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAgICAgQmluZGVyLm9uKCdkcmFnc3RhcnQnLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgdGhpcy5kcmFnc3RhcnQpO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFVuYmluZHMgYGRyYWdzdGFydGAgZXZlbnQgb24gd3JhcHBlci5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICAgICAgQmluZGVyLm9mZignZHJhZ3N0YXJ0JywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIpO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIEV2ZW50IGhhbmRsZXIuIFByZXZlbnRzIGRyYWdnaW5nLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIGRyYWdzdGFydDogZnVuY3Rpb24gZHJhZ3N0YXJ0KGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBiaW5kaW5ncyBmcm9tIGltYWdlczpcbiAgICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIHJlbW92ZSBhZGRlZCBFdmVudExpc3RlbmVyc1xuICAgICAqL1xuICAgIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIEltYWdlcy51bmJpbmQoKTtcbiAgICAgIEJpbmRlci5kZXN0cm95KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gSW1hZ2VzO1xuICB9XG5cbiAgZnVuY3Rpb24gQW5jaG9ycyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAgIC8qKlxuICAgICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgICAqL1xuICAgIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBIb2xkcyBkZXRhY2hpbmcgc3RhdHVzIG9mIGFuY2hvcnMuXG4gICAgICogUHJldmVudHMgZGV0YWNoaW5nIG9mIGFscmVhZHkgZGV0YWNoZWQgYW5jaG9ycy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdmFyIGRldGFjaGVkID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBIb2xkcyBwcmV2ZW50aW5nIHN0YXR1cyBvZiBhbmNob3JzLlxuICAgICAqIElmIGB0cnVlYCByZWRpcmVjdGlvbiBhZnRlciBjbGljayB3aWxsIGJlIGRpc2FibGVkLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICB2YXIgcHJldmVudGVkID0gZmFsc2U7XG5cbiAgICB2YXIgQW5jaG9ycyA9IHtcbiAgICAgIC8qKlxuICAgICAgICogU2V0dXBzIGEgaW5pdGlhbCBzdGF0ZSBvZiBhbmNob3JzIGNvbXBvbmVudC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogSG9sZHMgY29sbGVjdGlvbiBvZiBhbmNob3JzIGVsZW1lbnRzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAdHlwZSB7SFRNTENvbGxlY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9hID0gQ29tcG9uZW50cy5IdG1sLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCgnYScpO1xuXG4gICAgICAgIHRoaXMuYmluZCgpO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIEJpbmRzIGV2ZW50cyB0byBhbmNob3JzIGluc2lkZSBhIHRyYWNrLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgICAgIEJpbmRlci5vbignY2xpY2snLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgdGhpcy5jbGljayk7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogVW5iaW5kcyBldmVudHMgYXR0YWNoZWQgdG8gYW5jaG9ycyBpbnNpZGUgYSB0cmFjay5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICAgICAgQmluZGVyLm9mZignY2xpY2snLCBDb21wb25lbnRzLkh0bWwud3JhcHBlcik7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogSGFuZGxlciBmb3IgY2xpY2sgZXZlbnQuIFByZXZlbnRzIGNsaWNrcyB3aGVuIGdsaWRlIGlzIGluIGBwcmV2ZW50YCBzdGF0dXMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtICB7T2JqZWN0fSBldmVudFxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgY2xpY2s6IGZ1bmN0aW9uIGNsaWNrKGV2ZW50KSB7XG4gICAgICAgIGlmIChwcmV2ZW50ZWQpIHtcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogRGV0YWNoZXMgYW5jaG9ycyBjbGljayBldmVudCBpbnNpZGUgZ2xpZGUuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7c2VsZn1cbiAgICAgICAqL1xuICAgICAgZGV0YWNoOiBmdW5jdGlvbiBkZXRhY2goKSB7XG4gICAgICAgIHByZXZlbnRlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKCFkZXRhY2hlZCkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5kcmFnZ2FibGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaHJlZicsIHRoaXMuaXRlbXNbaV0uZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLnJlbW92ZUF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRldGFjaGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIEF0dGFjaGVzIGFuY2hvcnMgY2xpY2sgZXZlbnRzIGluc2lkZSBnbGlkZS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAgICovXG4gICAgICBhdHRhY2g6IGZ1bmN0aW9uIGF0dGFjaCgpIHtcbiAgICAgICAgcHJldmVudGVkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGRldGFjaGVkKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLmRyYWdnYWJsZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uc2V0QXR0cmlidXRlKCdocmVmJywgdGhpcy5pdGVtc1tpXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaHJlZicpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkZXRhY2hlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGRlZmluZShBbmNob3JzLCAnaXRlbXMnLCB7XG4gICAgICAvKipcbiAgICAgICAqIEdldHMgY29sbGVjdGlvbiBvZiB0aGUgYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7SFRNTEVsZW1lbnRbXX1cbiAgICAgICAqL1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiBBbmNob3JzLl9hO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogRGV0YWNoIGFuY2hvcnMgaW5zaWRlIHNsaWRlczpcbiAgICAgKiAtIG9uIHN3aXBpbmcsIHNvIHRoZXkgd29uJ3QgcmVkaXJlY3QgdG8gaXRzIGBocmVmYCBhdHRyaWJ1dGVzXG4gICAgICovXG4gICAgRXZlbnRzLm9uKCdzd2lwZS5tb3ZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgQW5jaG9ycy5kZXRhY2goKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhbmNob3JzIGluc2lkZSBzbGlkZXM6XG4gICAgICogLSBhZnRlciBzd2lwaW5nIGFuZCB0cmFuc2l0aW9ucyBlbmRzLCBzbyB0aGV5IGNhbiByZWRpcmVjdCBhZnRlciBjbGljayBhZ2FpblxuICAgICAqL1xuICAgIEV2ZW50cy5vbignc3dpcGUuZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgQ29tcG9uZW50cy5UcmFuc2l0aW9uLmFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgQW5jaG9ycy5hdHRhY2goKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGFuY2hvcnMgaW5zaWRlIHNsaWRlczpcbiAgICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGJyaW5nIGFuY2hvcnMgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICAgKi9cbiAgICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICBBbmNob3JzLmF0dGFjaCgpO1xuICAgICAgQW5jaG9ycy51bmJpbmQoKTtcbiAgICAgIEJpbmRlci5kZXN0cm95KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gQW5jaG9ycztcbiAgfVxuXG4gIHZhciBOQVZfU0VMRUNUT1IgPSAnW2RhdGEtZ2xpZGUtZWw9XCJjb250cm9sc1tuYXZdXCJdJztcbiAgdmFyIENPTlRST0xTX1NFTEVDVE9SID0gJ1tkYXRhLWdsaWRlLWVsXj1cImNvbnRyb2xzXCJdJztcblxuICBmdW5jdGlvbiBDb250cm9scyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAgIC8qKlxuICAgICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgICAqL1xuICAgIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG5cbiAgICB2YXIgY2FwdHVyZSA9IHN1cHBvcnRzUGFzc2l2ZSQxID8geyBwYXNzaXZlOiB0cnVlIH0gOiBmYWxzZTtcblxuICAgIHZhciBDb250cm9scyA9IHtcbiAgICAgIC8qKlxuICAgICAgICogSW5pdHMgYXJyb3dzLiBCaW5kcyBldmVudHMgbGlzdGVuZXJzXG4gICAgICAgKiB0byB0aGUgYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29sbGVjdGlvbiBvZiBuYXZpZ2F0aW9uIEhUTUwgZWxlbWVudHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtIVE1MQ29sbGVjdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX24gPSBDb21wb25lbnRzLkh0bWwucm9vdC5xdWVyeVNlbGVjdG9yQWxsKE5BVl9TRUxFQ1RPUik7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbGxlY3Rpb24gb2YgY29udHJvbHMgSFRNTCBlbGVtZW50cy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge0hUTUxDb2xsZWN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fYyA9IENvbXBvbmVudHMuSHRtbC5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoQ09OVFJPTFNfU0VMRUNUT1IpO1xuXG4gICAgICAgIHRoaXMuYWRkQmluZGluZ3MoKTtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIGFjdGl2ZSBjbGFzcyB0byBjdXJyZW50IHNsaWRlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHNldEFjdGl2ZTogZnVuY3Rpb24gc2V0QWN0aXZlKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLmFkZENsYXNzKHRoaXMuX25baV0uY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyBhY3RpdmUgY2xhc3MgdG8gY3VycmVudCBzbGlkZS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICByZW1vdmVBY3RpdmU6IGZ1bmN0aW9uIHJlbW92ZUFjdGl2ZSgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyh0aGlzLl9uW2ldLmNoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFRvZ2dsZXMgYWN0aXZlIGNsYXNzIG9uIGl0ZW1zIGluc2lkZSBuYXZpZ2F0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBjb250cm9sc1xuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgYWRkQ2xhc3M6IGZ1bmN0aW9uIGFkZENsYXNzKGNvbnRyb2xzKSB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuICAgICAgICB2YXIgaXRlbSA9IGNvbnRyb2xzW0dsaWRlLmluZGV4XTtcblxuICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc2VzLmFjdGl2ZU5hdik7XG5cbiAgICAgICAgICBzaWJsaW5ncyhpdGVtKS5mb3JFYWNoKGZ1bmN0aW9uIChzaWJsaW5nKSB7XG4gICAgICAgICAgICBzaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoc2V0dGluZ3MuY2xhc3Nlcy5hY3RpdmVOYXYpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyBhY3RpdmUgY2xhc3MgZnJvbSBhY3RpdmUgY29udHJvbC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gY29udHJvbHNcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbiByZW1vdmVDbGFzcyhjb250cm9scykge1xuICAgICAgICB2YXIgaXRlbSA9IGNvbnRyb2xzW0dsaWRlLmluZGV4XTtcblxuICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLmFjdGl2ZU5hdik7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGhhbmRsZXMgdG8gdGhlIGVhY2ggZ3JvdXAgb2YgY29udHJvbHMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgYWRkQmluZGluZ3M6IGZ1bmN0aW9uIGFkZEJpbmRpbmdzKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLmJpbmQodGhpcy5fY1tpXS5jaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIGhhbmRsZXMgZnJvbSB0aGUgZWFjaCBncm91cCBvZiBjb250cm9scy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICByZW1vdmVCaW5kaW5nczogZnVuY3Rpb24gcmVtb3ZlQmluZGluZ3MoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMudW5iaW5kKHRoaXMuX2NbaV0uY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogQmluZHMgZXZlbnRzIHRvIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7SFRNTENvbGxlY3Rpb259IGVsZW1lbnRzXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKGVsZW1lbnRzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBCaW5kZXIub24oJ2NsaWNrJywgZWxlbWVudHNbaV0sIHRoaXMuY2xpY2spO1xuICAgICAgICAgIEJpbmRlci5vbigndG91Y2hzdGFydCcsIGVsZW1lbnRzW2ldLCB0aGlzLmNsaWNrLCBjYXB0dXJlKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFVuYmluZHMgZXZlbnRzIGJpbmRlZCB0byB0aGUgYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtIVE1MQ29sbGVjdGlvbn0gZWxlbWVudHNcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKGVsZW1lbnRzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBCaW5kZXIub2ZmKFsnY2xpY2snLCAndG91Y2hzdGFydCddLCBlbGVtZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBIYW5kbGVzIGBjbGlja2AgZXZlbnQgb24gdGhlIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgICAgICogTW92ZXMgc2xpZGVyIGluIGRyaWVjdGlvbiBwcmVjaXNlZCBpblxuICAgICAgICogYGRhdGEtZ2xpZGUtZGlyYCBhdHRyaWJ1dGUuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBjbGljazogZnVuY3Rpb24gY2xpY2soZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBDb21wb25lbnRzLlJ1bi5tYWtlKENvbXBvbmVudHMuRGlyZWN0aW9uLnJlc29sdmUoZXZlbnQuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZ2xpZGUtZGlyJykpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZGVmaW5lKENvbnRyb2xzLCAnaXRlbXMnLCB7XG4gICAgICAvKipcbiAgICAgICAqIEdldHMgY29sbGVjdGlvbiBvZiB0aGUgY29udHJvbHMgSFRNTCBlbGVtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudFtdfVxuICAgICAgICovXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIENvbnRyb2xzLl9jO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogU3dhcCBhY3RpdmUgY2xhc3Mgb2YgY3VycmVudCBuYXZpZ2F0aW9uIGl0ZW06XG4gICAgICogLSBhZnRlciBtb3VudGluZyB0byBzZXQgaXQgdG8gaW5pdGlhbCBpbmRleFxuICAgICAqIC0gYWZ0ZXIgZWFjaCBtb3ZlIHRvIHRoZSBuZXcgaW5kZXhcbiAgICAgKi9cbiAgICBFdmVudHMub24oWydtb3VudC5hZnRlcicsICdtb3ZlLmFmdGVyJ10sIGZ1bmN0aW9uICgpIHtcbiAgICAgIENvbnRyb2xzLnNldEFjdGl2ZSgpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGJpbmRpbmdzIGFuZCBIVE1MIENsYXNzZXM6XG4gICAgICogLSBvbiBkZXN0cm95aW5nLCB0byBicmluZyBtYXJrdXAgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICAgKi9cbiAgICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICBDb250cm9scy5yZW1vdmVCaW5kaW5ncygpO1xuICAgICAgQ29udHJvbHMucmVtb3ZlQWN0aXZlKCk7XG4gICAgICBCaW5kZXIuZGVzdHJveSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIENvbnRyb2xzO1xuICB9XG5cbiAgZnVuY3Rpb24gS2V5Ym9hcmQgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgICAvKipcbiAgICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgICAqXG4gICAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICAgKi9cbiAgICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuXG4gICAgdmFyIEtleWJvYXJkID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBCaW5kcyBrZXlib2FyZCBldmVudHMgb24gY29tcG9uZW50IG1vdW50LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgICAgaWYgKEdsaWRlLnNldHRpbmdzLmtleWJvYXJkKSB7XG4gICAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIGtleWJvYXJkIHByZXNzIGV2ZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgICAgICBCaW5kZXIub24oJ2tleXVwJywgZG9jdW1lbnQsIHRoaXMucHJlc3MpO1xuICAgICAgfSxcblxuXG4gICAgICAvKipcbiAgICAgICAqIFJlbW92ZXMga2V5Ym9hcmQgcHJlc3MgZXZlbnRzLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgKi9cbiAgICAgIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgICAgICBCaW5kZXIub2ZmKCdrZXl1cCcsIGRvY3VtZW50KTtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBIYW5kbGVzIGtleWJvYXJkJ3MgYXJyb3dzIHByZXNzIGFuZCBtb3ZpbmcgZ2xpZGUgZm93YXJkIGFuZCBiYWNrd2FyZC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50XG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBwcmVzczogZnVuY3Rpb24gcHJlc3MoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5KSB7XG4gICAgICAgICAgQ29tcG9uZW50cy5SdW4ubWFrZShDb21wb25lbnRzLkRpcmVjdGlvbi5yZXNvbHZlKCc+JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3KSB7XG4gICAgICAgICAgQ29tcG9uZW50cy5SdW4ubWFrZShDb21wb25lbnRzLkRpcmVjdGlvbi5yZXNvbHZlKCc8JykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBiaW5kaW5ncyBmcm9tIGtleWJvYXJkOlxuICAgICAqIC0gb24gZGVzdHJveWluZyB0byByZW1vdmUgYWRkZWQgZXZlbnRzXG4gICAgICogLSBvbiB1cGRhdGluZyB0byByZW1vdmUgZXZlbnRzIGJlZm9yZSByZW1vdW50aW5nXG4gICAgICovXG4gICAgRXZlbnRzLm9uKFsnZGVzdHJveScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgICAgS2V5Ym9hcmQudW5iaW5kKCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdW50IGNvbXBvbmVudFxuICAgICAqIC0gb24gdXBkYXRpbmcgdG8gcmVmbGVjdCBwb3RlbnRpYWwgY2hhbmdlcyBpbiBzZXR0aW5nc1xuICAgICAqL1xuICAgIEV2ZW50cy5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgS2V5Ym9hcmQubW91bnQoKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgYmluZGVyOlxuICAgICAqIC0gb24gZGVzdHJveWluZyB0byByZW1vdmUgbGlzdGVuZXJzXG4gICAgICovXG4gICAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBLZXlib2FyZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIEF1dG9wbGF5IChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gICAgLyoqXG4gICAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAgICovXG4gICAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcblxuICAgIHZhciBBdXRvcGxheSA9IHtcbiAgICAgIC8qKlxuICAgICAgICogSW5pdGlhbGl6ZXMgYXV0b3BsYXlpbmcgYW5kIGV2ZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICovXG4gICAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICAgIHRoaXMuc3RhcnQoKTtcblxuICAgICAgICBpZiAoR2xpZGUuc2V0dGluZ3MuaG92ZXJwYXVzZSkge1xuICAgICAgICAgIHRoaXMuYmluZCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogU3RhcnRzIGF1dG9wbGF5aW5nIGluIGNvbmZpZ3VyZWQgaW50ZXJ2YWwuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtCb29sZWFufE51bWJlcn0gZm9yY2UgUnVuIGF1dG9wbGF5aW5nIHdpdGggcGFzc2VkIGludGVydmFsIHJlZ2FyZGxlc3Mgb2YgYGF1dG9wbGF5YCBzZXR0aW5nc1xuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmIChHbGlkZS5zZXR0aW5ncy5hdXRvcGxheSkge1xuICAgICAgICAgIGlmIChpc1VuZGVmaW5lZCh0aGlzLl9pKSkge1xuICAgICAgICAgICAgdGhpcy5faSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgX3RoaXMuc3RvcCgpO1xuXG4gICAgICAgICAgICAgIENvbXBvbmVudHMuUnVuLm1ha2UoJz4nKTtcblxuICAgICAgICAgICAgICBfdGhpcy5zdGFydCgpO1xuICAgICAgICAgICAgfSwgdGhpcy50aW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBTdG9wcyBhdXRvcnVubmluZyBvZiB0aGUgZ2xpZGUuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgc3RvcDogZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgdGhpcy5faSA9IGNsZWFySW50ZXJ2YWwodGhpcy5faSk7XG4gICAgICB9LFxuXG5cbiAgICAgIC8qKlxuICAgICAgICogU3RvcHMgYXV0b3BsYXlpbmcgd2hpbGUgbW91c2UgaXMgb3ZlciBnbGlkZSdzIGFyZWEuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgQmluZGVyLm9uKCdtb3VzZW92ZXInLCBDb21wb25lbnRzLkh0bWwucm9vdCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzMi5zdG9wKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEJpbmRlci5vbignbW91c2VvdXQnLCBDb21wb25lbnRzLkh0bWwucm9vdCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzMi5zdGFydCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cblxuICAgICAgLyoqXG4gICAgICAgKiBVbmJpbmQgbW91c2VvdmVyIGV2ZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgICAqL1xuICAgICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICAgIEJpbmRlci5vZmYoWydtb3VzZW92ZXInLCAnbW91c2VvdXQnXSwgQ29tcG9uZW50cy5IdG1sLnJvb3QpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBkZWZpbmUoQXV0b3BsYXksICd0aW1lJywge1xuICAgICAgLyoqXG4gICAgICAgKiBHZXRzIHRpbWUgcGVyaW9kIHZhbHVlIGZvciB0aGUgYXV0b3BsYXkgaW50ZXJ2YWwuIFByaW9yaXRpemVzXG4gICAgICAgKiB0aW1lcyBpbiBgZGF0YS1nbGlkZS1hdXRvcGxheWAgYXR0cnVidXRlcyBvdmVyIG9wdGlvbnMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAgICovXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgdmFyIGF1dG9wbGF5ID0gQ29tcG9uZW50cy5IdG1sLnNsaWRlc1tHbGlkZS5pbmRleF0uZ2V0QXR0cmlidXRlKCdkYXRhLWdsaWRlLWF1dG9wbGF5Jyk7XG5cbiAgICAgICAgaWYgKGF1dG9wbGF5KSB7XG4gICAgICAgICAgcmV0dXJuIHRvSW50KGF1dG9wbGF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0b0ludChHbGlkZS5zZXR0aW5ncy5hdXRvcGxheSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBTdG9wIGF1dG9wbGF5aW5nIGFuZCB1bmJpbmQgZXZlbnRzOlxuICAgICAqIC0gb24gZGVzdHJveWluZywgdG8gY2xlYXIgZGVmaW5lZCBpbnRlcnZhbFxuICAgICAqIC0gb24gdXBkYXRpbmcgdmlhIEFQSSB0byByZXNldCBpbnRlcnZhbCB0aGF0IG1heSBjaGFuZ2VkXG4gICAgICovXG4gICAgRXZlbnRzLm9uKFsnZGVzdHJveScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgICAgQXV0b3BsYXkudW5iaW5kKCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBTdG9wIGF1dG9wbGF5aW5nOlxuICAgICAqIC0gYmVmb3JlIGVhY2ggcnVuLCB0byByZXN0YXJ0IGF1dG9wbGF5aW5nXG4gICAgICogLSBvbiBwYXVzaW5nIHZpYSBBUElcbiAgICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGNsZWFyIGRlZmluZWQgaW50ZXJ2YWxcbiAgICAgKiAtIHdoaWxlIHN0YXJ0aW5nIGEgc3dpcGVcbiAgICAgKiAtIG9uIHVwZGF0aW5nIHZpYSBBUEkgdG8gcmVzZXQgaW50ZXJ2YWwgdGhhdCBtYXkgY2hhbmdlZFxuICAgICAqL1xuICAgIEV2ZW50cy5vbihbJ3J1bi5iZWZvcmUnLCAncGF1c2UnLCAnZGVzdHJveScsICdzd2lwZS5zdGFydCcsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgICAgQXV0b3BsYXkuc3RvcCgpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogU3RhcnQgYXV0b3BsYXlpbmc6XG4gICAgICogLSBhZnRlciBlYWNoIHJ1biwgdG8gcmVzdGFydCBhdXRvcGxheWluZ1xuICAgICAqIC0gb24gcGxheWluZyB2aWEgQVBJXG4gICAgICogLSB3aGlsZSBlbmRpbmcgYSBzd2lwZVxuICAgICAqL1xuICAgIEV2ZW50cy5vbihbJ3J1bi5hZnRlcicsICdwbGF5JywgJ3N3aXBlLmVuZCddLCBmdW5jdGlvbiAoKSB7XG4gICAgICBBdXRvcGxheS5zdGFydCgpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3VudCBhdXRvcGxheWluZzpcbiAgICAgKiAtIG9uIHVwZGF0aW5nIHZpYSBBUEkgdG8gcmVzZXQgaW50ZXJ2YWwgdGhhdCBtYXkgY2hhbmdlZFxuICAgICAqL1xuICAgIEV2ZW50cy5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgQXV0b3BsYXkubW91bnQoKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgYSBiaW5kZXI6XG4gICAgICogLSBvbiBkZXN0cm95aW5nIGdsaWRlIGluc3RhbmNlIHRvIGNsZWFydXAgbGlzdGVuZXJzXG4gICAgICovXG4gICAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBBdXRvcGxheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTb3J0cyBrZXlzIG9mIGJyZWFrcG9pbnQgb2JqZWN0IHNvIHRoZXkgd2lsbCBiZSBvcmRlcmVkIGZyb20gbG93ZXIgdG8gYmlnZ2VyLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcG9pbnRzXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICBmdW5jdGlvbiBzb3J0QnJlYWtwb2ludHMocG9pbnRzKSB7XG4gICAgaWYgKGlzT2JqZWN0KHBvaW50cykpIHtcbiAgICAgIHJldHVybiBzb3J0S2V5cyhwb2ludHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3YXJuKCdCcmVha3BvaW50cyBvcHRpb24gbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge307XG4gIH1cblxuICBmdW5jdGlvbiBCcmVha3BvaW50cyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAgIC8qKlxuICAgICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgICAqL1xuICAgIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBIb2xkcyByZWZlcmVuY2UgdG8gc2V0dGluZ3MuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuXG4gICAgLyoqXG4gICAgICogSG9sZHMgcmVmZXJlbmNlIHRvIGJyZWFrcG9pbnRzIG9iamVjdCBpbiBzZXR0aW5ncy4gU29ydHMgYnJlYWtwb2ludHNcbiAgICAgKiBmcm9tIHNtYWxsZXIgdG8gbGFyZ2VyLiBJdCBpcyByZXF1aXJlZCBpbiBvcmRlciB0byBwcm9wZXJcbiAgICAgKiBtYXRjaGluZyBjdXJyZW50bHkgYWN0aXZlIGJyZWFrcG9pbnQgc2V0dGluZ3MuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHZhciBwb2ludHMgPSBzb3J0QnJlYWtwb2ludHMoc2V0dGluZ3MuYnJlYWtwb2ludHMpO1xuXG4gICAgLyoqXG4gICAgICogQ2FjaGUgaW5pdGlhbCBzZXR0aW5ncyBiZWZvcmUgb3ZlcndyaXR0aW5nLlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB2YXIgZGVmYXVsdHMgPSBfZXh0ZW5kcyh7fSwgc2V0dGluZ3MpO1xuXG4gICAgdmFyIEJyZWFrcG9pbnRzID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBNYXRjaGVzIHNldHRpbmdzIGZvciBjdXJyZWN0bHkgbWF0Y2hpbmcgbWVkaWEgYnJlYWtwb2ludC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gcG9pbnRzXG4gICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAgICovXG4gICAgICBtYXRjaDogZnVuY3Rpb24gbWF0Y2gocG9pbnRzKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93Lm1hdGNoTWVkaWEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgZm9yICh2YXIgcG9pbnQgaW4gcG9pbnRzKSB7XG4gICAgICAgICAgICBpZiAocG9pbnRzLmhhc093blByb3BlcnR5KHBvaW50KSkge1xuICAgICAgICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoJyhtYXgtd2lkdGg6ICcgKyBwb2ludCArICdweCknKS5tYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvaW50c1twb2ludF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmYXVsdHM7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE92ZXJ3cml0ZSBpbnN0YW5jZSBzZXR0aW5ncyB3aXRoIGN1cnJlbnRseSBtYXRjaGluZyBicmVha3BvaW50IHNldHRpbmdzLlxuICAgICAqIFRoaXMgaGFwcGVucyByaWdodCBhZnRlciBjb21wb25lbnQgaW5pdGlhbGl6YXRpb24uXG4gICAgICovXG4gICAgX2V4dGVuZHMoc2V0dGluZ3MsIEJyZWFrcG9pbnRzLm1hdGNoKHBvaW50cykpO1xuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGdsaWRlIHdpdGggc2V0dGluZ3Mgb2YgbWF0Y2hlZCBicmVrcG9pbnQ6XG4gICAgICogLSB3aW5kb3cgcmVzaXplIHRvIHVwZGF0ZSBzbGlkZXJcbiAgICAgKi9cbiAgICBCaW5kZXIub24oJ3Jlc2l6ZScsIHdpbmRvdywgdGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgICAgR2xpZGUuc2V0dGluZ3MgPSBtZXJnZU9wdGlvbnMoc2V0dGluZ3MsIEJyZWFrcG9pbnRzLm1hdGNoKHBvaW50cykpO1xuICAgIH0sIEdsaWRlLnNldHRpbmdzLnRocm90dGxlKSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXNvcnQgYW5kIHVwZGF0ZSBkZWZhdWx0IHNldHRpbmdzOlxuICAgICAqIC0gb24gcmVpbml0IHZpYSBBUEksIHNvIGJyZWFrcG9pbnQgbWF0Y2hpbmcgd2lsbCBiZSBwZXJmb3JtZWQgd2l0aCBvcHRpb25zXG4gICAgICovXG4gICAgRXZlbnRzLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBwb2ludHMgPSBzb3J0QnJlYWtwb2ludHMocG9pbnRzKTtcblxuICAgICAgZGVmYXVsdHMgPSBfZXh0ZW5kcyh7fSwgc2V0dGluZ3MpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIHJlc2l6ZSBsaXN0ZW5lcjpcbiAgICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGJyaW5nIG1hcmt1cCB0byBpdHMgaW5pdGlhbCBzdGF0ZVxuICAgICAqL1xuICAgIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIEJpbmRlci5vZmYoJ3Jlc2l6ZScsIHdpbmRvdyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gQnJlYWtwb2ludHM7XG4gIH1cblxuICB2YXIgQ09NUE9ORU5UUyA9IHtcbiAgICAvLyBSZXF1aXJlZFxuICAgIEh0bWw6IEh0bWwsXG4gICAgVHJhbnNsYXRlOiBUcmFuc2xhdGUsXG4gICAgVHJhbnNpdGlvbjogVHJhbnNpdGlvbixcbiAgICBEaXJlY3Rpb246IERpcmVjdGlvbixcbiAgICBQZWVrOiBQZWVrLFxuICAgIFNpemVzOiBTaXplcyxcbiAgICBHYXBzOiBHYXBzLFxuICAgIE1vdmU6IE1vdmUsXG4gICAgQ2xvbmVzOiBDbG9uZXMsXG4gICAgUmVzaXplOiBSZXNpemUsXG4gICAgQnVpbGQ6IEJ1aWxkLFxuICAgIFJ1bjogUnVuLFxuXG4gICAgLy8gT3B0aW9uYWxcbiAgICBTd2lwZTogU3dpcGUsXG4gICAgSW1hZ2VzOiBJbWFnZXMsXG4gICAgQW5jaG9yczogQW5jaG9ycyxcbiAgICBDb250cm9sczogQ29udHJvbHMsXG4gICAgS2V5Ym9hcmQ6IEtleWJvYXJkLFxuICAgIEF1dG9wbGF5OiBBdXRvcGxheSxcbiAgICBCcmVha3BvaW50czogQnJlYWtwb2ludHNcbiAgfTtcblxuICB2YXIgR2xpZGUkMSA9IGZ1bmN0aW9uIChfQ29yZSkge1xuICAgIGluaGVyaXRzKEdsaWRlJCQxLCBfQ29yZSk7XG5cbiAgICBmdW5jdGlvbiBHbGlkZSQkMSgpIHtcbiAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIEdsaWRlJCQxKTtcbiAgICAgIHJldHVybiBwb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChHbGlkZSQkMS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEdsaWRlJCQxKSkuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2xhc3MoR2xpZGUkJDEsIFt7XG4gICAgICBrZXk6ICdtb3VudCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICAgIHZhciBleHRlbnNpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICAgICAgICByZXR1cm4gZ2V0KEdsaWRlJCQxLnByb3RvdHlwZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEdsaWRlJCQxLnByb3RvdHlwZSksICdtb3VudCcsIHRoaXMpLmNhbGwodGhpcywgX2V4dGVuZHMoe30sIENPTVBPTkVOVFMsIGV4dGVuc2lvbnMpKTtcbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIEdsaWRlJCQxO1xuICB9KEdsaWRlKTtcblxuICByZXR1cm4gR2xpZGUkMTtcblxufSkpKTtcbiJdfQ==
