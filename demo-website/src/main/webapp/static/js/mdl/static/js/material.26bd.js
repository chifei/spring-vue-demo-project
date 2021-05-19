(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

;(function () {
    "use strict";

    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    /**
     * A component handler interface using the revealing module design pattern.
     * More details on this design pattern here:
     * https://github.com/jasonmayes/mdl-component-design-pattern
     *
     * @author Jason Mayes.
     */
    /* exported componentHandler */

    // Pre-defining the componentHandler interface, for closure documentation and
    // static verification.

    var componentHandler = {
        /**
         * Searches existing DOM for elements of our component type and upgrades them
         * if they have not already been upgraded.
         *
         * @param {string=} optJsClass the programatic name of the element class we
         * need to create a new instance of.
         * @param {string=} optCssClass the name of the CSS class elements of this
         * type will have.
         */
        upgradeDom: function upgradeDom(optJsClass, optCssClass) {},
        /**
         * Upgrades a specific element rather than all in the DOM.
         *
         * @param {!Element} element The element we wish to upgrade.
         * @param {string=} optJsClass Optional name of the class we want to upgrade
         * the element to.
         */
        upgradeElement: function upgradeElement(element, optJsClass) {},
        /**
         * Upgrades a specific list of elements rather than all in the DOM.
         *
         * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
         * The elements we wish to upgrade.
         */
        upgradeElements: function upgradeElements(elements) {},
        /**
         * Upgrades all registered components found in the current DOM. This is
         * automatically called on window load.
         */
        upgradeAllRegistered: function upgradeAllRegistered() {},
        /**
         * Allows user to be alerted to any upgrades that are performed for a given
         * component type
         *
         * @param {string} jsClass The class name of the MDL component we wish
         * to hook into for any upgrades performed.
         * @param {function(!HTMLElement)} callback The function to call upon an
         * upgrade. This function should expect 1 parameter - the HTMLElement which
         * got upgraded.
         */
        registerUpgradedCallback: function registerUpgradedCallback(jsClass, callback) {},
        /**
         * Registers a class for future use and attempts to upgrade existing DOM.
         *
         * @param {componentHandler.ComponentConfigPublic} config the registration configuration
         */
        register: function register(config) {},
        /**
         * Downgrade either a given node, an array of nodes, or a NodeList.
         *
         * @param {!Node|!Array<!Node>|!NodeList} nodes
         */
        downgradeElements: function downgradeElements(nodes) {}
    };

    componentHandler = function () {
        'use strict';

        /** @type {!Array<componentHandler.ComponentConfig>} */

        var registeredComponents_ = [];

        /** @type {!Array<componentHandler.Component>} */
        var createdComponents_ = [];

        var componentConfigProperty_ = 'mdlComponentConfigInternal_';

        /**
         * Searches registered components for a class we are interested in using.
         * Optionally replaces a match with passed object if specified.
         *
         * @param {string} name The name of a class we want to use.
         * @param {componentHandler.ComponentConfig=} optReplace Optional object to replace match with.
         * @return {!Object|boolean}
         * @private
         */
        function findRegisteredClass_(name, optReplace) {
            for (var i = 0; i < registeredComponents_.length; i++) {
                if (registeredComponents_[i].className === name) {
                    if (typeof optReplace !== 'undefined') {
                        registeredComponents_[i] = optReplace;
                    }
                    return registeredComponents_[i];
                }
            }
            return false;
        }

        /**
         * Returns an array of the classNames of the upgraded classes on the element.
         *
         * @param {!Element} element The element to fetch data from.
         * @return {!Array<string>}
         * @private
         */
        function getUpgradedListOfElement_(element) {
            var dataUpgraded = element.getAttribute('data-upgraded');
            // Use `['']` as default value to conform the `,name,name...` style.
            return dataUpgraded === null ? [''] : dataUpgraded.split(',');
        }

        /**
         * Returns true if the given element has already been upgraded for the given
         * class.
         *
         * @param {!Element} element The element we want to check.
         * @param {string} jsClass The class to check for.
         * @returns {boolean}
         * @private
         */
        function isElementUpgraded_(element, jsClass) {
            var upgradedList = getUpgradedListOfElement_(element);
            return upgradedList.indexOf(jsClass) !== -1;
        }

        /**
         * Create an event object.
         *
         * @param {string} eventType The type name of the event.
         * @param {boolean} bubbles Whether the event should bubble up the DOM.
         * @param {boolean} cancelable Whether the event can be canceled.
         * @returns {!Event}
         */
        function createEvent_(eventType, bubbles, cancelable) {
            if ('CustomEvent' in window && typeof window.CustomEvent === 'function') {
                return new CustomEvent(eventType, {
                    bubbles: bubbles,
                    cancelable: cancelable
                });
            } else {
                var ev = document.createEvent('Events');
                ev.initEvent(eventType, bubbles, cancelable);
                return ev;
            }
        }

        /**
         * Searches existing DOM for elements of our component type and upgrades them
         * if they have not already been upgraded.
         *
         * @param {string=} optJsClass the programatic name of the element class we
         * need to create a new instance of.
         * @param {string=} optCssClass the name of the CSS class elements of this
         * type will have.
         */
        function upgradeDomInternal(optJsClass, optCssClass) {
            if (typeof optJsClass === 'undefined' && typeof optCssClass === 'undefined') {
                for (var i = 0; i < registeredComponents_.length; i++) {
                    upgradeDomInternal(registeredComponents_[i].className, registeredComponents_[i].cssClass);
                }
            } else {
                var jsClass = /** @type {string} */optJsClass;
                if (typeof optCssClass === 'undefined') {
                    var registeredClass = findRegisteredClass_(jsClass);
                    if (registeredClass) {
                        optCssClass = registeredClass.cssClass;
                    }
                }

                var elements = document.querySelectorAll('.' + optCssClass);
                for (var n = 0; n < elements.length; n++) {
                    upgradeElementInternal(elements[n], jsClass);
                }
            }
        }

        /**
         * Upgrades a specific element rather than all in the DOM.
         *
         * @param {!Element} element The element we wish to upgrade.
         * @param {string=} optJsClass Optional name of the class we want to upgrade
         * the element to.
         */
        function upgradeElementInternal(element, optJsClass) {
            // Verify argument type.
            if (!((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' && element instanceof Element)) {
                throw new Error('Invalid argument provided to upgrade MDL element.');
            }
            // Allow upgrade to be canceled by canceling emitted event.
            var upgradingEv = createEvent_('mdl-componentupgrading', true, true);
            element.dispatchEvent(upgradingEv);
            if (upgradingEv.defaultPrevented) {
                return;
            }

            var upgradedList = getUpgradedListOfElement_(element);
            var classesToUpgrade = [];
            // If jsClass is not provided scan the registered components to find the
            // ones matching the element's CSS classList.
            if (!optJsClass) {
                var classList = element.classList;
                registeredComponents_.forEach(function (component) {
                    // Match CSS & Not to be upgraded & Not upgraded.
                    if (classList.contains(component.cssClass) && classesToUpgrade.indexOf(component) === -1 && !isElementUpgraded_(element, component.className)) {
                        classesToUpgrade.push(component);
                    }
                });
            } else if (!isElementUpgraded_(element, optJsClass)) {
                classesToUpgrade.push(findRegisteredClass_(optJsClass));
            }

            // Upgrade the element for each classes.
            for (var i = 0, n = classesToUpgrade.length, registeredClass; i < n; i++) {
                registeredClass = classesToUpgrade[i];
                if (registeredClass) {
                    // Mark element as upgraded.
                    upgradedList.push(registeredClass.className);
                    element.setAttribute('data-upgraded', upgradedList.join(','));
                    var instance = new registeredClass.classConstructor(element);
                    instance[componentConfigProperty_] = registeredClass;
                    createdComponents_.push(instance);
                    // Call any callbacks the user has registered with this component type.
                    for (var j = 0, m = registeredClass.callbacks.length; j < m; j++) {
                        registeredClass.callbacks[j](element);
                    }

                    if (registeredClass.widget) {
                        // Assign per element instance for control over API
                        element[registeredClass.className] = instance;
                    }
                } else {
                    throw new Error('Unable to find a registered component for the given class.');
                }

                var upgradedEv = createEvent_('mdl-componentupgraded', true, false);
                element.dispatchEvent(upgradedEv);
            }
        }

        /**
         * Upgrades a specific list of elements rather than all in the DOM.
         *
         * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
         * The elements we wish to upgrade.
         */
        function upgradeElementsInternal(elements) {
            if (!Array.isArray(elements)) {
                if (elements instanceof Element) {
                    elements = [elements];
                } else {
                    elements = Array.prototype.slice.call(elements);
                }
            }
            for (var i = 0, n = elements.length, element; i < n; i++) {
                element = elements[i];
                if (element instanceof HTMLElement) {
                    upgradeElementInternal(element);
                    if (element.children.length > 0) {
                        upgradeElementsInternal(element.children);
                    }
                }
            }
        }

        /**
         * Registers a class for future use and attempts to upgrade existing DOM.
         *
         * @param {componentHandler.ComponentConfigPublic} config
         */
        function registerInternal(config) {
            // In order to support both Closure-compiled and uncompiled code accessing
            // this method, we need to allow for both the dot and array syntax for
            // property access. You'll therefore see the `foo.bar || foo['bar']`
            // pattern repeated across this method.
            var widgetMissing = typeof config.widget === 'undefined' && typeof config['widget'] === 'undefined';
            var widget = true;

            if (!widgetMissing) {
                widget = config.widget || config['widget'];
            }

            var newConfig = /** @type {componentHandler.ComponentConfig} */{
                classConstructor: config.constructor || config['constructor'],
                className: config.classAsString || config['classAsString'],
                cssClass: config.cssClass || config['cssClass'],
                widget: widget,
                callbacks: []
            };

            registeredComponents_.forEach(function (item) {
                if (item.cssClass === newConfig.cssClass) {
                    throw new Error('The provided cssClass has already been registered: ' + item.cssClass);
                }
                if (item.className === newConfig.className) {
                    throw new Error('The provided className has already been registered');
                }
            });

            if (config.constructor.prototype.hasOwnProperty(componentConfigProperty_)) {
                throw new Error('MDL component classes must not have ' + componentConfigProperty_ + ' defined as a property.');
            }

            var found = findRegisteredClass_(config.classAsString, newConfig);

            if (!found) {
                registeredComponents_.push(newConfig);
            }
        }

        /**
         * Allows user to be alerted to any upgrades that are performed for a given
         * component type
         *
         * @param {string} jsClass The class name of the MDL component we wish
         * to hook into for any upgrades performed.
         * @param {function(!HTMLElement)} callback The function to call upon an
         * upgrade. This function should expect 1 parameter - the HTMLElement which
         * got upgraded.
         */
        function registerUpgradedCallbackInternal(jsClass, callback) {
            var regClass = findRegisteredClass_(jsClass);
            if (regClass) {
                regClass.callbacks.push(callback);
            }
        }

        /**
         * Upgrades all registered components found in the current DOM. This is
         * automatically called on window load.
         */
        function upgradeAllRegisteredInternal() {
            for (var n = 0; n < registeredComponents_.length; n++) {
                upgradeDomInternal(registeredComponents_[n].className);
            }
        }

        /**
         * Check the component for the downgrade method.
         * Execute if found.
         * Remove component from createdComponents list.
         *
         * @param {?componentHandler.Component} component
         */
        function deconstructComponentInternal(component) {
            if (component) {
                var componentIndex = createdComponents_.indexOf(component);
                createdComponents_.splice(componentIndex, 1);

                var upgrades = component.element_.getAttribute('data-upgraded').split(',');
                var componentPlace = upgrades.indexOf(component[componentConfigProperty_].classAsString);
                upgrades.splice(componentPlace, 1);
                component.element_.setAttribute('data-upgraded', upgrades.join(','));

                var ev = createEvent_('mdl-componentdowngraded', true, false);
                component.element_.dispatchEvent(ev);
            }
        }

        /**
         * Downgrade either a given node, an array of nodes, or a NodeList.
         *
         * @param {!Node|!Array<!Node>|!NodeList} nodes
         */
        function downgradeNodesInternal(nodes) {
            /**
             * Auxiliary function to downgrade a single node.
             * @param  {!Node} node the node to be downgraded
             */
            var downgradeNode = function downgradeNode(node) {
                createdComponents_.filter(function (item) {
                    return item.element_ === node;
                }).forEach(deconstructComponentInternal);
            };
            if (nodes instanceof Array || nodes instanceof NodeList) {
                for (var n = 0; n < nodes.length; n++) {
                    downgradeNode(nodes[n]);
                }
            } else if (nodes instanceof Node) {
                downgradeNode(nodes);
            } else {
                throw new Error('Invalid argument provided to downgrade MDL nodes.');
            }
        }

        // Now return the functions that should be made public with their publicly
        // facing names...
        return {
            upgradeDom: upgradeDomInternal,
            upgradeElement: upgradeElementInternal,
            upgradeElements: upgradeElementsInternal,
            upgradeAllRegistered: upgradeAllRegisteredInternal,
            registerUpgradedCallback: registerUpgradedCallbackInternal,
            register: registerInternal,
            downgradeElements: downgradeNodesInternal
        };
    }();

    /**
     * Describes the type of a registered component type managed by
     * componentHandler. Provided for benefit of the Closure compiler.
     *
     * @typedef {{
     *   constructor: Function,
     *   classAsString: string,
     *   cssClass: string,
     *   widget: (string|boolean|undefined)
     * }}
     */
    componentHandler.ComponentConfigPublic; // jshint ignore:line

    /**
     * Describes the type of a registered component type managed by
     * componentHandler. Provided for benefit of the Closure compiler.
     *
     * @typedef {{
     *   constructor: !Function,
     *   className: string,
     *   cssClass: string,
     *   widget: (string|boolean),
     *   callbacks: !Array<function(!HTMLElement)>
     * }}
     */
    componentHandler.ComponentConfig; // jshint ignore:line

    /**
     * Created component (i.e., upgraded element) type as managed by
     * componentHandler. Provided for benefit of the Closure compiler.
     *
     * @typedef {{
     *   element_: !HTMLElement,
     *   className: string,
     *   classAsString: string,
     *   cssClass: string,
     *   widget: string
     * }}
     */
    componentHandler.Component; // jshint ignore:line

    // Export all symbols, for the benefit of Closure compiler.
    // No effect on uncompiled code.
    componentHandler['upgradeDom'] = componentHandler.upgradeDom;
    componentHandler['upgradeElement'] = componentHandler.upgradeElement;
    componentHandler['upgradeElements'] = componentHandler.upgradeElements;
    componentHandler['upgradeAllRegistered'] = componentHandler.upgradeAllRegistered;
    componentHandler['registerUpgradedCallback'] = componentHandler.registerUpgradedCallback;
    componentHandler['register'] = componentHandler.register;
    componentHandler['downgradeElements'] = componentHandler.downgradeElements;
    window.componentHandler = componentHandler;
    window['componentHandler'] = componentHandler;

    window.addEventListener('load', function () {
        'use strict';

        /**
         * Performs a "Cutting the mustard" test. If the browser supports the features
         * tested, adds a mdl-js class to the <html> element. It then upgrades all MDL
         * components requiring JavaScript.
         */

        if ('classList' in document.createElement('div') && 'querySelector' in document && 'addEventListener' in window && Array.prototype.forEach) {
            document.documentElement.classList.add('mdl-js');
            componentHandler.upgradeAllRegistered();
        } else {
            /**
             * Dummy function to avoid JS errors.
             */
            componentHandler.upgradeElement = function () {};
            /**
             * Dummy function to avoid JS errors.
             */
            componentHandler.register = function () {};
        }
    });

    // Source: https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js
    // Adapted from https://gist.github.com/paulirish/1579671 which derived from
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    // requestAnimationFrame polyfill by Erik Möller.
    // Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon
    // MIT license
    if (!Date.now) {
        /**
         * Date.now polyfill.
         * @return {number} the current Date
         */
        Date.now = function () {
            return new Date().getTime();
        };
        Date['now'] = Date.now;
    }
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
        window['requestAnimationFrame'] = window.requestAnimationFrame;
        window['cancelAnimationFrame'] = window.cancelAnimationFrame;
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        /**
         * requestAnimationFrame polyfill.
         * @param  {!Function} callback the callback function.
         */
        window.requestAnimationFrame = function (callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function () {
                callback(lastTime = nextTime);
            }, nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
        window['requestAnimationFrame'] = window.requestAnimationFrame;
        window['cancelAnimationFrame'] = window.cancelAnimationFrame;
    }
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Button MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialButton = function MaterialButton(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialButton'] = MaterialButton;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialButton.prototype.Constant_ = {};
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialButton.prototype.CssClasses_ = {
        RIPPLE_EFFECT: 'mdl-js-ripple-effect',
        RIPPLE_CONTAINER: 'mdl-button__ripple-container',
        RIPPLE: 'mdl-ripple'
    };
    /**
       * Handle blur of element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialButton.prototype.blurHandler_ = function (event) {
        if (event) {
            this.element_.blur();
        }
    };
    // Public methods.
    /**
       * Disable button.
       *
       * @public
       */
    MaterialButton.prototype.disable = function () {
        this.element_.disabled = true;
    };
    MaterialButton.prototype['disable'] = MaterialButton.prototype.disable;
    /**
       * Enable button.
       *
       * @public
       */
    MaterialButton.prototype.enable = function () {
        this.element_.disabled = false;
    };
    MaterialButton.prototype['enable'] = MaterialButton.prototype.enable;
    /**
       * Initialize element.
       */
    MaterialButton.prototype.init = function () {
        if (this.element_) {
            if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
                var rippleContainer = document.createElement('span');
                rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
                this.rippleElement_ = document.createElement('span');
                this.rippleElement_.classList.add(this.CssClasses_.RIPPLE);
                rippleContainer.appendChild(this.rippleElement_);
                this.boundRippleBlurHandler = this.blurHandler_.bind(this);
                this.rippleElement_.addEventListener('mouseup', this.boundRippleBlurHandler);
                this.element_.appendChild(rippleContainer);
            }
            this.boundButtonBlurHandler = this.blurHandler_.bind(this);
            this.element_.addEventListener('mouseup', this.boundButtonBlurHandler);
            this.element_.addEventListener('mouseleave', this.boundButtonBlurHandler);
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialButton,
        classAsString: 'MaterialButton',
        cssClass: 'mdl-js-button',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Checkbox MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialCheckbox = function MaterialCheckbox(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialCheckbox'] = MaterialCheckbox;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialCheckbox.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialCheckbox.prototype.CssClasses_ = {
        INPUT: 'mdl-checkbox__input',
        BOX_OUTLINE: 'mdl-checkbox__box-outline',
        FOCUS_HELPER: 'mdl-checkbox__focus-helper',
        TICK_OUTLINE: 'mdl-checkbox__tick-outline',
        RIPPLE_EFFECT: 'mdl-js-ripple-effect',
        RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
        RIPPLE_CONTAINER: 'mdl-checkbox__ripple-container',
        RIPPLE_CENTER: 'mdl-ripple--center',
        RIPPLE: 'mdl-ripple',
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_CHECKED: 'is-checked',
        IS_UPGRADED: 'is-upgraded'
    };
    /**
       * Handle change of state.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialCheckbox.prototype.onChange_ = function (event) {
        this.updateClasses_();
    };
    /**
       * Handle focus of element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialCheckbox.prototype.onFocus_ = function (event) {
        this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle lost focus of element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialCheckbox.prototype.onBlur_ = function (event) {
        this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle mouseup.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialCheckbox.prototype.onMouseUp_ = function (event) {
        this.blur_();
    };
    /**
       * Handle class updates.
       *
       * @private
       */
    MaterialCheckbox.prototype.updateClasses_ = function () {
        this.checkDisabled();
        this.checkToggleState();
    };
    /**
       * Add blur.
       *
       * @private
       */
    MaterialCheckbox.prototype.blur_ = function () {
        // TODO: figure out why there's a focus event being fired after our blur,
        // so that we can avoid this hack.
        window.setTimeout(function () {
            this.inputElement_.blur();
        }.bind(this), this.Constant_.TINY_TIMEOUT);
    };
    // Public methods.
    /**
       * Check the inputs toggle state and update display.
       *
       * @public
       */
    MaterialCheckbox.prototype.checkToggleState = function () {
        if (this.inputElement_.checked) {
            this.element_.classList.add(this.CssClasses_.IS_CHECKED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
        }
    };
    MaterialCheckbox.prototype['checkToggleState'] = MaterialCheckbox.prototype.checkToggleState;
    /**
       * Check the inputs disabled state and update display.
       *
       * @public
       */
    MaterialCheckbox.prototype.checkDisabled = function () {
        if (this.inputElement_.disabled) {
            this.element_.classList.add(this.CssClasses_.IS_DISABLED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
        }
    };
    MaterialCheckbox.prototype['checkDisabled'] = MaterialCheckbox.prototype.checkDisabled;
    /**
       * Disable checkbox.
       *
       * @public
       */
    MaterialCheckbox.prototype.disable = function () {
        this.inputElement_.disabled = true;
        this.updateClasses_();
    };
    MaterialCheckbox.prototype['disable'] = MaterialCheckbox.prototype.disable;
    /**
       * Enable checkbox.
       *
       * @public
       */
    MaterialCheckbox.prototype.enable = function () {
        this.inputElement_.disabled = false;
        this.updateClasses_();
    };
    MaterialCheckbox.prototype['enable'] = MaterialCheckbox.prototype.enable;
    /**
       * Check checkbox.
       *
       * @public
       */
    MaterialCheckbox.prototype.check = function () {
        this.inputElement_.checked = true;
        this.updateClasses_();
    };
    MaterialCheckbox.prototype['check'] = MaterialCheckbox.prototype.check;
    /**
       * Uncheck checkbox.
       *
       * @public
       */
    MaterialCheckbox.prototype.uncheck = function () {
        this.inputElement_.checked = false;
        this.updateClasses_();
    };
    MaterialCheckbox.prototype['uncheck'] = MaterialCheckbox.prototype.uncheck;
    /**
       * Initialize element.
       */
    MaterialCheckbox.prototype.init = function () {
        if (this.element_) {
            this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
            var boxOutline = document.createElement('span');
            boxOutline.classList.add(this.CssClasses_.BOX_OUTLINE);
            var tickContainer = document.createElement('span');
            tickContainer.classList.add(this.CssClasses_.FOCUS_HELPER);
            var tickOutline = document.createElement('span');
            tickOutline.classList.add(this.CssClasses_.TICK_OUTLINE);
            boxOutline.appendChild(tickOutline);
            this.element_.appendChild(tickContainer);
            this.element_.appendChild(boxOutline);
            if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
                this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
                this.rippleContainerElement_ = document.createElement('span');
                this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
                this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);
                this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
                this.boundRippleMouseUp = this.onMouseUp_.bind(this);
                this.rippleContainerElement_.addEventListener('mouseup', this.boundRippleMouseUp);
                var ripple = document.createElement('span');
                ripple.classList.add(this.CssClasses_.RIPPLE);
                this.rippleContainerElement_.appendChild(ripple);
                this.element_.appendChild(this.rippleContainerElement_);
            }
            this.boundInputOnChange = this.onChange_.bind(this);
            this.boundInputOnFocus = this.onFocus_.bind(this);
            this.boundInputOnBlur = this.onBlur_.bind(this);
            this.boundElementMouseUp = this.onMouseUp_.bind(this);
            this.inputElement_.addEventListener('change', this.boundInputOnChange);
            this.inputElement_.addEventListener('focus', this.boundInputOnFocus);
            this.inputElement_.addEventListener('blur', this.boundInputOnBlur);
            this.element_.addEventListener('mouseup', this.boundElementMouseUp);
            this.updateClasses_();
            this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialCheckbox,
        classAsString: 'MaterialCheckbox',
        cssClass: 'mdl-js-checkbox',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for icon toggle MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialIconToggle = function MaterialIconToggle(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialIconToggle'] = MaterialIconToggle;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialIconToggle.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialIconToggle.prototype.CssClasses_ = {
        INPUT: 'mdl-icon-toggle__input',
        JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
        RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
        RIPPLE_CONTAINER: 'mdl-icon-toggle__ripple-container',
        RIPPLE_CENTER: 'mdl-ripple--center',
        RIPPLE: 'mdl-ripple',
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_CHECKED: 'is-checked'
    };
    /**
       * Handle change of state.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialIconToggle.prototype.onChange_ = function (event) {
        this.updateClasses_();
    };
    /**
       * Handle focus of element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialIconToggle.prototype.onFocus_ = function (event) {
        this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle lost focus of element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialIconToggle.prototype.onBlur_ = function (event) {
        this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle mouseup.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialIconToggle.prototype.onMouseUp_ = function (event) {
        this.blur_();
    };
    /**
       * Handle class updates.
       *
       * @private
       */
    MaterialIconToggle.prototype.updateClasses_ = function () {
        this.checkDisabled();
        this.checkToggleState();
    };
    /**
       * Add blur.
       *
       * @private
       */
    MaterialIconToggle.prototype.blur_ = function () {
        // TODO: figure out why there's a focus event being fired after our blur,
        // so that we can avoid this hack.
        window.setTimeout(function () {
            this.inputElement_.blur();
        }.bind(this), this.Constant_.TINY_TIMEOUT);
    };
    // Public methods.
    /**
       * Check the inputs toggle state and update display.
       *
       * @public
       */
    MaterialIconToggle.prototype.checkToggleState = function () {
        if (this.inputElement_.checked) {
            this.element_.classList.add(this.CssClasses_.IS_CHECKED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
        }
    };
    MaterialIconToggle.prototype['checkToggleState'] = MaterialIconToggle.prototype.checkToggleState;
    /**
       * Check the inputs disabled state and update display.
       *
       * @public
       */
    MaterialIconToggle.prototype.checkDisabled = function () {
        if (this.inputElement_.disabled) {
            this.element_.classList.add(this.CssClasses_.IS_DISABLED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
        }
    };
    MaterialIconToggle.prototype['checkDisabled'] = MaterialIconToggle.prototype.checkDisabled;
    /**
       * Disable icon toggle.
       *
       * @public
       */
    MaterialIconToggle.prototype.disable = function () {
        this.inputElement_.disabled = true;
        this.updateClasses_();
    };
    MaterialIconToggle.prototype['disable'] = MaterialIconToggle.prototype.disable;
    /**
       * Enable icon toggle.
       *
       * @public
       */
    MaterialIconToggle.prototype.enable = function () {
        this.inputElement_.disabled = false;
        this.updateClasses_();
    };
    MaterialIconToggle.prototype['enable'] = MaterialIconToggle.prototype.enable;
    /**
       * Check icon toggle.
       *
       * @public
       */
    MaterialIconToggle.prototype.check = function () {
        this.inputElement_.checked = true;
        this.updateClasses_();
    };
    MaterialIconToggle.prototype['check'] = MaterialIconToggle.prototype.check;
    /**
       * Uncheck icon toggle.
       *
       * @public
       */
    MaterialIconToggle.prototype.uncheck = function () {
        this.inputElement_.checked = false;
        this.updateClasses_();
    };
    MaterialIconToggle.prototype['uncheck'] = MaterialIconToggle.prototype.uncheck;
    /**
       * Initialize element.
       */
    MaterialIconToggle.prototype.init = function () {
        if (this.element_) {
            this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
            if (this.element_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)) {
                this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
                this.rippleContainerElement_ = document.createElement('span');
                this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
                this.rippleContainerElement_.classList.add(this.CssClasses_.JS_RIPPLE_EFFECT);
                this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
                this.boundRippleMouseUp = this.onMouseUp_.bind(this);
                this.rippleContainerElement_.addEventListener('mouseup', this.boundRippleMouseUp);
                var ripple = document.createElement('span');
                ripple.classList.add(this.CssClasses_.RIPPLE);
                this.rippleContainerElement_.appendChild(ripple);
                this.element_.appendChild(this.rippleContainerElement_);
            }
            this.boundInputOnChange = this.onChange_.bind(this);
            this.boundInputOnFocus = this.onFocus_.bind(this);
            this.boundInputOnBlur = this.onBlur_.bind(this);
            this.boundElementOnMouseUp = this.onMouseUp_.bind(this);
            this.inputElement_.addEventListener('change', this.boundInputOnChange);
            this.inputElement_.addEventListener('focus', this.boundInputOnFocus);
            this.inputElement_.addEventListener('blur', this.boundInputOnBlur);
            this.element_.addEventListener('mouseup', this.boundElementOnMouseUp);
            this.updateClasses_();
            this.element_.classList.add('is-upgraded');
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialIconToggle,
        classAsString: 'MaterialIconToggle',
        cssClass: 'mdl-js-icon-toggle',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for dropdown MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialMenu = function MaterialMenu(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialMenu'] = MaterialMenu;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialMenu.prototype.Constant_ = {
        // Total duration of the menu animation.
        TRANSITION_DURATION_SECONDS: 0.3,
        // The fraction of the total duration we want to use for menu item animations.
        TRANSITION_DURATION_FRACTION: 0.8,
        // How long the menu stays open after choosing an option (so the user can see
        // the ripple).
        CLOSE_TIMEOUT: 150
    };
    /**
       * Keycodes, for code readability.
       *
       * @enum {number}
       * @private
       */
    MaterialMenu.prototype.Keycodes_ = {
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        UP_ARROW: 38,
        DOWN_ARROW: 40
    };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialMenu.prototype.CssClasses_ = {
        CONTAINER: 'mdl-menu__container',
        OUTLINE: 'mdl-menu__outline',
        ITEM: 'mdl-menu__item',
        ITEM_RIPPLE_CONTAINER: 'mdl-menu__item-ripple-container',
        RIPPLE_EFFECT: 'mdl-js-ripple-effect',
        RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
        RIPPLE: 'mdl-ripple',
        // Statuses
        IS_UPGRADED: 'is-upgraded',
        IS_VISIBLE: 'is-visible',
        IS_ANIMATING: 'is-animating',
        // Alignment options
        BOTTOM_LEFT: 'mdl-menu--bottom-left',
        // This is the default.
        BOTTOM_RIGHT: 'mdl-menu--bottom-right',
        TOP_LEFT: 'mdl-menu--top-left',
        TOP_RIGHT: 'mdl-menu--top-right',
        UNALIGNED: 'mdl-menu--unaligned'
    };
    /**
       * Initialize element.
       */
    MaterialMenu.prototype.init = function () {
        if (this.element_) {
            // Create container for the menu.
            var container = document.createElement('div');
            container.classList.add(this.CssClasses_.CONTAINER);
            this.element_.parentElement.insertBefore(container, this.element_);
            this.element_.parentElement.removeChild(this.element_);
            container.appendChild(this.element_);
            this.container_ = container;
            // Create outline for the menu (shadow and background).
            var outline = document.createElement('div');
            outline.classList.add(this.CssClasses_.OUTLINE);
            this.outline_ = outline;
            container.insertBefore(outline, this.element_);
            // Find the "for" element and bind events to it.
            var forElId = this.element_.getAttribute('for') || this.element_.getAttribute('data-mdl-for');
            var forEl = null;
            if (forElId) {
                forEl = document.getElementById(forElId);
                if (forEl) {
                    this.forElement_ = forEl;
                    forEl.addEventListener('click', this.handleForClick_.bind(this));
                    forEl.addEventListener('keydown', this.handleForKeyboardEvent_.bind(this));
                }
            }
            var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
            this.boundItemKeydown_ = this.handleItemKeyboardEvent_.bind(this);
            this.boundItemClick_ = this.handleItemClick_.bind(this);
            for (var i = 0; i < items.length; i++) {
                // Add a listener to each menu item.
                items[i].addEventListener('click', this.boundItemClick_);
                // Add a tab index to each menu item.
                items[i].tabIndex = '-1';
                // Add a keyboard listener to each menu item.
                items[i].addEventListener('keydown', this.boundItemKeydown_);
            }
            // Add ripple classes to each item, if the user has enabled ripples.
            if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
                this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
                for (i = 0; i < items.length; i++) {
                    var item = items[i];
                    var rippleContainer = document.createElement('span');
                    rippleContainer.classList.add(this.CssClasses_.ITEM_RIPPLE_CONTAINER);
                    var ripple = document.createElement('span');
                    ripple.classList.add(this.CssClasses_.RIPPLE);
                    rippleContainer.appendChild(ripple);
                    item.appendChild(rippleContainer);
                    item.classList.add(this.CssClasses_.RIPPLE_EFFECT);
                }
            }
            // Copy alignment classes to the container, so the outline can use them.
            if (this.element_.classList.contains(this.CssClasses_.BOTTOM_LEFT)) {
                this.outline_.classList.add(this.CssClasses_.BOTTOM_LEFT);
            }
            if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
                this.outline_.classList.add(this.CssClasses_.BOTTOM_RIGHT);
            }
            if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
                this.outline_.classList.add(this.CssClasses_.TOP_LEFT);
            }
            if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
                this.outline_.classList.add(this.CssClasses_.TOP_RIGHT);
            }
            if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
                this.outline_.classList.add(this.CssClasses_.UNALIGNED);
            }
            container.classList.add(this.CssClasses_.IS_UPGRADED);
        }
    };
    /**
       * Handles a click on the "for" element, by positioning the menu and then
       * toggling it.
       *
       * @param {Event} evt The event that fired.
       * @private
       */
    MaterialMenu.prototype.handleForClick_ = function (evt) {
        if (this.element_ && this.forElement_) {
            var rect = this.forElement_.getBoundingClientRect();
            var forRect = this.forElement_.parentElement.getBoundingClientRect();
            if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {} else if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
                // Position below the "for" element, aligned to its right.
                this.container_.style.right = forRect.right - rect.right + 'px';
                this.container_.style.top = this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
            } else if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
                // Position above the "for" element, aligned to its left.
                this.container_.style.left = this.forElement_.offsetLeft + 'px';
                this.container_.style.bottom = forRect.bottom - rect.top + 'px';
            } else if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
                // Position above the "for" element, aligned to its right.
                this.container_.style.right = forRect.right - rect.right + 'px';
                this.container_.style.bottom = forRect.bottom - rect.top + 'px';
            } else {
                // Default: position below the "for" element, aligned to its left.
                this.container_.style.left = this.forElement_.offsetLeft + 'px';
                this.container_.style.top = this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
            }
        }
        this.toggle(evt);
    };
    /**
       * Handles a keyboard event on the "for" element.
       *
       * @param {Event} evt The event that fired.
       * @private
       */
    MaterialMenu.prototype.handleForKeyboardEvent_ = function (evt) {
        if (this.element_ && this.container_ && this.forElement_) {
            var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM + ':not([disabled])');
            if (items && items.length > 0 && this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
                if (evt.keyCode === this.Keycodes_.UP_ARROW) {
                    evt.preventDefault();
                    items[items.length - 1].focus();
                } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
                    evt.preventDefault();
                    items[0].focus();
                }
            }
        }
    };
    /**
       * Handles a keyboard event on an item.
       *
       * @param {Event} evt The event that fired.
       * @private
       */
    MaterialMenu.prototype.handleItemKeyboardEvent_ = function (evt) {
        if (this.element_ && this.container_) {
            var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM + ':not([disabled])');
            if (items && items.length > 0 && this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
                var currentIndex = Array.prototype.slice.call(items).indexOf(evt.target);
                if (evt.keyCode === this.Keycodes_.UP_ARROW) {
                    evt.preventDefault();
                    if (currentIndex > 0) {
                        items[currentIndex - 1].focus();
                    } else {
                        items[items.length - 1].focus();
                    }
                } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
                    evt.preventDefault();
                    if (items.length > currentIndex + 1) {
                        items[currentIndex + 1].focus();
                    } else {
                        items[0].focus();
                    }
                } else if (evt.keyCode === this.Keycodes_.SPACE || evt.keyCode === this.Keycodes_.ENTER) {
                    evt.preventDefault();
                    // Send mousedown and mouseup to trigger ripple.
                    var e = new MouseEvent('mousedown');
                    evt.target.dispatchEvent(e);
                    e = new MouseEvent('mouseup');
                    evt.target.dispatchEvent(e);
                    // Send click.
                    evt.target.click();
                } else if (evt.keyCode === this.Keycodes_.ESCAPE) {
                    evt.preventDefault();
                    this.hide();
                }
            }
        }
    };
    /**
       * Handles a click event on an item.
       *
       * @param {Event} evt The event that fired.
       * @private
       */
    MaterialMenu.prototype.handleItemClick_ = function (evt) {
        if (evt.target.hasAttribute('disabled')) {
            evt.stopPropagation();
        } else {
            // Wait some time before closing menu, so the user can see the ripple.
            this.closing_ = true;
            window.setTimeout(function (evt) {
                this.hide();
                this.closing_ = false;
            }.bind(this), this.Constant_.CLOSE_TIMEOUT);
        }
    };
    /**
       * Calculates the initial clip (for opening the menu) or final clip (for closing
       * it), and applies it. This allows us to animate from or to the correct point,
       * that is, the point it's aligned to in the "for" element.
       *
       * @param {number} height Height of the clip rectangle
       * @param {number} width Width of the clip rectangle
       * @private
       */
    MaterialMenu.prototype.applyClip_ = function (height, width) {
        if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
            // Do not clip.
            this.element_.style.clip = '';
        } else if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
            // Clip to the top right corner of the menu.
            this.element_.style.clip = 'rect(0 ' + width + 'px ' + '0 ' + width + 'px)';
        } else if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
            // Clip to the bottom left corner of the menu.
            this.element_.style.clip = 'rect(' + height + 'px 0 ' + height + 'px 0)';
        } else if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
            // Clip to the bottom right corner of the menu.
            this.element_.style.clip = 'rect(' + height + 'px ' + width + 'px ' + height + 'px ' + width + 'px)';
        } else {
            // Default: do not clip (same as clipping to the top left corner).
            this.element_.style.clip = '';
        }
    };
    /**
       * Cleanup function to remove animation listeners.
       *
       * @param {Event} evt
       * @private
       */
    MaterialMenu.prototype.removeAnimationEndListener_ = function (evt) {
        evt.target.classList.remove(MaterialMenu.prototype.CssClasses_.IS_ANIMATING);
    };
    /**
       * Adds an event listener to clean up after the animation ends.
       *
       * @private
       */
    MaterialMenu.prototype.addAnimationEndListener_ = function () {
        this.element_.addEventListener('transitionend', this.removeAnimationEndListener_);
        this.element_.addEventListener('webkitTransitionEnd', this.removeAnimationEndListener_);
    };
    /**
       * Displays the menu.
       *
       * @public
       */
    MaterialMenu.prototype.show = function (evt) {
        if (this.element_ && this.container_ && this.outline_) {
            // Measure the inner element.
            var height = this.element_.getBoundingClientRect().height;
            var width = this.element_.getBoundingClientRect().width;
            // Apply the inner element's size to the container and outline.
            this.container_.style.width = width + 'px';
            this.container_.style.height = height + 'px';
            this.outline_.style.width = width + 'px';
            this.outline_.style.height = height + 'px';
            var transitionDuration = this.Constant_.TRANSITION_DURATION_SECONDS * this.Constant_.TRANSITION_DURATION_FRACTION;
            // Calculate transition delays for individual menu items, so that they fade
            // in one at a time.
            var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
            for (var i = 0; i < items.length; i++) {
                var itemDelay = null;
                if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT) || this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
                    itemDelay = (height - items[i].offsetTop - items[i].offsetHeight) / height * transitionDuration + 's';
                } else {
                    itemDelay = items[i].offsetTop / height * transitionDuration + 's';
                }
                items[i].style.transitionDelay = itemDelay;
            }
            // Apply the initial clip to the text before we start animating.
            this.applyClip_(height, width);
            // Wait for the next frame, turn on animation, and apply the final clip.
            // Also make it visible. This triggers the transitions.
            window.requestAnimationFrame(function () {
                this.element_.classList.add(this.CssClasses_.IS_ANIMATING);
                this.element_.style.clip = 'rect(0 ' + width + 'px ' + height + 'px 0)';
                this.container_.classList.add(this.CssClasses_.IS_VISIBLE);
            }.bind(this));
            // Clean up after the animation is complete.
            this.addAnimationEndListener_();
            // Add a click listener to the document, to close the menu.
            var callback = function (e) {
                // Check to see if the document is processing the same event that
                // displayed the menu in the first place. If so, do nothing.
                // Also check to see if the menu is in the process of closing itself, and
                // do nothing in that case.
                // Also check if the clicked element is a menu item
                // if so, do nothing.
                if (e !== evt && !this.closing_ && e.target.parentNode !== this.element_) {
                    document.removeEventListener('click', callback);
                    this.hide();
                }
            }.bind(this);
            document.addEventListener('click', callback);
        }
    };
    MaterialMenu.prototype['show'] = MaterialMenu.prototype.show;
    /**
       * Hides the menu.
       *
       * @public
       */
    MaterialMenu.prototype.hide = function () {
        if (this.element_ && this.container_ && this.outline_) {
            var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
            // Remove all transition delays; menu items fade out concurrently.
            for (var i = 0; i < items.length; i++) {
                items[i].style.removeProperty('transition-delay');
            }
            // Measure the inner element.
            var rect = this.element_.getBoundingClientRect();
            var height = rect.height;
            var width = rect.width;
            // Turn on animation, and apply the final clip. Also make invisible.
            // This triggers the transitions.
            this.element_.classList.add(this.CssClasses_.IS_ANIMATING);
            this.applyClip_(height, width);
            this.container_.classList.remove(this.CssClasses_.IS_VISIBLE);
            // Clean up after the animation is complete.
            this.addAnimationEndListener_();
        }
    };
    MaterialMenu.prototype['hide'] = MaterialMenu.prototype.hide;
    /**
       * Displays or hides the menu, depending on current state.
       *
       * @public
       */
    MaterialMenu.prototype.toggle = function (evt) {
        if (this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
            this.hide();
        } else {
            this.show(evt);
        }
    };
    MaterialMenu.prototype['toggle'] = MaterialMenu.prototype.toggle;
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialMenu,
        classAsString: 'MaterialMenu',
        cssClass: 'mdl-js-menu',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Progress MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialProgress = function MaterialProgress(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialProgress'] = MaterialProgress;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialProgress.prototype.Constant_ = {};
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialProgress.prototype.CssClasses_ = { INDETERMINATE_CLASS: 'mdl-progress__indeterminate' };
    /**
       * Set the current progress of the progressbar.
       *
       * @param {number} p Percentage of the progress (0-100)
       * @public
       */
    MaterialProgress.prototype.setProgress = function (p) {
        if (this.element_.classList.contains(this.CssClasses_.INDETERMINATE_CLASS)) {
            return;
        }
        this.progressbar_.style.width = p + '%';
    };
    MaterialProgress.prototype['setProgress'] = MaterialProgress.prototype.setProgress;
    /**
       * Set the current progress of the buffer.
       *
       * @param {number} p Percentage of the buffer (0-100)
       * @public
       */
    MaterialProgress.prototype.setBuffer = function (p) {
        this.bufferbar_.style.width = p + '%';
        this.auxbar_.style.width = 100 - p + '%';
    };
    MaterialProgress.prototype['setBuffer'] = MaterialProgress.prototype.setBuffer;
    /**
       * Initialize element.
       */
    MaterialProgress.prototype.init = function () {
        if (this.element_) {
            var el = document.createElement('div');
            el.className = 'progressbar bar bar1';
            this.element_.appendChild(el);
            this.progressbar_ = el;
            el = document.createElement('div');
            el.className = 'bufferbar bar bar2';
            this.element_.appendChild(el);
            this.bufferbar_ = el;
            el = document.createElement('div');
            el.className = 'auxbar bar bar3';
            this.element_.appendChild(el);
            this.auxbar_ = el;
            this.progressbar_.style.width = '0%';
            this.bufferbar_.style.width = '100%';
            this.auxbar_.style.width = '0%';
            this.element_.classList.add('is-upgraded');
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialProgress,
        classAsString: 'MaterialProgress',
        cssClass: 'mdl-js-progress',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Radio MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialRadio = function MaterialRadio(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialRadio'] = MaterialRadio;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialRadio.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialRadio.prototype.CssClasses_ = {
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_CHECKED: 'is-checked',
        IS_UPGRADED: 'is-upgraded',
        JS_RADIO: 'mdl-js-radio',
        RADIO_BTN: 'mdl-radio__button',
        RADIO_OUTER_CIRCLE: 'mdl-radio__outer-circle',
        RADIO_INNER_CIRCLE: 'mdl-radio__inner-circle',
        RIPPLE_EFFECT: 'mdl-js-ripple-effect',
        RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
        RIPPLE_CONTAINER: 'mdl-radio__ripple-container',
        RIPPLE_CENTER: 'mdl-ripple--center',
        RIPPLE: 'mdl-ripple'
    };
    /**
       * Handle change of state.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialRadio.prototype.onChange_ = function (event) {
        // Since other radio buttons don't get change events, we need to look for
        // them to update their classes.
        var radios = document.getElementsByClassName(this.CssClasses_.JS_RADIO);
        for (var i = 0; i < radios.length; i++) {
            var button = radios[i].querySelector('.' + this.CssClasses_.RADIO_BTN);
            // Different name == different group, so no point updating those.
            if (button.getAttribute('name') === this.btnElement_.getAttribute('name')) {
                if (typeof radios[i]['MaterialRadio'] !== 'undefined') {
                    radios[i]['MaterialRadio'].updateClasses_();
                }
            }
        }
    };
    /**
       * Handle focus.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialRadio.prototype.onFocus_ = function (event) {
        this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle lost focus.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialRadio.prototype.onBlur_ = function (event) {
        this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle mouseup.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialRadio.prototype.onMouseup_ = function (event) {
        this.blur_();
    };
    /**
       * Update classes.
       *
       * @private
       */
    MaterialRadio.prototype.updateClasses_ = function () {
        this.checkDisabled();
        this.checkToggleState();
    };
    /**
       * Add blur.
       *
       * @private
       */
    MaterialRadio.prototype.blur_ = function () {
        // TODO: figure out why there's a focus event being fired after our blur,
        // so that we can avoid this hack.
        window.setTimeout(function () {
            this.btnElement_.blur();
        }.bind(this), this.Constant_.TINY_TIMEOUT);
    };
    // Public methods.
    /**
       * Check the components disabled state.
       *
       * @public
       */
    MaterialRadio.prototype.checkDisabled = function () {
        if (this.btnElement_.disabled) {
            this.element_.classList.add(this.CssClasses_.IS_DISABLED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
        }
    };
    MaterialRadio.prototype['checkDisabled'] = MaterialRadio.prototype.checkDisabled;
    /**
       * Check the components toggled state.
       *
       * @public
       */
    MaterialRadio.prototype.checkToggleState = function () {
        if (this.btnElement_.checked) {
            this.element_.classList.add(this.CssClasses_.IS_CHECKED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
        }
    };
    MaterialRadio.prototype['checkToggleState'] = MaterialRadio.prototype.checkToggleState;
    /**
       * Disable radio.
       *
       * @public
       */
    MaterialRadio.prototype.disable = function () {
        this.btnElement_.disabled = true;
        this.updateClasses_();
    };
    MaterialRadio.prototype['disable'] = MaterialRadio.prototype.disable;
    /**
       * Enable radio.
       *
       * @public
       */
    MaterialRadio.prototype.enable = function () {
        this.btnElement_.disabled = false;
        this.updateClasses_();
    };
    MaterialRadio.prototype['enable'] = MaterialRadio.prototype.enable;
    /**
       * Check radio.
       *
       * @public
       */
    MaterialRadio.prototype.check = function () {
        this.btnElement_.checked = true;
        this.onChange_(null);
    };
    MaterialRadio.prototype['check'] = MaterialRadio.prototype.check;
    /**
       * Uncheck radio.
       *
       * @public
       */
    MaterialRadio.prototype.uncheck = function () {
        this.btnElement_.checked = false;
        this.onChange_(null);
    };
    MaterialRadio.prototype['uncheck'] = MaterialRadio.prototype.uncheck;
    /**
       * Initialize element.
       */
    MaterialRadio.prototype.init = function () {
        if (this.element_) {
            this.btnElement_ = this.element_.querySelector('.' + this.CssClasses_.RADIO_BTN);
            this.boundChangeHandler_ = this.onChange_.bind(this);
            this.boundFocusHandler_ = this.onChange_.bind(this);
            this.boundBlurHandler_ = this.onBlur_.bind(this);
            this.boundMouseUpHandler_ = this.onMouseup_.bind(this);
            var outerCircle = document.createElement('span');
            outerCircle.classList.add(this.CssClasses_.RADIO_OUTER_CIRCLE);
            var innerCircle = document.createElement('span');
            innerCircle.classList.add(this.CssClasses_.RADIO_INNER_CIRCLE);
            this.element_.appendChild(outerCircle);
            this.element_.appendChild(innerCircle);
            var rippleContainer;
            if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
                this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
                rippleContainer = document.createElement('span');
                rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
                rippleContainer.classList.add(this.CssClasses_.RIPPLE_EFFECT);
                rippleContainer.classList.add(this.CssClasses_.RIPPLE_CENTER);
                rippleContainer.addEventListener('mouseup', this.boundMouseUpHandler_);
                var ripple = document.createElement('span');
                ripple.classList.add(this.CssClasses_.RIPPLE);
                rippleContainer.appendChild(ripple);
                this.element_.appendChild(rippleContainer);
            }
            this.btnElement_.addEventListener('change', this.boundChangeHandler_);
            this.btnElement_.addEventListener('focus', this.boundFocusHandler_);
            this.btnElement_.addEventListener('blur', this.boundBlurHandler_);
            this.element_.addEventListener('mouseup', this.boundMouseUpHandler_);
            this.updateClasses_();
            this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialRadio,
        classAsString: 'MaterialRadio',
        cssClass: 'mdl-js-radio',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Slider MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialSlider = function MaterialSlider(element) {
        this.element_ = element;
        // Browser feature detection.
        this.isIE_ = window.navigator.msPointerEnabled;
        // Initialize instance.
        this.init();
    };
    window['MaterialSlider'] = MaterialSlider;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialSlider.prototype.Constant_ = {};
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialSlider.prototype.CssClasses_ = {
        IE_CONTAINER: 'mdl-slider__ie-container',
        SLIDER_CONTAINER: 'mdl-slider__container',
        BACKGROUND_FLEX: 'mdl-slider__background-flex',
        BACKGROUND_LOWER: 'mdl-slider__background-lower',
        BACKGROUND_UPPER: 'mdl-slider__background-upper',
        IS_LOWEST_VALUE: 'is-lowest-value',
        IS_UPGRADED: 'is-upgraded'
    };
    /**
       * Handle input on element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialSlider.prototype.onInput_ = function (event) {
        this.updateValueStyles_();
    };
    /**
       * Handle change on element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialSlider.prototype.onChange_ = function (event) {
        this.updateValueStyles_();
    };
    /**
       * Handle mouseup on element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialSlider.prototype.onMouseUp_ = function (event) {
        event.target.blur();
    };
    /**
       * Handle mousedown on container element.
       * This handler is purpose is to not require the use to click
       * exactly on the 2px slider element, as FireFox seems to be very
       * strict about this.
       *
       * @param {Event} event The event that fired.
       * @private
       * @suppress {missingProperties}
       */
    MaterialSlider.prototype.onContainerMouseDown_ = function (event) {
        // If this click is not on the parent element (but rather some child)
        // ignore. It may still bubble up.
        if (event.target !== this.element_.parentElement) {
            return;
        }
        // Discard the original event and create a new event that
        // is on the slider element.
        event.preventDefault();
        var newEvent = new MouseEvent('mousedown', {
            target: event.target,
            buttons: event.buttons,
            clientX: event.clientX,
            clientY: this.element_.getBoundingClientRect().y
        });
        this.element_.dispatchEvent(newEvent);
    };
    /**
       * Handle updating of values.
       *
       * @private
       */
    MaterialSlider.prototype.updateValueStyles_ = function () {
        // Calculate and apply percentages to div structure behind slider.
        var fraction = (this.element_.value - this.element_.min) / (this.element_.max - this.element_.min);
        if (fraction === 0) {
            this.element_.classList.add(this.CssClasses_.IS_LOWEST_VALUE);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_LOWEST_VALUE);
        }
        if (!this.isIE_) {
            this.backgroundLower_.style.flex = fraction;
            this.backgroundLower_.style.webkitFlex = fraction;
            this.backgroundUpper_.style.flex = 1 - fraction;
            this.backgroundUpper_.style.webkitFlex = 1 - fraction;
        }
    };
    // Public methods.
    /**
       * Disable slider.
       *
       * @public
       */
    MaterialSlider.prototype.disable = function () {
        this.element_.disabled = true;
    };
    MaterialSlider.prototype['disable'] = MaterialSlider.prototype.disable;
    /**
       * Enable slider.
       *
       * @public
       */
    MaterialSlider.prototype.enable = function () {
        this.element_.disabled = false;
    };
    MaterialSlider.prototype['enable'] = MaterialSlider.prototype.enable;
    /**
       * Update slider value.
       *
       * @param {number} value The value to which to set the control (optional).
       * @public
       */
    MaterialSlider.prototype.change = function (value) {
        if (typeof value !== 'undefined') {
            this.element_.value = value;
        }
        this.updateValueStyles_();
    };
    MaterialSlider.prototype['change'] = MaterialSlider.prototype.change;
    /**
       * Initialize element.
       */
    MaterialSlider.prototype.init = function () {
        if (this.element_) {
            if (this.isIE_) {
                // Since we need to specify a very large height in IE due to
                // implementation limitations, we add a parent here that trims it down to
                // a reasonable size.
                var containerIE = document.createElement('div');
                containerIE.classList.add(this.CssClasses_.IE_CONTAINER);
                this.element_.parentElement.insertBefore(containerIE, this.element_);
                this.element_.parentElement.removeChild(this.element_);
                containerIE.appendChild(this.element_);
            } else {
                // For non-IE browsers, we need a div structure that sits behind the
                // slider and allows us to style the left and right sides of it with
                // different colors.
                var container = document.createElement('div');
                container.classList.add(this.CssClasses_.SLIDER_CONTAINER);
                this.element_.parentElement.insertBefore(container, this.element_);
                this.element_.parentElement.removeChild(this.element_);
                container.appendChild(this.element_);
                var backgroundFlex = document.createElement('div');
                backgroundFlex.classList.add(this.CssClasses_.BACKGROUND_FLEX);
                container.appendChild(backgroundFlex);
                this.backgroundLower_ = document.createElement('div');
                this.backgroundLower_.classList.add(this.CssClasses_.BACKGROUND_LOWER);
                backgroundFlex.appendChild(this.backgroundLower_);
                this.backgroundUpper_ = document.createElement('div');
                this.backgroundUpper_.classList.add(this.CssClasses_.BACKGROUND_UPPER);
                backgroundFlex.appendChild(this.backgroundUpper_);
            }
            this.boundInputHandler = this.onInput_.bind(this);
            this.boundChangeHandler = this.onChange_.bind(this);
            this.boundMouseUpHandler = this.onMouseUp_.bind(this);
            this.boundContainerMouseDownHandler = this.onContainerMouseDown_.bind(this);
            this.element_.addEventListener('input', this.boundInputHandler);
            this.element_.addEventListener('change', this.boundChangeHandler);
            this.element_.addEventListener('mouseup', this.boundMouseUpHandler);
            this.element_.parentElement.addEventListener('mousedown', this.boundContainerMouseDownHandler);
            this.updateValueStyles_();
            this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialSlider,
        classAsString: 'MaterialSlider',
        cssClass: 'mdl-js-slider',
        widget: true
    });
    /**
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Snackbar MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialSnackbar = function MaterialSnackbar(element) {
        this.element_ = element;
        this.textElement_ = this.element_.querySelector('.' + this.cssClasses_.MESSAGE);
        this.actionElement_ = this.element_.querySelector('.' + this.cssClasses_.ACTION);
        if (!this.textElement_) {
            throw new Error('There must be a message element for a snackbar.');
        }
        if (!this.actionElement_) {
            throw new Error('There must be an action element for a snackbar.');
        }
        this.active = false;
        this.actionHandler_ = undefined;
        this.message_ = undefined;
        this.actionText_ = undefined;
        this.queuedNotifications_ = [];
        this.setActionHidden_(true);
    };
    window['MaterialSnackbar'] = MaterialSnackbar;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialSnackbar.prototype.Constant_ = {
        // The duration of the snackbar show/hide animation, in ms.
        ANIMATION_LENGTH: 250
    };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialSnackbar.prototype.cssClasses_ = {
        SNACKBAR: 'mdl-snackbar',
        MESSAGE: 'mdl-snackbar__text',
        ACTION: 'mdl-snackbar__action',
        ACTIVE: 'mdl-snackbar--active'
    };
    /**
       * Display the snackbar.
       *
       * @private
       */
    MaterialSnackbar.prototype.displaySnackbar_ = function () {
        this.element_.setAttribute('aria-hidden', 'true');
        if (this.actionHandler_) {
            this.actionElement_.textContent = this.actionText_;
            this.actionElement_.addEventListener('click', this.actionHandler_);
            this.setActionHidden_(false);
        }
        this.textElement_.textContent = this.message_;
        this.element_.classList.add(this.cssClasses_.ACTIVE);
        this.element_.setAttribute('aria-hidden', 'false');
        setTimeout(this.cleanup_.bind(this), this.timeout_);
    };
    /**
       * Show the snackbar.
       *
       * @param {Object} data The data for the notification.
       * @public
       */
    MaterialSnackbar.prototype.showSnackbar = function (data) {
        if (data === undefined) {
            throw new Error('Please provide a data object with at least a message to display.');
        }
        if (data['message'] === undefined) {
            throw new Error('Please provide a message to be displayed.');
        }
        if (data['actionHandler'] && !data['actionText']) {
            throw new Error('Please provide action text with the handler.');
        }
        if (this.active) {
            this.queuedNotifications_.push(data);
        } else {
            this.active = true;
            this.message_ = data['message'];
            if (data['timeout']) {
                this.timeout_ = data['timeout'];
            } else {
                this.timeout_ = 2750;
            }
            if (data['actionHandler']) {
                this.actionHandler_ = data['actionHandler'];
            }
            if (data['actionText']) {
                this.actionText_ = data['actionText'];
            }
            this.displaySnackbar_();
        }
    };
    MaterialSnackbar.prototype['showSnackbar'] = MaterialSnackbar.prototype.showSnackbar;
    /**
       * Check if the queue has items within it.
       * If it does, display the next entry.
       *
       * @private
       */
    MaterialSnackbar.prototype.checkQueue_ = function () {
        if (this.queuedNotifications_.length > 0) {
            this.showSnackbar(this.queuedNotifications_.shift());
        }
    };
    /**
       * Cleanup the snackbar event listeners and accessiblity attributes.
       *
       * @private
       */
    MaterialSnackbar.prototype.cleanup_ = function () {
        this.element_.classList.remove(this.cssClasses_.ACTIVE);
        setTimeout(function () {
            this.element_.setAttribute('aria-hidden', 'true');
            this.textElement_.textContent = '';
            if (!Boolean(this.actionElement_.getAttribute('aria-hidden'))) {
                this.setActionHidden_(true);
                this.actionElement_.textContent = '';
                this.actionElement_.removeEventListener('click', this.actionHandler_);
            }
            this.actionHandler_ = undefined;
            this.message_ = undefined;
            this.actionText_ = undefined;
            this.active = false;
            this.checkQueue_();
        }.bind(this), this.Constant_.ANIMATION_LENGTH);
    };
    /**
       * Set the action handler hidden state.
       *
       * @param {boolean} value
       * @private
       */
    MaterialSnackbar.prototype.setActionHidden_ = function (value) {
        if (value) {
            this.actionElement_.setAttribute('aria-hidden', 'true');
        } else {
            this.actionElement_.removeAttribute('aria-hidden');
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialSnackbar,
        classAsString: 'MaterialSnackbar',
        cssClass: 'mdl-js-snackbar',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Spinner MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @param {HTMLElement} element The element that will be upgraded.
       * @constructor
       */
    var MaterialSpinner = function MaterialSpinner(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialSpinner'] = MaterialSpinner;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialSpinner.prototype.Constant_ = { MDL_SPINNER_LAYER_COUNT: 4 };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialSpinner.prototype.CssClasses_ = {
        MDL_SPINNER_LAYER: 'mdl-spinner__layer',
        MDL_SPINNER_CIRCLE_CLIPPER: 'mdl-spinner__circle-clipper',
        MDL_SPINNER_CIRCLE: 'mdl-spinner__circle',
        MDL_SPINNER_GAP_PATCH: 'mdl-spinner__gap-patch',
        MDL_SPINNER_LEFT: 'mdl-spinner__left',
        MDL_SPINNER_RIGHT: 'mdl-spinner__right'
    };
    /**
       * Auxiliary method to create a spinner layer.
       *
       * @param {number} index Index of the layer to be created.
       * @public
       */
    MaterialSpinner.prototype.createLayer = function (index) {
        var layer = document.createElement('div');
        layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER);
        layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER + '-' + index);
        var leftClipper = document.createElement('div');
        leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
        leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_LEFT);
        var gapPatch = document.createElement('div');
        gapPatch.classList.add(this.CssClasses_.MDL_SPINNER_GAP_PATCH);
        var rightClipper = document.createElement('div');
        rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
        rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_RIGHT);
        var circleOwners = [leftClipper, gapPatch, rightClipper];
        for (var i = 0; i < circleOwners.length; i++) {
            var circle = document.createElement('div');
            circle.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE);
            circleOwners[i].appendChild(circle);
        }
        layer.appendChild(leftClipper);
        layer.appendChild(gapPatch);
        layer.appendChild(rightClipper);
        this.element_.appendChild(layer);
    };
    MaterialSpinner.prototype['createLayer'] = MaterialSpinner.prototype.createLayer;
    /**
       * Stops the spinner animation.
       * Public method for users who need to stop the spinner for any reason.
       *
       * @public
       */
    MaterialSpinner.prototype.stop = function () {
        this.element_.classList.remove('is-active');
    };
    MaterialSpinner.prototype['stop'] = MaterialSpinner.prototype.stop;
    /**
       * Starts the spinner animation.
       * Public method for users who need to manually start the spinner for any reason
       * (instead of just adding the 'is-active' class to their markup).
       *
       * @public
       */
    MaterialSpinner.prototype.start = function () {
        this.element_.classList.add('is-active');
    };
    MaterialSpinner.prototype['start'] = MaterialSpinner.prototype.start;
    /**
       * Initialize element.
       */
    MaterialSpinner.prototype.init = function () {
        if (this.element_) {
            for (var i = 1; i <= this.Constant_.MDL_SPINNER_LAYER_COUNT; i++) {
                this.createLayer(i);
            }
            this.element_.classList.add('is-upgraded');
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialSpinner,
        classAsString: 'MaterialSpinner',
        cssClass: 'mdl-js-spinner',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Checkbox MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialSwitch = function MaterialSwitch(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialSwitch'] = MaterialSwitch;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialSwitch.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialSwitch.prototype.CssClasses_ = {
        INPUT: 'mdl-switch__input',
        TRACK: 'mdl-switch__track',
        THUMB: 'mdl-switch__thumb',
        FOCUS_HELPER: 'mdl-switch__focus-helper',
        RIPPLE_EFFECT: 'mdl-js-ripple-effect',
        RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
        RIPPLE_CONTAINER: 'mdl-switch__ripple-container',
        RIPPLE_CENTER: 'mdl-ripple--center',
        RIPPLE: 'mdl-ripple',
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_CHECKED: 'is-checked'
    };
    /**
       * Handle change of state.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialSwitch.prototype.onChange_ = function (event) {
        this.updateClasses_();
    };
    /**
       * Handle focus of element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialSwitch.prototype.onFocus_ = function (event) {
        this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle lost focus of element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialSwitch.prototype.onBlur_ = function (event) {
        this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle mouseup.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialSwitch.prototype.onMouseUp_ = function (event) {
        this.blur_();
    };
    /**
       * Handle class updates.
       *
       * @private
       */
    MaterialSwitch.prototype.updateClasses_ = function () {
        this.checkDisabled();
        this.checkToggleState();
    };
    /**
       * Add blur.
       *
       * @private
       */
    MaterialSwitch.prototype.blur_ = function () {
        // TODO: figure out why there's a focus event being fired after our blur,
        // so that we can avoid this hack.
        window.setTimeout(function () {
            this.inputElement_.blur();
        }.bind(this), this.Constant_.TINY_TIMEOUT);
    };
    // Public methods.
    /**
       * Check the components disabled state.
       *
       * @public
       */
    MaterialSwitch.prototype.checkDisabled = function () {
        if (this.inputElement_.disabled) {
            this.element_.classList.add(this.CssClasses_.IS_DISABLED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
        }
    };
    MaterialSwitch.prototype['checkDisabled'] = MaterialSwitch.prototype.checkDisabled;
    /**
       * Check the components toggled state.
       *
       * @public
       */
    MaterialSwitch.prototype.checkToggleState = function () {
        if (this.inputElement_.checked) {
            this.element_.classList.add(this.CssClasses_.IS_CHECKED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
        }
    };
    MaterialSwitch.prototype['checkToggleState'] = MaterialSwitch.prototype.checkToggleState;
    /**
       * Disable switch.
       *
       * @public
       */
    MaterialSwitch.prototype.disable = function () {
        this.inputElement_.disabled = true;
        this.updateClasses_();
    };
    MaterialSwitch.prototype['disable'] = MaterialSwitch.prototype.disable;
    /**
       * Enable switch.
       *
       * @public
       */
    MaterialSwitch.prototype.enable = function () {
        this.inputElement_.disabled = false;
        this.updateClasses_();
    };
    MaterialSwitch.prototype['enable'] = MaterialSwitch.prototype.enable;
    /**
       * Activate switch.
       *
       * @public
       */
    MaterialSwitch.prototype.on = function () {
        this.inputElement_.checked = true;
        this.updateClasses_();
    };
    MaterialSwitch.prototype['on'] = MaterialSwitch.prototype.on;
    /**
       * Deactivate switch.
       *
       * @public
       */
    MaterialSwitch.prototype.off = function () {
        this.inputElement_.checked = false;
        this.updateClasses_();
    };
    MaterialSwitch.prototype['off'] = MaterialSwitch.prototype.off;
    /**
       * Initialize element.
       */
    MaterialSwitch.prototype.init = function () {
        if (this.element_) {
            this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
            var track = document.createElement('div');
            track.classList.add(this.CssClasses_.TRACK);
            var thumb = document.createElement('div');
            thumb.classList.add(this.CssClasses_.THUMB);
            var focusHelper = document.createElement('span');
            focusHelper.classList.add(this.CssClasses_.FOCUS_HELPER);
            thumb.appendChild(focusHelper);
            this.element_.appendChild(track);
            this.element_.appendChild(thumb);
            this.boundMouseUpHandler = this.onMouseUp_.bind(this);
            if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
                this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
                this.rippleContainerElement_ = document.createElement('span');
                this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
                this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);
                this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
                this.rippleContainerElement_.addEventListener('mouseup', this.boundMouseUpHandler);
                var ripple = document.createElement('span');
                ripple.classList.add(this.CssClasses_.RIPPLE);
                this.rippleContainerElement_.appendChild(ripple);
                this.element_.appendChild(this.rippleContainerElement_);
            }
            this.boundChangeHandler = this.onChange_.bind(this);
            this.boundFocusHandler = this.onFocus_.bind(this);
            this.boundBlurHandler = this.onBlur_.bind(this);
            this.inputElement_.addEventListener('change', this.boundChangeHandler);
            this.inputElement_.addEventListener('focus', this.boundFocusHandler);
            this.inputElement_.addEventListener('blur', this.boundBlurHandler);
            this.element_.addEventListener('mouseup', this.boundMouseUpHandler);
            this.updateClasses_();
            this.element_.classList.add('is-upgraded');
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialSwitch,
        classAsString: 'MaterialSwitch',
        cssClass: 'mdl-js-switch',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Tabs MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {Element} element The element that will be upgraded.
       */
    var MaterialTabs = function MaterialTabs(element) {
        // Stores the HTML element.
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialTabs'] = MaterialTabs;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string}
       * @private
       */
    MaterialTabs.prototype.Constant_ = {};
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialTabs.prototype.CssClasses_ = {
        TAB_CLASS: 'mdl-tabs__tab',
        PANEL_CLASS: 'mdl-tabs__panel',
        ACTIVE_CLASS: 'is-active',
        UPGRADED_CLASS: 'is-upgraded',
        MDL_JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
        MDL_RIPPLE_CONTAINER: 'mdl-tabs__ripple-container',
        MDL_RIPPLE: 'mdl-ripple',
        MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events'
    };
    /**
       * Handle clicks to a tabs component
       *
       * @private
       */
    MaterialTabs.prototype.initTabs_ = function () {
        if (this.element_.classList.contains(this.CssClasses_.MDL_JS_RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS);
        }
        // Select element tabs, document panels
        this.tabs_ = this.element_.querySelectorAll('.' + this.CssClasses_.TAB_CLASS);
        this.panels_ = this.element_.querySelectorAll('.' + this.CssClasses_.PANEL_CLASS);
        // Create new tabs for each tab element
        for (var i = 0; i < this.tabs_.length; i++) {
            new MaterialTab(this.tabs_[i], this);
        }
        this.element_.classList.add(this.CssClasses_.UPGRADED_CLASS);
    };
    /**
       * Reset tab state, dropping active classes
       *
       * @private
       */
    MaterialTabs.prototype.resetTabState_ = function () {
        for (var k = 0; k < this.tabs_.length; k++) {
            this.tabs_[k].classList.remove(this.CssClasses_.ACTIVE_CLASS);
        }
    };
    /**
       * Reset panel state, droping active classes
       *
       * @private
       */
    MaterialTabs.prototype.resetPanelState_ = function () {
        for (var j = 0; j < this.panels_.length; j++) {
            this.panels_[j].classList.remove(this.CssClasses_.ACTIVE_CLASS);
        }
    };
    /**
       * Initialize element.
       */
    MaterialTabs.prototype.init = function () {
        if (this.element_) {
            this.initTabs_();
        }
    };
    /**
       * Constructor for an individual tab.
       *
       * @constructor
       * @param {Element} tab The HTML element for the tab.
       * @param {MaterialTabs} ctx The MaterialTabs object that owns the tab.
       */
    function MaterialTab(tab, ctx) {
        if (tab) {
            if (ctx.element_.classList.contains(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT)) {
                var rippleContainer = document.createElement('span');
                rippleContainer.classList.add(ctx.CssClasses_.MDL_RIPPLE_CONTAINER);
                rippleContainer.classList.add(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT);
                var ripple = document.createElement('span');
                ripple.classList.add(ctx.CssClasses_.MDL_RIPPLE);
                rippleContainer.appendChild(ripple);
                tab.appendChild(rippleContainer);
            }
            tab.addEventListener('click', function (e) {
                if (tab.getAttribute('href').charAt(0) === '#') {
                    e.preventDefault();
                    var href = tab.href.split('#')[1];
                    var panel = ctx.element_.querySelector('#' + href);
                    ctx.resetTabState_();
                    ctx.resetPanelState_();
                    tab.classList.add(ctx.CssClasses_.ACTIVE_CLASS);
                    panel.classList.add(ctx.CssClasses_.ACTIVE_CLASS);
                }
            });
        }
    }
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialTabs,
        classAsString: 'MaterialTabs',
        cssClass: 'mdl-js-tabs'
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Textfield MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialTextfield = function MaterialTextfield(element) {
        this.element_ = element;
        this.maxRows = this.Constant_.NO_MAX_ROWS;
        // Initialize instance.
        this.init();
    };
    window['MaterialTextfield'] = MaterialTextfield;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialTextfield.prototype.Constant_ = {
        NO_MAX_ROWS: -1,
        MAX_ROWS_ATTRIBUTE: 'maxrows'
    };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialTextfield.prototype.CssClasses_ = {
        LABEL: 'mdl-textfield__label',
        INPUT: 'mdl-textfield__input',
        IS_DIRTY: 'is-dirty',
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_INVALID: 'is-invalid',
        IS_UPGRADED: 'is-upgraded',
        HAS_PLACEHOLDER: 'has-placeholder'
    };
    /**
       * Handle input being entered.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialTextfield.prototype.onKeyDown_ = function (event) {
        var currentRowCount = event.target.value.split('\n').length;
        if (event.keyCode === 13) {
            if (currentRowCount >= this.maxRows) {
                event.preventDefault();
            }
        }
    };
    /**
       * Handle focus.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialTextfield.prototype.onFocus_ = function (event) {
        this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle lost focus.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialTextfield.prototype.onBlur_ = function (event) {
        this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
    };
    /**
       * Handle reset event from out side.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialTextfield.prototype.onReset_ = function (event) {
        this.updateClasses_();
    };
    /**
       * Handle class updates.
       *
       * @private
       */
    MaterialTextfield.prototype.updateClasses_ = function () {
        this.checkDisabled();
        this.checkValidity();
        this.checkDirty();
        this.checkFocus();
    };
    // Public methods.
    /**
       * Check the disabled state and update field accordingly.
       *
       * @public
       */
    MaterialTextfield.prototype.checkDisabled = function () {
        if (this.input_.disabled) {
            this.element_.classList.add(this.CssClasses_.IS_DISABLED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
        }
    };
    MaterialTextfield.prototype['checkDisabled'] = MaterialTextfield.prototype.checkDisabled;
    /**
      * Check the focus state and update field accordingly.
      *
      * @public
      */
    MaterialTextfield.prototype.checkFocus = function () {
        if (Boolean(this.element_.querySelector(':focus'))) {
            this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
        }
    };
    MaterialTextfield.prototype['checkFocus'] = MaterialTextfield.prototype.checkFocus;
    /**
       * Check the validity state and update field accordingly.
       *
       * @public
       */
    MaterialTextfield.prototype.checkValidity = function () {
        if (this.input_.validity) {
            if (this.input_.validity.valid) {
                this.element_.classList.remove(this.CssClasses_.IS_INVALID);
            } else {
                this.element_.classList.add(this.CssClasses_.IS_INVALID);
            }
        }
    };
    MaterialTextfield.prototype['checkValidity'] = MaterialTextfield.prototype.checkValidity;
    /**
       * Check the dirty state and update field accordingly.
       *
       * @public
       */
    MaterialTextfield.prototype.checkDirty = function () {
        if (this.input_.value && this.input_.value.length > 0) {
            this.element_.classList.add(this.CssClasses_.IS_DIRTY);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_DIRTY);
        }
    };
    MaterialTextfield.prototype['checkDirty'] = MaterialTextfield.prototype.checkDirty;
    /**
       * Disable text field.
       *
       * @public
       */
    MaterialTextfield.prototype.disable = function () {
        this.input_.disabled = true;
        this.updateClasses_();
    };
    MaterialTextfield.prototype['disable'] = MaterialTextfield.prototype.disable;
    /**
       * Enable text field.
       *
       * @public
       */
    MaterialTextfield.prototype.enable = function () {
        this.input_.disabled = false;
        this.updateClasses_();
    };
    MaterialTextfield.prototype['enable'] = MaterialTextfield.prototype.enable;
    /**
       * Update text field value.
       *
       * @param {string} value The value to which to set the control (optional).
       * @public
       */
    MaterialTextfield.prototype.change = function (value) {
        this.input_.value = value || '';
        this.updateClasses_();
    };
    MaterialTextfield.prototype['change'] = MaterialTextfield.prototype.change;
    /**
       * Initialize element.
       */
    MaterialTextfield.prototype.init = function () {
        if (this.element_) {
            this.label_ = this.element_.querySelector('.' + this.CssClasses_.LABEL);
            this.input_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
            if (this.input_) {
                if (this.input_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE)) {
                    this.maxRows = parseInt(this.input_.getAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE), 10);
                    if (isNaN(this.maxRows)) {
                        this.maxRows = this.Constant_.NO_MAX_ROWS;
                    }
                }
                if (this.input_.hasAttribute('placeholder')) {
                    this.element_.classList.add(this.CssClasses_.HAS_PLACEHOLDER);
                }
                this.boundUpdateClassesHandler = this.updateClasses_.bind(this);
                this.boundFocusHandler = this.onFocus_.bind(this);
                this.boundBlurHandler = this.onBlur_.bind(this);
                this.boundResetHandler = this.onReset_.bind(this);
                this.input_.addEventListener('input', this.boundUpdateClassesHandler);
                this.input_.addEventListener('focus', this.boundFocusHandler);
                this.input_.addEventListener('blur', this.boundBlurHandler);
                this.input_.addEventListener('reset', this.boundResetHandler);
                if (this.maxRows !== this.Constant_.NO_MAX_ROWS) {
                    // TODO: This should handle pasting multi line text.
                    // Currently doesn't.
                    this.boundKeyDownHandler = this.onKeyDown_.bind(this);
                    this.input_.addEventListener('keydown', this.boundKeyDownHandler);
                }
                var invalid = this.element_.classList.contains(this.CssClasses_.IS_INVALID);
                this.updateClasses_();
                this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
                if (invalid) {
                    this.element_.classList.add(this.CssClasses_.IS_INVALID);
                }
                if (this.input_.hasAttribute('autofocus')) {
                    this.element_.focus();
                    this.checkFocus();
                }
            }
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialTextfield,
        classAsString: 'MaterialTextfield',
        cssClass: 'mdl-js-textfield',
        widget: true
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Tooltip MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialTooltip = function MaterialTooltip(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialTooltip'] = MaterialTooltip;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialTooltip.prototype.Constant_ = {};
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialTooltip.prototype.CssClasses_ = {
        IS_ACTIVE: 'is-active',
        BOTTOM: 'mdl-tooltip--bottom',
        LEFT: 'mdl-tooltip--left',
        RIGHT: 'mdl-tooltip--right',
        TOP: 'mdl-tooltip--top'
    };
    /**
       * Handle mouseenter for tooltip.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialTooltip.prototype.handleMouseEnter_ = function (event) {
        var props = event.target.getBoundingClientRect();
        var left = props.left + props.width / 2;
        var top = props.top + props.height / 2;
        var marginLeft = -1 * (this.element_.offsetWidth / 2);
        var marginTop = -1 * (this.element_.offsetHeight / 2);
        if (this.element_.classList.contains(this.CssClasses_.LEFT) || this.element_.classList.contains(this.CssClasses_.RIGHT)) {
            left = props.width / 2;
            if (top + marginTop < 0) {
                this.element_.style.top = '0';
                this.element_.style.marginTop = '0';
            } else {
                this.element_.style.top = top + 'px';
                this.element_.style.marginTop = marginTop + 'px';
            }
        } else {
            if (left + marginLeft < 0) {
                this.element_.style.left = '0';
                this.element_.style.marginLeft = '0';
            } else {
                this.element_.style.left = left + 'px';
                this.element_.style.marginLeft = marginLeft + 'px';
            }
        }
        if (this.element_.classList.contains(this.CssClasses_.TOP)) {
            this.element_.style.top = props.top - this.element_.offsetHeight - 10 + 'px';
        } else if (this.element_.classList.contains(this.CssClasses_.RIGHT)) {
            this.element_.style.left = props.left + props.width + 10 + 'px';
        } else if (this.element_.classList.contains(this.CssClasses_.LEFT)) {
            this.element_.style.left = props.left - this.element_.offsetWidth - 10 + 'px';
        } else {
            this.element_.style.top = props.top + props.height + 10 + 'px';
        }
        this.element_.classList.add(this.CssClasses_.IS_ACTIVE);
    };
    /**
       * Hide tooltip on mouseleave or scroll
       *
       * @private
       */
    MaterialTooltip.prototype.hideTooltip_ = function () {
        this.element_.classList.remove(this.CssClasses_.IS_ACTIVE);
    };
    /**
       * Initialize element.
       */
    MaterialTooltip.prototype.init = function () {
        if (this.element_) {
            var forElId = this.element_.getAttribute('for') || this.element_.getAttribute('data-mdl-for');
            if (forElId) {
                this.forElement_ = document.getElementById(forElId);
            }
            if (this.forElement_) {
                // It's left here because it prevents accidental text selection on Android
                if (!this.forElement_.hasAttribute('tabindex')) {
                    this.forElement_.setAttribute('tabindex', '0');
                }
                this.boundMouseEnterHandler = this.handleMouseEnter_.bind(this);
                this.boundMouseLeaveAndScrollHandler = this.hideTooltip_.bind(this);
                this.forElement_.addEventListener('mouseenter', this.boundMouseEnterHandler, false);
                this.forElement_.addEventListener('touchend', this.boundMouseEnterHandler, false);
                this.forElement_.addEventListener('mouseleave', this.boundMouseLeaveAndScrollHandler, false);
                window.addEventListener('scroll', this.boundMouseLeaveAndScrollHandler, true);
                window.addEventListener('touchstart', this.boundMouseLeaveAndScrollHandler);
            }
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialTooltip,
        classAsString: 'MaterialTooltip',
        cssClass: 'mdl-tooltip'
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Layout MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialLayout = function MaterialLayout(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialLayout'] = MaterialLayout;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialLayout.prototype.Constant_ = {
        MAX_WIDTH: '(max-width: 1024px)',
        TAB_SCROLL_PIXELS: 100,
        RESIZE_TIMEOUT: 100,
        MENU_ICON: '&#xE5D2;',
        CHEVRON_LEFT: 'chevron_left',
        CHEVRON_RIGHT: 'chevron_right'
    };
    /**
       * Keycodes, for code readability.
       *
       * @enum {number}
       * @private
       */
    MaterialLayout.prototype.Keycodes_ = {
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32
    };
    /**
       * Modes.
       *
       * @enum {number}
       * @private
       */
    MaterialLayout.prototype.Mode_ = {
        STANDARD: 0,
        SEAMED: 1,
        WATERFALL: 2,
        SCROLL: 3
    };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialLayout.prototype.CssClasses_ = {
        CONTAINER: 'mdl-layout__container',
        HEADER: 'mdl-layout__header',
        DRAWER: 'mdl-layout__drawer',
        CONTENT: 'mdl-layout__content',
        DRAWER_BTN: 'mdl-layout__drawer-button',
        ICON: 'material-icons',
        JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
        RIPPLE_CONTAINER: 'mdl-layout__tab-ripple-container',
        RIPPLE: 'mdl-ripple',
        RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
        HEADER_SEAMED: 'mdl-layout__header--seamed',
        HEADER_WATERFALL: 'mdl-layout__header--waterfall',
        HEADER_SCROLL: 'mdl-layout__header--scroll',
        FIXED_HEADER: 'mdl-layout--fixed-header',
        OBFUSCATOR: 'mdl-layout__obfuscator',
        TAB_BAR: 'mdl-layout__tab-bar',
        TAB_CONTAINER: 'mdl-layout__tab-bar-container',
        TAB: 'mdl-layout__tab',
        TAB_BAR_BUTTON: 'mdl-layout__tab-bar-button',
        TAB_BAR_LEFT_BUTTON: 'mdl-layout__tab-bar-left-button',
        TAB_BAR_RIGHT_BUTTON: 'mdl-layout__tab-bar-right-button',
        TAB_MANUAL_SWITCH: 'mdl-layout__tab-manual-switch',
        PANEL: 'mdl-layout__tab-panel',
        HAS_DRAWER: 'has-drawer',
        HAS_TABS: 'has-tabs',
        HAS_SCROLLING_HEADER: 'has-scrolling-header',
        CASTING_SHADOW: 'is-casting-shadow',
        IS_COMPACT: 'is-compact',
        IS_SMALL_SCREEN: 'is-small-screen',
        IS_DRAWER_OPEN: 'is-visible',
        IS_ACTIVE: 'is-active',
        IS_UPGRADED: 'is-upgraded',
        IS_ANIMATING: 'is-animating',
        ON_LARGE_SCREEN: 'mdl-layout--large-screen-only',
        ON_SMALL_SCREEN: 'mdl-layout--small-screen-only'
    };
    /**
       * Handles scrolling on the content.
       *
       * @private
       */
    MaterialLayout.prototype.contentScrollHandler_ = function () {
        if (this.header_.classList.contains(this.CssClasses_.IS_ANIMATING)) {
            return;
        }
        var headerVisible = !this.element_.classList.contains(this.CssClasses_.IS_SMALL_SCREEN) || this.element_.classList.contains(this.CssClasses_.FIXED_HEADER);
        if (this.content_.scrollTop > 0 && !this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
            this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);
            this.header_.classList.add(this.CssClasses_.IS_COMPACT);
            if (headerVisible) {
                this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
            }
        } else if (this.content_.scrollTop <= 0 && this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
            this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);
            this.header_.classList.remove(this.CssClasses_.IS_COMPACT);
            if (headerVisible) {
                this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
            }
        }
    };
    /**
       * Handles a keyboard event on the drawer.
       *
       * @param {Event} evt The event that fired.
       * @private
       */
    MaterialLayout.prototype.keyboardEventHandler_ = function (evt) {
        // Only react when the drawer is open.
        if (evt.keyCode === this.Keycodes_.ESCAPE && this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)) {
            this.toggleDrawer();
        }
    };
    /**
       * Handles changes in screen size.
       *
       * @private
       */
    MaterialLayout.prototype.screenSizeHandler_ = function () {
        if (this.screenSizeMediaQuery_.matches) {
            this.element_.classList.add(this.CssClasses_.IS_SMALL_SCREEN);
        } else {
            this.element_.classList.remove(this.CssClasses_.IS_SMALL_SCREEN);
            // Collapse drawer (if any) when moving to a large screen size.
            if (this.drawer_) {
                this.drawer_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);
                this.obfuscator_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);
            }
        }
    };
    /**
       * Handles events of drawer button.
       *
       * @param {Event} evt The event that fired.
       * @private
       */
    MaterialLayout.prototype.drawerToggleHandler_ = function (evt) {
        if (evt && evt.type === 'keydown') {
            if (evt.keyCode === this.Keycodes_.SPACE || evt.keyCode === this.Keycodes_.ENTER) {
                // prevent scrolling in drawer nav
                evt.preventDefault();
            } else {
                // prevent other keys
                return;
            }
        }
        this.toggleDrawer();
    };
    /**
       * Handles (un)setting the `is-animating` class
       *
       * @private
       */
    MaterialLayout.prototype.headerTransitionEndHandler_ = function () {
        this.header_.classList.remove(this.CssClasses_.IS_ANIMATING);
    };
    /**
       * Handles expanding the header on click
       *
       * @private
       */
    MaterialLayout.prototype.headerClickHandler_ = function () {
        if (this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
            this.header_.classList.remove(this.CssClasses_.IS_COMPACT);
            this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
        }
    };
    /**
       * Reset tab state, dropping active classes
       *
       * @private
       */
    MaterialLayout.prototype.resetTabState_ = function (tabBar) {
        for (var k = 0; k < tabBar.length; k++) {
            tabBar[k].classList.remove(this.CssClasses_.IS_ACTIVE);
        }
    };
    /**
       * Reset panel state, droping active classes
       *
       * @private
       */
    MaterialLayout.prototype.resetPanelState_ = function (panels) {
        for (var j = 0; j < panels.length; j++) {
            panels[j].classList.remove(this.CssClasses_.IS_ACTIVE);
        }
    };
    /**
      * Toggle drawer state
      *
      * @public
      */
    MaterialLayout.prototype.toggleDrawer = function () {
        var drawerButton = this.element_.querySelector('.' + this.CssClasses_.DRAWER_BTN);
        this.drawer_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);
        this.obfuscator_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);
        // Set accessibility properties.
        if (this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)) {
            this.drawer_.setAttribute('aria-hidden', 'false');
            drawerButton.setAttribute('aria-expanded', 'true');
        } else {
            this.drawer_.setAttribute('aria-hidden', 'true');
            drawerButton.setAttribute('aria-expanded', 'false');
        }
    };
    MaterialLayout.prototype['toggleDrawer'] = MaterialLayout.prototype.toggleDrawer;
    /**
       * Initialize element.
       */
    MaterialLayout.prototype.init = function () {
        if (this.element_) {
            var container = document.createElement('div');
            container.classList.add(this.CssClasses_.CONTAINER);
            var focusedElement = this.element_.querySelector(':focus');
            this.element_.parentElement.insertBefore(container, this.element_);
            this.element_.parentElement.removeChild(this.element_);
            container.appendChild(this.element_);
            if (focusedElement) {
                focusedElement.focus();
            }
            var directChildren = this.element_.childNodes;
            var numChildren = directChildren.length;
            for (var c = 0; c < numChildren; c++) {
                var child = directChildren[c];
                if (child.classList && child.classList.contains(this.CssClasses_.HEADER)) {
                    this.header_ = child;
                }
                if (child.classList && child.classList.contains(this.CssClasses_.DRAWER)) {
                    this.drawer_ = child;
                }
                if (child.classList && child.classList.contains(this.CssClasses_.CONTENT)) {
                    this.content_ = child;
                }
            }
            window.addEventListener('pageshow', function (e) {
                if (e.persisted) {
                    // when page is loaded from back/forward cache
                    // trigger repaint to let layout scroll in safari
                    this.element_.style.overflowY = 'hidden';
                    requestAnimationFrame(function () {
                        this.element_.style.overflowY = '';
                    }.bind(this));
                }
            }.bind(this), false);
            if (this.header_) {
                this.tabBar_ = this.header_.querySelector('.' + this.CssClasses_.TAB_BAR);
            }
            var mode = this.Mode_.STANDARD;
            if (this.header_) {
                if (this.header_.classList.contains(this.CssClasses_.HEADER_SEAMED)) {
                    mode = this.Mode_.SEAMED;
                } else if (this.header_.classList.contains(this.CssClasses_.HEADER_WATERFALL)) {
                    mode = this.Mode_.WATERFALL;
                    this.header_.addEventListener('transitionend', this.headerTransitionEndHandler_.bind(this));
                    this.header_.addEventListener('click', this.headerClickHandler_.bind(this));
                } else if (this.header_.classList.contains(this.CssClasses_.HEADER_SCROLL)) {
                    mode = this.Mode_.SCROLL;
                    container.classList.add(this.CssClasses_.HAS_SCROLLING_HEADER);
                }
                if (mode === this.Mode_.STANDARD) {
                    this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);
                    if (this.tabBar_) {
                        this.tabBar_.classList.add(this.CssClasses_.CASTING_SHADOW);
                    }
                } else if (mode === this.Mode_.SEAMED || mode === this.Mode_.SCROLL) {
                    this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);
                    if (this.tabBar_) {
                        this.tabBar_.classList.remove(this.CssClasses_.CASTING_SHADOW);
                    }
                } else if (mode === this.Mode_.WATERFALL) {
                    // Add and remove shadows depending on scroll position.
                    // Also add/remove auxiliary class for styling of the compact version of
                    // the header.
                    this.content_.addEventListener('scroll', this.contentScrollHandler_.bind(this));
                    this.contentScrollHandler_();
                }
            }
            // Add drawer toggling button to our layout, if we have an openable drawer.
            if (this.drawer_) {
                var drawerButton = this.element_.querySelector('.' + this.CssClasses_.DRAWER_BTN);
                if (!drawerButton) {
                    drawerButton = document.createElement('div');
                    drawerButton.setAttribute('aria-expanded', 'false');
                    drawerButton.setAttribute('role', 'button');
                    drawerButton.setAttribute('tabindex', '0');
                    drawerButton.classList.add(this.CssClasses_.DRAWER_BTN);
                    var drawerButtonIcon = document.createElement('i');
                    drawerButtonIcon.classList.add(this.CssClasses_.ICON);
                    drawerButtonIcon.innerHTML = this.Constant_.MENU_ICON;
                    drawerButton.appendChild(drawerButtonIcon);
                }
                if (this.drawer_.classList.contains(this.CssClasses_.ON_LARGE_SCREEN)) {
                    //If drawer has ON_LARGE_SCREEN class then add it to the drawer toggle button as well.
                    drawerButton.classList.add(this.CssClasses_.ON_LARGE_SCREEN);
                } else if (this.drawer_.classList.contains(this.CssClasses_.ON_SMALL_SCREEN)) {
                    //If drawer has ON_SMALL_SCREEN class then add it to the drawer toggle button as well.
                    drawerButton.classList.add(this.CssClasses_.ON_SMALL_SCREEN);
                }
                drawerButton.addEventListener('click', this.drawerToggleHandler_.bind(this));
                drawerButton.addEventListener('keydown', this.drawerToggleHandler_.bind(this));
                // Add a class if the layout has a drawer, for altering the left padding.
                // Adds the HAS_DRAWER to the elements since this.header_ may or may
                // not be present.
                this.element_.classList.add(this.CssClasses_.HAS_DRAWER);
                // If we have a fixed header, add the button to the header rather than
                // the layout.
                if (this.element_.classList.contains(this.CssClasses_.FIXED_HEADER)) {
                    this.header_.insertBefore(drawerButton, this.header_.firstChild);
                } else {
                    this.element_.insertBefore(drawerButton, this.content_);
                }
                var obfuscator = document.createElement('div');
                obfuscator.classList.add(this.CssClasses_.OBFUSCATOR);
                this.element_.appendChild(obfuscator);
                obfuscator.addEventListener('click', this.drawerToggleHandler_.bind(this));
                this.obfuscator_ = obfuscator;
                this.drawer_.addEventListener('keydown', this.keyboardEventHandler_.bind(this));
                this.drawer_.setAttribute('aria-hidden', 'true');
            }
            // Keep an eye on screen size, and add/remove auxiliary class for styling
            // of small screens.
            this.screenSizeMediaQuery_ = window.matchMedia(this.Constant_.MAX_WIDTH);
            this.screenSizeMediaQuery_.addListener(this.screenSizeHandler_.bind(this));
            this.screenSizeHandler_();
            // Initialize tabs, if any.
            if (this.header_ && this.tabBar_) {
                this.element_.classList.add(this.CssClasses_.HAS_TABS);
                var tabContainer = document.createElement('div');
                tabContainer.classList.add(this.CssClasses_.TAB_CONTAINER);
                this.header_.insertBefore(tabContainer, this.tabBar_);
                this.header_.removeChild(this.tabBar_);
                var leftButton = document.createElement('div');
                leftButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);
                leftButton.classList.add(this.CssClasses_.TAB_BAR_LEFT_BUTTON);
                var leftButtonIcon = document.createElement('i');
                leftButtonIcon.classList.add(this.CssClasses_.ICON);
                leftButtonIcon.textContent = this.Constant_.CHEVRON_LEFT;
                leftButton.appendChild(leftButtonIcon);
                leftButton.addEventListener('click', function () {
                    this.tabBar_.scrollLeft -= this.Constant_.TAB_SCROLL_PIXELS;
                }.bind(this));
                var rightButton = document.createElement('div');
                rightButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);
                rightButton.classList.add(this.CssClasses_.TAB_BAR_RIGHT_BUTTON);
                var rightButtonIcon = document.createElement('i');
                rightButtonIcon.classList.add(this.CssClasses_.ICON);
                rightButtonIcon.textContent = this.Constant_.CHEVRON_RIGHT;
                rightButton.appendChild(rightButtonIcon);
                rightButton.addEventListener('click', function () {
                    this.tabBar_.scrollLeft += this.Constant_.TAB_SCROLL_PIXELS;
                }.bind(this));
                tabContainer.appendChild(leftButton);
                tabContainer.appendChild(this.tabBar_);
                tabContainer.appendChild(rightButton);
                // Add and remove tab buttons depending on scroll position and total
                // window size.
                var tabUpdateHandler = function () {
                    if (this.tabBar_.scrollLeft > 0) {
                        leftButton.classList.add(this.CssClasses_.IS_ACTIVE);
                    } else {
                        leftButton.classList.remove(this.CssClasses_.IS_ACTIVE);
                    }
                    if (this.tabBar_.scrollLeft < this.tabBar_.scrollWidth - this.tabBar_.offsetWidth) {
                        rightButton.classList.add(this.CssClasses_.IS_ACTIVE);
                    } else {
                        rightButton.classList.remove(this.CssClasses_.IS_ACTIVE);
                    }
                }.bind(this);
                this.tabBar_.addEventListener('scroll', tabUpdateHandler);
                tabUpdateHandler();
                // Update tabs when the window resizes.
                var windowResizeHandler = function () {
                    // Use timeouts to make sure it doesn't happen too often.
                    if (this.resizeTimeoutId_) {
                        clearTimeout(this.resizeTimeoutId_);
                    }
                    this.resizeTimeoutId_ = setTimeout(function () {
                        tabUpdateHandler();
                        this.resizeTimeoutId_ = null;
                    }.bind(this), this.Constant_.RESIZE_TIMEOUT);
                }.bind(this);
                window.addEventListener('resize', windowResizeHandler);
                if (this.tabBar_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)) {
                    this.tabBar_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
                }
                // Select element tabs, document panels
                var tabs = this.tabBar_.querySelectorAll('.' + this.CssClasses_.TAB);
                var panels = this.content_.querySelectorAll('.' + this.CssClasses_.PANEL);
                // Create new tabs for each tab element
                for (var i = 0; i < tabs.length; i++) {
                    new MaterialLayoutTab(tabs[i], tabs, panels, this);
                }
            }
            this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
        }
    };
    /**
       * Constructor for an individual tab.
       *
       * @constructor
       * @param {HTMLElement} tab The HTML element for the tab.
       * @param {!Array<HTMLElement>} tabs Array with HTML elements for all tabs.
       * @param {!Array<HTMLElement>} panels Array with HTML elements for all panels.
       * @param {MaterialLayout} layout The MaterialLayout object that owns the tab.
       */
    function MaterialLayoutTab(tab, tabs, panels, layout) {
        /**
         * Auxiliary method to programmatically select a tab in the UI.
         */
        function selectTab() {
            var href = tab.href.split('#')[1];
            var panel = layout.content_.querySelector('#' + href);
            layout.resetTabState_(tabs);
            layout.resetPanelState_(panels);
            tab.classList.add(layout.CssClasses_.IS_ACTIVE);
            panel.classList.add(layout.CssClasses_.IS_ACTIVE);
        }
        if (layout.tabBar_.classList.contains(layout.CssClasses_.JS_RIPPLE_EFFECT)) {
            var rippleContainer = document.createElement('span');
            rippleContainer.classList.add(layout.CssClasses_.RIPPLE_CONTAINER);
            rippleContainer.classList.add(layout.CssClasses_.JS_RIPPLE_EFFECT);
            var ripple = document.createElement('span');
            ripple.classList.add(layout.CssClasses_.RIPPLE);
            rippleContainer.appendChild(ripple);
            tab.appendChild(rippleContainer);
        }
        if (!layout.tabBar_.classList.contains(layout.CssClasses_.TAB_MANUAL_SWITCH)) {
            tab.addEventListener('click', function (e) {
                if (tab.getAttribute('href').charAt(0) === '#') {
                    e.preventDefault();
                    selectTab();
                }
            });
        }
        tab.show = selectTab;
    }
    window['MaterialLayoutTab'] = MaterialLayoutTab;
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialLayout,
        classAsString: 'MaterialLayout',
        cssClass: 'mdl-js-layout'
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Data Table Card MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {Element} element The element that will be upgraded.
       */
    var MaterialDataTable = function MaterialDataTable(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialDataTable'] = MaterialDataTable;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialDataTable.prototype.Constant_ = {};
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialDataTable.prototype.CssClasses_ = {
        DATA_TABLE: 'mdl-data-table',
        SELECTABLE: 'mdl-data-table--selectable',
        SELECT_ELEMENT: 'mdl-data-table__select',
        IS_SELECTED: 'is-selected',
        IS_UPGRADED: 'is-upgraded'
    };
    /**
       * Generates and returns a function that toggles the selection state of a
       * single row (or multiple rows).
       *
       * @param {Element} checkbox Checkbox that toggles the selection state.
       * @param {Element} row Row to toggle when checkbox changes.
       * @param {(Array<Object>|NodeList)=} opt_rows Rows to toggle when checkbox changes.
       * @private
       */
    MaterialDataTable.prototype.selectRow_ = function (checkbox, row, opt_rows) {
        if (row) {
            return function () {
                if (checkbox.checked) {
                    row.classList.add(this.CssClasses_.IS_SELECTED);
                } else {
                    row.classList.remove(this.CssClasses_.IS_SELECTED);
                }
            }.bind(this);
        }
        if (opt_rows) {
            return function () {
                var i;
                var el;
                if (checkbox.checked) {
                    for (i = 0; i < opt_rows.length; i++) {
                        el = opt_rows[i].querySelector('td').querySelector('.mdl-checkbox');
                        el['MaterialCheckbox'].check();
                        opt_rows[i].classList.add(this.CssClasses_.IS_SELECTED);
                    }
                } else {
                    for (i = 0; i < opt_rows.length; i++) {
                        el = opt_rows[i].querySelector('td').querySelector('.mdl-checkbox');
                        el['MaterialCheckbox'].uncheck();
                        opt_rows[i].classList.remove(this.CssClasses_.IS_SELECTED);
                    }
                }
            }.bind(this);
        }
    };
    /**
       * Creates a checkbox for a single or or multiple rows and hooks up the
       * event handling.
       *
       * @param {Element} row Row to toggle when checkbox changes.
       * @param {(Array<Object>|NodeList)=} opt_rows Rows to toggle when checkbox changes.
       * @private
       */
    MaterialDataTable.prototype.createCheckbox_ = function (row, opt_rows) {
        var label = document.createElement('label');
        var labelClasses = ['mdl-checkbox', 'mdl-js-checkbox', 'mdl-js-ripple-effect', this.CssClasses_.SELECT_ELEMENT];
        label.className = labelClasses.join(' ');
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('mdl-checkbox__input');
        if (row) {
            checkbox.checked = row.classList.contains(this.CssClasses_.IS_SELECTED);
            checkbox.addEventListener('change', this.selectRow_(checkbox, row));
        } else if (opt_rows) {
            checkbox.addEventListener('change', this.selectRow_(checkbox, null, opt_rows));
        }
        label.appendChild(checkbox);
        componentHandler.upgradeElement(label, 'MaterialCheckbox');
        return label;
    };
    /**
       * Initialize element.
       */
    MaterialDataTable.prototype.init = function () {
        if (this.element_) {
            var firstHeader = this.element_.querySelector('th');
            var bodyRows = Array.prototype.slice.call(this.element_.querySelectorAll('tbody tr'));
            var footRows = Array.prototype.slice.call(this.element_.querySelectorAll('tfoot tr'));
            var rows = bodyRows.concat(footRows);
            if (this.element_.classList.contains(this.CssClasses_.SELECTABLE)) {
                var th = document.createElement('th');
                var headerCheckbox = this.createCheckbox_(null, rows);
                th.appendChild(headerCheckbox);
                firstHeader.parentElement.insertBefore(th, firstHeader);
                for (var i = 0; i < rows.length; i++) {
                    var firstCell = rows[i].querySelector('td');
                    if (firstCell) {
                        var td = document.createElement('td');
                        if (rows[i].parentNode.nodeName.toUpperCase() === 'TBODY') {
                            var rowCheckbox = this.createCheckbox_(rows[i]);
                            td.appendChild(rowCheckbox);
                        }
                        rows[i].insertBefore(td, firstCell);
                    }
                }
                this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
            }
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialDataTable,
        classAsString: 'MaterialDataTable',
        cssClass: 'mdl-js-data-table'
    });
    /**
     * @license
     * Copyright 2015 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
       * Class constructor for Ripple MDL component.
       * Implements MDL component design pattern defined at:
       * https://github.com/jasonmayes/mdl-component-design-pattern
       *
       * @constructor
       * @param {HTMLElement} element The element that will be upgraded.
       */
    var MaterialRipple = function MaterialRipple(element) {
        this.element_ = element;
        // Initialize instance.
        this.init();
    };
    window['MaterialRipple'] = MaterialRipple;
    /**
       * Store constants in one place so they can be updated easily.
       *
       * @enum {string | number}
       * @private
       */
    MaterialRipple.prototype.Constant_ = {
        INITIAL_SCALE: 'scale(0.0001, 0.0001)',
        INITIAL_SIZE: '1px',
        INITIAL_OPACITY: '0.4',
        FINAL_OPACITY: '0',
        FINAL_SCALE: ''
    };
    /**
       * Store strings for class names defined by this component that are used in
       * JavaScript. This allows us to simply change it in one place should we
       * decide to modify at a later date.
       *
       * @enum {string}
       * @private
       */
    MaterialRipple.prototype.CssClasses_ = {
        RIPPLE_CENTER: 'mdl-ripple--center',
        RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
        RIPPLE: 'mdl-ripple',
        IS_ANIMATING: 'is-animating',
        IS_VISIBLE: 'is-visible'
    };
    /**
       * Handle mouse / finger down on element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialRipple.prototype.downHandler_ = function (event) {
        if (!this.rippleElement_.style.width && !this.rippleElement_.style.height) {
            var rect = this.element_.getBoundingClientRect();
            this.boundHeight = rect.height;
            this.boundWidth = rect.width;
            this.rippleSize_ = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2 + 2;
            this.rippleElement_.style.width = this.rippleSize_ + 'px';
            this.rippleElement_.style.height = this.rippleSize_ + 'px';
        }
        this.rippleElement_.classList.add(this.CssClasses_.IS_VISIBLE);
        if (event.type === 'mousedown' && this.ignoringMouseDown_) {
            this.ignoringMouseDown_ = false;
        } else {
            if (event.type === 'touchstart') {
                this.ignoringMouseDown_ = true;
            }
            var frameCount = this.getFrameCount();
            if (frameCount > 0) {
                return;
            }
            this.setFrameCount(1);
            var bound = event.currentTarget.getBoundingClientRect();
            var x;
            var y;
            // Check if we are handling a keyboard click.
            if (event.clientX === 0 && event.clientY === 0) {
                x = Math.round(bound.width / 2);
                y = Math.round(bound.height / 2);
            } else {
                var clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
                var clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
                x = Math.round(clientX - bound.left);
                y = Math.round(clientY - bound.top);
            }
            this.setRippleXY(x, y);
            this.setRippleStyles(true);
            window.requestAnimationFrame(this.animFrameHandler.bind(this));
        }
    };
    /**
       * Handle mouse / finger up on element.
       *
       * @param {Event} event The event that fired.
       * @private
       */
    MaterialRipple.prototype.upHandler_ = function (event) {
        // Don't fire for the artificial "mouseup" generated by a double-click.
        if (event && event.detail !== 2) {
            // Allow a repaint to occur before removing this class, so the animation
            // shows for tap events, which seem to trigger a mouseup too soon after
            // mousedown.
            window.setTimeout(function () {
                this.rippleElement_.classList.remove(this.CssClasses_.IS_VISIBLE);
            }.bind(this), 0);
        }
    };
    /**
       * Initialize element.
       */
    MaterialRipple.prototype.init = function () {
        if (this.element_) {
            var recentering = this.element_.classList.contains(this.CssClasses_.RIPPLE_CENTER);
            if (!this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT_IGNORE_EVENTS)) {
                this.rippleElement_ = this.element_.querySelector('.' + this.CssClasses_.RIPPLE);
                this.frameCount_ = 0;
                this.rippleSize_ = 0;
                this.x_ = 0;
                this.y_ = 0;
                // Touch start produces a compat mouse down event, which would cause a
                // second ripples. To avoid that, we use this property to ignore the first
                // mouse down after a touch start.
                this.ignoringMouseDown_ = false;
                this.boundDownHandler = this.downHandler_.bind(this);
                this.element_.addEventListener('mousedown', this.boundDownHandler);
                this.element_.addEventListener('touchstart', this.boundDownHandler);
                this.boundUpHandler = this.upHandler_.bind(this);
                this.element_.addEventListener('mouseup', this.boundUpHandler);
                this.element_.addEventListener('mouseleave', this.boundUpHandler);
                this.element_.addEventListener('touchend', this.boundUpHandler);
                this.element_.addEventListener('blur', this.boundUpHandler);
                /**
                * Getter for frameCount_.
                * @return {number} the frame count.
                */
                this.getFrameCount = function () {
                    return this.frameCount_;
                };
                /**
                * Setter for frameCount_.
                * @param {number} fC the frame count.
                */
                this.setFrameCount = function (fC) {
                    this.frameCount_ = fC;
                };
                /**
                * Getter for rippleElement_.
                * @return {Element} the ripple element.
                */
                this.getRippleElement = function () {
                    return this.rippleElement_;
                };
                /**
                * Sets the ripple X and Y coordinates.
                * @param  {number} newX the new X coordinate
                * @param  {number} newY the new Y coordinate
                */
                this.setRippleXY = function (newX, newY) {
                    this.x_ = newX;
                    this.y_ = newY;
                };
                /**
                * Sets the ripple styles.
                * @param  {boolean} start whether or not this is the start frame.
                */
                this.setRippleStyles = function (start) {
                    if (this.rippleElement_ !== null) {
                        var transformString;
                        var scale;
                        var size;
                        var offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';
                        if (start) {
                            scale = this.Constant_.INITIAL_SCALE;
                            size = this.Constant_.INITIAL_SIZE;
                        } else {
                            scale = this.Constant_.FINAL_SCALE;
                            size = this.rippleSize_ + 'px';
                            if (recentering) {
                                offset = 'translate(' + this.boundWidth / 2 + 'px, ' + this.boundHeight / 2 + 'px)';
                            }
                        }
                        transformString = 'translate(-50%, -50%) ' + offset + scale;
                        this.rippleElement_.style.webkitTransform = transformString;
                        this.rippleElement_.style.msTransform = transformString;
                        this.rippleElement_.style.transform = transformString;
                        if (start) {
                            this.rippleElement_.classList.remove(this.CssClasses_.IS_ANIMATING);
                        } else {
                            this.rippleElement_.classList.add(this.CssClasses_.IS_ANIMATING);
                        }
                    }
                };
                /**
                * Handles an animation frame.
                */
                this.animFrameHandler = function () {
                    if (this.frameCount_-- > 0) {
                        window.requestAnimationFrame(this.animFrameHandler.bind(this));
                    } else {
                        this.setRippleStyles(false);
                    }
                };
            }
        }
    };
    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
        constructor: MaterialRipple,
        classAsString: 'MaterialRipple',
        cssClass: 'mdl-js-ripple-effect',
        widget: false
    });
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvanMvbWRsL3N0YXRpYy9qcy9tYXRlcmlhbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSxDQUFFLGFBQVc7QUFDYjs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkE7Ozs7Ozs7QUFPQTs7QUFFQTtBQUNBOztBQUNBLFFBQUksbUJBQW1CO0FBQ3JCOzs7Ozs7Ozs7QUFTQSxvQkFBWSxvQkFBUyxVQUFULEVBQXFCLFdBQXJCLEVBQWtDLENBQUUsQ0FWM0I7QUFXckI7Ozs7Ozs7QUFPQSx3QkFBZ0Isd0JBQVMsT0FBVCxFQUFrQixVQUFsQixFQUE4QixDQUFFLENBbEIzQjtBQW1CckI7Ozs7OztBQU1BLHlCQUFpQix5QkFBUyxRQUFULEVBQW1CLENBQUUsQ0F6QmpCO0FBMEJyQjs7OztBQUlBLDhCQUFzQixnQ0FBVyxDQUFFLENBOUJkO0FBK0JyQjs7Ozs7Ozs7OztBQVVBLGtDQUEwQixrQ0FBUyxPQUFULEVBQWtCLFFBQWxCLEVBQTRCLENBQUUsQ0F6Q25DO0FBMENyQjs7Ozs7QUFLQSxrQkFBVSxrQkFBUyxNQUFULEVBQWlCLENBQUUsQ0EvQ1I7QUFnRHJCOzs7OztBQUtBLDJCQUFtQiwyQkFBUyxLQUFULEVBQWdCLENBQUU7QUFyRGhCLEtBQXZCOztBQXdEQSx1QkFBb0IsWUFBVztBQUM3Qjs7QUFFQTs7QUFDQSxZQUFJLHdCQUF3QixFQUE1Qjs7QUFFQTtBQUNBLFlBQUkscUJBQXFCLEVBQXpCOztBQUVBLFlBQUksMkJBQTJCLDZCQUEvQjs7QUFFQTs7Ozs7Ozs7O0FBU0EsaUJBQVMsb0JBQVQsQ0FBOEIsSUFBOUIsRUFBb0MsVUFBcEMsRUFBZ0Q7QUFDOUMsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxzQkFBc0IsTUFBMUMsRUFBa0QsR0FBbEQsRUFBdUQ7QUFDckQsb0JBQUksc0JBQXNCLENBQXRCLEVBQXlCLFNBQXpCLEtB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QTFCLEdBQXdDLGVBQXhDO0FBQ0EsNkJBQUssY0FBTCxDQUFvQixLQUFwQixDQUEwQixTQUExQixHQUFzQyxlQUF0QztBQUNBLDRCQUFJLEtBQUosRUFBVztBQUNQLGlDQUFLLGNBQUwsQ0FBb0IsU0FBcEIsQ0FBOEIsTUFBOUIsQ0FBcUMsS0FBSyxXQUFMLENBQWlCLFlBQXREO0FBQ0gseUJBRkQsTUFFTztBQUNILGlDQUFLLGNBQUwsQ0FBb0IsU0FBcEIsQ0FBOEIsR0FBOUIsQ0FBa0MsS0FBSyxXQUFMLENBQWlCLFlBQW5EO0FBQ0g7QUFDSjtBQUNKLGlCQTFCRDtBQTJCQTs7O0FBR0EscUJBQUssZ0JBQUwsR0FBd0IsWUFBWTtBQUNoQyx3QkFBSSxLQUFLLFdBQUwsS0FBcUIsQ0FBekIsRUFBNEI7QUFDeEIsK0JBQU8scUJBQVAsQ0FBNkIsS0FBSyxnQkFBTCxDQUFzQixJQUF0QixDQUEyQixJQUEzQixDQUE3QjtBQUNILHFCQUZELE1BRU87QUFDSCw2QkFBSyxlQUFMLENBQXFCLEtBQXJCO0FBQ0g7QUFDSixpQkFORDtBQU9IO0FBQ0o7QUFDSixLQTlGRDtBQStGQTtBQUNBO0FBQ0EscUJBQWlCLFFBQWpCLENBQTBCO0FBQ3RCLHFCQUFhLGNBRFM7QUFFdEIsdUJBQWUsZ0JBRk87QUFHdEIsa0JBQVUsc0JBSFk7QUFJdEIsZ0JBQVE7QUFKYyxLQUExQjtBQU1DLENBMzVIQyxHQUFEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiOyhmdW5jdGlvbigpIHtcblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBBIGNvbXBvbmVudCBoYW5kbGVyIGludGVyZmFjZSB1c2luZyB0aGUgcmV2ZWFsaW5nIG1vZHVsZSBkZXNpZ24gcGF0dGVybi5cbiAqIE1vcmUgZGV0YWlscyBvbiB0aGlzIGRlc2lnbiBwYXR0ZXJuIGhlcmU6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vamFzb25tYXllcy9tZGwtY29tcG9uZW50LWRlc2lnbi1wYXR0ZXJuXG4gKlxuICogQGF1dGhvciBKYXNvbiBNYXllcy5cbiAqL1xuLyogZXhwb3J0ZWQgY29tcG9uZW50SGFuZGxlciAqL1xuXG4vLyBQcmUtZGVmaW5pbmcgdGhlIGNvbXBvbmVudEhhbmRsZXIgaW50ZXJmYWNlLCBmb3IgY2xvc3VyZSBkb2N1bWVudGF0aW9uIGFuZFxuLy8gc3RhdGljIHZlcmlmaWNhdGlvbi5cbnZhciBjb21wb25lbnRIYW5kbGVyID0ge1xuICAvKipcbiAgICogU2VhcmNoZXMgZXhpc3RpbmcgRE9NIGZvciBlbGVtZW50cyBvZiBvdXIgY29tcG9uZW50IHR5cGUgYW5kIHVwZ3JhZGVzIHRoZW1cbiAgICogaWYgdGhleSBoYXZlIG5vdCBhbHJlYWR5IGJlZW4gdXBncmFkZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0SnNDbGFzcyB0aGUgcHJvZ3JhbWF0aWMgbmFtZSBvZiB0aGUgZWxlbWVudCBjbGFzcyB3ZVxuICAgKiBuZWVkIHRvIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZi5cbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRDc3NDbGFzcyB0aGUgbmFtZSBvZiB0aGUgQ1NTIGNsYXNzIGVsZW1lbnRzIG9mIHRoaXNcbiAgICogdHlwZSB3aWxsIGhhdmUuXG4gICAqL1xuICB1cGdyYWRlRG9tOiBmdW5jdGlvbihvcHRKc0NsYXNzLCBvcHRDc3NDbGFzcykge30sXG4gIC8qKlxuICAgKiBVcGdyYWRlcyBhIHNwZWNpZmljIGVsZW1lbnQgcmF0aGVyIHRoYW4gYWxsIGluIHRoZSBET00uXG4gICAqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgd2Ugd2lzaCB0byB1cGdyYWRlLlxuICAgKiBAcGFyYW0ge3N0cmluZz19IG9wdEpzQ2xhc3MgT3B0aW9uYWwgbmFtZSBvZiB0aGUgY2xhc3Mgd2Ugd2FudCB0byB1cGdyYWRlXG4gICAqIHRoZSBlbGVtZW50IHRvLlxuICAgKi9cbiAgdXBncmFkZUVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdEpzQ2xhc3MpIHt9LFxuICAvKipcbiAgICogVXBncmFkZXMgYSBzcGVjaWZpYyBsaXN0IG9mIGVsZW1lbnRzIHJhdGhlciB0aGFuIGFsbCBpbiB0aGUgRE9NLlxuICAgKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFBcnJheTwhRWxlbWVudD58IU5vZGVMaXN0fCFIVE1MQ29sbGVjdGlvbn0gZWxlbWVudHNcbiAgICogVGhlIGVsZW1lbnRzIHdlIHdpc2ggdG8gdXBncmFkZS5cbiAgICovXG4gIHVwZ3JhZGVFbGVtZW50czogZnVuY3Rpb24oZWxlbWVudHMpIHt9LFxuICAvKipcbiAgICogVXBncmFkZXMgYWxsIHJlZ2lzdGVyZWQgY29tcG9uZW50cyBmb3VuZCBpbiB0aGUgY3VycmVudCBET00uIFRoaXMgaXNcbiAgICogYXV0b21hdGljYWxseSBjYWxsZWQgb24gd2luZG93IGxvYWQuXG4gICAqL1xuICB1cGdyYWRlQWxsUmVnaXN0ZXJlZDogZnVuY3Rpb24oKSB7fSxcbiAgLyoqXG4gICAqIEFsbG93cyB1c2VyIHRvIGJlIGFsZXJ0ZWQgdG8gYW55IHVwZ3JhZGVzIHRoYXQgYXJlIHBlcmZvcm1lZCBmb3IgYSBnaXZlblxuICAgKiBjb21wb25lbnQgdHlwZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30ganNDbGFzcyBUaGUgY2xhc3MgbmFtZSBvZiB0aGUgTURMIGNvbXBvbmVudCB3ZSB3aXNoXG4gICAqIHRvIGhvb2sgaW50byBmb3IgYW55IHVwZ3JhZGVzIHBlcmZvcm1lZC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbighSFRNTEVsZW1lbnQpfSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gY2FsbCB1cG9uIGFuXG4gICAqIHVwZ3JhZGUuIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGV4cGVjdCAxIHBhcmFtZXRlciAtIHRoZSBIVE1MRWxlbWVudCB3aGljaFxuICAgKiBnb3QgdXBncmFkZWQuXG4gICAqL1xuICByZWdpc3RlclVwZ3JhZGVkQ2FsbGJhY2s6IGZ1bmN0aW9uKGpzQ2xhc3MsIGNhbGxiYWNrKSB7fSxcbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNsYXNzIGZvciBmdXR1cmUgdXNlIGFuZCBhdHRlbXB0cyB0byB1cGdyYWRlIGV4aXN0aW5nIERPTS5cbiAgICpcbiAgICogQHBhcmFtIHtjb21wb25lbnRIYW5kbGVyLkNvbXBvbmVudENvbmZpZ1B1YmxpY30gY29uZmlnIHRoZSByZWdpc3RyYXRpb24gY29uZmlndXJhdGlvblxuICAgKi9cbiAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGNvbmZpZykge30sXG4gIC8qKlxuICAgKiBEb3duZ3JhZGUgZWl0aGVyIGEgZ2l2ZW4gbm9kZSwgYW4gYXJyYXkgb2Ygbm9kZXMsIG9yIGEgTm9kZUxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV8IUFycmF5PCFOb2RlPnwhTm9kZUxpc3R9IG5vZGVzXG4gICAqL1xuICBkb3duZ3JhZGVFbGVtZW50czogZnVuY3Rpb24obm9kZXMpIHt9XG59O1xuXG5jb21wb25lbnRIYW5kbGVyID0gKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqIEB0eXBlIHshQXJyYXk8Y29tcG9uZW50SGFuZGxlci5Db21wb25lbnRDb25maWc+fSAqL1xuICB2YXIgcmVnaXN0ZXJlZENvbXBvbmVudHNfID0gW107XG5cbiAgLyoqIEB0eXBlIHshQXJyYXk8Y29tcG9uZW50SGFuZGxlci5Db21wb25lbnQ+fSAqL1xuICB2YXIgY3JlYXRlZENvbXBvbmVudHNfID0gW107XG5cbiAgdmFyIGNvbXBvbmVudENvbmZpZ1Byb3BlcnR5XyA9ICdtZGxDb21wb25lbnRDb25maWdJbnRlcm5hbF8nO1xuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyByZWdpc3RlcmVkIGNvbXBvbmVudHMgZm9yIGEgY2xhc3Mgd2UgYXJlIGludGVyZXN0ZWQgaW4gdXNpbmcuXG4gICAqIE9wdGlvbmFsbHkgcmVwbGFjZXMgYSBtYXRjaCB3aXRoIHBhc3NlZCBvYmplY3QgaWYgc3BlY2lmaWVkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiBhIGNsYXNzIHdlIHdhbnQgdG8gdXNlLlxuICAgKiBAcGFyYW0ge2NvbXBvbmVudEhhbmRsZXIuQ29tcG9uZW50Q29uZmlnPX0gb3B0UmVwbGFjZSBPcHRpb25hbCBvYmplY3QgdG8gcmVwbGFjZSBtYXRjaCB3aXRoLlxuICAgKiBAcmV0dXJuIHshT2JqZWN0fGJvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBmaW5kUmVnaXN0ZXJlZENsYXNzXyhuYW1lLCBvcHRSZXBsYWNlKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpc3RlcmVkQ29tcG9uZW50c18ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWdpc3RlcmVkQ29tcG9uZW50c19baV0uY2xhc3NOYW1lID09PSBuYW1lKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0UmVwbGFjZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZWdpc3RlcmVkQ29tcG9uZW50c19baV0gPSBvcHRSZXBsYWNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWdpc3RlcmVkQ29tcG9uZW50c19baV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBjbGFzc05hbWVzIG9mIHRoZSB1cGdyYWRlZCBjbGFzc2VzIG9uIHRoZSBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIGZldGNoIGRhdGEgZnJvbS5cbiAgICogQHJldHVybiB7IUFycmF5PHN0cmluZz59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBnZXRVcGdyYWRlZExpc3RPZkVsZW1lbnRfKGVsZW1lbnQpIHtcbiAgICB2YXIgZGF0YVVwZ3JhZGVkID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXBncmFkZWQnKTtcbiAgICAvLyBVc2UgYFsnJ11gIGFzIGRlZmF1bHQgdmFsdWUgdG8gY29uZm9ybSB0aGUgYCxuYW1lLG5hbWUuLi5gIHN0eWxlLlxuICAgIHJldHVybiBkYXRhVXBncmFkZWQgPT09IG51bGwgPyBbJyddIDogZGF0YVVwZ3JhZGVkLnNwbGl0KCcsJyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBlbGVtZW50IGhhcyBhbHJlYWR5IGJlZW4gdXBncmFkZWQgZm9yIHRoZSBnaXZlblxuICAgKiBjbGFzcy5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB3ZSB3YW50IHRvIGNoZWNrLlxuICAgKiBAcGFyYW0ge3N0cmluZ30ganNDbGFzcyBUaGUgY2xhc3MgdG8gY2hlY2sgZm9yLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIGlzRWxlbWVudFVwZ3JhZGVkXyhlbGVtZW50LCBqc0NsYXNzKSB7XG4gICAgdmFyIHVwZ3JhZGVkTGlzdCA9IGdldFVwZ3JhZGVkTGlzdE9mRWxlbWVudF8oZWxlbWVudCk7XG4gICAgcmV0dXJuIHVwZ3JhZGVkTGlzdC5pbmRleE9mKGpzQ2xhc3MpICE9PSAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gZXZlbnQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIFRoZSB0eXBlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGJ1YmJsZXMgV2hldGhlciB0aGUgZXZlbnQgc2hvdWxkIGJ1YmJsZSB1cCB0aGUgRE9NLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNhbmNlbGFibGUgV2hldGhlciB0aGUgZXZlbnQgY2FuIGJlIGNhbmNlbGVkLlxuICAgKiBAcmV0dXJucyB7IUV2ZW50fVxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlRXZlbnRfKGV2ZW50VHlwZSwgYnViYmxlcywgY2FuY2VsYWJsZSkge1xuICAgIGlmICgnQ3VzdG9tRXZlbnQnIGluIHdpbmRvdyAmJiB0eXBlb2Ygd2luZG93LkN1c3RvbUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbmV3IEN1c3RvbUV2ZW50KGV2ZW50VHlwZSwge1xuICAgICAgICBidWJibGVzOiBidWJibGVzLFxuICAgICAgICBjYW5jZWxhYmxlOiBjYW5jZWxhYmxlXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50cycpO1xuICAgICAgZXYuaW5pdEV2ZW50KGV2ZW50VHlwZSwgYnViYmxlcywgY2FuY2VsYWJsZSk7XG4gICAgICByZXR1cm4gZXY7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlYXJjaGVzIGV4aXN0aW5nIERPTSBmb3IgZWxlbWVudHMgb2Ygb3VyIGNvbXBvbmVudCB0eXBlIGFuZCB1cGdyYWRlcyB0aGVtXG4gICAqIGlmIHRoZXkgaGF2ZSBub3QgYWxyZWFkeSBiZWVuIHVwZ3JhZGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZz19IG9wdEpzQ2xhc3MgdGhlIHByb2dyYW1hdGljIG5hbWUgb2YgdGhlIGVsZW1lbnQgY2xhc3Mgd2VcbiAgICogbmVlZCB0byBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YuXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0Q3NzQ2xhc3MgdGhlIG5hbWUgb2YgdGhlIENTUyBjbGFzcyBlbGVtZW50cyBvZiB0aGlzXG4gICAqIHR5cGUgd2lsbCBoYXZlLlxuICAgKi9cbiAgZnVuY3Rpb24gdXBncmFkZURvbUludGVybmFsKG9wdEpzQ2xhc3MsIG9wdENzc0NsYXNzKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRKc0NsYXNzID09PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICB0eXBlb2Ygb3B0Q3NzQ2xhc3MgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lzdGVyZWRDb21wb25lbnRzXy5sZW5ndGg7IGkrKykge1xuICAgICAgICB1cGdyYWRlRG9tSW50ZXJuYWwocmVnaXN0ZXJlZENvbXBvbmVudHNfW2ldLmNsYXNzTmFtZSxcbiAgICAgICAgICAgIHJlZ2lzdGVyZWRDb21wb25lbnRzX1tpXS5jc3NDbGFzcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBqc0NsYXNzID0gLyoqIEB0eXBlIHtzdHJpbmd9ICovIChvcHRKc0NsYXNzKTtcbiAgICAgIGlmICh0eXBlb2Ygb3B0Q3NzQ2xhc3MgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciByZWdpc3RlcmVkQ2xhc3MgPSBmaW5kUmVnaXN0ZXJlZENsYXNzXyhqc0NsYXNzKTtcbiAgICAgICAgaWYgKHJlZ2lzdGVyZWRDbGFzcykge1xuICAgICAgICAgIG9wdENzc0NsYXNzID0gcmVnaXN0ZXJlZENsYXNzLmNzc0NsYXNzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgb3B0Q3NzQ2xhc3MpO1xuICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCBlbGVtZW50cy5sZW5ndGg7IG4rKykge1xuICAgICAgICB1cGdyYWRlRWxlbWVudEludGVybmFsKGVsZW1lbnRzW25dLCBqc0NsYXNzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBncmFkZXMgYSBzcGVjaWZpYyBlbGVtZW50IHJhdGhlciB0aGFuIGFsbCBpbiB0aGUgRE9NLlxuICAgKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHdlIHdpc2ggdG8gdXBncmFkZS5cbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRKc0NsYXNzIE9wdGlvbmFsIG5hbWUgb2YgdGhlIGNsYXNzIHdlIHdhbnQgdG8gdXBncmFkZVxuICAgKiB0aGUgZWxlbWVudCB0by5cbiAgICovXG4gIGZ1bmN0aW9uIHVwZ3JhZGVFbGVtZW50SW50ZXJuYWwoZWxlbWVudCwgb3B0SnNDbGFzcykge1xuICAgIC8vIFZlcmlmeSBhcmd1bWVudCB0eXBlLlxuICAgIGlmICghKHR5cGVvZiBlbGVtZW50ID09PSAnb2JqZWN0JyAmJiBlbGVtZW50IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudCBwcm92aWRlZCB0byB1cGdyYWRlIE1ETCBlbGVtZW50LicpO1xuICAgIH1cbiAgICAvLyBBbGxvdyB1cGdyYWRlIHRvIGJlIGNhbmNlbGVkIGJ5IGNhbmNlbGluZyBlbWl0dGVkIGV2ZW50LlxuICAgIHZhciB1cGdyYWRpbmdFdiA9IGNyZWF0ZUV2ZW50XygnbWRsLWNvbXBvbmVudHVwZ3JhZGluZycsIHRydWUsIHRydWUpO1xuICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudCh1cGdyYWRpbmdFdik7XG4gICAgaWYgKHVwZ3JhZGluZ0V2LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdXBncmFkZWRMaXN0ID0gZ2V0VXBncmFkZWRMaXN0T2ZFbGVtZW50XyhlbGVtZW50KTtcbiAgICB2YXIgY2xhc3Nlc1RvVXBncmFkZSA9IFtdO1xuICAgIC8vIElmIGpzQ2xhc3MgaXMgbm90IHByb3ZpZGVkIHNjYW4gdGhlIHJlZ2lzdGVyZWQgY29tcG9uZW50cyB0byBmaW5kIHRoZVxuICAgIC8vIG9uZXMgbWF0Y2hpbmcgdGhlIGVsZW1lbnQncyBDU1MgY2xhc3NMaXN0LlxuICAgIGlmICghb3B0SnNDbGFzcykge1xuICAgICAgdmFyIGNsYXNzTGlzdCA9IGVsZW1lbnQuY2xhc3NMaXN0O1xuICAgICAgcmVnaXN0ZXJlZENvbXBvbmVudHNfLmZvckVhY2goZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIC8vIE1hdGNoIENTUyAmIE5vdCB0byBiZSB1cGdyYWRlZCAmIE5vdCB1cGdyYWRlZC5cbiAgICAgICAgaWYgKGNsYXNzTGlzdC5jb250YWlucyhjb21wb25lbnQuY3NzQ2xhc3MpICYmXG4gICAgICAgICAgICBjbGFzc2VzVG9VcGdyYWRlLmluZGV4T2YoY29tcG9uZW50KSA9PT0gLTEgJiZcbiAgICAgICAgICAgICFpc0VsZW1lbnRVcGdyYWRlZF8oZWxlbWVudCwgY29tcG9uZW50LmNsYXNzTmFtZSkpIHtcbiAgICAgICAgICBjbGFzc2VzVG9VcGdyYWRlLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghaXNFbGVtZW50VXBncmFkZWRfKGVsZW1lbnQsIG9wdEpzQ2xhc3MpKSB7XG4gICAgICBjbGFzc2VzVG9VcGdyYWRlLnB1c2goZmluZFJlZ2lzdGVyZWRDbGFzc18ob3B0SnNDbGFzcykpO1xuICAgIH1cblxuICAgIC8vIFVwZ3JhZGUgdGhlIGVsZW1lbnQgZm9yIGVhY2ggY2xhc3Nlcy5cbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IGNsYXNzZXNUb1VwZ3JhZGUubGVuZ3RoLCByZWdpc3RlcmVkQ2xhc3M7IGkgPCBuOyBpKyspIHtcbiAgICAgIHJlZ2lzdGVyZWRDbGFzcyA9IGNsYXNzZXNUb1VwZ3JhZGVbaV07XG4gICAgICBpZiAocmVnaXN0ZXJlZENsYXNzKSB7XG4gICAgICAgIC8vIE1hcmsgZWxlbWVudCBhcyB1cGdyYWRlZC5cbiAgICAgICAgdXBncmFkZWRMaXN0LnB1c2gocmVnaXN0ZXJlZENsYXNzLmNsYXNzTmFtZSk7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXVwZ3JhZGVkJywgdXBncmFkZWRMaXN0LmpvaW4oJywnKSk7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyByZWdpc3RlcmVkQ2xhc3MuY2xhc3NDb25zdHJ1Y3RvcihlbGVtZW50KTtcbiAgICAgICAgaW5zdGFuY2VbY29tcG9uZW50Q29uZmlnUHJvcGVydHlfXSA9IHJlZ2lzdGVyZWRDbGFzcztcbiAgICAgICAgY3JlYXRlZENvbXBvbmVudHNfLnB1c2goaW5zdGFuY2UpO1xuICAgICAgICAvLyBDYWxsIGFueSBjYWxsYmFja3MgdGhlIHVzZXIgaGFzIHJlZ2lzdGVyZWQgd2l0aCB0aGlzIGNvbXBvbmVudCB0eXBlLlxuICAgICAgICBmb3IgKHZhciBqID0gMCwgbSA9IHJlZ2lzdGVyZWRDbGFzcy5jYWxsYmFja3MubGVuZ3RoOyBqIDwgbTsgaisrKSB7XG4gICAgICAgICAgcmVnaXN0ZXJlZENsYXNzLmNhbGxiYWNrc1tqXShlbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWdpc3RlcmVkQ2xhc3Mud2lkZ2V0KSB7XG4gICAgICAgICAgLy8gQXNzaWduIHBlciBlbGVtZW50IGluc3RhbmNlIGZvciBjb250cm9sIG92ZXIgQVBJXG4gICAgICAgICAgZWxlbWVudFtyZWdpc3RlcmVkQ2xhc3MuY2xhc3NOYW1lXSA9IGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1VuYWJsZSB0byBmaW5kIGEgcmVnaXN0ZXJlZCBjb21wb25lbnQgZm9yIHRoZSBnaXZlbiBjbGFzcy4nKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHVwZ3JhZGVkRXYgPSBjcmVhdGVFdmVudF8oJ21kbC1jb21wb25lbnR1cGdyYWRlZCcsIHRydWUsIGZhbHNlKTtcbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudCh1cGdyYWRlZEV2KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBncmFkZXMgYSBzcGVjaWZpYyBsaXN0IG9mIGVsZW1lbnRzIHJhdGhlciB0aGFuIGFsbCBpbiB0aGUgRE9NLlxuICAgKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFBcnJheTwhRWxlbWVudD58IU5vZGVMaXN0fCFIVE1MQ29sbGVjdGlvbn0gZWxlbWVudHNcbiAgICogVGhlIGVsZW1lbnRzIHdlIHdpc2ggdG8gdXBncmFkZS5cbiAgICovXG4gIGZ1bmN0aW9uIHVwZ3JhZGVFbGVtZW50c0ludGVybmFsKGVsZW1lbnRzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGVsZW1lbnRzKSkge1xuICAgICAgaWYgKGVsZW1lbnRzIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50cyA9IFtlbGVtZW50c107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVsZW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBlbGVtZW50cy5sZW5ndGgsIGVsZW1lbnQ7IGkgPCBuOyBpKyspIHtcbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcbiAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdXBncmFkZUVsZW1lbnRJbnRlcm5hbChlbGVtZW50KTtcbiAgICAgICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHVwZ3JhZGVFbGVtZW50c0ludGVybmFsKGVsZW1lbnQuY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNsYXNzIGZvciBmdXR1cmUgdXNlIGFuZCBhdHRlbXB0cyB0byB1cGdyYWRlIGV4aXN0aW5nIERPTS5cbiAgICpcbiAgICogQHBhcmFtIHtjb21wb25lbnRIYW5kbGVyLkNvbXBvbmVudENvbmZpZ1B1YmxpY30gY29uZmlnXG4gICAqL1xuICBmdW5jdGlvbiByZWdpc3RlckludGVybmFsKGNvbmZpZykge1xuICAgIC8vIEluIG9yZGVyIHRvIHN1cHBvcnQgYm90aCBDbG9zdXJlLWNvbXBpbGVkIGFuZCB1bmNvbXBpbGVkIGNvZGUgYWNjZXNzaW5nXG4gICAgLy8gdGhpcyBtZXRob2QsIHdlIG5lZWQgdG8gYWxsb3cgZm9yIGJvdGggdGhlIGRvdCBhbmQgYXJyYXkgc3ludGF4IGZvclxuICAgIC8vIHByb3BlcnR5IGFjY2Vzcy4gWW91J2xsIHRoZXJlZm9yZSBzZWUgdGhlIGBmb28uYmFyIHx8IGZvb1snYmFyJ11gXG4gICAgLy8gcGF0dGVybiByZXBlYXRlZCBhY3Jvc3MgdGhpcyBtZXRob2QuXG4gICAgdmFyIHdpZGdldE1pc3NpbmcgPSAodHlwZW9mIGNvbmZpZy53aWRnZXQgPT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIHR5cGVvZiBjb25maWdbJ3dpZGdldCddID09PSAndW5kZWZpbmVkJyk7XG4gICAgdmFyIHdpZGdldCA9IHRydWU7XG5cbiAgICBpZiAoIXdpZGdldE1pc3NpbmcpIHtcbiAgICAgIHdpZGdldCA9IGNvbmZpZy53aWRnZXQgfHwgY29uZmlnWyd3aWRnZXQnXTtcbiAgICB9XG5cbiAgICB2YXIgbmV3Q29uZmlnID0gLyoqIEB0eXBlIHtjb21wb25lbnRIYW5kbGVyLkNvbXBvbmVudENvbmZpZ30gKi8gKHtcbiAgICAgIGNsYXNzQ29uc3RydWN0b3I6IGNvbmZpZy5jb25zdHJ1Y3RvciB8fCBjb25maWdbJ2NvbnN0cnVjdG9yJ10sXG4gICAgICBjbGFzc05hbWU6IGNvbmZpZy5jbGFzc0FzU3RyaW5nIHx8IGNvbmZpZ1snY2xhc3NBc1N0cmluZyddLFxuICAgICAgY3NzQ2xhc3M6IGNvbmZpZy5jc3NDbGFzcyB8fCBjb25maWdbJ2Nzc0NsYXNzJ10sXG4gICAgICB3aWRnZXQ6IHdpZGdldCxcbiAgICAgIGNhbGxiYWNrczogW11cbiAgICB9KTtcblxuICAgIHJlZ2lzdGVyZWRDb21wb25lbnRzXy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLmNzc0NsYXNzID09PSBuZXdDb25maWcuY3NzQ2xhc3MpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcHJvdmlkZWQgY3NzQ2xhc3MgaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkOiAnICsgaXRlbS5jc3NDbGFzcyk7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbS5jbGFzc05hbWUgPT09IG5ld0NvbmZpZy5jbGFzc05hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcHJvdmlkZWQgY2xhc3NOYW1lIGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZCcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGNvbmZpZy5jb25zdHJ1Y3Rvci5wcm90b3R5cGVcbiAgICAgICAgLmhhc093blByb3BlcnR5KGNvbXBvbmVudENvbmZpZ1Byb3BlcnR5XykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnTURMIGNvbXBvbmVudCBjbGFzc2VzIG11c3Qgbm90IGhhdmUgJyArIGNvbXBvbmVudENvbmZpZ1Byb3BlcnR5XyArXG4gICAgICAgICAgJyBkZWZpbmVkIGFzIGEgcHJvcGVydHkuJyk7XG4gICAgfVxuXG4gICAgdmFyIGZvdW5kID0gZmluZFJlZ2lzdGVyZWRDbGFzc18oY29uZmlnLmNsYXNzQXNTdHJpbmcsIG5ld0NvbmZpZyk7XG5cbiAgICBpZiAoIWZvdW5kKSB7XG4gICAgICByZWdpc3RlcmVkQ29tcG9uZW50c18ucHVzaChuZXdDb25maWcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdXNlciB0byBiZSBhbGVydGVkIHRvIGFueSB1cGdyYWRlcyB0aGF0IGFyZSBwZXJmb3JtZWQgZm9yIGEgZ2l2ZW5cbiAgICogY29tcG9uZW50IHR5cGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGpzQ2xhc3MgVGhlIGNsYXNzIG5hbWUgb2YgdGhlIE1ETCBjb21wb25lbnQgd2Ugd2lzaFxuICAgKiB0byBob29rIGludG8gZm9yIGFueSB1cGdyYWRlcyBwZXJmb3JtZWQuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUhUTUxFbGVtZW50KX0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGNhbGwgdXBvbiBhblxuICAgKiB1cGdyYWRlLiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBleHBlY3QgMSBwYXJhbWV0ZXIgLSB0aGUgSFRNTEVsZW1lbnQgd2hpY2hcbiAgICogZ290IHVwZ3JhZGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVnaXN0ZXJVcGdyYWRlZENhbGxiYWNrSW50ZXJuYWwoanNDbGFzcywgY2FsbGJhY2spIHtcbiAgICB2YXIgcmVnQ2xhc3MgPSBmaW5kUmVnaXN0ZXJlZENsYXNzXyhqc0NsYXNzKTtcbiAgICBpZiAocmVnQ2xhc3MpIHtcbiAgICAgIHJlZ0NsYXNzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBncmFkZXMgYWxsIHJlZ2lzdGVyZWQgY29tcG9uZW50cyBmb3VuZCBpbiB0aGUgY3VycmVudCBET00uIFRoaXMgaXNcbiAgICogYXV0b21hdGljYWxseSBjYWxsZWQgb24gd2luZG93IGxvYWQuXG4gICAqL1xuICBmdW5jdGlvbiB1cGdyYWRlQWxsUmVnaXN0ZXJlZEludGVybmFsKCkge1xuICAgIGZvciAodmFyIG4gPSAwOyBuIDwgcmVnaXN0ZXJlZENvbXBvbmVudHNfLmxlbmd0aDsgbisrKSB7XG4gICAgICB1cGdyYWRlRG9tSW50ZXJuYWwocmVnaXN0ZXJlZENvbXBvbmVudHNfW25dLmNsYXNzTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHRoZSBjb21wb25lbnQgZm9yIHRoZSBkb3duZ3JhZGUgbWV0aG9kLlxuICAgKiBFeGVjdXRlIGlmIGZvdW5kLlxuICAgKiBSZW1vdmUgY29tcG9uZW50IGZyb20gY3JlYXRlZENvbXBvbmVudHMgbGlzdC5cbiAgICpcbiAgICogQHBhcmFtIHs/Y29tcG9uZW50SGFuZGxlci5Db21wb25lbnR9IGNvbXBvbmVudFxuICAgKi9cbiAgZnVuY3Rpb24gZGVjb25zdHJ1Y3RDb21wb25lbnRJbnRlcm5hbChjb21wb25lbnQpIHtcbiAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICB2YXIgY29tcG9uZW50SW5kZXggPSBjcmVhdGVkQ29tcG9uZW50c18uaW5kZXhPZihjb21wb25lbnQpO1xuICAgICAgY3JlYXRlZENvbXBvbmVudHNfLnNwbGljZShjb21wb25lbnRJbmRleCwgMSk7XG5cbiAgICAgIHZhciB1cGdyYWRlcyA9IGNvbXBvbmVudC5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXBncmFkZWQnKS5zcGxpdCgnLCcpO1xuICAgICAgdmFyIGNvbXBvbmVudFBsYWNlID0gdXBncmFkZXMuaW5kZXhPZihjb21wb25lbnRbY29tcG9uZW50Q29uZmlnUHJvcGVydHlfXS5jbGFzc0FzU3RyaW5nKTtcbiAgICAgIHVwZ3JhZGVzLnNwbGljZShjb21wb25lbnRQbGFjZSwgMSk7XG4gICAgICBjb21wb25lbnQuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdkYXRhLXVwZ3JhZGVkJywgdXBncmFkZXMuam9pbignLCcpKTtcblxuICAgICAgdmFyIGV2ID0gY3JlYXRlRXZlbnRfKCdtZGwtY29tcG9uZW50ZG93bmdyYWRlZCcsIHRydWUsIGZhbHNlKTtcbiAgICAgIGNvbXBvbmVudC5lbGVtZW50Xy5kaXNwYXRjaEV2ZW50KGV2KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRG93bmdyYWRlIGVpdGhlciBhIGdpdmVuIG5vZGUsIGFuIGFycmF5IG9mIG5vZGVzLCBvciBhIE5vZGVMaXN0LlxuICAgKlxuICAgKiBAcGFyYW0geyFOb2RlfCFBcnJheTwhTm9kZT58IU5vZGVMaXN0fSBub2Rlc1xuICAgKi9cbiAgZnVuY3Rpb24gZG93bmdyYWRlTm9kZXNJbnRlcm5hbChub2Rlcykge1xuICAgIC8qKlxuICAgICAqIEF1eGlsaWFyeSBmdW5jdGlvbiB0byBkb3duZ3JhZGUgYSBzaW5nbGUgbm9kZS5cbiAgICAgKiBAcGFyYW0gIHshTm9kZX0gbm9kZSB0aGUgbm9kZSB0byBiZSBkb3duZ3JhZGVkXG4gICAgICovXG4gICAgdmFyIGRvd25ncmFkZU5vZGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICBjcmVhdGVkQ29tcG9uZW50c18uZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uZWxlbWVudF8gPT09IG5vZGU7XG4gICAgICB9KS5mb3JFYWNoKGRlY29uc3RydWN0Q29tcG9uZW50SW50ZXJuYWwpO1xuICAgIH07XG4gICAgaWYgKG5vZGVzIGluc3RhbmNlb2YgQXJyYXkgfHwgbm9kZXMgaW5zdGFuY2VvZiBOb2RlTGlzdCkge1xuICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCBub2Rlcy5sZW5ndGg7IG4rKykge1xuICAgICAgICBkb3duZ3JhZGVOb2RlKG5vZGVzW25dKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5vZGVzIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgZG93bmdyYWRlTm9kZShub2Rlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudCBwcm92aWRlZCB0byBkb3duZ3JhZGUgTURMIG5vZGVzLicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIE5vdyByZXR1cm4gdGhlIGZ1bmN0aW9ucyB0aGF0IHNob3VsZCBiZSBtYWRlIHB1YmxpYyB3aXRoIHRoZWlyIHB1YmxpY2x5XG4gIC8vIGZhY2luZyBuYW1lcy4uLlxuICByZXR1cm4ge1xuICAgIHVwZ3JhZGVEb206IHVwZ3JhZGVEb21JbnRlcm5hbCxcbiAgICB1cGdyYWRlRWxlbWVudDogdXBncmFkZUVsZW1lbnRJbnRlcm5hbCxcbiAgICB1cGdyYWRlRWxlbWVudHM6IHVwZ3JhZGVFbGVtZW50c0ludGVybmFsLFxuICAgIHVwZ3JhZGVBbGxSZWdpc3RlcmVkOiB1cGdyYWRlQWxsUmVnaXN0ZXJlZEludGVybmFsLFxuICAgIHJlZ2lzdGVyVXBncmFkZWRDYWxsYmFjazogcmVnaXN0ZXJVcGdyYWRlZENhbGxiYWNrSW50ZXJuYWwsXG4gICAgcmVnaXN0ZXI6IHJlZ2lzdGVySW50ZXJuYWwsXG4gICAgZG93bmdyYWRlRWxlbWVudHM6IGRvd25ncmFkZU5vZGVzSW50ZXJuYWxcbiAgfTtcbn0pKCk7XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSB0eXBlIG9mIGEgcmVnaXN0ZXJlZCBjb21wb25lbnQgdHlwZSBtYW5hZ2VkIGJ5XG4gKiBjb21wb25lbnRIYW5kbGVyLiBQcm92aWRlZCBmb3IgYmVuZWZpdCBvZiB0aGUgQ2xvc3VyZSBjb21waWxlci5cbiAqXG4gKiBAdHlwZWRlZiB7e1xuICogICBjb25zdHJ1Y3RvcjogRnVuY3Rpb24sXG4gKiAgIGNsYXNzQXNTdHJpbmc6IHN0cmluZyxcbiAqICAgY3NzQ2xhc3M6IHN0cmluZyxcbiAqICAgd2lkZ2V0OiAoc3RyaW5nfGJvb2xlYW58dW5kZWZpbmVkKVxuICogfX1cbiAqL1xuY29tcG9uZW50SGFuZGxlci5Db21wb25lbnRDb25maWdQdWJsaWM7ICAvLyBqc2hpbnQgaWdub3JlOmxpbmVcblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIHR5cGUgb2YgYSByZWdpc3RlcmVkIGNvbXBvbmVudCB0eXBlIG1hbmFnZWQgYnlcbiAqIGNvbXBvbmVudEhhbmRsZXIuIFByb3ZpZGVkIGZvciBiZW5lZml0IG9mIHRoZSBDbG9zdXJlIGNvbXBpbGVyLlxuICpcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGNvbnN0cnVjdG9yOiAhRnVuY3Rpb24sXG4gKiAgIGNsYXNzTmFtZTogc3RyaW5nLFxuICogICBjc3NDbGFzczogc3RyaW5nLFxuICogICB3aWRnZXQ6IChzdHJpbmd8Ym9vbGVhbiksXG4gKiAgIGNhbGxiYWNrczogIUFycmF5PGZ1bmN0aW9uKCFIVE1MRWxlbWVudCk+XG4gKiB9fVxuICovXG5jb21wb25lbnRIYW5kbGVyLkNvbXBvbmVudENvbmZpZzsgIC8vIGpzaGludCBpZ25vcmU6bGluZVxuXG4vKipcbiAqIENyZWF0ZWQgY29tcG9uZW50IChpLmUuLCB1cGdyYWRlZCBlbGVtZW50KSB0eXBlIGFzIG1hbmFnZWQgYnlcbiAqIGNvbXBvbmVudEhhbmRsZXIuIFByb3ZpZGVkIGZvciBiZW5lZml0IG9mIHRoZSBDbG9zdXJlIGNvbXBpbGVyLlxuICpcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGVsZW1lbnRfOiAhSFRNTEVsZW1lbnQsXG4gKiAgIGNsYXNzTmFtZTogc3RyaW5nLFxuICogICBjbGFzc0FzU3RyaW5nOiBzdHJpbmcsXG4gKiAgIGNzc0NsYXNzOiBzdHJpbmcsXG4gKiAgIHdpZGdldDogc3RyaW5nXG4gKiB9fVxuICovXG5jb21wb25lbnRIYW5kbGVyLkNvbXBvbmVudDsgIC8vIGpzaGludCBpZ25vcmU6bGluZVxuXG4vLyBFeHBvcnQgYWxsIHN5bWJvbHMsIGZvciB0aGUgYmVuZWZpdCBvZiBDbG9zdXJlIGNvbXBpbGVyLlxuLy8gTm8gZWZmZWN0IG9uIHVuY29tcGlsZWQgY29kZS5cbmNvbXBvbmVudEhhbmRsZXJbJ3VwZ3JhZGVEb20nXSA9IGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbTtcbmNvbXBvbmVudEhhbmRsZXJbJ3VwZ3JhZGVFbGVtZW50J10gPSBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVFbGVtZW50O1xuY29tcG9uZW50SGFuZGxlclsndXBncmFkZUVsZW1lbnRzJ10gPSBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVFbGVtZW50cztcbmNvbXBvbmVudEhhbmRsZXJbJ3VwZ3JhZGVBbGxSZWdpc3RlcmVkJ10gPVxuICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZUFsbFJlZ2lzdGVyZWQ7XG5jb21wb25lbnRIYW5kbGVyWydyZWdpc3RlclVwZ3JhZGVkQ2FsbGJhY2snXSA9XG4gICAgY29tcG9uZW50SGFuZGxlci5yZWdpc3RlclVwZ3JhZGVkQ2FsbGJhY2s7XG5jb21wb25lbnRIYW5kbGVyWydyZWdpc3RlciddID0gY29tcG9uZW50SGFuZGxlci5yZWdpc3RlcjtcbmNvbXBvbmVudEhhbmRsZXJbJ2Rvd25ncmFkZUVsZW1lbnRzJ10gPSBjb21wb25lbnRIYW5kbGVyLmRvd25ncmFkZUVsZW1lbnRzO1xud2luZG93LmNvbXBvbmVudEhhbmRsZXIgPSBjb21wb25lbnRIYW5kbGVyO1xud2luZG93Wydjb21wb25lbnRIYW5kbGVyJ10gPSBjb21wb25lbnRIYW5kbGVyO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGEgXCJDdXR0aW5nIHRoZSBtdXN0YXJkXCIgdGVzdC4gSWYgdGhlIGJyb3dzZXIgc3VwcG9ydHMgdGhlIGZlYXR1cmVzXG4gICAqIHRlc3RlZCwgYWRkcyBhIG1kbC1qcyBjbGFzcyB0byB0aGUgPGh0bWw+IGVsZW1lbnQuIEl0IHRoZW4gdXBncmFkZXMgYWxsIE1ETFxuICAgKiBjb21wb25lbnRzIHJlcXVpcmluZyBKYXZhU2NyaXB0LlxuICAgKi9cbiAgaWYgKCdjbGFzc0xpc3QnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpICYmXG4gICAgICAncXVlcnlTZWxlY3RvcicgaW4gZG9jdW1lbnQgJiZcbiAgICAgICdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cgJiYgQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWRsLWpzJyk7XG4gICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlQWxsUmVnaXN0ZXJlZCgpO1xuICB9IGVsc2Uge1xuICAgIC8qKlxuICAgICAqIER1bW15IGZ1bmN0aW9uIHRvIGF2b2lkIEpTIGVycm9ycy5cbiAgICAgKi9cbiAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVFbGVtZW50ID0gZnVuY3Rpb24oKSB7fTtcbiAgICAvKipcbiAgICAgKiBEdW1teSBmdW5jdGlvbiB0byBhdm9pZCBKUyBlcnJvcnMuXG4gICAgICovXG4gICAgY29tcG9uZW50SGFuZGxlci5yZWdpc3RlciA9IGZ1bmN0aW9uKCkge307XG4gIH1cbn0pO1xuXG4vLyBTb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXJpdXMvcmVxdWVzdEFuaW1hdGlvbkZyYW1lL2Jsb2IvbWFzdGVyL3JlcXVlc3RBbmltYXRpb25GcmFtZS5qc1xuLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC8xNTc5NjcxIHdoaWNoIGRlcml2ZWQgZnJvbVxuLy8gaHR0cDovL3BhdWxpcmlzaC5jb20vMjAxMS9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWFuaW1hdGluZy9cbi8vIGh0dHA6Ly9teS5vcGVyYS5jb20vZW1vbGxlci9ibG9nLzIwMTEvMTIvMjAvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1lci1hbmltYXRpbmdcbi8vIHJlcXVlc3RBbmltYXRpb25GcmFtZSBwb2x5ZmlsbCBieSBFcmlrIE3DtmxsZXIuXG4vLyBGaXhlcyBmcm9tIFBhdWwgSXJpc2gsIFRpbm8gWmlqZGVsLCBBbmRyZXcgTWFvLCBLbGVtZW4gU2xhdmnEjSwgRGFyaXVzIEJhY29uXG4vLyBNSVQgbGljZW5zZVxuaWYgKCFEYXRlLm5vdykge1xuICAgIC8qKlxuICAgICAqIERhdGUubm93IHBvbHlmaWxsLlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIGN1cnJlbnQgRGF0ZVxuICAgICAqL1xuICAgIERhdGUubm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfTtcbiAgICBEYXRlWydub3cnXSA9IERhdGUubm93O1xufVxudmFyIHZlbmRvcnMgPSBbXG4gICAgJ3dlYmtpdCcsXG4gICAgJ21veidcbl07XG5mb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnAgKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwICsgJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHwgd2luZG93W3ZwICsgJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIHdpbmRvd1sncmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIHdpbmRvd1snY2FuY2VsQW5pbWF0aW9uRnJhbWUnXSA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZTtcbn1cbmlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIC8qKlxuICAgICAqIHJlcXVlc3RBbmltYXRpb25GcmFtZSBwb2x5ZmlsbC5cbiAgICAgKiBAcGFyYW0gIHshRnVuY3Rpb259IGNhbGxiYWNrIHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTtcbiAgICAgICAgfSwgbmV4dFRpbWUgLSBub3cpO1xuICAgIH07XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xuICAgIHdpbmRvd1sncmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIHdpbmRvd1snY2FuY2VsQW5pbWF0aW9uRnJhbWUnXSA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZTtcbn1cbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDE1IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yIGZvciBCdXR0b24gTURMIGNvbXBvbmVudC5cbiAgICogSW1wbGVtZW50cyBNREwgY29tcG9uZW50IGRlc2lnbiBwYXR0ZXJuIGRlZmluZWQgYXQ6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNvbm1heWVzL21kbC1jb21wb25lbnQtZGVzaWduLXBhdHRlcm5cbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBncmFkZWQuXG4gICAqL1xudmFyIE1hdGVyaWFsQnV0dG9uID0gZnVuY3Rpb24gTWF0ZXJpYWxCdXR0b24oZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuICAgIC8vIEluaXRpYWxpemUgaW5zdGFuY2UuXG4gICAgdGhpcy5pbml0KCk7XG59O1xud2luZG93WydNYXRlcmlhbEJ1dHRvbiddID0gTWF0ZXJpYWxCdXR0b247XG4vKipcbiAgICogU3RvcmUgY29uc3RhbnRzIGluIG9uZSBwbGFjZSBzbyB0aGV5IGNhbiBiZSB1cGRhdGVkIGVhc2lseS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZyB8IG51bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbEJ1dHRvbi5wcm90b3R5cGUuQ29uc3RhbnRfID0ge307XG4vKipcbiAgICogU3RvcmUgc3RyaW5ncyBmb3IgY2xhc3MgbmFtZXMgZGVmaW5lZCBieSB0aGlzIGNvbXBvbmVudCB0aGF0IGFyZSB1c2VkIGluXG4gICAqIEphdmFTY3JpcHQuIFRoaXMgYWxsb3dzIHVzIHRvIHNpbXBseSBjaGFuZ2UgaXQgaW4gb25lIHBsYWNlIHNob3VsZCB3ZVxuICAgKiBkZWNpZGUgdG8gbW9kaWZ5IGF0IGEgbGF0ZXIgZGF0ZS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbEJ1dHRvbi5wcm90b3R5cGUuQ3NzQ2xhc3Nlc18gPSB7XG4gICAgUklQUExFX0VGRkVDVDogJ21kbC1qcy1yaXBwbGUtZWZmZWN0JyxcbiAgICBSSVBQTEVfQ09OVEFJTkVSOiAnbWRsLWJ1dHRvbl9fcmlwcGxlLWNvbnRhaW5lcicsXG4gICAgUklQUExFOiAnbWRsLXJpcHBsZSdcbn07XG4vKipcbiAgICogSGFuZGxlIGJsdXIgb2YgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxCdXR0b24ucHJvdG90eXBlLmJsdXJIYW5kbGVyXyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmJsdXIoKTtcbiAgICB9XG59O1xuLy8gUHVibGljIG1ldGhvZHMuXG4vKipcbiAgICogRGlzYWJsZSBidXR0b24uXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbEJ1dHRvbi5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnRfLmRpc2FibGVkID0gdHJ1ZTtcbn07XG5NYXRlcmlhbEJ1dHRvbi5wcm90b3R5cGVbJ2Rpc2FibGUnXSA9IE1hdGVyaWFsQnV0dG9uLnByb3RvdHlwZS5kaXNhYmxlO1xuLyoqXG4gICAqIEVuYWJsZSBidXR0b24uXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbEJ1dHRvbi5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudF8uZGlzYWJsZWQgPSBmYWxzZTtcbn07XG5NYXRlcmlhbEJ1dHRvbi5wcm90b3R5cGVbJ2VuYWJsZSddID0gTWF0ZXJpYWxCdXR0b24ucHJvdG90eXBlLmVuYWJsZTtcbi8qKlxuICAgKiBJbml0aWFsaXplIGVsZW1lbnQuXG4gICAqL1xuTWF0ZXJpYWxCdXR0b24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8pIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uUklQUExFX0VGRkVDVCkpIHtcbiAgICAgICAgICAgIHZhciByaXBwbGVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICByaXBwbGVDb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9DT05UQUlORVIpO1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVFbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHRoaXMucmlwcGxlRWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRSk7XG4gICAgICAgICAgICByaXBwbGVDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5yaXBwbGVFbGVtZW50Xyk7XG4gICAgICAgICAgICB0aGlzLmJvdW5kUmlwcGxlQmx1ckhhbmRsZXIgPSB0aGlzLmJsdXJIYW5kbGVyXy5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5ib3VuZFJpcHBsZUJsdXJIYW5kbGVyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQocmlwcGxlQ29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJvdW5kQnV0dG9uQmx1ckhhbmRsZXIgPSB0aGlzLmJsdXJIYW5kbGVyXy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmJvdW5kQnV0dG9uQmx1ckhhbmRsZXIpO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLmJvdW5kQnV0dG9uQmx1ckhhbmRsZXIpO1xuICAgIH1cbn07XG4vLyBUaGUgY29tcG9uZW50IHJlZ2lzdGVycyBpdHNlbGYuIEl0IGNhbiBhc3N1bWUgY29tcG9uZW50SGFuZGxlciBpcyBhdmFpbGFibGVcbi8vIGluIHRoZSBnbG9iYWwgc2NvcGUuXG5jb21wb25lbnRIYW5kbGVyLnJlZ2lzdGVyKHtcbiAgICBjb25zdHJ1Y3RvcjogTWF0ZXJpYWxCdXR0b24sXG4gICAgY2xhc3NBc1N0cmluZzogJ01hdGVyaWFsQnV0dG9uJyxcbiAgICBjc3NDbGFzczogJ21kbC1qcy1idXR0b24nLFxuICAgIHdpZGdldDogdHJ1ZVxufSk7XG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbi8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3RvciBmb3IgQ2hlY2tib3ggTURMIGNvbXBvbmVudC5cbiAgICogSW1wbGVtZW50cyBNREwgY29tcG9uZW50IGRlc2lnbiBwYXR0ZXJuIGRlZmluZWQgYXQ6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNvbm1heWVzL21kbC1jb21wb25lbnQtZGVzaWduLXBhdHRlcm5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCB3aWxsIGJlIHVwZ3JhZGVkLlxuICAgKi9cbnZhciBNYXRlcmlhbENoZWNrYm94ID0gZnVuY3Rpb24gTWF0ZXJpYWxDaGVja2JveChlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG4gICAgLy8gSW5pdGlhbGl6ZSBpbnN0YW5jZS5cbiAgICB0aGlzLmluaXQoKTtcbn07XG53aW5kb3dbJ01hdGVyaWFsQ2hlY2tib3gnXSA9IE1hdGVyaWFsQ2hlY2tib3g7XG4vKipcbiAgICogU3RvcmUgY29uc3RhbnRzIGluIG9uZSBwbGFjZSBzbyB0aGV5IGNhbiBiZSB1cGRhdGVkIGVhc2lseS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZyB8IG51bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZS5Db25zdGFudF8gPSB7IFRJTllfVElNRU9VVDogMC4wMDEgfTtcbi8qKlxuICAgKiBTdG9yZSBzdHJpbmdzIGZvciBjbGFzcyBuYW1lcyBkZWZpbmVkIGJ5IHRoaXMgY29tcG9uZW50IHRoYXQgYXJlIHVzZWQgaW5cbiAgICogSmF2YVNjcmlwdC4gVGhpcyBhbGxvd3MgdXMgdG8gc2ltcGx5IGNoYW5nZSBpdCBpbiBvbmUgcGxhY2Ugc2hvdWxkIHdlXG4gICAqIGRlY2lkZSB0byBtb2RpZnkgYXQgYSBsYXRlciBkYXRlLlxuICAgKlxuICAgKiBAZW51bSB7c3RyaW5nfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsQ2hlY2tib3gucHJvdG90eXBlLkNzc0NsYXNzZXNfID0ge1xuICAgIElOUFVUOiAnbWRsLWNoZWNrYm94X19pbnB1dCcsXG4gICAgQk9YX09VVExJTkU6ICdtZGwtY2hlY2tib3hfX2JveC1vdXRsaW5lJyxcbiAgICBGT0NVU19IRUxQRVI6ICdtZGwtY2hlY2tib3hfX2ZvY3VzLWhlbHBlcicsXG4gICAgVElDS19PVVRMSU5FOiAnbWRsLWNoZWNrYm94X190aWNrLW91dGxpbmUnLFxuICAgIFJJUFBMRV9FRkZFQ1Q6ICdtZGwtanMtcmlwcGxlLWVmZmVjdCcsXG4gICAgUklQUExFX0lHTk9SRV9FVkVOVFM6ICdtZGwtanMtcmlwcGxlLWVmZmVjdC0taWdub3JlLWV2ZW50cycsXG4gICAgUklQUExFX0NPTlRBSU5FUjogJ21kbC1jaGVja2JveF9fcmlwcGxlLWNvbnRhaW5lcicsXG4gICAgUklQUExFX0NFTlRFUjogJ21kbC1yaXBwbGUtLWNlbnRlcicsXG4gICAgUklQUExFOiAnbWRsLXJpcHBsZScsXG4gICAgSVNfRk9DVVNFRDogJ2lzLWZvY3VzZWQnLFxuICAgIElTX0RJU0FCTEVEOiAnaXMtZGlzYWJsZWQnLFxuICAgIElTX0NIRUNLRUQ6ICdpcy1jaGVja2VkJyxcbiAgICBJU19VUEdSQURFRDogJ2lzLXVwZ3JhZGVkJ1xufTtcbi8qKlxuICAgKiBIYW5kbGUgY2hhbmdlIG9mIHN0YXRlLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZS5vbkNoYW5nZV8gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XG59O1xuLyoqXG4gICAqIEhhbmRsZSBmb2N1cyBvZiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZS5vbkZvY3VzXyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0ZPQ1VTRUQpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgbG9zdCBmb2N1cyBvZiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZS5vbkJsdXJfID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfRk9DVVNFRCk7XG59O1xuLyoqXG4gICAqIEhhbmRsZSBtb3VzZXVwLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZS5vbk1vdXNlVXBfID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5ibHVyXygpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgY2xhc3MgdXBkYXRlcy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZS51cGRhdGVDbGFzc2VzXyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNoZWNrRGlzYWJsZWQoKTtcbiAgICB0aGlzLmNoZWNrVG9nZ2xlU3RhdGUoKTtcbn07XG4vKipcbiAgICogQWRkIGJsdXIuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxDaGVja2JveC5wcm90b3R5cGUuYmx1cl8gPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gVE9ETzogZmlndXJlIG91dCB3aHkgdGhlcmUncyBhIGZvY3VzIGV2ZW50IGJlaW5nIGZpcmVkIGFmdGVyIG91ciBibHVyLFxuICAgIC8vIHNvIHRoYXQgd2UgY2FuIGF2b2lkIHRoaXMgaGFjay5cbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50Xy5ibHVyKCk7XG4gICAgfS5iaW5kKHRoaXMpLCB0aGlzLkNvbnN0YW50Xy5USU5ZX1RJTUVPVVQpO1xufTtcbi8vIFB1YmxpYyBtZXRob2RzLlxuLyoqXG4gICAqIENoZWNrIHRoZSBpbnB1dHMgdG9nZ2xlIHN0YXRlIGFuZCB1cGRhdGUgZGlzcGxheS5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsQ2hlY2tib3gucHJvdG90eXBlLmNoZWNrVG9nZ2xlU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaW5wdXRFbGVtZW50Xy5jaGVja2VkKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0NIRUNLRUQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0NIRUNLRUQpO1xuICAgIH1cbn07XG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZVsnY2hlY2tUb2dnbGVTdGF0ZSddID0gTWF0ZXJpYWxDaGVja2JveC5wcm90b3R5cGUuY2hlY2tUb2dnbGVTdGF0ZTtcbi8qKlxuICAgKiBDaGVjayB0aGUgaW5wdXRzIGRpc2FibGVkIHN0YXRlIGFuZCB1cGRhdGUgZGlzcGxheS5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsQ2hlY2tib3gucHJvdG90eXBlLmNoZWNrRGlzYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaW5wdXRFbGVtZW50Xy5kaXNhYmxlZCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19ESVNBQkxFRCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfRElTQUJMRUQpO1xuICAgIH1cbn07XG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZVsnY2hlY2tEaXNhYmxlZCddID0gTWF0ZXJpYWxDaGVja2JveC5wcm90b3R5cGUuY2hlY2tEaXNhYmxlZDtcbi8qKlxuICAgKiBEaXNhYmxlIGNoZWNrYm94LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxDaGVja2JveC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlucHV0RWxlbWVudF8uZGlzYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbn07XG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZVsnZGlzYWJsZSddID0gTWF0ZXJpYWxDaGVja2JveC5wcm90b3R5cGUuZGlzYWJsZTtcbi8qKlxuICAgKiBFbmFibGUgY2hlY2tib3guXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbnB1dEVsZW1lbnRfLmRpc2FibGVkID0gZmFsc2U7XG4gICAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xufTtcbk1hdGVyaWFsQ2hlY2tib3gucHJvdG90eXBlWydlbmFibGUnXSA9IE1hdGVyaWFsQ2hlY2tib3gucHJvdG90eXBlLmVuYWJsZTtcbi8qKlxuICAgKiBDaGVjayBjaGVja2JveC5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsQ2hlY2tib3gucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5wdXRFbGVtZW50Xy5jaGVja2VkID0gdHJ1ZTtcbiAgICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XG59O1xuTWF0ZXJpYWxDaGVja2JveC5wcm90b3R5cGVbJ2NoZWNrJ10gPSBNYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZS5jaGVjaztcbi8qKlxuICAgKiBVbmNoZWNrIGNoZWNrYm94LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxDaGVja2JveC5wcm90b3R5cGUudW5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlucHV0RWxlbWVudF8uY2hlY2tlZCA9IGZhbHNlO1xuICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbn07XG5NYXRlcmlhbENoZWNrYm94LnByb3RvdHlwZVsndW5jaGVjayddID0gTWF0ZXJpYWxDaGVja2JveC5wcm90b3R5cGUudW5jaGVjaztcbi8qKlxuICAgKiBJbml0aWFsaXplIGVsZW1lbnQuXG4gICAqL1xuTWF0ZXJpYWxDaGVja2JveC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50Xykge1xuICAgICAgICB0aGlzLmlucHV0RWxlbWVudF8gPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5Dc3NDbGFzc2VzXy5JTlBVVCk7XG4gICAgICAgIHZhciBib3hPdXRsaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBib3hPdXRsaW5lLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5CT1hfT1VUTElORSk7XG4gICAgICAgIHZhciB0aWNrQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICB0aWNrQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5GT0NVU19IRUxQRVIpO1xuICAgICAgICB2YXIgdGlja091dGxpbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHRpY2tPdXRsaW5lLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5USUNLX09VVExJTkUpO1xuICAgICAgICBib3hPdXRsaW5lLmFwcGVuZENoaWxkKHRpY2tPdXRsaW5lKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5hcHBlbmRDaGlsZCh0aWNrQ29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5hcHBlbmRDaGlsZChib3hPdXRsaW5lKTtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uUklQUExFX0VGRkVDVCkpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9JR05PUkVfRVZFTlRTKTtcbiAgICAgICAgICAgIHRoaXMucmlwcGxlQ29udGFpbmVyRWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICB0aGlzLnJpcHBsZUNvbnRhaW5lckVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEVfQ09OVEFJTkVSKTtcbiAgICAgICAgICAgIHRoaXMucmlwcGxlQ29udGFpbmVyRWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9FRkZFQ1QpO1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVDb250YWluZXJFbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uUklQUExFX0NFTlRFUik7XG4gICAgICAgICAgICB0aGlzLmJvdW5kUmlwcGxlTW91c2VVcCA9IHRoaXMub25Nb3VzZVVwXy5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVDb250YWluZXJFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5ib3VuZFJpcHBsZU1vdXNlVXApO1xuICAgICAgICAgICAgdmFyIHJpcHBsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHJpcHBsZS5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uUklQUExFKTtcbiAgICAgICAgICAgIHRoaXMucmlwcGxlQ29udGFpbmVyRWxlbWVudF8uYXBwZW5kQ2hpbGQocmlwcGxlKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQodGhpcy5yaXBwbGVDb250YWluZXJFbGVtZW50Xyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ib3VuZElucHV0T25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlXy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJvdW5kSW5wdXRPbkZvY3VzID0gdGhpcy5vbkZvY3VzXy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJvdW5kSW5wdXRPbkJsdXIgPSB0aGlzLm9uQmx1cl8uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZEVsZW1lbnRNb3VzZVVwID0gdGhpcy5vbk1vdXNlVXBfLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmJvdW5kSW5wdXRPbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuYm91bmRJbnB1dE9uRm9jdXMpO1xuICAgICAgICB0aGlzLmlucHV0RWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuYm91bmRJbnB1dE9uQmx1cik7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuYm91bmRFbGVtZW50TW91c2VVcCk7XG4gICAgICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVVBHUkFERUQpO1xuICAgIH1cbn07XG4vLyBUaGUgY29tcG9uZW50IHJlZ2lzdGVycyBpdHNlbGYuIEl0IGNhbiBhc3N1bWUgY29tcG9uZW50SGFuZGxlciBpcyBhdmFpbGFibGVcbi8vIGluIHRoZSBnbG9iYWwgc2NvcGUuXG5jb21wb25lbnRIYW5kbGVyLnJlZ2lzdGVyKHtcbiAgICBjb25zdHJ1Y3RvcjogTWF0ZXJpYWxDaGVja2JveCxcbiAgICBjbGFzc0FzU3RyaW5nOiAnTWF0ZXJpYWxDaGVja2JveCcsXG4gICAgY3NzQ2xhc3M6ICdtZGwtanMtY2hlY2tib3gnLFxuICAgIHdpZGdldDogdHJ1ZVxufSk7XG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbi8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3RvciBmb3IgaWNvbiB0b2dnbGUgTURMIGNvbXBvbmVudC5cbiAgICogSW1wbGVtZW50cyBNREwgY29tcG9uZW50IGRlc2lnbiBwYXR0ZXJuIGRlZmluZWQgYXQ6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNvbm1heWVzL21kbC1jb21wb25lbnQtZGVzaWduLXBhdHRlcm5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCB3aWxsIGJlIHVwZ3JhZGVkLlxuICAgKi9cbnZhciBNYXRlcmlhbEljb25Ub2dnbGUgPSBmdW5jdGlvbiBNYXRlcmlhbEljb25Ub2dnbGUoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuICAgIC8vIEluaXRpYWxpemUgaW5zdGFuY2UuXG4gICAgdGhpcy5pbml0KCk7XG59O1xud2luZG93WydNYXRlcmlhbEljb25Ub2dnbGUnXSA9IE1hdGVyaWFsSWNvblRvZ2dsZTtcbi8qKlxuICAgKiBTdG9yZSBjb25zdGFudHMgaW4gb25lIHBsYWNlIHNvIHRoZXkgY2FuIGJlIHVwZGF0ZWQgZWFzaWx5LlxuICAgKlxuICAgKiBAZW51bSB7c3RyaW5nIHwgbnVtYmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsSWNvblRvZ2dsZS5wcm90b3R5cGUuQ29uc3RhbnRfID0geyBUSU5ZX1RJTUVPVVQ6IDAuMDAxIH07XG4vKipcbiAgICogU3RvcmUgc3RyaW5ncyBmb3IgY2xhc3MgbmFtZXMgZGVmaW5lZCBieSB0aGlzIGNvbXBvbmVudCB0aGF0IGFyZSB1c2VkIGluXG4gICAqIEphdmFTY3JpcHQuIFRoaXMgYWxsb3dzIHVzIHRvIHNpbXBseSBjaGFuZ2UgaXQgaW4gb25lIHBsYWNlIHNob3VsZCB3ZVxuICAgKiBkZWNpZGUgdG8gbW9kaWZ5IGF0IGEgbGF0ZXIgZGF0ZS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbEljb25Ub2dnbGUucHJvdG90eXBlLkNzc0NsYXNzZXNfID0ge1xuICAgIElOUFVUOiAnbWRsLWljb24tdG9nZ2xlX19pbnB1dCcsXG4gICAgSlNfUklQUExFX0VGRkVDVDogJ21kbC1qcy1yaXBwbGUtZWZmZWN0JyxcbiAgICBSSVBQTEVfSUdOT1JFX0VWRU5UUzogJ21kbC1qcy1yaXBwbGUtZWZmZWN0LS1pZ25vcmUtZXZlbnRzJyxcbiAgICBSSVBQTEVfQ09OVEFJTkVSOiAnbWRsLWljb24tdG9nZ2xlX19yaXBwbGUtY29udGFpbmVyJyxcbiAgICBSSVBQTEVfQ0VOVEVSOiAnbWRsLXJpcHBsZS0tY2VudGVyJyxcbiAgICBSSVBQTEU6ICdtZGwtcmlwcGxlJyxcbiAgICBJU19GT0NVU0VEOiAnaXMtZm9jdXNlZCcsXG4gICAgSVNfRElTQUJMRUQ6ICdpcy1kaXNhYmxlZCcsXG4gICAgSVNfQ0hFQ0tFRDogJ2lzLWNoZWNrZWQnXG59O1xuLyoqXG4gICAqIEhhbmRsZSBjaGFuZ2Ugb2Ygc3RhdGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsSWNvblRvZ2dsZS5wcm90b3R5cGUub25DaGFuZ2VfID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgZm9jdXMgb2YgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS5vbkZvY3VzXyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0ZPQ1VTRUQpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgbG9zdCBmb2N1cyBvZiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbEljb25Ub2dnbGUucHJvdG90eXBlLm9uQmx1cl8gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19GT0NVU0VEKTtcbn07XG4vKipcbiAgICogSGFuZGxlIG1vdXNldXAuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsSWNvblRvZ2dsZS5wcm90b3R5cGUub25Nb3VzZVVwXyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMuYmx1cl8oKTtcbn07XG4vKipcbiAgICogSGFuZGxlIGNsYXNzIHVwZGF0ZXMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS51cGRhdGVDbGFzc2VzXyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNoZWNrRGlzYWJsZWQoKTtcbiAgICB0aGlzLmNoZWNrVG9nZ2xlU3RhdGUoKTtcbn07XG4vKipcbiAgICogQWRkIGJsdXIuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS5ibHVyXyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBmaWd1cmUgb3V0IHdoeSB0aGVyZSdzIGEgZm9jdXMgZXZlbnQgYmVpbmcgZmlyZWQgYWZ0ZXIgb3VyIGJsdXIsXG4gICAgLy8gc28gdGhhdCB3ZSBjYW4gYXZvaWQgdGhpcyBoYWNrLlxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnRfLmJsdXIoKTtcbiAgICB9LmJpbmQodGhpcyksIHRoaXMuQ29uc3RhbnRfLlRJTllfVElNRU9VVCk7XG59O1xuLy8gUHVibGljIG1ldGhvZHMuXG4vKipcbiAgICogQ2hlY2sgdGhlIGlucHV0cyB0b2dnbGUgc3RhdGUgYW5kIHVwZGF0ZSBkaXNwbGF5LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS5jaGVja1RvZ2dsZVN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlucHV0RWxlbWVudF8uY2hlY2tlZCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19DSEVDS0VEKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19DSEVDS0VEKTtcbiAgICB9XG59O1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZVsnY2hlY2tUb2dnbGVTdGF0ZSddID0gTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS5jaGVja1RvZ2dsZVN0YXRlO1xuLyoqXG4gICAqIENoZWNrIHRoZSBpbnB1dHMgZGlzYWJsZWQgc3RhdGUgYW5kIHVwZGF0ZSBkaXNwbGF5LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS5jaGVja0Rpc2FibGVkID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlucHV0RWxlbWVudF8uZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfRElTQUJMRUQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0RJU0FCTEVEKTtcbiAgICB9XG59O1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZVsnY2hlY2tEaXNhYmxlZCddID0gTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS5jaGVja0Rpc2FibGVkO1xuLyoqXG4gICAqIERpc2FibGUgaWNvbiB0b2dnbGUuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbEljb25Ub2dnbGUucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbnB1dEVsZW1lbnRfLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XG59O1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZVsnZGlzYWJsZSddID0gTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS5kaXNhYmxlO1xuLyoqXG4gICAqIEVuYWJsZSBpY29uIHRvZ2dsZS5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsSWNvblRvZ2dsZS5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5wdXRFbGVtZW50Xy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbn07XG5NYXRlcmlhbEljb25Ub2dnbGUucHJvdG90eXBlWydlbmFibGUnXSA9IE1hdGVyaWFsSWNvblRvZ2dsZS5wcm90b3R5cGUuZW5hYmxlO1xuLyoqXG4gICAqIENoZWNrIGljb24gdG9nZ2xlLlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlucHV0RWxlbWVudF8uY2hlY2tlZCA9IHRydWU7XG4gICAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xufTtcbk1hdGVyaWFsSWNvblRvZ2dsZS5wcm90b3R5cGVbJ2NoZWNrJ10gPSBNYXRlcmlhbEljb25Ub2dnbGUucHJvdG90eXBlLmNoZWNrO1xuLyoqXG4gICAqIFVuY2hlY2sgaWNvbiB0b2dnbGUuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbEljb25Ub2dnbGUucHJvdG90eXBlLnVuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbnB1dEVsZW1lbnRfLmNoZWNrZWQgPSBmYWxzZTtcbiAgICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XG59O1xuTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZVsndW5jaGVjayddID0gTWF0ZXJpYWxJY29uVG9nZ2xlLnByb3RvdHlwZS51bmNoZWNrO1xuLyoqXG4gICAqIEluaXRpYWxpemUgZWxlbWVudC5cbiAgICovXG5NYXRlcmlhbEljb25Ub2dnbGUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8pIHtcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnRfID0gdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCcuJyArIHRoaXMuQ3NzQ2xhc3Nlc18uSU5QVVQpO1xuICAgICAgICBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5KU19SSVBQTEVfRUZGRUNUKSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uUklQUExFX0lHTk9SRV9FVkVOVFMpO1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVDb250YWluZXJFbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHRoaXMucmlwcGxlQ29udGFpbmVyRWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9DT05UQUlORVIpO1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVDb250YWluZXJFbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSlNfUklQUExFX0VGRkVDVCk7XG4gICAgICAgICAgICB0aGlzLnJpcHBsZUNvbnRhaW5lckVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEVfQ0VOVEVSKTtcbiAgICAgICAgICAgIHRoaXMuYm91bmRSaXBwbGVNb3VzZVVwID0gdGhpcy5vbk1vdXNlVXBfLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnJpcHBsZUNvbnRhaW5lckVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmJvdW5kUmlwcGxlTW91c2VVcCk7XG4gICAgICAgICAgICB2YXIgcmlwcGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgcmlwcGxlLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEUpO1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVDb250YWluZXJFbGVtZW50Xy5hcHBlbmRDaGlsZChyaXBwbGUpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5hcHBlbmRDaGlsZCh0aGlzLnJpcHBsZUNvbnRhaW5lckVsZW1lbnRfKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJvdW5kSW5wdXRPbkNoYW5nZSA9IHRoaXMub25DaGFuZ2VfLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYm91bmRJbnB1dE9uRm9jdXMgPSB0aGlzLm9uRm9jdXNfLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYm91bmRJbnB1dE9uQmx1ciA9IHRoaXMub25CbHVyXy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJvdW5kRWxlbWVudE9uTW91c2VVcCA9IHRoaXMub25Nb3VzZVVwXy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmlucHV0RWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5ib3VuZElucHV0T25DaGFuZ2UpO1xuICAgICAgICB0aGlzLmlucHV0RWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLmJvdW5kSW5wdXRPbkZvY3VzKTtcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLmJvdW5kSW5wdXRPbkJsdXIpO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmJvdW5kRWxlbWVudE9uTW91c2VVcCk7XG4gICAgICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKCdpcy11cGdyYWRlZCcpO1xuICAgIH1cbn07XG4vLyBUaGUgY29tcG9uZW50IHJlZ2lzdGVycyBpdHNlbGYuIEl0IGNhbiBhc3N1bWUgY29tcG9uZW50SGFuZGxlciBpcyBhdmFpbGFibGVcbi8vIGluIHRoZSBnbG9iYWwgc2NvcGUuXG5jb21wb25lbnRIYW5kbGVyLnJlZ2lzdGVyKHtcbiAgICBjb25zdHJ1Y3RvcjogTWF0ZXJpYWxJY29uVG9nZ2xlLFxuICAgIGNsYXNzQXNTdHJpbmc6ICdNYXRlcmlhbEljb25Ub2dnbGUnLFxuICAgIGNzc0NsYXNzOiAnbWRsLWpzLWljb24tdG9nZ2xlJyxcbiAgICB3aWRnZXQ6IHRydWVcbn0pO1xuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG4vKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IgZm9yIGRyb3Bkb3duIE1ETCBjb21wb25lbnQuXG4gICAqIEltcGxlbWVudHMgTURMIGNvbXBvbmVudCBkZXNpZ24gcGF0dGVybiBkZWZpbmVkIGF0OlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vamFzb25tYXllcy9tZGwtY29tcG9uZW50LWRlc2lnbi1wYXR0ZXJuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgd2lsbCBiZSB1cGdyYWRlZC5cbiAgICovXG52YXIgTWF0ZXJpYWxNZW51ID0gZnVuY3Rpb24gTWF0ZXJpYWxNZW51KGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcbiAgICAvLyBJbml0aWFsaXplIGluc3RhbmNlLlxuICAgIHRoaXMuaW5pdCgpO1xufTtcbndpbmRvd1snTWF0ZXJpYWxNZW51J10gPSBNYXRlcmlhbE1lbnU7XG4vKipcbiAgICogU3RvcmUgY29uc3RhbnRzIGluIG9uZSBwbGFjZSBzbyB0aGV5IGNhbiBiZSB1cGRhdGVkIGVhc2lseS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZyB8IG51bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbE1lbnUucHJvdG90eXBlLkNvbnN0YW50XyA9IHtcbiAgICAvLyBUb3RhbCBkdXJhdGlvbiBvZiB0aGUgbWVudSBhbmltYXRpb24uXG4gICAgVFJBTlNJVElPTl9EVVJBVElPTl9TRUNPTkRTOiAwLjMsXG4gICAgLy8gVGhlIGZyYWN0aW9uIG9mIHRoZSB0b3RhbCBkdXJhdGlvbiB3ZSB3YW50IHRvIHVzZSBmb3IgbWVudSBpdGVtIGFuaW1hdGlvbnMuXG4gICAgVFJBTlNJVElPTl9EVVJBVElPTl9GUkFDVElPTjogMC44LFxuICAgIC8vIEhvdyBsb25nIHRoZSBtZW51IHN0YXlzIG9wZW4gYWZ0ZXIgY2hvb3NpbmcgYW4gb3B0aW9uIChzbyB0aGUgdXNlciBjYW4gc2VlXG4gICAgLy8gdGhlIHJpcHBsZSkuXG4gICAgQ0xPU0VfVElNRU9VVDogMTUwXG59O1xuLyoqXG4gICAqIEtleWNvZGVzLCBmb3IgY29kZSByZWFkYWJpbGl0eS5cbiAgICpcbiAgICogQGVudW0ge251bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbE1lbnUucHJvdG90eXBlLktleWNvZGVzXyA9IHtcbiAgICBFTlRFUjogMTMsXG4gICAgRVNDQVBFOiAyNyxcbiAgICBTUEFDRTogMzIsXG4gICAgVVBfQVJST1c6IDM4LFxuICAgIERPV05fQVJST1c6IDQwXG59O1xuLyoqXG4gICAqIFN0b3JlIHN0cmluZ3MgZm9yIGNsYXNzIG5hbWVzIGRlZmluZWQgYnkgdGhpcyBjb21wb25lbnQgdGhhdCBhcmUgdXNlZCBpblxuICAgKiBKYXZhU2NyaXB0LiBUaGlzIGFsbG93cyB1cyB0byBzaW1wbHkgY2hhbmdlIGl0IGluIG9uZSBwbGFjZSBzaG91bGQgd2VcbiAgICogZGVjaWRlIHRvIG1vZGlmeSBhdCBhIGxhdGVyIGRhdGUuXG4gICAqXG4gICAqIEBlbnVtIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxNZW51LnByb3RvdHlwZS5Dc3NDbGFzc2VzXyA9IHtcbiAgICBDT05UQUlORVI6ICdtZGwtbWVudV9fY29udGFpbmVyJyxcbiAgICBPVVRMSU5FOiAnbWRsLW1lbnVfX291dGxpbmUnLFxuICAgIElURU06ICdtZGwtbWVudV9faXRlbScsXG4gICAgSVRFTV9SSVBQTEVfQ09OVEFJTkVSOiAnbWRsLW1lbnVfX2l0ZW0tcmlwcGxlLWNvbnRhaW5lcicsXG4gICAgUklQUExFX0VGRkVDVDogJ21kbC1qcy1yaXBwbGUtZWZmZWN0JyxcbiAgICBSSVBQTEVfSUdOT1JFX0VWRU5UUzogJ21kbC1qcy1yaXBwbGUtZWZmZWN0LS1pZ25vcmUtZXZlbnRzJyxcbiAgICBSSVBQTEU6ICdtZGwtcmlwcGxlJyxcbiAgICAvLyBTdGF0dXNlc1xuICAgIElTX1VQR1JBREVEOiAnaXMtdXBncmFkZWQnLFxuICAgIElTX1ZJU0lCTEU6ICdpcy12aXNpYmxlJyxcbiAgICBJU19BTklNQVRJTkc6ICdpcy1hbmltYXRpbmcnLFxuICAgIC8vIEFsaWdubWVudCBvcHRpb25zXG4gICAgQk9UVE9NX0xFRlQ6ICdtZGwtbWVudS0tYm90dG9tLWxlZnQnLFxuICAgIC8vIFRoaXMgaXMgdGhlIGRlZmF1bHQuXG4gICAgQk9UVE9NX1JJR0hUOiAnbWRsLW1lbnUtLWJvdHRvbS1yaWdodCcsXG4gICAgVE9QX0xFRlQ6ICdtZGwtbWVudS0tdG9wLWxlZnQnLFxuICAgIFRPUF9SSUdIVDogJ21kbC1tZW51LS10b3AtcmlnaHQnLFxuICAgIFVOQUxJR05FRDogJ21kbC1tZW51LS11bmFsaWduZWQnXG59O1xuLyoqXG4gICAqIEluaXRpYWxpemUgZWxlbWVudC5cbiAgICovXG5NYXRlcmlhbE1lbnUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8pIHtcbiAgICAgICAgLy8gQ3JlYXRlIGNvbnRhaW5lciBmb3IgdGhlIG1lbnUuXG4gICAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5DT05UQUlORVIpO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNvbnRhaW5lciwgdGhpcy5lbGVtZW50Xyk7XG4gICAgICAgIHRoaXMuZWxlbWVudF8ucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICAgICAgICB0aGlzLmNvbnRhaW5lcl8gPSBjb250YWluZXI7XG4gICAgICAgIC8vIENyZWF0ZSBvdXRsaW5lIGZvciB0aGUgbWVudSAoc2hhZG93IGFuZCBiYWNrZ3JvdW5kKS5cbiAgICAgICAgdmFyIG91dGxpbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgb3V0bGluZS5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uT1VUTElORSk7XG4gICAgICAgIHRoaXMub3V0bGluZV8gPSBvdXRsaW5lO1xuICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG91dGxpbmUsIHRoaXMuZWxlbWVudF8pO1xuICAgICAgICAvLyBGaW5kIHRoZSBcImZvclwiIGVsZW1lbnQgYW5kIGJpbmQgZXZlbnRzIHRvIGl0LlxuICAgICAgICB2YXIgZm9yRWxJZCA9IHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKCdmb3InKSB8fCB0aGlzLmVsZW1lbnRfLmdldEF0dHJpYnV0ZSgnZGF0YS1tZGwtZm9yJyk7XG4gICAgICAgIHZhciBmb3JFbCA9IG51bGw7XG4gICAgICAgIGlmIChmb3JFbElkKSB7XG4gICAgICAgICAgICBmb3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZvckVsSWQpO1xuICAgICAgICAgICAgaWYgKGZvckVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JFbGVtZW50XyA9IGZvckVsO1xuICAgICAgICAgICAgICAgIGZvckVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oYW5kbGVGb3JDbGlja18uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgZm9yRWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGFuZGxlRm9yS2V5Ym9hcmRFdmVudF8uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGl0ZW1zID0gdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIHRoaXMuQ3NzQ2xhc3Nlc18uSVRFTSk7XG4gICAgICAgIHRoaXMuYm91bmRJdGVtS2V5ZG93bl8gPSB0aGlzLmhhbmRsZUl0ZW1LZXlib2FyZEV2ZW50Xy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJvdW5kSXRlbUNsaWNrXyA9IHRoaXMuaGFuZGxlSXRlbUNsaWNrXy5iaW5kKHRoaXMpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBBZGQgYSBsaXN0ZW5lciB0byBlYWNoIG1lbnUgaXRlbS5cbiAgICAgICAgICAgIGl0ZW1zW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5ib3VuZEl0ZW1DbGlja18pO1xuICAgICAgICAgICAgLy8gQWRkIGEgdGFiIGluZGV4IHRvIGVhY2ggbWVudSBpdGVtLlxuICAgICAgICAgICAgaXRlbXNbaV0udGFiSW5kZXggPSAnLTEnO1xuICAgICAgICAgICAgLy8gQWRkIGEga2V5Ym9hcmQgbGlzdGVuZXIgdG8gZWFjaCBtZW51IGl0ZW0uXG4gICAgICAgICAgICBpdGVtc1tpXS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5ib3VuZEl0ZW1LZXlkb3duXyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHJpcHBsZSBjbGFzc2VzIHRvIGVhY2ggaXRlbSwgaWYgdGhlIHVzZXIgaGFzIGVuYWJsZWQgcmlwcGxlcy5cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uUklQUExFX0VGRkVDVCkpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9JR05PUkVfRVZFTlRTKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHJpcHBsZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICByaXBwbGVDb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklURU1fUklQUExFX0NPTlRBSU5FUik7XG4gICAgICAgICAgICAgICAgdmFyIHJpcHBsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgICAgICByaXBwbGUuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRSk7XG4gICAgICAgICAgICAgICAgcmlwcGxlQ29udGFpbmVyLmFwcGVuZENoaWxkKHJpcHBsZSk7XG4gICAgICAgICAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChyaXBwbGVDb250YWluZXIpO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9FRkZFQ1QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIENvcHkgYWxpZ25tZW50IGNsYXNzZXMgdG8gdGhlIGNvbnRhaW5lciwgc28gdGhlIG91dGxpbmUgY2FuIHVzZSB0aGVtLlxuICAgICAgICBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5CT1RUT01fTEVGVCkpIHtcbiAgICAgICAgICAgIHRoaXMub3V0bGluZV8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLkJPVFRPTV9MRUZUKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5CT1RUT01fUklHSFQpKSB7XG4gICAgICAgICAgICB0aGlzLm91dGxpbmVfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5CT1RUT01fUklHSFQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLlRPUF9MRUZUKSkge1xuICAgICAgICAgICAgdGhpcy5vdXRsaW5lXy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uVE9QX0xFRlQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLlRPUF9SSUdIVCkpIHtcbiAgICAgICAgICAgIHRoaXMub3V0bGluZV8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlRPUF9SSUdIVCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uVU5BTElHTkVEKSkge1xuICAgICAgICAgICAgdGhpcy5vdXRsaW5lXy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uVU5BTElHTkVEKTtcbiAgICAgICAgfVxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX1VQR1JBREVEKTtcbiAgICB9XG59O1xuLyoqXG4gICAqIEhhbmRsZXMgYSBjbGljayBvbiB0aGUgXCJmb3JcIiBlbGVtZW50LCBieSBwb3NpdGlvbmluZyB0aGUgbWVudSBhbmQgdGhlblxuICAgKiB0b2dnbGluZyBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZ0IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsTWVudS5wcm90b3R5cGUuaGFuZGxlRm9yQ2xpY2tfID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfICYmIHRoaXMuZm9yRWxlbWVudF8pIHtcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmZvckVsZW1lbnRfLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB2YXIgZm9yUmVjdCA9IHRoaXMuZm9yRWxlbWVudF8ucGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uVU5BTElHTkVEKSkge1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uQk9UVE9NX1JJR0hUKSkge1xuICAgICAgICAgICAgLy8gUG9zaXRpb24gYmVsb3cgdGhlIFwiZm9yXCIgZWxlbWVudCwgYWxpZ25lZCB0byBpdHMgcmlnaHQuXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lcl8uc3R5bGUucmlnaHQgPSBmb3JSZWN0LnJpZ2h0IC0gcmVjdC5yaWdodCArICdweCc7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lcl8uc3R5bGUudG9wID0gdGhpcy5mb3JFbGVtZW50Xy5vZmZzZXRUb3AgKyB0aGlzLmZvckVsZW1lbnRfLm9mZnNldEhlaWdodCArICdweCc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5UT1BfTEVGVCkpIHtcbiAgICAgICAgICAgIC8vIFBvc2l0aW9uIGFib3ZlIHRoZSBcImZvclwiIGVsZW1lbnQsIGFsaWduZWQgdG8gaXRzIGxlZnQuXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lcl8uc3R5bGUubGVmdCA9IHRoaXMuZm9yRWxlbWVudF8ub2Zmc2V0TGVmdCArICdweCc7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lcl8uc3R5bGUuYm90dG9tID0gZm9yUmVjdC5ib3R0b20gLSByZWN0LnRvcCArICdweCc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5UT1BfUklHSFQpKSB7XG4gICAgICAgICAgICAvLyBQb3NpdGlvbiBhYm92ZSB0aGUgXCJmb3JcIiBlbGVtZW50LCBhbGlnbmVkIHRvIGl0cyByaWdodC5cbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyXy5zdHlsZS5yaWdodCA9IGZvclJlY3QucmlnaHQgLSByZWN0LnJpZ2h0ICsgJ3B4JztcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyXy5zdHlsZS5ib3R0b20gPSBmb3JSZWN0LmJvdHRvbSAtIHJlY3QudG9wICsgJ3B4JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIERlZmF1bHQ6IHBvc2l0aW9uIGJlbG93IHRoZSBcImZvclwiIGVsZW1lbnQsIGFsaWduZWQgdG8gaXRzIGxlZnQuXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lcl8uc3R5bGUubGVmdCA9IHRoaXMuZm9yRWxlbWVudF8ub2Zmc2V0TGVmdCArICdweCc7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lcl8uc3R5bGUudG9wID0gdGhpcy5mb3JFbGVtZW50Xy5vZmZzZXRUb3AgKyB0aGlzLmZvckVsZW1lbnRfLm9mZnNldEhlaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2dnbGUoZXZ0KTtcbn07XG4vKipcbiAgICogSGFuZGxlcyBhIGtleWJvYXJkIGV2ZW50IG9uIHRoZSBcImZvclwiIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2dCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbE1lbnUucHJvdG90eXBlLmhhbmRsZUZvcktleWJvYXJkRXZlbnRfID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfICYmIHRoaXMuY29udGFpbmVyXyAmJiB0aGlzLmZvckVsZW1lbnRfKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvckFsbCgnLicgKyB0aGlzLkNzc0NsYXNzZXNfLklURU0gKyAnOm5vdChbZGlzYWJsZWRdKScpO1xuICAgICAgICBpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMCAmJiB0aGlzLmNvbnRhaW5lcl8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVklTSUJMRSkpIHtcbiAgICAgICAgICAgIGlmIChldnQua2V5Q29kZSA9PT0gdGhpcy5LZXljb2Rlc18uVVBfQVJST1cpIHtcbiAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpdGVtc1tpdGVtcy5sZW5ndGggLSAxXS5mb2N1cygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChldnQua2V5Q29kZSA9PT0gdGhpcy5LZXljb2Rlc18uRE9XTl9BUlJPVykge1xuICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGl0ZW1zWzBdLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuLyoqXG4gICAqIEhhbmRsZXMgYSBrZXlib2FyZCBldmVudCBvbiBhbiBpdGVtLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxNZW51LnByb3RvdHlwZS5oYW5kbGVJdGVtS2V5Ym9hcmRFdmVudF8gPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8gJiYgdGhpcy5jb250YWluZXJfKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvckFsbCgnLicgKyB0aGlzLkNzc0NsYXNzZXNfLklURU0gKyAnOm5vdChbZGlzYWJsZWRdKScpO1xuICAgICAgICBpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMCAmJiB0aGlzLmNvbnRhaW5lcl8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVklTSUJMRSkpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50SW5kZXggPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChpdGVtcykuaW5kZXhPZihldnQudGFyZ2V0KTtcbiAgICAgICAgICAgIGlmIChldnQua2V5Q29kZSA9PT0gdGhpcy5LZXljb2Rlc18uVVBfQVJST1cpIHtcbiAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtc1tjdXJyZW50SW5kZXggLSAxXS5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zW2l0ZW1zLmxlbmd0aCAtIDFdLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChldnQua2V5Q29kZSA9PT0gdGhpcy5LZXljb2Rlc18uRE9XTl9BUlJPVykge1xuICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtcy5sZW5ndGggPiBjdXJyZW50SW5kZXggKyAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zW2N1cnJlbnRJbmRleCArIDFdLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXNbMF0uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2dC5rZXlDb2RlID09PSB0aGlzLktleWNvZGVzXy5TUEFDRSB8fCBldnQua2V5Q29kZSA9PT0gdGhpcy5LZXljb2Rlc18uRU5URVIpIHtcbiAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAvLyBTZW5kIG1vdXNlZG93biBhbmQgbW91c2V1cCB0byB0cmlnZ2VyIHJpcHBsZS5cbiAgICAgICAgICAgICAgICB2YXIgZSA9IG5ldyBNb3VzZUV2ZW50KCdtb3VzZWRvd24nKTtcbiAgICAgICAgICAgICAgICBldnQudGFyZ2V0LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgICAgICAgICAgICAgZSA9IG5ldyBNb3VzZUV2ZW50KCdtb3VzZXVwJyk7XG4gICAgICAgICAgICAgICAgZXZ0LnRhcmdldC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgICAgICAgICAgIC8vIFNlbmQgY2xpY2suXG4gICAgICAgICAgICAgICAgZXZ0LnRhcmdldC5jbGljaygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChldnQua2V5Q29kZSA9PT0gdGhpcy5LZXljb2Rlc18uRVNDQVBFKSB7XG4gICAgICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuLyoqXG4gICAqIEhhbmRsZXMgYSBjbGljayBldmVudCBvbiBhbiBpdGVtLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxNZW51LnByb3RvdHlwZS5oYW5kbGVJdGVtQ2xpY2tfID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmIChldnQudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkge1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2FpdCBzb21lIHRpbWUgYmVmb3JlIGNsb3NpbmcgbWVudSwgc28gdGhlIHVzZXIgY2FuIHNlZSB0aGUgcmlwcGxlLlxuICAgICAgICB0aGlzLmNsb3NpbmdfID0gdHJ1ZTtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICB0aGlzLmNsb3NpbmdfID0gZmFsc2U7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgdGhpcy5Db25zdGFudF8uQ0xPU0VfVElNRU9VVCk7XG4gICAgfVxufTtcbi8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSBpbml0aWFsIGNsaXAgKGZvciBvcGVuaW5nIHRoZSBtZW51KSBvciBmaW5hbCBjbGlwIChmb3IgY2xvc2luZ1xuICAgKiBpdCksIGFuZCBhcHBsaWVzIGl0LiBUaGlzIGFsbG93cyB1cyB0byBhbmltYXRlIGZyb20gb3IgdG8gdGhlIGNvcnJlY3QgcG9pbnQsXG4gICAqIHRoYXQgaXMsIHRoZSBwb2ludCBpdCdzIGFsaWduZWQgdG8gaW4gdGhlIFwiZm9yXCIgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBIZWlnaHQgb2YgdGhlIGNsaXAgcmVjdGFuZ2xlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB0aGUgY2xpcCByZWN0YW5nbGVcbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbE1lbnUucHJvdG90eXBlLmFwcGx5Q2xpcF8gPSBmdW5jdGlvbiAoaGVpZ2h0LCB3aWR0aCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLlVOQUxJR05FRCkpIHtcbiAgICAgICAgLy8gRG8gbm90IGNsaXAuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uc3R5bGUuY2xpcCA9ICcnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5CT1RUT01fUklHSFQpKSB7XG4gICAgICAgIC8vIENsaXAgdG8gdGhlIHRvcCByaWdodCBjb3JuZXIgb2YgdGhlIG1lbnUuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uc3R5bGUuY2xpcCA9ICdyZWN0KDAgJyArIHdpZHRoICsgJ3B4ICcgKyAnMCAnICsgd2lkdGggKyAncHgpJztcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uVE9QX0xFRlQpKSB7XG4gICAgICAgIC8vIENsaXAgdG8gdGhlIGJvdHRvbSBsZWZ0IGNvcm5lciBvZiB0aGUgbWVudS5cbiAgICAgICAgdGhpcy5lbGVtZW50Xy5zdHlsZS5jbGlwID0gJ3JlY3QoJyArIGhlaWdodCArICdweCAwICcgKyBoZWlnaHQgKyAncHggMCknO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5UT1BfUklHSFQpKSB7XG4gICAgICAgIC8vIENsaXAgdG8gdGhlIGJvdHRvbSByaWdodCBjb3JuZXIgb2YgdGhlIG1lbnUuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uc3R5bGUuY2xpcCA9ICdyZWN0KCcgKyBoZWlnaHQgKyAncHggJyArIHdpZHRoICsgJ3B4ICcgKyBoZWlnaHQgKyAncHggJyArIHdpZHRoICsgJ3B4KSc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRGVmYXVsdDogZG8gbm90IGNsaXAgKHNhbWUgYXMgY2xpcHBpbmcgdG8gdGhlIHRvcCBsZWZ0IGNvcm5lcikuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uc3R5bGUuY2xpcCA9ICcnO1xuICAgIH1cbn07XG4vKipcbiAgICogQ2xlYW51cCBmdW5jdGlvbiB0byByZW1vdmUgYW5pbWF0aW9uIGxpc3RlbmVycy5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZ0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxNZW51LnByb3RvdHlwZS5yZW1vdmVBbmltYXRpb25FbmRMaXN0ZW5lcl8gPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgZXZ0LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKE1hdGVyaWFsTWVudS5wcm90b3R5cGUuQ3NzQ2xhc3Nlc18uSVNfQU5JTUFUSU5HKTtcbn07XG4vKipcbiAgICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byBjbGVhbiB1cCBhZnRlciB0aGUgYW5pbWF0aW9uIGVuZHMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxNZW51LnByb3RvdHlwZS5hZGRBbmltYXRpb25FbmRMaXN0ZW5lcl8gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgdGhpcy5yZW1vdmVBbmltYXRpb25FbmRMaXN0ZW5lcl8pO1xuICAgIHRoaXMuZWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0VHJhbnNpdGlvbkVuZCcsIHRoaXMucmVtb3ZlQW5pbWF0aW9uRW5kTGlzdGVuZXJfKTtcbn07XG4vKipcbiAgICogRGlzcGxheXMgdGhlIG1lbnUuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbE1lbnUucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8gJiYgdGhpcy5jb250YWluZXJfICYmIHRoaXMub3V0bGluZV8pIHtcbiAgICAgICAgLy8gTWVhc3VyZSB0aGUgaW5uZXIgZWxlbWVudC5cbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuZWxlbWVudF8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLmVsZW1lbnRfLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgICAgICAvLyBBcHBseSB0aGUgaW5uZXIgZWxlbWVudCdzIHNpemUgdG8gdGhlIGNvbnRhaW5lciBhbmQgb3V0bGluZS5cbiAgICAgICAgdGhpcy5jb250YWluZXJfLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgICAgICB0aGlzLmNvbnRhaW5lcl8uc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgdGhpcy5vdXRsaW5lXy5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4JztcbiAgICAgICAgdGhpcy5vdXRsaW5lXy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgICAgICB2YXIgdHJhbnNpdGlvbkR1cmF0aW9uID0gdGhpcy5Db25zdGFudF8uVFJBTlNJVElPTl9EVVJBVElPTl9TRUNPTkRTICogdGhpcy5Db25zdGFudF8uVFJBTlNJVElPTl9EVVJBVElPTl9GUkFDVElPTjtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRyYW5zaXRpb24gZGVsYXlzIGZvciBpbmRpdmlkdWFsIG1lbnUgaXRlbXMsIHNvIHRoYXQgdGhleSBmYWRlXG4gICAgICAgIC8vIGluIG9uZSBhdCBhIHRpbWUuXG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvckFsbCgnLicgKyB0aGlzLkNzc0NsYXNzZXNfLklURU0pO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbURlbGF5ID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLlRPUF9MRUZUKSB8fCB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLlRPUF9SSUdIVCkpIHtcbiAgICAgICAgICAgICAgICBpdGVtRGVsYXkgPSAoaGVpZ2h0IC0gaXRlbXNbaV0ub2Zmc2V0VG9wIC0gaXRlbXNbaV0ub2Zmc2V0SGVpZ2h0KSAvIGhlaWdodCAqIHRyYW5zaXRpb25EdXJhdGlvbiArICdzJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbURlbGF5ID0gaXRlbXNbaV0ub2Zmc2V0VG9wIC8gaGVpZ2h0ICogdHJhbnNpdGlvbkR1cmF0aW9uICsgJ3MnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbXNbaV0uc3R5bGUudHJhbnNpdGlvbkRlbGF5ID0gaXRlbURlbGF5O1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHRoZSBpbml0aWFsIGNsaXAgdG8gdGhlIHRleHQgYmVmb3JlIHdlIHN0YXJ0IGFuaW1hdGluZy5cbiAgICAgICAgdGhpcy5hcHBseUNsaXBfKGhlaWdodCwgd2lkdGgpO1xuICAgICAgICAvLyBXYWl0IGZvciB0aGUgbmV4dCBmcmFtZSwgdHVybiBvbiBhbmltYXRpb24sIGFuZCBhcHBseSB0aGUgZmluYWwgY2xpcC5cbiAgICAgICAgLy8gQWxzbyBtYWtlIGl0IHZpc2libGUuIFRoaXMgdHJpZ2dlcnMgdGhlIHRyYW5zaXRpb25zLlxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0FOSU1BVElORyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLnN0eWxlLmNsaXAgPSAncmVjdCgwICcgKyB3aWR0aCArICdweCAnICsgaGVpZ2h0ICsgJ3B4IDApJztcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyXy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVklTSUJMRSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIC8vIENsZWFuIHVwIGFmdGVyIHRoZSBhbmltYXRpb24gaXMgY29tcGxldGUuXG4gICAgICAgIHRoaXMuYWRkQW5pbWF0aW9uRW5kTGlzdGVuZXJfKCk7XG4gICAgICAgIC8vIEFkZCBhIGNsaWNrIGxpc3RlbmVyIHRvIHRoZSBkb2N1bWVudCwgdG8gY2xvc2UgdGhlIG1lbnUuXG4gICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIGRvY3VtZW50IGlzIHByb2Nlc3NpbmcgdGhlIHNhbWUgZXZlbnQgdGhhdFxuICAgICAgICAgICAgLy8gZGlzcGxheWVkIHRoZSBtZW51IGluIHRoZSBmaXJzdCBwbGFjZS4gSWYgc28sIGRvIG5vdGhpbmcuXG4gICAgICAgICAgICAvLyBBbHNvIGNoZWNrIHRvIHNlZSBpZiB0aGUgbWVudSBpcyBpbiB0aGUgcHJvY2VzcyBvZiBjbG9zaW5nIGl0c2VsZiwgYW5kXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nIGluIHRoYXQgY2FzZS5cbiAgICAgICAgICAgIC8vIEFsc28gY2hlY2sgaWYgdGhlIGNsaWNrZWQgZWxlbWVudCBpcyBhIG1lbnUgaXRlbVxuICAgICAgICAgICAgLy8gaWYgc28sIGRvIG5vdGhpbmcuXG4gICAgICAgICAgICBpZiAoZSAhPT0gZXZ0ICYmICF0aGlzLmNsb3NpbmdfICYmIGUudGFyZ2V0LnBhcmVudE5vZGUgIT09IHRoaXMuZWxlbWVudF8pIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrKTtcbiAgICB9XG59O1xuTWF0ZXJpYWxNZW51LnByb3RvdHlwZVsnc2hvdyddID0gTWF0ZXJpYWxNZW51LnByb3RvdHlwZS5zaG93O1xuLyoqXG4gICAqIEhpZGVzIHRoZSBtZW51LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxNZW51LnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfICYmIHRoaXMuY29udGFpbmVyXyAmJiB0aGlzLm91dGxpbmVfKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvckFsbCgnLicgKyB0aGlzLkNzc0NsYXNzZXNfLklURU0pO1xuICAgICAgICAvLyBSZW1vdmUgYWxsIHRyYW5zaXRpb24gZGVsYXlzOyBtZW51IGl0ZW1zIGZhZGUgb3V0IGNvbmN1cnJlbnRseS5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaXRlbXNbaV0uc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3RyYW5zaXRpb24tZGVsYXknKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNZWFzdXJlIHRoZSBpbm5lciBlbGVtZW50LlxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWxlbWVudF8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHZhciBoZWlnaHQgPSByZWN0LmhlaWdodDtcbiAgICAgICAgdmFyIHdpZHRoID0gcmVjdC53aWR0aDtcbiAgICAgICAgLy8gVHVybiBvbiBhbmltYXRpb24sIGFuZCBhcHBseSB0aGUgZmluYWwgY2xpcC4gQWxzbyBtYWtlIGludmlzaWJsZS5cbiAgICAgICAgLy8gVGhpcyB0cmlnZ2VycyB0aGUgdHJhbnNpdGlvbnMuXG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0FOSU1BVElORyk7XG4gICAgICAgIHRoaXMuYXBwbHlDbGlwXyhoZWlnaHQsIHdpZHRoKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19WSVNJQkxFKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBpcyBjb21wbGV0ZS5cbiAgICAgICAgdGhpcy5hZGRBbmltYXRpb25FbmRMaXN0ZW5lcl8oKTtcbiAgICB9XG59O1xuTWF0ZXJpYWxNZW51LnByb3RvdHlwZVsnaGlkZSddID0gTWF0ZXJpYWxNZW51LnByb3RvdHlwZS5oaWRlO1xuLyoqXG4gICAqIERpc3BsYXlzIG9yIGhpZGVzIHRoZSBtZW51LCBkZXBlbmRpbmcgb24gY3VycmVudCBzdGF0ZS5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsTWVudS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmICh0aGlzLmNvbnRhaW5lcl8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVklTSUJMRSkpIHtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zaG93KGV2dCk7XG4gICAgfVxufTtcbk1hdGVyaWFsTWVudS5wcm90b3R5cGVbJ3RvZ2dsZSddID0gTWF0ZXJpYWxNZW51LnByb3RvdHlwZS50b2dnbGU7XG4vLyBUaGUgY29tcG9uZW50IHJlZ2lzdGVycyBpdHNlbGYuIEl0IGNhbiBhc3N1bWUgY29tcG9uZW50SGFuZGxlciBpcyBhdmFpbGFibGVcbi8vIGluIHRoZSBnbG9iYWwgc2NvcGUuXG5jb21wb25lbnRIYW5kbGVyLnJlZ2lzdGVyKHtcbiAgICBjb25zdHJ1Y3RvcjogTWF0ZXJpYWxNZW51LFxuICAgIGNsYXNzQXNTdHJpbmc6ICdNYXRlcmlhbE1lbnUnLFxuICAgIGNzc0NsYXNzOiAnbWRsLWpzLW1lbnUnLFxuICAgIHdpZGdldDogdHJ1ZVxufSk7XG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbi8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3RvciBmb3IgUHJvZ3Jlc3MgTURMIGNvbXBvbmVudC5cbiAgICogSW1wbGVtZW50cyBNREwgY29tcG9uZW50IGRlc2lnbiBwYXR0ZXJuIGRlZmluZWQgYXQ6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNvbm1heWVzL21kbC1jb21wb25lbnQtZGVzaWduLXBhdHRlcm5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCB3aWxsIGJlIHVwZ3JhZGVkLlxuICAgKi9cbnZhciBNYXRlcmlhbFByb2dyZXNzID0gZnVuY3Rpb24gTWF0ZXJpYWxQcm9ncmVzcyhlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG4gICAgLy8gSW5pdGlhbGl6ZSBpbnN0YW5jZS5cbiAgICB0aGlzLmluaXQoKTtcbn07XG53aW5kb3dbJ01hdGVyaWFsUHJvZ3Jlc3MnXSA9IE1hdGVyaWFsUHJvZ3Jlc3M7XG4vKipcbiAgICogU3RvcmUgY29uc3RhbnRzIGluIG9uZSBwbGFjZSBzbyB0aGV5IGNhbiBiZSB1cGRhdGVkIGVhc2lseS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZyB8IG51bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFByb2dyZXNzLnByb3RvdHlwZS5Db25zdGFudF8gPSB7fTtcbi8qKlxuICAgKiBTdG9yZSBzdHJpbmdzIGZvciBjbGFzcyBuYW1lcyBkZWZpbmVkIGJ5IHRoaXMgY29tcG9uZW50IHRoYXQgYXJlIHVzZWQgaW5cbiAgICogSmF2YVNjcmlwdC4gVGhpcyBhbGxvd3MgdXMgdG8gc2ltcGx5IGNoYW5nZSBpdCBpbiBvbmUgcGxhY2Ugc2hvdWxkIHdlXG4gICAqIGRlY2lkZSB0byBtb2RpZnkgYXQgYSBsYXRlciBkYXRlLlxuICAgKlxuICAgKiBAZW51bSB7c3RyaW5nfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsUHJvZ3Jlc3MucHJvdG90eXBlLkNzc0NsYXNzZXNfID0geyBJTkRFVEVSTUlOQVRFX0NMQVNTOiAnbWRsLXByb2dyZXNzX19pbmRldGVybWluYXRlJyB9O1xuLyoqXG4gICAqIFNldCB0aGUgY3VycmVudCBwcm9ncmVzcyBvZiB0aGUgcHJvZ3Jlc3NiYXIuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwIFBlcmNlbnRhZ2Ugb2YgdGhlIHByb2dyZXNzICgwLTEwMClcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsUHJvZ3Jlc3MucHJvdG90eXBlLnNldFByb2dyZXNzID0gZnVuY3Rpb24gKHApIHtcbiAgICBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5JTkRFVEVSTUlOQVRFX0NMQVNTKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvZ3Jlc3NiYXJfLnN0eWxlLndpZHRoID0gcCArICclJztcbn07XG5NYXRlcmlhbFByb2dyZXNzLnByb3RvdHlwZVsnc2V0UHJvZ3Jlc3MnXSA9IE1hdGVyaWFsUHJvZ3Jlc3MucHJvdG90eXBlLnNldFByb2dyZXNzO1xuLyoqXG4gICAqIFNldCB0aGUgY3VycmVudCBwcm9ncmVzcyBvZiB0aGUgYnVmZmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcCBQZXJjZW50YWdlIG9mIHRoZSBidWZmZXIgKDAtMTAwKVxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxQcm9ncmVzcy5wcm90b3R5cGUuc2V0QnVmZmVyID0gZnVuY3Rpb24gKHApIHtcbiAgICB0aGlzLmJ1ZmZlcmJhcl8uc3R5bGUud2lkdGggPSBwICsgJyUnO1xuICAgIHRoaXMuYXV4YmFyXy5zdHlsZS53aWR0aCA9IDEwMCAtIHAgKyAnJSc7XG59O1xuTWF0ZXJpYWxQcm9ncmVzcy5wcm90b3R5cGVbJ3NldEJ1ZmZlciddID0gTWF0ZXJpYWxQcm9ncmVzcy5wcm90b3R5cGUuc2V0QnVmZmVyO1xuLyoqXG4gICAqIEluaXRpYWxpemUgZWxlbWVudC5cbiAgICovXG5NYXRlcmlhbFByb2dyZXNzLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfKSB7XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSAncHJvZ3Jlc3NiYXIgYmFyIGJhcjEnO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdGhpcy5wcm9ncmVzc2Jhcl8gPSBlbDtcbiAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gJ2J1ZmZlcmJhciBiYXIgYmFyMic7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB0aGlzLmJ1ZmZlcmJhcl8gPSBlbDtcbiAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gJ2F1eGJhciBiYXIgYmFyMyc7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB0aGlzLmF1eGJhcl8gPSBlbDtcbiAgICAgICAgdGhpcy5wcm9ncmVzc2Jhcl8uc3R5bGUud2lkdGggPSAnMCUnO1xuICAgICAgICB0aGlzLmJ1ZmZlcmJhcl8uc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgICAgIHRoaXMuYXV4YmFyXy5zdHlsZS53aWR0aCA9ICcwJSc7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCgnaXMtdXBncmFkZWQnKTtcbiAgICB9XG59O1xuLy8gVGhlIGNvbXBvbmVudCByZWdpc3RlcnMgaXRzZWxmLiBJdCBjYW4gYXNzdW1lIGNvbXBvbmVudEhhbmRsZXIgaXMgYXZhaWxhYmxlXG4vLyBpbiB0aGUgZ2xvYmFsIHNjb3BlLlxuY29tcG9uZW50SGFuZGxlci5yZWdpc3Rlcih7XG4gICAgY29uc3RydWN0b3I6IE1hdGVyaWFsUHJvZ3Jlc3MsXG4gICAgY2xhc3NBc1N0cmluZzogJ01hdGVyaWFsUHJvZ3Jlc3MnLFxuICAgIGNzc0NsYXNzOiAnbWRsLWpzLXByb2dyZXNzJyxcbiAgICB3aWRnZXQ6IHRydWVcbn0pO1xuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG4vKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IgZm9yIFJhZGlvIE1ETCBjb21wb25lbnQuXG4gICAqIEltcGxlbWVudHMgTURMIGNvbXBvbmVudCBkZXNpZ24gcGF0dGVybiBkZWZpbmVkIGF0OlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vamFzb25tYXllcy9tZGwtY29tcG9uZW50LWRlc2lnbi1wYXR0ZXJuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgd2lsbCBiZSB1cGdyYWRlZC5cbiAgICovXG52YXIgTWF0ZXJpYWxSYWRpbyA9IGZ1bmN0aW9uIE1hdGVyaWFsUmFkaW8oZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuICAgIC8vIEluaXRpYWxpemUgaW5zdGFuY2UuXG4gICAgdGhpcy5pbml0KCk7XG59O1xud2luZG93WydNYXRlcmlhbFJhZGlvJ10gPSBNYXRlcmlhbFJhZGlvO1xuLyoqXG4gICAqIFN0b3JlIGNvbnN0YW50cyBpbiBvbmUgcGxhY2Ugc28gdGhleSBjYW4gYmUgdXBkYXRlZCBlYXNpbHkuXG4gICAqXG4gICAqIEBlbnVtIHtzdHJpbmcgfCBudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxSYWRpby5wcm90b3R5cGUuQ29uc3RhbnRfID0geyBUSU5ZX1RJTUVPVVQ6IDAuMDAxIH07XG4vKipcbiAgICogU3RvcmUgc3RyaW5ncyBmb3IgY2xhc3MgbmFtZXMgZGVmaW5lZCBieSB0aGlzIGNvbXBvbmVudCB0aGF0IGFyZSB1c2VkIGluXG4gICAqIEphdmFTY3JpcHQuIFRoaXMgYWxsb3dzIHVzIHRvIHNpbXBseSBjaGFuZ2UgaXQgaW4gb25lIHBsYWNlIHNob3VsZCB3ZVxuICAgKiBkZWNpZGUgdG8gbW9kaWZ5IGF0IGEgbGF0ZXIgZGF0ZS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5Dc3NDbGFzc2VzXyA9IHtcbiAgICBJU19GT0NVU0VEOiAnaXMtZm9jdXNlZCcsXG4gICAgSVNfRElTQUJMRUQ6ICdpcy1kaXNhYmxlZCcsXG4gICAgSVNfQ0hFQ0tFRDogJ2lzLWNoZWNrZWQnLFxuICAgIElTX1VQR1JBREVEOiAnaXMtdXBncmFkZWQnLFxuICAgIEpTX1JBRElPOiAnbWRsLWpzLXJhZGlvJyxcbiAgICBSQURJT19CVE46ICdtZGwtcmFkaW9fX2J1dHRvbicsXG4gICAgUkFESU9fT1VURVJfQ0lSQ0xFOiAnbWRsLXJhZGlvX19vdXRlci1jaXJjbGUnLFxuICAgIFJBRElPX0lOTkVSX0NJUkNMRTogJ21kbC1yYWRpb19faW5uZXItY2lyY2xlJyxcbiAgICBSSVBQTEVfRUZGRUNUOiAnbWRsLWpzLXJpcHBsZS1lZmZlY3QnLFxuICAgIFJJUFBMRV9JR05PUkVfRVZFTlRTOiAnbWRsLWpzLXJpcHBsZS1lZmZlY3QtLWlnbm9yZS1ldmVudHMnLFxuICAgIFJJUFBMRV9DT05UQUlORVI6ICdtZGwtcmFkaW9fX3JpcHBsZS1jb250YWluZXInLFxuICAgIFJJUFBMRV9DRU5URVI6ICdtZGwtcmlwcGxlLS1jZW50ZXInLFxuICAgIFJJUFBMRTogJ21kbC1yaXBwbGUnXG59O1xuLyoqXG4gICAqIEhhbmRsZSBjaGFuZ2Ugb2Ygc3RhdGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsUmFkaW8ucHJvdG90eXBlLm9uQ2hhbmdlXyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vIFNpbmNlIG90aGVyIHJhZGlvIGJ1dHRvbnMgZG9uJ3QgZ2V0IGNoYW5nZSBldmVudHMsIHdlIG5lZWQgdG8gbG9vayBmb3JcbiAgICAvLyB0aGVtIHRvIHVwZGF0ZSB0aGVpciBjbGFzc2VzLlxuICAgIHZhciByYWRpb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHRoaXMuQ3NzQ2xhc3Nlc18uSlNfUkFESU8pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFkaW9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBidXR0b24gPSByYWRpb3NbaV0ucXVlcnlTZWxlY3RvcignLicgKyB0aGlzLkNzc0NsYXNzZXNfLlJBRElPX0JUTik7XG4gICAgICAgIC8vIERpZmZlcmVudCBuYW1lID09IGRpZmZlcmVudCBncm91cCwgc28gbm8gcG9pbnQgdXBkYXRpbmcgdGhvc2UuXG4gICAgICAgIGlmIChidXR0b24uZ2V0QXR0cmlidXRlKCduYW1lJykgPT09IHRoaXMuYnRuRWxlbWVudF8uZ2V0QXR0cmlidXRlKCduYW1lJykpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmFkaW9zW2ldWydNYXRlcmlhbFJhZGlvJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcmFkaW9zW2ldWydNYXRlcmlhbFJhZGlvJ10udXBkYXRlQ2xhc3Nlc18oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG4vKipcbiAgICogSGFuZGxlIGZvY3VzLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5vbkZvY3VzXyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0ZPQ1VTRUQpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgbG9zdCBmb2N1cy5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxSYWRpby5wcm90b3R5cGUub25CbHVyXyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0ZPQ1VTRUQpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgbW91c2V1cC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxSYWRpby5wcm90b3R5cGUub25Nb3VzZXVwXyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMuYmx1cl8oKTtcbn07XG4vKipcbiAgICogVXBkYXRlIGNsYXNzZXMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxSYWRpby5wcm90b3R5cGUudXBkYXRlQ2xhc3Nlc18gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jaGVja0Rpc2FibGVkKCk7XG4gICAgdGhpcy5jaGVja1RvZ2dsZVN0YXRlKCk7XG59O1xuLyoqXG4gICAqIEFkZCBibHVyLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsUmFkaW8ucHJvdG90eXBlLmJsdXJfID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE86IGZpZ3VyZSBvdXQgd2h5IHRoZXJlJ3MgYSBmb2N1cyBldmVudCBiZWluZyBmaXJlZCBhZnRlciBvdXIgYmx1cixcbiAgICAvLyBzbyB0aGF0IHdlIGNhbiBhdm9pZCB0aGlzIGhhY2suXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJ0bkVsZW1lbnRfLmJsdXIoKTtcbiAgICB9LmJpbmQodGhpcyksIHRoaXMuQ29uc3RhbnRfLlRJTllfVElNRU9VVCk7XG59O1xuLy8gUHVibGljIG1ldGhvZHMuXG4vKipcbiAgICogQ2hlY2sgdGhlIGNvbXBvbmVudHMgZGlzYWJsZWQgc3RhdGUuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5jaGVja0Rpc2FibGVkID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmJ0bkVsZW1lbnRfLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0RJU0FCTEVEKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19ESVNBQkxFRCk7XG4gICAgfVxufTtcbk1hdGVyaWFsUmFkaW8ucHJvdG90eXBlWydjaGVja0Rpc2FibGVkJ10gPSBNYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5jaGVja0Rpc2FibGVkO1xuLyoqXG4gICAqIENoZWNrIHRoZSBjb21wb25lbnRzIHRvZ2dsZWQgc3RhdGUuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5jaGVja1RvZ2dsZVN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmJ0bkVsZW1lbnRfLmNoZWNrZWQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfQ0hFQ0tFRCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfQ0hFQ0tFRCk7XG4gICAgfVxufTtcbk1hdGVyaWFsUmFkaW8ucHJvdG90eXBlWydjaGVja1RvZ2dsZVN0YXRlJ10gPSBNYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5jaGVja1RvZ2dsZVN0YXRlO1xuLyoqXG4gICAqIERpc2FibGUgcmFkaW8uXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYnRuRWxlbWVudF8uZGlzYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbn07XG5NYXRlcmlhbFJhZGlvLnByb3RvdHlwZVsnZGlzYWJsZSddID0gTWF0ZXJpYWxSYWRpby5wcm90b3R5cGUuZGlzYWJsZTtcbi8qKlxuICAgKiBFbmFibGUgcmFkaW8uXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5idG5FbGVtZW50Xy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbn07XG5NYXRlcmlhbFJhZGlvLnByb3RvdHlwZVsnZW5hYmxlJ10gPSBNYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5lbmFibGU7XG4vKipcbiAgICogQ2hlY2sgcmFkaW8uXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFJhZGlvLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmJ0bkVsZW1lbnRfLmNoZWNrZWQgPSB0cnVlO1xuICAgIHRoaXMub25DaGFuZ2VfKG51bGwpO1xufTtcbk1hdGVyaWFsUmFkaW8ucHJvdG90eXBlWydjaGVjayddID0gTWF0ZXJpYWxSYWRpby5wcm90b3R5cGUuY2hlY2s7XG4vKipcbiAgICogVW5jaGVjayByYWRpby5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsUmFkaW8ucHJvdG90eXBlLnVuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5idG5FbGVtZW50Xy5jaGVja2VkID0gZmFsc2U7XG4gICAgdGhpcy5vbkNoYW5nZV8obnVsbCk7XG59O1xuTWF0ZXJpYWxSYWRpby5wcm90b3R5cGVbJ3VuY2hlY2snXSA9IE1hdGVyaWFsUmFkaW8ucHJvdG90eXBlLnVuY2hlY2s7XG4vKipcbiAgICogSW5pdGlhbGl6ZSBlbGVtZW50LlxuICAgKi9cbk1hdGVyaWFsUmFkaW8ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8pIHtcbiAgICAgICAgdGhpcy5idG5FbGVtZW50XyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvcignLicgKyB0aGlzLkNzc0NsYXNzZXNfLlJBRElPX0JUTik7XG4gICAgICAgIHRoaXMuYm91bmRDaGFuZ2VIYW5kbGVyXyA9IHRoaXMub25DaGFuZ2VfLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYm91bmRGb2N1c0hhbmRsZXJfID0gdGhpcy5vbkNoYW5nZV8uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZEJsdXJIYW5kbGVyXyA9IHRoaXMub25CbHVyXy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJvdW5kTW91c2VVcEhhbmRsZXJfID0gdGhpcy5vbk1vdXNldXBfLmJpbmQodGhpcyk7XG4gICAgICAgIHZhciBvdXRlckNpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgb3V0ZXJDaXJjbGUuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJBRElPX09VVEVSX0NJUkNMRSk7XG4gICAgICAgIHZhciBpbm5lckNpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgaW5uZXJDaXJjbGUuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJBRElPX0lOTkVSX0NJUkNMRSk7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQob3V0ZXJDaXJjbGUpO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmFwcGVuZENoaWxkKGlubmVyQ2lyY2xlKTtcbiAgICAgICAgdmFyIHJpcHBsZUNvbnRhaW5lcjtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uUklQUExFX0VGRkVDVCkpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9JR05PUkVfRVZFTlRTKTtcbiAgICAgICAgICAgIHJpcHBsZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHJpcHBsZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uUklQUExFX0NPTlRBSU5FUik7XG4gICAgICAgICAgICByaXBwbGVDb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9FRkZFQ1QpO1xuICAgICAgICAgICAgcmlwcGxlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEVfQ0VOVEVSKTtcbiAgICAgICAgICAgIHJpcHBsZUNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5ib3VuZE1vdXNlVXBIYW5kbGVyXyk7XG4gICAgICAgICAgICB2YXIgcmlwcGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgcmlwcGxlLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEUpO1xuICAgICAgICAgICAgcmlwcGxlQ29udGFpbmVyLmFwcGVuZENoaWxkKHJpcHBsZSk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmFwcGVuZENoaWxkKHJpcHBsZUNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idG5FbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmJvdW5kQ2hhbmdlSGFuZGxlcl8pO1xuICAgICAgICB0aGlzLmJ0bkVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5ib3VuZEZvY3VzSGFuZGxlcl8pO1xuICAgICAgICB0aGlzLmJ0bkVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLmJvdW5kQmx1ckhhbmRsZXJfKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5ib3VuZE1vdXNlVXBIYW5kbGVyXyk7XG4gICAgICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVVBHUkFERUQpO1xuICAgIH1cbn07XG4vLyBUaGUgY29tcG9uZW50IHJlZ2lzdGVycyBpdHNlbGYuIEl0IGNhbiBhc3N1bWUgY29tcG9uZW50SGFuZGxlciBpcyBhdmFpbGFibGVcbi8vIGluIHRoZSBnbG9iYWwgc2NvcGUuXG5jb21wb25lbnRIYW5kbGVyLnJlZ2lzdGVyKHtcbiAgICBjb25zdHJ1Y3RvcjogTWF0ZXJpYWxSYWRpbyxcbiAgICBjbGFzc0FzU3RyaW5nOiAnTWF0ZXJpYWxSYWRpbycsXG4gICAgY3NzQ2xhc3M6ICdtZGwtanMtcmFkaW8nLFxuICAgIHdpZGdldDogdHJ1ZVxufSk7XG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbi8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3RvciBmb3IgU2xpZGVyIE1ETCBjb21wb25lbnQuXG4gICAqIEltcGxlbWVudHMgTURMIGNvbXBvbmVudCBkZXNpZ24gcGF0dGVybiBkZWZpbmVkIGF0OlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vamFzb25tYXllcy9tZGwtY29tcG9uZW50LWRlc2lnbi1wYXR0ZXJuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgd2lsbCBiZSB1cGdyYWRlZC5cbiAgICovXG52YXIgTWF0ZXJpYWxTbGlkZXIgPSBmdW5jdGlvbiBNYXRlcmlhbFNsaWRlcihlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG4gICAgLy8gQnJvd3NlciBmZWF0dXJlIGRldGVjdGlvbi5cbiAgICB0aGlzLmlzSUVfID0gd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkO1xuICAgIC8vIEluaXRpYWxpemUgaW5zdGFuY2UuXG4gICAgdGhpcy5pbml0KCk7XG59O1xud2luZG93WydNYXRlcmlhbFNsaWRlciddID0gTWF0ZXJpYWxTbGlkZXI7XG4vKipcbiAgICogU3RvcmUgY29uc3RhbnRzIGluIG9uZSBwbGFjZSBzbyB0aGV5IGNhbiBiZSB1cGRhdGVkIGVhc2lseS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZyB8IG51bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFNsaWRlci5wcm90b3R5cGUuQ29uc3RhbnRfID0ge307XG4vKipcbiAgICogU3RvcmUgc3RyaW5ncyBmb3IgY2xhc3MgbmFtZXMgZGVmaW5lZCBieSB0aGlzIGNvbXBvbmVudCB0aGF0IGFyZSB1c2VkIGluXG4gICAqIEphdmFTY3JpcHQuIFRoaXMgYWxsb3dzIHVzIHRvIHNpbXBseSBjaGFuZ2UgaXQgaW4gb25lIHBsYWNlIHNob3VsZCB3ZVxuICAgKiBkZWNpZGUgdG8gbW9kaWZ5IGF0IGEgbGF0ZXIgZGF0ZS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFNsaWRlci5wcm90b3R5cGUuQ3NzQ2xhc3Nlc18gPSB7XG4gICAgSUVfQ09OVEFJTkVSOiAnbWRsLXNsaWRlcl9faWUtY29udGFpbmVyJyxcbiAgICBTTElERVJfQ09OVEFJTkVSOiAnbWRsLXNsaWRlcl9fY29udGFpbmVyJyxcbiAgICBCQUNLR1JPVU5EX0ZMRVg6ICdtZGwtc2xpZGVyX19iYWNrZ3JvdW5kLWZsZXgnLFxuICAgIEJBQ0tHUk9VTkRfTE9XRVI6ICdtZGwtc2xpZGVyX19iYWNrZ3JvdW5kLWxvd2VyJyxcbiAgICBCQUNLR1JPVU5EX1VQUEVSOiAnbWRsLXNsaWRlcl9fYmFja2dyb3VuZC11cHBlcicsXG4gICAgSVNfTE9XRVNUX1ZBTFVFOiAnaXMtbG93ZXN0LXZhbHVlJyxcbiAgICBJU19VUEdSQURFRDogJ2lzLXVwZ3JhZGVkJ1xufTtcbi8qKlxuICAgKiBIYW5kbGUgaW5wdXQgb24gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxTbGlkZXIucHJvdG90eXBlLm9uSW5wdXRfID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy51cGRhdGVWYWx1ZVN0eWxlc18oKTtcbn07XG4vKipcbiAgICogSGFuZGxlIGNoYW5nZSBvbiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFNsaWRlci5wcm90b3R5cGUub25DaGFuZ2VfID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy51cGRhdGVWYWx1ZVN0eWxlc18oKTtcbn07XG4vKipcbiAgICogSGFuZGxlIG1vdXNldXAgb24gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxTbGlkZXIucHJvdG90eXBlLm9uTW91c2VVcF8gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBldmVudC50YXJnZXQuYmx1cigpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgbW91c2Vkb3duIG9uIGNvbnRhaW5lciBlbGVtZW50LlxuICAgKiBUaGlzIGhhbmRsZXIgaXMgcHVycG9zZSBpcyB0byBub3QgcmVxdWlyZSB0aGUgdXNlIHRvIGNsaWNrXG4gICAqIGV4YWN0bHkgb24gdGhlIDJweCBzbGlkZXIgZWxlbWVudCwgYXMgRmlyZUZveCBzZWVtcyB0byBiZSB2ZXJ5XG4gICAqIHN0cmljdCBhYm91dCB0aGlzLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICogQHN1cHByZXNzIHttaXNzaW5nUHJvcGVydGllc31cbiAgICovXG5NYXRlcmlhbFNsaWRlci5wcm90b3R5cGUub25Db250YWluZXJNb3VzZURvd25fID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gSWYgdGhpcyBjbGljayBpcyBub3Qgb24gdGhlIHBhcmVudCBlbGVtZW50IChidXQgcmF0aGVyIHNvbWUgY2hpbGQpXG4gICAgLy8gaWdub3JlLiBJdCBtYXkgc3RpbGwgYnViYmxlIHVwLlxuICAgIGlmIChldmVudC50YXJnZXQgIT09IHRoaXMuZWxlbWVudF8ucGFyZW50RWxlbWVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIERpc2NhcmQgdGhlIG9yaWdpbmFsIGV2ZW50IGFuZCBjcmVhdGUgYSBuZXcgZXZlbnQgdGhhdFxuICAgIC8vIGlzIG9uIHRoZSBzbGlkZXIgZWxlbWVudC5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBuZXdFdmVudCA9IG5ldyBNb3VzZUV2ZW50KCdtb3VzZWRvd24nLCB7XG4gICAgICAgIHRhcmdldDogZXZlbnQudGFyZ2V0LFxuICAgICAgICBidXR0b25zOiBldmVudC5idXR0b25zLFxuICAgICAgICBjbGllbnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICBjbGllbnRZOiB0aGlzLmVsZW1lbnRfLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnlcbiAgICB9KTtcbiAgICB0aGlzLmVsZW1lbnRfLmRpc3BhdGNoRXZlbnQobmV3RXZlbnQpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgdXBkYXRpbmcgb2YgdmFsdWVzLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsU2xpZGVyLnByb3RvdHlwZS51cGRhdGVWYWx1ZVN0eWxlc18gPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gQ2FsY3VsYXRlIGFuZCBhcHBseSBwZXJjZW50YWdlcyB0byBkaXYgc3RydWN0dXJlIGJlaGluZCBzbGlkZXIuXG4gICAgdmFyIGZyYWN0aW9uID0gKHRoaXMuZWxlbWVudF8udmFsdWUgLSB0aGlzLmVsZW1lbnRfLm1pbikgLyAodGhpcy5lbGVtZW50Xy5tYXggLSB0aGlzLmVsZW1lbnRfLm1pbik7XG4gICAgaWYgKGZyYWN0aW9uID09PSAwKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0xPV0VTVF9WQUxVRSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfTE9XRVNUX1ZBTFVFKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzSUVfKSB7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZExvd2VyXy5zdHlsZS5mbGV4ID0gZnJhY3Rpb247XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZExvd2VyXy5zdHlsZS53ZWJraXRGbGV4ID0gZnJhY3Rpb247XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZFVwcGVyXy5zdHlsZS5mbGV4ID0gMSAtIGZyYWN0aW9uO1xuICAgICAgICB0aGlzLmJhY2tncm91bmRVcHBlcl8uc3R5bGUud2Via2l0RmxleCA9IDEgLSBmcmFjdGlvbjtcbiAgICB9XG59O1xuLy8gUHVibGljIG1ldGhvZHMuXG4vKipcbiAgICogRGlzYWJsZSBzbGlkZXIuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFNsaWRlci5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnRfLmRpc2FibGVkID0gdHJ1ZTtcbn07XG5NYXRlcmlhbFNsaWRlci5wcm90b3R5cGVbJ2Rpc2FibGUnXSA9IE1hdGVyaWFsU2xpZGVyLnByb3RvdHlwZS5kaXNhYmxlO1xuLyoqXG4gICAqIEVuYWJsZSBzbGlkZXIuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFNsaWRlci5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudF8uZGlzYWJsZWQgPSBmYWxzZTtcbn07XG5NYXRlcmlhbFNsaWRlci5wcm90b3R5cGVbJ2VuYWJsZSddID0gTWF0ZXJpYWxTbGlkZXIucHJvdG90eXBlLmVuYWJsZTtcbi8qKlxuICAgKiBVcGRhdGUgc2xpZGVyIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVGhlIHZhbHVlIHRvIHdoaWNoIHRvIHNldCB0aGUgY29udHJvbCAob3B0aW9uYWwpLlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxTbGlkZXIucHJvdG90eXBlLmNoYW5nZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8udmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVWYWx1ZVN0eWxlc18oKTtcbn07XG5NYXRlcmlhbFNsaWRlci5wcm90b3R5cGVbJ2NoYW5nZSddID0gTWF0ZXJpYWxTbGlkZXIucHJvdG90eXBlLmNoYW5nZTtcbi8qKlxuICAgKiBJbml0aWFsaXplIGVsZW1lbnQuXG4gICAqL1xuTWF0ZXJpYWxTbGlkZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8pIHtcbiAgICAgICAgaWYgKHRoaXMuaXNJRV8pIHtcbiAgICAgICAgICAgIC8vIFNpbmNlIHdlIG5lZWQgdG8gc3BlY2lmeSBhIHZlcnkgbGFyZ2UgaGVpZ2h0IGluIElFIGR1ZSB0b1xuICAgICAgICAgICAgLy8gaW1wbGVtZW50YXRpb24gbGltaXRhdGlvbnMsIHdlIGFkZCBhIHBhcmVudCBoZXJlIHRoYXQgdHJpbXMgaXQgZG93biB0b1xuICAgICAgICAgICAgLy8gYSByZWFzb25hYmxlIHNpemUuXG4gICAgICAgICAgICB2YXIgY29udGFpbmVySUUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGNvbnRhaW5lcklFLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JRV9DT05UQUlORVIpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShjb250YWluZXJJRSwgdGhpcy5lbGVtZW50Xyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gICAgICAgICAgICBjb250YWluZXJJRS5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZvciBub24tSUUgYnJvd3NlcnMsIHdlIG5lZWQgYSBkaXYgc3RydWN0dXJlIHRoYXQgc2l0cyBiZWhpbmQgdGhlXG4gICAgICAgICAgICAvLyBzbGlkZXIgYW5kIGFsbG93cyB1cyB0byBzdHlsZSB0aGUgbGVmdCBhbmQgcmlnaHQgc2lkZXMgb2YgaXQgd2l0aFxuICAgICAgICAgICAgLy8gZGlmZmVyZW50IGNvbG9ycy5cbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uU0xJREVSX0NPTlRBSU5FUik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNvbnRhaW5lciwgdGhpcy5lbGVtZW50Xyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gICAgICAgICAgICB2YXIgYmFja2dyb3VuZEZsZXggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGJhY2tncm91bmRGbGV4LmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5CQUNLR1JPVU5EX0ZMRVgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJhY2tncm91bmRGbGV4KTtcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZExvd2VyXyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kTG93ZXJfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5CQUNLR1JPVU5EX0xPV0VSKTtcbiAgICAgICAgICAgIGJhY2tncm91bmRGbGV4LmFwcGVuZENoaWxkKHRoaXMuYmFja2dyb3VuZExvd2VyXyk7XG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRVcHBlcl8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZFVwcGVyXy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uQkFDS0dST1VORF9VUFBFUik7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kRmxleC5hcHBlbmRDaGlsZCh0aGlzLmJhY2tncm91bmRVcHBlcl8pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm91bmRJbnB1dEhhbmRsZXIgPSB0aGlzLm9uSW5wdXRfLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYm91bmRDaGFuZ2VIYW5kbGVyID0gdGhpcy5vbkNoYW5nZV8uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZE1vdXNlVXBIYW5kbGVyID0gdGhpcy5vbk1vdXNlVXBfLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYm91bmRDb250YWluZXJNb3VzZURvd25IYW5kbGVyID0gdGhpcy5vbkNvbnRhaW5lck1vdXNlRG93bl8uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuYm91bmRJbnB1dEhhbmRsZXIpO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuYm91bmRDaGFuZ2VIYW5kbGVyKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5ib3VuZE1vdXNlVXBIYW5kbGVyKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5wYXJlbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuYm91bmRDb250YWluZXJNb3VzZURvd25IYW5kbGVyKTtcbiAgICAgICAgdGhpcy51cGRhdGVWYWx1ZVN0eWxlc18oKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVVBHUkFERUQpO1xuICAgIH1cbn07XG4vLyBUaGUgY29tcG9uZW50IHJlZ2lzdGVycyBpdHNlbGYuIEl0IGNhbiBhc3N1bWUgY29tcG9uZW50SGFuZGxlciBpcyBhdmFpbGFibGVcbi8vIGluIHRoZSBnbG9iYWwgc2NvcGUuXG5jb21wb25lbnRIYW5kbGVyLnJlZ2lzdGVyKHtcbiAgICBjb25zdHJ1Y3RvcjogTWF0ZXJpYWxTbGlkZXIsXG4gICAgY2xhc3NBc1N0cmluZzogJ01hdGVyaWFsU2xpZGVyJyxcbiAgICBjc3NDbGFzczogJ21kbC1qcy1zbGlkZXInLFxuICAgIHdpZGdldDogdHJ1ZVxufSk7XG4vKipcbiAqIENvcHlyaWdodCAyMDE1IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yIGZvciBTbmFja2JhciBNREwgY29tcG9uZW50LlxuICAgKiBJbXBsZW1lbnRzIE1ETCBjb21wb25lbnQgZGVzaWduIHBhdHRlcm4gZGVmaW5lZCBhdDpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2phc29ubWF5ZXMvbWRsLWNvbXBvbmVudC1kZXNpZ24tcGF0dGVyblxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBncmFkZWQuXG4gICAqL1xudmFyIE1hdGVyaWFsU25hY2tiYXIgPSBmdW5jdGlvbiBNYXRlcmlhbFNuYWNrYmFyKGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcbiAgICB0aGlzLnRleHRFbGVtZW50XyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvcignLicgKyB0aGlzLmNzc0NsYXNzZXNfLk1FU1NBR0UpO1xuICAgIHRoaXMuYWN0aW9uRWxlbWVudF8gPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5jc3NDbGFzc2VzXy5BQ1RJT04pO1xuICAgIGlmICghdGhpcy50ZXh0RWxlbWVudF8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBtdXN0IGJlIGEgbWVzc2FnZSBlbGVtZW50IGZvciBhIHNuYWNrYmFyLicpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuYWN0aW9uRWxlbWVudF8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBtdXN0IGJlIGFuIGFjdGlvbiBlbGVtZW50IGZvciBhIHNuYWNrYmFyLicpO1xuICAgIH1cbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuYWN0aW9uSGFuZGxlcl8gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5tZXNzYWdlXyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmFjdGlvblRleHRfID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucXVldWVkTm90aWZpY2F0aW9uc18gPSBbXTtcbiAgICB0aGlzLnNldEFjdGlvbkhpZGRlbl8odHJ1ZSk7XG59O1xud2luZG93WydNYXRlcmlhbFNuYWNrYmFyJ10gPSBNYXRlcmlhbFNuYWNrYmFyO1xuLyoqXG4gICAqIFN0b3JlIGNvbnN0YW50cyBpbiBvbmUgcGxhY2Ugc28gdGhleSBjYW4gYmUgdXBkYXRlZCBlYXNpbHkuXG4gICAqXG4gICAqIEBlbnVtIHtzdHJpbmcgfCBudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxTbmFja2Jhci5wcm90b3R5cGUuQ29uc3RhbnRfID0ge1xuICAgIC8vIFRoZSBkdXJhdGlvbiBvZiB0aGUgc25hY2tiYXIgc2hvdy9oaWRlIGFuaW1hdGlvbiwgaW4gbXMuXG4gICAgQU5JTUFUSU9OX0xFTkdUSDogMjUwXG59O1xuLyoqXG4gICAqIFN0b3JlIHN0cmluZ3MgZm9yIGNsYXNzIG5hbWVzIGRlZmluZWQgYnkgdGhpcyBjb21wb25lbnQgdGhhdCBhcmUgdXNlZCBpblxuICAgKiBKYXZhU2NyaXB0LiBUaGlzIGFsbG93cyB1cyB0byBzaW1wbHkgY2hhbmdlIGl0IGluIG9uZSBwbGFjZSBzaG91bGQgd2VcbiAgICogZGVjaWRlIHRvIG1vZGlmeSBhdCBhIGxhdGVyIGRhdGUuXG4gICAqXG4gICAqIEBlbnVtIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxTbmFja2Jhci5wcm90b3R5cGUuY3NzQ2xhc3Nlc18gPSB7XG4gICAgU05BQ0tCQVI6ICdtZGwtc25hY2tiYXInLFxuICAgIE1FU1NBR0U6ICdtZGwtc25hY2tiYXJfX3RleHQnLFxuICAgIEFDVElPTjogJ21kbC1zbmFja2Jhcl9fYWN0aW9uJyxcbiAgICBBQ1RJVkU6ICdtZGwtc25hY2tiYXItLWFjdGl2ZSdcbn07XG4vKipcbiAgICogRGlzcGxheSB0aGUgc25hY2tiYXIuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxTbmFja2Jhci5wcm90b3R5cGUuZGlzcGxheVNuYWNrYmFyXyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGlmICh0aGlzLmFjdGlvbkhhbmRsZXJfKSB7XG4gICAgICAgIHRoaXMuYWN0aW9uRWxlbWVudF8udGV4dENvbnRlbnQgPSB0aGlzLmFjdGlvblRleHRfO1xuICAgICAgICB0aGlzLmFjdGlvbkVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5hY3Rpb25IYW5kbGVyXyk7XG4gICAgICAgIHRoaXMuc2V0QWN0aW9uSGlkZGVuXyhmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMudGV4dEVsZW1lbnRfLnRleHRDb250ZW50ID0gdGhpcy5tZXNzYWdlXztcbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5jc3NDbGFzc2VzXy5BQ1RJVkUpO1xuICAgIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgIHNldFRpbWVvdXQodGhpcy5jbGVhbnVwXy5iaW5kKHRoaXMpLCB0aGlzLnRpbWVvdXRfKTtcbn07XG4vKipcbiAgICogU2hvdyB0aGUgc25hY2tiYXIuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBkYXRhIGZvciB0aGUgbm90aWZpY2F0aW9uLlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxTbmFja2Jhci5wcm90b3R5cGUuc2hvd1NuYWNrYmFyID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIHByb3ZpZGUgYSBkYXRhIG9iamVjdCB3aXRoIGF0IGxlYXN0IGEgbWVzc2FnZSB0byBkaXNwbGF5LicpO1xuICAgIH1cbiAgICBpZiAoZGF0YVsnbWVzc2FnZSddID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgcHJvdmlkZSBhIG1lc3NhZ2UgdG8gYmUgZGlzcGxheWVkLicpO1xuICAgIH1cbiAgICBpZiAoZGF0YVsnYWN0aW9uSGFuZGxlciddICYmICFkYXRhWydhY3Rpb25UZXh0J10pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgcHJvdmlkZSBhY3Rpb24gdGV4dCB3aXRoIHRoZSBoYW5kbGVyLicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgICAgdGhpcy5xdWV1ZWROb3RpZmljYXRpb25zXy5wdXNoKGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tZXNzYWdlXyA9IGRhdGFbJ21lc3NhZ2UnXTtcbiAgICAgICAgaWYgKGRhdGFbJ3RpbWVvdXQnXSkge1xuICAgICAgICAgICAgdGhpcy50aW1lb3V0XyA9IGRhdGFbJ3RpbWVvdXQnXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGltZW91dF8gPSAyNzUwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhWydhY3Rpb25IYW5kbGVyJ10pIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uSGFuZGxlcl8gPSBkYXRhWydhY3Rpb25IYW5kbGVyJ107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGFbJ2FjdGlvblRleHQnXSkge1xuICAgICAgICAgICAgdGhpcy5hY3Rpb25UZXh0XyA9IGRhdGFbJ2FjdGlvblRleHQnXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpc3BsYXlTbmFja2Jhcl8oKTtcbiAgICB9XG59O1xuTWF0ZXJpYWxTbmFja2Jhci5wcm90b3R5cGVbJ3Nob3dTbmFja2JhciddID0gTWF0ZXJpYWxTbmFja2Jhci5wcm90b3R5cGUuc2hvd1NuYWNrYmFyO1xuLyoqXG4gICAqIENoZWNrIGlmIHRoZSBxdWV1ZSBoYXMgaXRlbXMgd2l0aGluIGl0LlxuICAgKiBJZiBpdCBkb2VzLCBkaXNwbGF5IHRoZSBuZXh0IGVudHJ5LlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsU25hY2tiYXIucHJvdG90eXBlLmNoZWNrUXVldWVfID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnF1ZXVlZE5vdGlmaWNhdGlvbnNfLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5zaG93U25hY2tiYXIodGhpcy5xdWV1ZWROb3RpZmljYXRpb25zXy5zaGlmdCgpKTtcbiAgICB9XG59O1xuLyoqXG4gICAqIENsZWFudXAgdGhlIHNuYWNrYmFyIGV2ZW50IGxpc3RlbmVycyBhbmQgYWNjZXNzaWJsaXR5IGF0dHJpYnV0ZXMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxTbmFja2Jhci5wcm90b3R5cGUuY2xlYW51cF8gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY3NzQ2xhc3Nlc18uQUNUSVZFKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy50ZXh0RWxlbWVudF8udGV4dENvbnRlbnQgPSAnJztcbiAgICAgICAgaWYgKCFCb29sZWFuKHRoaXMuYWN0aW9uRWxlbWVudF8uZ2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicpKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBY3Rpb25IaWRkZW5fKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5hY3Rpb25FbGVtZW50Xy50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5hY3Rpb25FbGVtZW50Xy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuYWN0aW9uSGFuZGxlcl8pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWN0aW9uSGFuZGxlcl8gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMubWVzc2FnZV8gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYWN0aW9uVGV4dF8gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2hlY2tRdWV1ZV8oKTtcbiAgICB9LmJpbmQodGhpcyksIHRoaXMuQ29uc3RhbnRfLkFOSU1BVElPTl9MRU5HVEgpO1xufTtcbi8qKlxuICAgKiBTZXQgdGhlIGFjdGlvbiBoYW5kbGVyIGhpZGRlbiBzdGF0ZS5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSB2YWx1ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsU25hY2tiYXIucHJvdG90eXBlLnNldEFjdGlvbkhpZGRlbl8gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5hY3Rpb25FbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFjdGlvbkVsZW1lbnRfLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcbiAgICB9XG59O1xuLy8gVGhlIGNvbXBvbmVudCByZWdpc3RlcnMgaXRzZWxmLiBJdCBjYW4gYXNzdW1lIGNvbXBvbmVudEhhbmRsZXIgaXMgYXZhaWxhYmxlXG4vLyBpbiB0aGUgZ2xvYmFsIHNjb3BlLlxuY29tcG9uZW50SGFuZGxlci5yZWdpc3Rlcih7XG4gICAgY29uc3RydWN0b3I6IE1hdGVyaWFsU25hY2tiYXIsXG4gICAgY2xhc3NBc1N0cmluZzogJ01hdGVyaWFsU25hY2tiYXInLFxuICAgIGNzc0NsYXNzOiAnbWRsLWpzLXNuYWNrYmFyJyxcbiAgICB3aWRnZXQ6IHRydWVcbn0pO1xuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG4vKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IgZm9yIFNwaW5uZXIgTURMIGNvbXBvbmVudC5cbiAgICogSW1wbGVtZW50cyBNREwgY29tcG9uZW50IGRlc2lnbiBwYXR0ZXJuIGRlZmluZWQgYXQ6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNvbm1heWVzL21kbC1jb21wb25lbnQtZGVzaWduLXBhdHRlcm5cbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBncmFkZWQuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbnZhciBNYXRlcmlhbFNwaW5uZXIgPSBmdW5jdGlvbiBNYXRlcmlhbFNwaW5uZXIoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuICAgIC8vIEluaXRpYWxpemUgaW5zdGFuY2UuXG4gICAgdGhpcy5pbml0KCk7XG59O1xud2luZG93WydNYXRlcmlhbFNwaW5uZXInXSA9IE1hdGVyaWFsU3Bpbm5lcjtcbi8qKlxuICAgKiBTdG9yZSBjb25zdGFudHMgaW4gb25lIHBsYWNlIHNvIHRoZXkgY2FuIGJlIHVwZGF0ZWQgZWFzaWx5LlxuICAgKlxuICAgKiBAZW51bSB7c3RyaW5nIHwgbnVtYmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsU3Bpbm5lci5wcm90b3R5cGUuQ29uc3RhbnRfID0geyBNRExfU1BJTk5FUl9MQVlFUl9DT1VOVDogNCB9O1xuLyoqXG4gICAqIFN0b3JlIHN0cmluZ3MgZm9yIGNsYXNzIG5hbWVzIGRlZmluZWQgYnkgdGhpcyBjb21wb25lbnQgdGhhdCBhcmUgdXNlZCBpblxuICAgKiBKYXZhU2NyaXB0LiBUaGlzIGFsbG93cyB1cyB0byBzaW1wbHkgY2hhbmdlIGl0IGluIG9uZSBwbGFjZSBzaG91bGQgd2VcbiAgICogZGVjaWRlIHRvIG1vZGlmeSBhdCBhIGxhdGVyIGRhdGUuXG4gICAqXG4gICAqIEBlbnVtIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxTcGlubmVyLnByb3RvdHlwZS5Dc3NDbGFzc2VzXyA9IHtcbiAgICBNRExfU1BJTk5FUl9MQVlFUjogJ21kbC1zcGlubmVyX19sYXllcicsXG4gICAgTURMX1NQSU5ORVJfQ0lSQ0xFX0NMSVBQRVI6ICdtZGwtc3Bpbm5lcl9fY2lyY2xlLWNsaXBwZXInLFxuICAgIE1ETF9TUElOTkVSX0NJUkNMRTogJ21kbC1zcGlubmVyX19jaXJjbGUnLFxuICAgIE1ETF9TUElOTkVSX0dBUF9QQVRDSDogJ21kbC1zcGlubmVyX19nYXAtcGF0Y2gnLFxuICAgIE1ETF9TUElOTkVSX0xFRlQ6ICdtZGwtc3Bpbm5lcl9fbGVmdCcsXG4gICAgTURMX1NQSU5ORVJfUklHSFQ6ICdtZGwtc3Bpbm5lcl9fcmlnaHQnXG59O1xuLyoqXG4gICAqIEF1eGlsaWFyeSBtZXRob2QgdG8gY3JlYXRlIGEgc3Bpbm5lciBsYXllci5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IEluZGV4IG9mIHRoZSBsYXllciB0byBiZSBjcmVhdGVkLlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxTcGlubmVyLnByb3RvdHlwZS5jcmVhdGVMYXllciA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHZhciBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxheWVyLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5NRExfU1BJTk5FUl9MQVlFUik7XG4gICAgbGF5ZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLk1ETF9TUElOTkVSX0xBWUVSICsgJy0nICsgaW5kZXgpO1xuICAgIHZhciBsZWZ0Q2xpcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxlZnRDbGlwcGVyLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5NRExfU1BJTk5FUl9DSVJDTEVfQ0xJUFBFUik7XG4gICAgbGVmdENsaXBwZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLk1ETF9TUElOTkVSX0xFRlQpO1xuICAgIHZhciBnYXBQYXRjaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGdhcFBhdGNoLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5NRExfU1BJTk5FUl9HQVBfUEFUQ0gpO1xuICAgIHZhciByaWdodENsaXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByaWdodENsaXBwZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLk1ETF9TUElOTkVSX0NJUkNMRV9DTElQUEVSKTtcbiAgICByaWdodENsaXBwZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLk1ETF9TUElOTkVSX1JJR0hUKTtcbiAgICB2YXIgY2lyY2xlT3duZXJzID0gW1xuICAgICAgICBsZWZ0Q2xpcHBlcixcbiAgICAgICAgZ2FwUGF0Y2gsXG4gICAgICAgIHJpZ2h0Q2xpcHBlclxuICAgIF07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaXJjbGVPd25lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjaXJjbGUuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLk1ETF9TUElOTkVSX0NJUkNMRSk7XG4gICAgICAgIGNpcmNsZU93bmVyc1tpXS5hcHBlbmRDaGlsZChjaXJjbGUpO1xuICAgIH1cbiAgICBsYXllci5hcHBlbmRDaGlsZChsZWZ0Q2xpcHBlcik7XG4gICAgbGF5ZXIuYXBwZW5kQ2hpbGQoZ2FwUGF0Y2gpO1xuICAgIGxheWVyLmFwcGVuZENoaWxkKHJpZ2h0Q2xpcHBlcik7XG4gICAgdGhpcy5lbGVtZW50Xy5hcHBlbmRDaGlsZChsYXllcik7XG59O1xuTWF0ZXJpYWxTcGlubmVyLnByb3RvdHlwZVsnY3JlYXRlTGF5ZXInXSA9IE1hdGVyaWFsU3Bpbm5lci5wcm90b3R5cGUuY3JlYXRlTGF5ZXI7XG4vKipcbiAgICogU3RvcHMgdGhlIHNwaW5uZXIgYW5pbWF0aW9uLlxuICAgKiBQdWJsaWMgbWV0aG9kIGZvciB1c2VycyB3aG8gbmVlZCB0byBzdG9wIHRoZSBzcGlubmVyIGZvciBhbnkgcmVhc29uLlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxTcGlubmVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG59O1xuTWF0ZXJpYWxTcGlubmVyLnByb3RvdHlwZVsnc3RvcCddID0gTWF0ZXJpYWxTcGlubmVyLnByb3RvdHlwZS5zdG9wO1xuLyoqXG4gICAqIFN0YXJ0cyB0aGUgc3Bpbm5lciBhbmltYXRpb24uXG4gICAqIFB1YmxpYyBtZXRob2QgZm9yIHVzZXJzIHdobyBuZWVkIHRvIG1hbnVhbGx5IHN0YXJ0IHRoZSBzcGlubmVyIGZvciBhbnkgcmVhc29uXG4gICAqIChpbnN0ZWFkIG9mIGp1c3QgYWRkaW5nIHRoZSAnaXMtYWN0aXZlJyBjbGFzcyB0byB0aGVpciBtYXJrdXApLlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxTcGlubmVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xufTtcbk1hdGVyaWFsU3Bpbm5lci5wcm90b3R5cGVbJ3N0YXJ0J10gPSBNYXRlcmlhbFNwaW5uZXIucHJvdG90eXBlLnN0YXJ0O1xuLyoqXG4gICAqIEluaXRpYWxpemUgZWxlbWVudC5cbiAgICovXG5NYXRlcmlhbFNwaW5uZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gdGhpcy5Db25zdGFudF8uTURMX1NQSU5ORVJfTEFZRVJfQ09VTlQ7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVMYXllcihpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQoJ2lzLXVwZ3JhZGVkJyk7XG4gICAgfVxufTtcbi8vIFRoZSBjb21wb25lbnQgcmVnaXN0ZXJzIGl0c2VsZi4gSXQgY2FuIGFzc3VtZSBjb21wb25lbnRIYW5kbGVyIGlzIGF2YWlsYWJsZVxuLy8gaW4gdGhlIGdsb2JhbCBzY29wZS5cbmNvbXBvbmVudEhhbmRsZXIucmVnaXN0ZXIoe1xuICAgIGNvbnN0cnVjdG9yOiBNYXRlcmlhbFNwaW5uZXIsXG4gICAgY2xhc3NBc1N0cmluZzogJ01hdGVyaWFsU3Bpbm5lcicsXG4gICAgY3NzQ2xhc3M6ICdtZGwtanMtc3Bpbm5lcicsXG4gICAgd2lkZ2V0OiB0cnVlXG59KTtcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDE1IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yIGZvciBDaGVja2JveCBNREwgY29tcG9uZW50LlxuICAgKiBJbXBsZW1lbnRzIE1ETCBjb21wb25lbnQgZGVzaWduIHBhdHRlcm4gZGVmaW5lZCBhdDpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2phc29ubWF5ZXMvbWRsLWNvbXBvbmVudC1kZXNpZ24tcGF0dGVyblxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBncmFkZWQuXG4gICAqL1xudmFyIE1hdGVyaWFsU3dpdGNoID0gZnVuY3Rpb24gTWF0ZXJpYWxTd2l0Y2goZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuICAgIC8vIEluaXRpYWxpemUgaW5zdGFuY2UuXG4gICAgdGhpcy5pbml0KCk7XG59O1xud2luZG93WydNYXRlcmlhbFN3aXRjaCddID0gTWF0ZXJpYWxTd2l0Y2g7XG4vKipcbiAgICogU3RvcmUgY29uc3RhbnRzIGluIG9uZSBwbGFjZSBzbyB0aGV5IGNhbiBiZSB1cGRhdGVkIGVhc2lseS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZyB8IG51bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFN3aXRjaC5wcm90b3R5cGUuQ29uc3RhbnRfID0geyBUSU5ZX1RJTUVPVVQ6IDAuMDAxIH07XG4vKipcbiAgICogU3RvcmUgc3RyaW5ncyBmb3IgY2xhc3MgbmFtZXMgZGVmaW5lZCBieSB0aGlzIGNvbXBvbmVudCB0aGF0IGFyZSB1c2VkIGluXG4gICAqIEphdmFTY3JpcHQuIFRoaXMgYWxsb3dzIHVzIHRvIHNpbXBseSBjaGFuZ2UgaXQgaW4gb25lIHBsYWNlIHNob3VsZCB3ZVxuICAgKiBkZWNpZGUgdG8gbW9kaWZ5IGF0IGEgbGF0ZXIgZGF0ZS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFN3aXRjaC5wcm90b3R5cGUuQ3NzQ2xhc3Nlc18gPSB7XG4gICAgSU5QVVQ6ICdtZGwtc3dpdGNoX19pbnB1dCcsXG4gICAgVFJBQ0s6ICdtZGwtc3dpdGNoX190cmFjaycsXG4gICAgVEhVTUI6ICdtZGwtc3dpdGNoX190aHVtYicsXG4gICAgRk9DVVNfSEVMUEVSOiAnbWRsLXN3aXRjaF9fZm9jdXMtaGVscGVyJyxcbiAgICBSSVBQTEVfRUZGRUNUOiAnbWRsLWpzLXJpcHBsZS1lZmZlY3QnLFxuICAgIFJJUFBMRV9JR05PUkVfRVZFTlRTOiAnbWRsLWpzLXJpcHBsZS1lZmZlY3QtLWlnbm9yZS1ldmVudHMnLFxuICAgIFJJUFBMRV9DT05UQUlORVI6ICdtZGwtc3dpdGNoX19yaXBwbGUtY29udGFpbmVyJyxcbiAgICBSSVBQTEVfQ0VOVEVSOiAnbWRsLXJpcHBsZS0tY2VudGVyJyxcbiAgICBSSVBQTEU6ICdtZGwtcmlwcGxlJyxcbiAgICBJU19GT0NVU0VEOiAnaXMtZm9jdXNlZCcsXG4gICAgSVNfRElTQUJMRUQ6ICdpcy1kaXNhYmxlZCcsXG4gICAgSVNfQ0hFQ0tFRDogJ2lzLWNoZWNrZWQnXG59O1xuLyoqXG4gICAqIEhhbmRsZSBjaGFuZ2Ugb2Ygc3RhdGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5vbkNoYW5nZV8gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XG59O1xuLyoqXG4gICAqIEhhbmRsZSBmb2N1cyBvZiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFN3aXRjaC5wcm90b3R5cGUub25Gb2N1c18gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19GT0NVU0VEKTtcbn07XG4vKipcbiAgICogSGFuZGxlIGxvc3QgZm9jdXMgb2YgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxTd2l0Y2gucHJvdG90eXBlLm9uQmx1cl8gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19GT0NVU0VEKTtcbn07XG4vKipcbiAgICogSGFuZGxlIG1vdXNldXAuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5vbk1vdXNlVXBfID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5ibHVyXygpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgY2xhc3MgdXBkYXRlcy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFN3aXRjaC5wcm90b3R5cGUudXBkYXRlQ2xhc3Nlc18gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jaGVja0Rpc2FibGVkKCk7XG4gICAgdGhpcy5jaGVja1RvZ2dsZVN0YXRlKCk7XG59O1xuLyoqXG4gICAqIEFkZCBibHVyLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5ibHVyXyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBmaWd1cmUgb3V0IHdoeSB0aGVyZSdzIGEgZm9jdXMgZXZlbnQgYmVpbmcgZmlyZWQgYWZ0ZXIgb3VyIGJsdXIsXG4gICAgLy8gc28gdGhhdCB3ZSBjYW4gYXZvaWQgdGhpcyBoYWNrLlxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnRfLmJsdXIoKTtcbiAgICB9LmJpbmQodGhpcyksIHRoaXMuQ29uc3RhbnRfLlRJTllfVElNRU9VVCk7XG59O1xuLy8gUHVibGljIG1ldGhvZHMuXG4vKipcbiAgICogQ2hlY2sgdGhlIGNvbXBvbmVudHMgZGlzYWJsZWQgc3RhdGUuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFN3aXRjaC5wcm90b3R5cGUuY2hlY2tEaXNhYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pbnB1dEVsZW1lbnRfLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0RJU0FCTEVEKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19ESVNBQkxFRCk7XG4gICAgfVxufTtcbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZVsnY2hlY2tEaXNhYmxlZCddID0gTWF0ZXJpYWxTd2l0Y2gucHJvdG90eXBlLmNoZWNrRGlzYWJsZWQ7XG4vKipcbiAgICogQ2hlY2sgdGhlIGNvbXBvbmVudHMgdG9nZ2xlZCBzdGF0ZS5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5jaGVja1RvZ2dsZVN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlucHV0RWxlbWVudF8uY2hlY2tlZCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19DSEVDS0VEKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19DSEVDS0VEKTtcbiAgICB9XG59O1xuTWF0ZXJpYWxTd2l0Y2gucHJvdG90eXBlWydjaGVja1RvZ2dsZVN0YXRlJ10gPSBNYXRlcmlhbFN3aXRjaC5wcm90b3R5cGUuY2hlY2tUb2dnbGVTdGF0ZTtcbi8qKlxuICAgKiBEaXNhYmxlIHN3aXRjaC5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5wdXRFbGVtZW50Xy5kaXNhYmxlZCA9IHRydWU7XG4gICAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xufTtcbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZVsnZGlzYWJsZSddID0gTWF0ZXJpYWxTd2l0Y2gucHJvdG90eXBlLmRpc2FibGU7XG4vKipcbiAgICogRW5hYmxlIHN3aXRjaC5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbnB1dEVsZW1lbnRfLmRpc2FibGVkID0gZmFsc2U7XG4gICAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xufTtcbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZVsnZW5hYmxlJ10gPSBNYXRlcmlhbFN3aXRjaC5wcm90b3R5cGUuZW5hYmxlO1xuLyoqXG4gICAqIEFjdGl2YXRlIHN3aXRjaC5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlucHV0RWxlbWVudF8uY2hlY2tlZCA9IHRydWU7XG4gICAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xufTtcbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZVsnb24nXSA9IE1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5vbjtcbi8qKlxuICAgKiBEZWFjdGl2YXRlIHN3aXRjaC5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbnB1dEVsZW1lbnRfLmNoZWNrZWQgPSBmYWxzZTtcbiAgICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XG59O1xuTWF0ZXJpYWxTd2l0Y2gucHJvdG90eXBlWydvZmYnXSA9IE1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5vZmY7XG4vKipcbiAgICogSW5pdGlhbGl6ZSBlbGVtZW50LlxuICAgKi9cbk1hdGVyaWFsU3dpdGNoLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfKSB7XG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50XyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvcignLicgKyB0aGlzLkNzc0NsYXNzZXNfLklOUFVUKTtcbiAgICAgICAgdmFyIHRyYWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRyYWNrLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5UUkFDSyk7XG4gICAgICAgIHZhciB0aHVtYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aHVtYi5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uVEhVTUIpO1xuICAgICAgICB2YXIgZm9jdXNIZWxwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGZvY3VzSGVscGVyLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5GT0NVU19IRUxQRVIpO1xuICAgICAgICB0aHVtYi5hcHBlbmRDaGlsZChmb2N1c0hlbHBlcik7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uYXBwZW5kQ2hpbGQodHJhY2spO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmFwcGVuZENoaWxkKHRodW1iKTtcbiAgICAgICAgdGhpcy5ib3VuZE1vdXNlVXBIYW5kbGVyID0gdGhpcy5vbk1vdXNlVXBfLmJpbmQodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9FRkZFQ1QpKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEVfSUdOT1JFX0VWRU5UUyk7XG4gICAgICAgICAgICB0aGlzLnJpcHBsZUNvbnRhaW5lckVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVDb250YWluZXJFbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uUklQUExFX0NPTlRBSU5FUik7XG4gICAgICAgICAgICB0aGlzLnJpcHBsZUNvbnRhaW5lckVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEVfRUZGRUNUKTtcbiAgICAgICAgICAgIHRoaXMucmlwcGxlQ29udGFpbmVyRWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9DRU5URVIpO1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVDb250YWluZXJFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5ib3VuZE1vdXNlVXBIYW5kbGVyKTtcbiAgICAgICAgICAgIHZhciByaXBwbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICByaXBwbGUuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRSk7XG4gICAgICAgICAgICB0aGlzLnJpcHBsZUNvbnRhaW5lckVsZW1lbnRfLmFwcGVuZENoaWxkKHJpcHBsZSk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmFwcGVuZENoaWxkKHRoaXMucmlwcGxlQ29udGFpbmVyRWxlbWVudF8pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm91bmRDaGFuZ2VIYW5kbGVyID0gdGhpcy5vbkNoYW5nZV8uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZEZvY3VzSGFuZGxlciA9IHRoaXMub25Gb2N1c18uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZEJsdXJIYW5kbGVyID0gdGhpcy5vbkJsdXJfLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmJvdW5kQ2hhbmdlSGFuZGxlcik7XG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuYm91bmRGb2N1c0hhbmRsZXIpO1xuICAgICAgICB0aGlzLmlucHV0RWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuYm91bmRCbHVySGFuZGxlcik7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuYm91bmRNb3VzZVVwSGFuZGxlcik7XG4gICAgICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKCdpcy11cGdyYWRlZCcpO1xuICAgIH1cbn07XG4vLyBUaGUgY29tcG9uZW50IHJlZ2lzdGVycyBpdHNlbGYuIEl0IGNhbiBhc3N1bWUgY29tcG9uZW50SGFuZGxlciBpcyBhdmFpbGFibGVcbi8vIGluIHRoZSBnbG9iYWwgc2NvcGUuXG5jb21wb25lbnRIYW5kbGVyLnJlZ2lzdGVyKHtcbiAgICBjb25zdHJ1Y3RvcjogTWF0ZXJpYWxTd2l0Y2gsXG4gICAgY2xhc3NBc1N0cmluZzogJ01hdGVyaWFsU3dpdGNoJyxcbiAgICBjc3NDbGFzczogJ21kbC1qcy1zd2l0Y2gnLFxuICAgIHdpZGdldDogdHJ1ZVxufSk7XG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbi8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3RvciBmb3IgVGFicyBNREwgY29tcG9uZW50LlxuICAgKiBJbXBsZW1lbnRzIE1ETCBjb21wb25lbnQgZGVzaWduIHBhdHRlcm4gZGVmaW5lZCBhdDpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2phc29ubWF5ZXMvbWRsLWNvbXBvbmVudC1kZXNpZ24tcGF0dGVyblxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgd2lsbCBiZSB1cGdyYWRlZC5cbiAgICovXG52YXIgTWF0ZXJpYWxUYWJzID0gZnVuY3Rpb24gTWF0ZXJpYWxUYWJzKGVsZW1lbnQpIHtcbiAgICAvLyBTdG9yZXMgdGhlIEhUTUwgZWxlbWVudC5cbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcbiAgICAvLyBJbml0aWFsaXplIGluc3RhbmNlLlxuICAgIHRoaXMuaW5pdCgpO1xufTtcbndpbmRvd1snTWF0ZXJpYWxUYWJzJ10gPSBNYXRlcmlhbFRhYnM7XG4vKipcbiAgICogU3RvcmUgY29uc3RhbnRzIGluIG9uZSBwbGFjZSBzbyB0aGV5IGNhbiBiZSB1cGRhdGVkIGVhc2lseS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFRhYnMucHJvdG90eXBlLkNvbnN0YW50XyA9IHt9O1xuLyoqXG4gICAqIFN0b3JlIHN0cmluZ3MgZm9yIGNsYXNzIG5hbWVzIGRlZmluZWQgYnkgdGhpcyBjb21wb25lbnQgdGhhdCBhcmUgdXNlZCBpblxuICAgKiBKYXZhU2NyaXB0LiBUaGlzIGFsbG93cyB1cyB0byBzaW1wbHkgY2hhbmdlIGl0IGluIG9uZSBwbGFjZSBzaG91bGQgd2VcbiAgICogZGVjaWRlIHRvIG1vZGlmeSBhdCBhIGxhdGVyIGRhdGUuXG4gICAqXG4gICAqIEBlbnVtIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxUYWJzLnByb3RvdHlwZS5Dc3NDbGFzc2VzXyA9IHtcbiAgICBUQUJfQ0xBU1M6ICdtZGwtdGFic19fdGFiJyxcbiAgICBQQU5FTF9DTEFTUzogJ21kbC10YWJzX19wYW5lbCcsXG4gICAgQUNUSVZFX0NMQVNTOiAnaXMtYWN0aXZlJyxcbiAgICBVUEdSQURFRF9DTEFTUzogJ2lzLXVwZ3JhZGVkJyxcbiAgICBNRExfSlNfUklQUExFX0VGRkVDVDogJ21kbC1qcy1yaXBwbGUtZWZmZWN0JyxcbiAgICBNRExfUklQUExFX0NPTlRBSU5FUjogJ21kbC10YWJzX19yaXBwbGUtY29udGFpbmVyJyxcbiAgICBNRExfUklQUExFOiAnbWRsLXJpcHBsZScsXG4gICAgTURMX0pTX1JJUFBMRV9FRkZFQ1RfSUdOT1JFX0VWRU5UUzogJ21kbC1qcy1yaXBwbGUtZWZmZWN0LS1pZ25vcmUtZXZlbnRzJ1xufTtcbi8qKlxuICAgKiBIYW5kbGUgY2xpY2tzIHRvIGEgdGFicyBjb21wb25lbnRcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFRhYnMucHJvdG90eXBlLmluaXRUYWJzXyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5NRExfSlNfUklQUExFX0VGRkVDVCkpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uTURMX0pTX1JJUFBMRV9FRkZFQ1RfSUdOT1JFX0VWRU5UUyk7XG4gICAgfVxuICAgIC8vIFNlbGVjdCBlbGVtZW50IHRhYnMsIGRvY3VtZW50IHBhbmVsc1xuICAgIHRoaXMudGFic18gPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgdGhpcy5Dc3NDbGFzc2VzXy5UQUJfQ0xBU1MpO1xuICAgIHRoaXMucGFuZWxzXyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvckFsbCgnLicgKyB0aGlzLkNzc0NsYXNzZXNfLlBBTkVMX0NMQVNTKTtcbiAgICAvLyBDcmVhdGUgbmV3IHRhYnMgZm9yIGVhY2ggdGFiIGVsZW1lbnRcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFic18ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbmV3IE1hdGVyaWFsVGFiKHRoaXMudGFic19baV0sIHRoaXMpO1xuICAgIH1cbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5VUEdSQURFRF9DTEFTUyk7XG59O1xuLyoqXG4gICAqIFJlc2V0IHRhYiBzdGF0ZSwgZHJvcHBpbmcgYWN0aXZlIGNsYXNzZXNcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFRhYnMucHJvdG90eXBlLnJlc2V0VGFiU3RhdGVfID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy50YWJzXy5sZW5ndGg7IGsrKykge1xuICAgICAgICB0aGlzLnRhYnNfW2tdLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5BQ1RJVkVfQ0xBU1MpO1xuICAgIH1cbn07XG4vKipcbiAgICogUmVzZXQgcGFuZWwgc3RhdGUsIGRyb3BpbmcgYWN0aXZlIGNsYXNzZXNcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFRhYnMucHJvdG90eXBlLnJlc2V0UGFuZWxTdGF0ZV8gPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLnBhbmVsc18ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdGhpcy5wYW5lbHNfW2pdLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5BQ1RJVkVfQ0xBU1MpO1xuICAgIH1cbn07XG4vKipcbiAgICogSW5pdGlhbGl6ZSBlbGVtZW50LlxuICAgKi9cbk1hdGVyaWFsVGFicy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50Xykge1xuICAgICAgICB0aGlzLmluaXRUYWJzXygpO1xuICAgIH1cbn07XG4vKipcbiAgICogQ29uc3RydWN0b3IgZm9yIGFuIGluZGl2aWR1YWwgdGFiLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtFbGVtZW50fSB0YWIgVGhlIEhUTUwgZWxlbWVudCBmb3IgdGhlIHRhYi5cbiAgICogQHBhcmFtIHtNYXRlcmlhbFRhYnN9IGN0eCBUaGUgTWF0ZXJpYWxUYWJzIG9iamVjdCB0aGF0IG93bnMgdGhlIHRhYi5cbiAgICovXG5mdW5jdGlvbiBNYXRlcmlhbFRhYih0YWIsIGN0eCkge1xuICAgIGlmICh0YWIpIHtcbiAgICAgICAgaWYgKGN0eC5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnMoY3R4LkNzc0NsYXNzZXNfLk1ETF9KU19SSVBQTEVfRUZGRUNUKSkge1xuICAgICAgICAgICAgdmFyIHJpcHBsZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHJpcHBsZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKGN0eC5Dc3NDbGFzc2VzXy5NRExfUklQUExFX0NPTlRBSU5FUik7XG4gICAgICAgICAgICByaXBwbGVDb250YWluZXIuY2xhc3NMaXN0LmFkZChjdHguQ3NzQ2xhc3Nlc18uTURMX0pTX1JJUFBMRV9FRkZFQ1QpO1xuICAgICAgICAgICAgdmFyIHJpcHBsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHJpcHBsZS5jbGFzc0xpc3QuYWRkKGN0eC5Dc3NDbGFzc2VzXy5NRExfUklQUExFKTtcbiAgICAgICAgICAgIHJpcHBsZUNvbnRhaW5lci5hcHBlbmRDaGlsZChyaXBwbGUpO1xuICAgICAgICAgICAgdGFiLmFwcGVuZENoaWxkKHJpcHBsZUNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGFiLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICh0YWIuZ2V0QXR0cmlidXRlKCdocmVmJykuY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdmFyIGhyZWYgPSB0YWIuaHJlZi5zcGxpdCgnIycpWzFdO1xuICAgICAgICAgICAgICAgIHZhciBwYW5lbCA9IGN0eC5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCcjJyArIGhyZWYpO1xuICAgICAgICAgICAgICAgIGN0eC5yZXNldFRhYlN0YXRlXygpO1xuICAgICAgICAgICAgICAgIGN0eC5yZXNldFBhbmVsU3RhdGVfKCk7XG4gICAgICAgICAgICAgICAgdGFiLmNsYXNzTGlzdC5hZGQoY3R4LkNzc0NsYXNzZXNfLkFDVElWRV9DTEFTUyk7XG4gICAgICAgICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LmFkZChjdHguQ3NzQ2xhc3Nlc18uQUNUSVZFX0NMQVNTKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuLy8gVGhlIGNvbXBvbmVudCByZWdpc3RlcnMgaXRzZWxmLiBJdCBjYW4gYXNzdW1lIGNvbXBvbmVudEhhbmRsZXIgaXMgYXZhaWxhYmxlXG4vLyBpbiB0aGUgZ2xvYmFsIHNjb3BlLlxuY29tcG9uZW50SGFuZGxlci5yZWdpc3Rlcih7XG4gICAgY29uc3RydWN0b3I6IE1hdGVyaWFsVGFicyxcbiAgICBjbGFzc0FzU3RyaW5nOiAnTWF0ZXJpYWxUYWJzJyxcbiAgICBjc3NDbGFzczogJ21kbC1qcy10YWJzJ1xufSk7XG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbi8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3RvciBmb3IgVGV4dGZpZWxkIE1ETCBjb21wb25lbnQuXG4gICAqIEltcGxlbWVudHMgTURMIGNvbXBvbmVudCBkZXNpZ24gcGF0dGVybiBkZWZpbmVkIGF0OlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vamFzb25tYXllcy9tZGwtY29tcG9uZW50LWRlc2lnbi1wYXR0ZXJuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgd2lsbCBiZSB1cGdyYWRlZC5cbiAgICovXG52YXIgTWF0ZXJpYWxUZXh0ZmllbGQgPSBmdW5jdGlvbiBNYXRlcmlhbFRleHRmaWVsZChlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG4gICAgdGhpcy5tYXhSb3dzID0gdGhpcy5Db25zdGFudF8uTk9fTUFYX1JPV1M7XG4gICAgLy8gSW5pdGlhbGl6ZSBpbnN0YW5jZS5cbiAgICB0aGlzLmluaXQoKTtcbn07XG53aW5kb3dbJ01hdGVyaWFsVGV4dGZpZWxkJ10gPSBNYXRlcmlhbFRleHRmaWVsZDtcbi8qKlxuICAgKiBTdG9yZSBjb25zdGFudHMgaW4gb25lIHBsYWNlIHNvIHRoZXkgY2FuIGJlIHVwZGF0ZWQgZWFzaWx5LlxuICAgKlxuICAgKiBAZW51bSB7c3RyaW5nIHwgbnVtYmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5Db25zdGFudF8gPSB7XG4gICAgTk9fTUFYX1JPV1M6IC0xLFxuICAgIE1BWF9ST1dTX0FUVFJJQlVURTogJ21heHJvd3MnXG59O1xuLyoqXG4gICAqIFN0b3JlIHN0cmluZ3MgZm9yIGNsYXNzIG5hbWVzIGRlZmluZWQgYnkgdGhpcyBjb21wb25lbnQgdGhhdCBhcmUgdXNlZCBpblxuICAgKiBKYXZhU2NyaXB0LiBUaGlzIGFsbG93cyB1cyB0byBzaW1wbHkgY2hhbmdlIGl0IGluIG9uZSBwbGFjZSBzaG91bGQgd2VcbiAgICogZGVjaWRlIHRvIG1vZGlmeSBhdCBhIGxhdGVyIGRhdGUuXG4gICAqXG4gICAqIEBlbnVtIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLkNzc0NsYXNzZXNfID0ge1xuICAgIExBQkVMOiAnbWRsLXRleHRmaWVsZF9fbGFiZWwnLFxuICAgIElOUFVUOiAnbWRsLXRleHRmaWVsZF9faW5wdXQnLFxuICAgIElTX0RJUlRZOiAnaXMtZGlydHknLFxuICAgIElTX0ZPQ1VTRUQ6ICdpcy1mb2N1c2VkJyxcbiAgICBJU19ESVNBQkxFRDogJ2lzLWRpc2FibGVkJyxcbiAgICBJU19JTlZBTElEOiAnaXMtaW52YWxpZCcsXG4gICAgSVNfVVBHUkFERUQ6ICdpcy11cGdyYWRlZCcsXG4gICAgSEFTX1BMQUNFSE9MREVSOiAnaGFzLXBsYWNlaG9sZGVyJ1xufTtcbi8qKlxuICAgKiBIYW5kbGUgaW5wdXQgYmVpbmcgZW50ZXJlZC5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLm9uS2V5RG93bl8gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgY3VycmVudFJvd0NvdW50ID0gZXZlbnQudGFyZ2V0LnZhbHVlLnNwbGl0KCdcXG4nKS5sZW5ndGg7XG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgIGlmIChjdXJyZW50Um93Q291bnQgPj0gdGhpcy5tYXhSb3dzKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8qKlxuICAgKiBIYW5kbGUgZm9jdXMuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5vbkZvY3VzXyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0ZPQ1VTRUQpO1xufTtcbi8qKlxuICAgKiBIYW5kbGUgbG9zdCBmb2N1cy5cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLm9uQmx1cl8gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19GT0NVU0VEKTtcbn07XG4vKipcbiAgICogSGFuZGxlIHJlc2V0IGV2ZW50IGZyb20gb3V0IHNpZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5vblJlc2V0XyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMudXBkYXRlQ2xhc3Nlc18oKTtcbn07XG4vKipcbiAgICogSGFuZGxlIGNsYXNzIHVwZGF0ZXMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLnVwZGF0ZUNsYXNzZXNfID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2hlY2tEaXNhYmxlZCgpO1xuICAgIHRoaXMuY2hlY2tWYWxpZGl0eSgpO1xuICAgIHRoaXMuY2hlY2tEaXJ0eSgpO1xuICAgIHRoaXMuY2hlY2tGb2N1cygpO1xufTtcbi8vIFB1YmxpYyBtZXRob2RzLlxuLyoqXG4gICAqIENoZWNrIHRoZSBkaXNhYmxlZCBzdGF0ZSBhbmQgdXBkYXRlIGZpZWxkIGFjY29yZGluZ2x5LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLmNoZWNrRGlzYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaW5wdXRfLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0RJU0FCTEVEKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19ESVNBQkxFRCk7XG4gICAgfVxufTtcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZVsnY2hlY2tEaXNhYmxlZCddID0gTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLmNoZWNrRGlzYWJsZWQ7XG4vKipcbiAgKiBDaGVjayB0aGUgZm9jdXMgc3RhdGUgYW5kIHVwZGF0ZSBmaWVsZCBhY2NvcmRpbmdseS5cbiAgKlxuICAqIEBwdWJsaWNcbiAgKi9cbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5jaGVja0ZvY3VzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChCb29sZWFuKHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvcignOmZvY3VzJykpKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0ZPQ1VTRUQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0ZPQ1VTRUQpO1xuICAgIH1cbn07XG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGVbJ2NoZWNrRm9jdXMnXSA9IE1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5jaGVja0ZvY3VzO1xuLyoqXG4gICAqIENoZWNrIHRoZSB2YWxpZGl0eSBzdGF0ZSBhbmQgdXBkYXRlIGZpZWxkIGFjY29yZGluZ2x5LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLmNoZWNrVmFsaWRpdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaW5wdXRfLnZhbGlkaXR5KSB7XG4gICAgICAgIGlmICh0aGlzLmlucHV0Xy52YWxpZGl0eS52YWxpZCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfSU5WQUxJRCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19JTlZBTElEKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGVbJ2NoZWNrVmFsaWRpdHknXSA9IE1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5jaGVja1ZhbGlkaXR5O1xuLyoqXG4gICAqIENoZWNrIHRoZSBkaXJ0eSBzdGF0ZSBhbmQgdXBkYXRlIGZpZWxkIGFjY29yZGluZ2x5LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLmNoZWNrRGlydHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaW5wdXRfLnZhbHVlICYmIHRoaXMuaW5wdXRfLnZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfRElSVFkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0RJUlRZKTtcbiAgICB9XG59O1xuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlWydjaGVja0RpcnR5J10gPSBNYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuY2hlY2tEaXJ0eTtcbi8qKlxuICAgKiBEaXNhYmxlIHRleHQgZmllbGQuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlucHV0Xy5kaXNhYmxlZCA9IHRydWU7XG4gICAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xufTtcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZVsnZGlzYWJsZSddID0gTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLmRpc2FibGU7XG4vKipcbiAgICogRW5hYmxlIHRleHQgZmllbGQuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5wdXRfLmRpc2FibGVkID0gZmFsc2U7XG4gICAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xufTtcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZVsnZW5hYmxlJ10gPSBNYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuZW5hYmxlO1xuLyoqXG4gICAqIFVwZGF0ZSB0ZXh0IGZpZWxkIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgVGhlIHZhbHVlIHRvIHdoaWNoIHRvIHNldCB0aGUgY29udHJvbCAob3B0aW9uYWwpLlxuICAgKiBAcHVibGljXG4gICAqL1xuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLmNoYW5nZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuaW5wdXRfLnZhbHVlID0gdmFsdWUgfHwgJyc7XG4gICAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xufTtcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZVsnY2hhbmdlJ10gPSBNYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuY2hhbmdlO1xuLyoqXG4gICAqIEluaXRpYWxpemUgZWxlbWVudC5cbiAgICovXG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50Xykge1xuICAgICAgICB0aGlzLmxhYmVsXyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvcignLicgKyB0aGlzLkNzc0NsYXNzZXNfLkxBQkVMKTtcbiAgICAgICAgdGhpcy5pbnB1dF8gPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5Dc3NDbGFzc2VzXy5JTlBVVCk7XG4gICAgICAgIGlmICh0aGlzLmlucHV0Xykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW5wdXRfLmhhc0F0dHJpYnV0ZSh0aGlzLkNvbnN0YW50Xy5NQVhfUk9XU19BVFRSSUJVVEUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXhSb3dzID0gcGFyc2VJbnQodGhpcy5pbnB1dF8uZ2V0QXR0cmlidXRlKHRoaXMuQ29uc3RhbnRfLk1BWF9ST1dTX0FUVFJJQlVURSksIDEwKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4odGhpcy5tYXhSb3dzKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heFJvd3MgPSB0aGlzLkNvbnN0YW50Xy5OT19NQVhfUk9XUztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5pbnB1dF8uaGFzQXR0cmlidXRlKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSEFTX1BMQUNFSE9MREVSKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYm91bmRVcGRhdGVDbGFzc2VzSGFuZGxlciA9IHRoaXMudXBkYXRlQ2xhc3Nlc18uYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuYm91bmRGb2N1c0hhbmRsZXIgPSB0aGlzLm9uRm9jdXNfLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLmJvdW5kQmx1ckhhbmRsZXIgPSB0aGlzLm9uQmx1cl8uYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuYm91bmRSZXNldEhhbmRsZXIgPSB0aGlzLm9uUmVzZXRfLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLmlucHV0Xy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuYm91bmRVcGRhdGVDbGFzc2VzSGFuZGxlcik7XG4gICAgICAgICAgICB0aGlzLmlucHV0Xy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuYm91bmRGb2N1c0hhbmRsZXIpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dF8uYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuYm91bmRCbHVySGFuZGxlcik7XG4gICAgICAgICAgICB0aGlzLmlucHV0Xy5hZGRFdmVudExpc3RlbmVyKCdyZXNldCcsIHRoaXMuYm91bmRSZXNldEhhbmRsZXIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubWF4Um93cyAhPT0gdGhpcy5Db25zdGFudF8uTk9fTUFYX1JPV1MpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBUaGlzIHNob3VsZCBoYW5kbGUgcGFzdGluZyBtdWx0aSBsaW5lIHRleHQuXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudGx5IGRvZXNuJ3QuXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZEtleURvd25IYW5kbGVyID0gdGhpcy5vbktleURvd25fLmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnB1dF8uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuYm91bmRLZXlEb3duSGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaW52YWxpZCA9IHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfSU5WQUxJRCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19VUEdSQURFRCk7XG4gICAgICAgICAgICBpZiAoaW52YWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0lOVkFMSUQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuaW5wdXRfLmhhc0F0dHJpYnV0ZSgnYXV0b2ZvY3VzJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0ZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuLy8gVGhlIGNvbXBvbmVudCByZWdpc3RlcnMgaXRzZWxmLiBJdCBjYW4gYXNzdW1lIGNvbXBvbmVudEhhbmRsZXIgaXMgYXZhaWxhYmxlXG4vLyBpbiB0aGUgZ2xvYmFsIHNjb3BlLlxuY29tcG9uZW50SGFuZGxlci5yZWdpc3Rlcih7XG4gICAgY29uc3RydWN0b3I6IE1hdGVyaWFsVGV4dGZpZWxkLFxuICAgIGNsYXNzQXNTdHJpbmc6ICdNYXRlcmlhbFRleHRmaWVsZCcsXG4gICAgY3NzQ2xhc3M6ICdtZGwtanMtdGV4dGZpZWxkJyxcbiAgICB3aWRnZXQ6IHRydWVcbn0pO1xuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG4vKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IgZm9yIFRvb2x0aXAgTURMIGNvbXBvbmVudC5cbiAgICogSW1wbGVtZW50cyBNREwgY29tcG9uZW50IGRlc2lnbiBwYXR0ZXJuIGRlZmluZWQgYXQ6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNvbm1heWVzL21kbC1jb21wb25lbnQtZGVzaWduLXBhdHRlcm5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCB3aWxsIGJlIHVwZ3JhZGVkLlxuICAgKi9cbnZhciBNYXRlcmlhbFRvb2x0aXAgPSBmdW5jdGlvbiBNYXRlcmlhbFRvb2x0aXAoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuICAgIC8vIEluaXRpYWxpemUgaW5zdGFuY2UuXG4gICAgdGhpcy5pbml0KCk7XG59O1xud2luZG93WydNYXRlcmlhbFRvb2x0aXAnXSA9IE1hdGVyaWFsVG9vbHRpcDtcbi8qKlxuICAgKiBTdG9yZSBjb25zdGFudHMgaW4gb25lIHBsYWNlIHNvIHRoZXkgY2FuIGJlIHVwZGF0ZWQgZWFzaWx5LlxuICAgKlxuICAgKiBAZW51bSB7c3RyaW5nIHwgbnVtYmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsVG9vbHRpcC5wcm90b3R5cGUuQ29uc3RhbnRfID0ge307XG4vKipcbiAgICogU3RvcmUgc3RyaW5ncyBmb3IgY2xhc3MgbmFtZXMgZGVmaW5lZCBieSB0aGlzIGNvbXBvbmVudCB0aGF0IGFyZSB1c2VkIGluXG4gICAqIEphdmFTY3JpcHQuIFRoaXMgYWxsb3dzIHVzIHRvIHNpbXBseSBjaGFuZ2UgaXQgaW4gb25lIHBsYWNlIHNob3VsZCB3ZVxuICAgKiBkZWNpZGUgdG8gbW9kaWZ5IGF0IGEgbGF0ZXIgZGF0ZS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFRvb2x0aXAucHJvdG90eXBlLkNzc0NsYXNzZXNfID0ge1xuICAgIElTX0FDVElWRTogJ2lzLWFjdGl2ZScsXG4gICAgQk9UVE9NOiAnbWRsLXRvb2x0aXAtLWJvdHRvbScsXG4gICAgTEVGVDogJ21kbC10b29sdGlwLS1sZWZ0JyxcbiAgICBSSUdIVDogJ21kbC10b29sdGlwLS1yaWdodCcsXG4gICAgVE9QOiAnbWRsLXRvb2x0aXAtLXRvcCdcbn07XG4vKipcbiAgICogSGFuZGxlIG1vdXNlZW50ZXIgZm9yIHRvb2x0aXAuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsVG9vbHRpcC5wcm90b3R5cGUuaGFuZGxlTW91c2VFbnRlcl8gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgcHJvcHMgPSBldmVudC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdmFyIGxlZnQgPSBwcm9wcy5sZWZ0ICsgcHJvcHMud2lkdGggLyAyO1xuICAgIHZhciB0b3AgPSBwcm9wcy50b3AgKyBwcm9wcy5oZWlnaHQgLyAyO1xuICAgIHZhciBtYXJnaW5MZWZ0ID0gLTEgKiAodGhpcy5lbGVtZW50Xy5vZmZzZXRXaWR0aCAvIDIpO1xuICAgIHZhciBtYXJnaW5Ub3AgPSAtMSAqICh0aGlzLmVsZW1lbnRfLm9mZnNldEhlaWdodCAvIDIpO1xuICAgIGlmICh0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLkxFRlQpIHx8IHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uUklHSFQpKSB7XG4gICAgICAgIGxlZnQgPSBwcm9wcy53aWR0aCAvIDI7XG4gICAgICAgIGlmICh0b3AgKyBtYXJnaW5Ub3AgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLnN0eWxlLnRvcCA9ICcwJztcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uc3R5bGUubWFyZ2luVG9wID0gJzAnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5zdHlsZS5tYXJnaW5Ub3AgPSBtYXJnaW5Ub3AgKyAncHgnO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGxlZnQgKyBtYXJnaW5MZWZ0IDwgMCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5zdHlsZS5tYXJnaW5MZWZ0ID0gJzAnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLnN0eWxlLm1hcmdpbkxlZnQgPSBtYXJnaW5MZWZ0ICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5UT1ApKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uc3R5bGUudG9wID0gcHJvcHMudG9wIC0gdGhpcy5lbGVtZW50Xy5vZmZzZXRIZWlnaHQgLSAxMCArICdweCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLlJJR0hUKSkge1xuICAgICAgICB0aGlzLmVsZW1lbnRfLnN0eWxlLmxlZnQgPSBwcm9wcy5sZWZ0ICsgcHJvcHMud2lkdGggKyAxMCArICdweCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLkxFRlQpKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uc3R5bGUubGVmdCA9IHByb3BzLmxlZnQgLSB0aGlzLmVsZW1lbnRfLm9mZnNldFdpZHRoIC0gMTAgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uc3R5bGUudG9wID0gcHJvcHMudG9wICsgcHJvcHMuaGVpZ2h0ICsgMTAgKyAncHgnO1xuICAgIH1cbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19BQ1RJVkUpO1xufTtcbi8qKlxuICAgKiBIaWRlIHRvb2x0aXAgb24gbW91c2VsZWF2ZSBvciBzY3JvbGxcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFRvb2x0aXAucHJvdG90eXBlLmhpZGVUb29sdGlwXyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19BQ1RJVkUpO1xufTtcbi8qKlxuICAgKiBJbml0aWFsaXplIGVsZW1lbnQuXG4gICAqL1xuTWF0ZXJpYWxUb29sdGlwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfKSB7XG4gICAgICAgIHZhciBmb3JFbElkID0gdGhpcy5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ2ZvcicpIHx8IHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKCdkYXRhLW1kbC1mb3InKTtcbiAgICAgICAgaWYgKGZvckVsSWQpIHtcbiAgICAgICAgICAgIHRoaXMuZm9yRWxlbWVudF8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmb3JFbElkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5mb3JFbGVtZW50Xykge1xuICAgICAgICAgICAgLy8gSXQncyBsZWZ0IGhlcmUgYmVjYXVzZSBpdCBwcmV2ZW50cyBhY2NpZGVudGFsIHRleHQgc2VsZWN0aW9uIG9uIEFuZHJvaWRcbiAgICAgICAgICAgIGlmICghdGhpcy5mb3JFbGVtZW50Xy5oYXNBdHRyaWJ1dGUoJ3RhYmluZGV4JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvckVsZW1lbnRfLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ib3VuZE1vdXNlRW50ZXJIYW5kbGVyID0gdGhpcy5oYW5kbGVNb3VzZUVudGVyXy5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5ib3VuZE1vdXNlTGVhdmVBbmRTY3JvbGxIYW5kbGVyID0gdGhpcy5oaWRlVG9vbHRpcF8uYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuZm9yRWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuYm91bmRNb3VzZUVudGVySGFuZGxlciwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5mb3JFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuYm91bmRNb3VzZUVudGVySGFuZGxlciwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5mb3JFbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5ib3VuZE1vdXNlTGVhdmVBbmRTY3JvbGxIYW5kbGVyLCBmYWxzZSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5ib3VuZE1vdXNlTGVhdmVBbmRTY3JvbGxIYW5kbGVyLCB0cnVlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5ib3VuZE1vdXNlTGVhdmVBbmRTY3JvbGxIYW5kbGVyKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG4vLyBUaGUgY29tcG9uZW50IHJlZ2lzdGVycyBpdHNlbGYuIEl0IGNhbiBhc3N1bWUgY29tcG9uZW50SGFuZGxlciBpcyBhdmFpbGFibGVcbi8vIGluIHRoZSBnbG9iYWwgc2NvcGUuXG5jb21wb25lbnRIYW5kbGVyLnJlZ2lzdGVyKHtcbiAgICBjb25zdHJ1Y3RvcjogTWF0ZXJpYWxUb29sdGlwLFxuICAgIGNsYXNzQXNTdHJpbmc6ICdNYXRlcmlhbFRvb2x0aXAnLFxuICAgIGNzc0NsYXNzOiAnbWRsLXRvb2x0aXAnXG59KTtcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDE1IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yIGZvciBMYXlvdXQgTURMIGNvbXBvbmVudC5cbiAgICogSW1wbGVtZW50cyBNREwgY29tcG9uZW50IGRlc2lnbiBwYXR0ZXJuIGRlZmluZWQgYXQ6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNvbm1heWVzL21kbC1jb21wb25lbnQtZGVzaWduLXBhdHRlcm5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCB3aWxsIGJlIHVwZ3JhZGVkLlxuICAgKi9cbnZhciBNYXRlcmlhbExheW91dCA9IGZ1bmN0aW9uIE1hdGVyaWFsTGF5b3V0KGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcbiAgICAvLyBJbml0aWFsaXplIGluc3RhbmNlLlxuICAgIHRoaXMuaW5pdCgpO1xufTtcbndpbmRvd1snTWF0ZXJpYWxMYXlvdXQnXSA9IE1hdGVyaWFsTGF5b3V0O1xuLyoqXG4gICAqIFN0b3JlIGNvbnN0YW50cyBpbiBvbmUgcGxhY2Ugc28gdGhleSBjYW4gYmUgdXBkYXRlZCBlYXNpbHkuXG4gICAqXG4gICAqIEBlbnVtIHtzdHJpbmcgfCBudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxMYXlvdXQucHJvdG90eXBlLkNvbnN0YW50XyA9IHtcbiAgICBNQVhfV0lEVEg6ICcobWF4LXdpZHRoOiAxMDI0cHgpJyxcbiAgICBUQUJfU0NST0xMX1BJWEVMUzogMTAwLFxuICAgIFJFU0laRV9USU1FT1VUOiAxMDAsXG4gICAgTUVOVV9JQ09OOiAnJiN4RTVEMjsnLFxuICAgIENIRVZST05fTEVGVDogJ2NoZXZyb25fbGVmdCcsXG4gICAgQ0hFVlJPTl9SSUdIVDogJ2NoZXZyb25fcmlnaHQnXG59O1xuLyoqXG4gICAqIEtleWNvZGVzLCBmb3IgY29kZSByZWFkYWJpbGl0eS5cbiAgICpcbiAgICogQGVudW0ge251bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbExheW91dC5wcm90b3R5cGUuS2V5Y29kZXNfID0ge1xuICAgIEVOVEVSOiAxMyxcbiAgICBFU0NBUEU6IDI3LFxuICAgIFNQQUNFOiAzMlxufTtcbi8qKlxuICAgKiBNb2Rlcy5cbiAgICpcbiAgICogQGVudW0ge251bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbExheW91dC5wcm90b3R5cGUuTW9kZV8gPSB7XG4gICAgU1RBTkRBUkQ6IDAsXG4gICAgU0VBTUVEOiAxLFxuICAgIFdBVEVSRkFMTDogMixcbiAgICBTQ1JPTEw6IDNcbn07XG4vKipcbiAgICogU3RvcmUgc3RyaW5ncyBmb3IgY2xhc3MgbmFtZXMgZGVmaW5lZCBieSB0aGlzIGNvbXBvbmVudCB0aGF0IGFyZSB1c2VkIGluXG4gICAqIEphdmFTY3JpcHQuIFRoaXMgYWxsb3dzIHVzIHRvIHNpbXBseSBjaGFuZ2UgaXQgaW4gb25lIHBsYWNlIHNob3VsZCB3ZVxuICAgKiBkZWNpZGUgdG8gbW9kaWZ5IGF0IGEgbGF0ZXIgZGF0ZS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbExheW91dC5wcm90b3R5cGUuQ3NzQ2xhc3Nlc18gPSB7XG4gICAgQ09OVEFJTkVSOiAnbWRsLWxheW91dF9fY29udGFpbmVyJyxcbiAgICBIRUFERVI6ICdtZGwtbGF5b3V0X19oZWFkZXInLFxuICAgIERSQVdFUjogJ21kbC1sYXlvdXRfX2RyYXdlcicsXG4gICAgQ09OVEVOVDogJ21kbC1sYXlvdXRfX2NvbnRlbnQnLFxuICAgIERSQVdFUl9CVE46ICdtZGwtbGF5b3V0X19kcmF3ZXItYnV0dG9uJyxcbiAgICBJQ09OOiAnbWF0ZXJpYWwtaWNvbnMnLFxuICAgIEpTX1JJUFBMRV9FRkZFQ1Q6ICdtZGwtanMtcmlwcGxlLWVmZmVjdCcsXG4gICAgUklQUExFX0NPTlRBSU5FUjogJ21kbC1sYXlvdXRfX3RhYi1yaXBwbGUtY29udGFpbmVyJyxcbiAgICBSSVBQTEU6ICdtZGwtcmlwcGxlJyxcbiAgICBSSVBQTEVfSUdOT1JFX0VWRU5UUzogJ21kbC1qcy1yaXBwbGUtZWZmZWN0LS1pZ25vcmUtZXZlbnRzJyxcbiAgICBIRUFERVJfU0VBTUVEOiAnbWRsLWxheW91dF9faGVhZGVyLS1zZWFtZWQnLFxuICAgIEhFQURFUl9XQVRFUkZBTEw6ICdtZGwtbGF5b3V0X19oZWFkZXItLXdhdGVyZmFsbCcsXG4gICAgSEVBREVSX1NDUk9MTDogJ21kbC1sYXlvdXRfX2hlYWRlci0tc2Nyb2xsJyxcbiAgICBGSVhFRF9IRUFERVI6ICdtZGwtbGF5b3V0LS1maXhlZC1oZWFkZXInLFxuICAgIE9CRlVTQ0FUT1I6ICdtZGwtbGF5b3V0X19vYmZ1c2NhdG9yJyxcbiAgICBUQUJfQkFSOiAnbWRsLWxheW91dF9fdGFiLWJhcicsXG4gICAgVEFCX0NPTlRBSU5FUjogJ21kbC1sYXlvdXRfX3RhYi1iYXItY29udGFpbmVyJyxcbiAgICBUQUI6ICdtZGwtbGF5b3V0X190YWInLFxuICAgIFRBQl9CQVJfQlVUVE9OOiAnbWRsLWxheW91dF9fdGFiLWJhci1idXR0b24nLFxuICAgIFRBQl9CQVJfTEVGVF9CVVRUT046ICdtZGwtbGF5b3V0X190YWItYmFyLWxlZnQtYnV0dG9uJyxcbiAgICBUQUJfQkFSX1JJR0hUX0JVVFRPTjogJ21kbC1sYXlvdXRfX3RhYi1iYXItcmlnaHQtYnV0dG9uJyxcbiAgICBUQUJfTUFOVUFMX1NXSVRDSDogJ21kbC1sYXlvdXRfX3RhYi1tYW51YWwtc3dpdGNoJyxcbiAgICBQQU5FTDogJ21kbC1sYXlvdXRfX3RhYi1wYW5lbCcsXG4gICAgSEFTX0RSQVdFUjogJ2hhcy1kcmF3ZXInLFxuICAgIEhBU19UQUJTOiAnaGFzLXRhYnMnLFxuICAgIEhBU19TQ1JPTExJTkdfSEVBREVSOiAnaGFzLXNjcm9sbGluZy1oZWFkZXInLFxuICAgIENBU1RJTkdfU0hBRE9XOiAnaXMtY2FzdGluZy1zaGFkb3cnLFxuICAgIElTX0NPTVBBQ1Q6ICdpcy1jb21wYWN0JyxcbiAgICBJU19TTUFMTF9TQ1JFRU46ICdpcy1zbWFsbC1zY3JlZW4nLFxuICAgIElTX0RSQVdFUl9PUEVOOiAnaXMtdmlzaWJsZScsXG4gICAgSVNfQUNUSVZFOiAnaXMtYWN0aXZlJyxcbiAgICBJU19VUEdSQURFRDogJ2lzLXVwZ3JhZGVkJyxcbiAgICBJU19BTklNQVRJTkc6ICdpcy1hbmltYXRpbmcnLFxuICAgIE9OX0xBUkdFX1NDUkVFTjogJ21kbC1sYXlvdXQtLWxhcmdlLXNjcmVlbi1vbmx5JyxcbiAgICBPTl9TTUFMTF9TQ1JFRU46ICdtZGwtbGF5b3V0LS1zbWFsbC1zY3JlZW4tb25seSdcbn07XG4vKipcbiAgICogSGFuZGxlcyBzY3JvbGxpbmcgb24gdGhlIGNvbnRlbnQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxMYXlvdXQucHJvdG90eXBlLmNvbnRlbnRTY3JvbGxIYW5kbGVyXyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5oZWFkZXJfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLklTX0FOSU1BVElORykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaGVhZGVyVmlzaWJsZSA9ICF0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLklTX1NNQUxMX1NDUkVFTikgfHwgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5GSVhFRF9IRUFERVIpO1xuICAgIGlmICh0aGlzLmNvbnRlbnRfLnNjcm9sbFRvcCA+IDAgJiYgIXRoaXMuaGVhZGVyXy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5JU19DT01QQUNUKSkge1xuICAgICAgICB0aGlzLmhlYWRlcl8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLkNBU1RJTkdfU0hBRE9XKTtcbiAgICAgICAgdGhpcy5oZWFkZXJfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19DT01QQUNUKTtcbiAgICAgICAgaWYgKGhlYWRlclZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuaGVhZGVyXy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfQU5JTUFUSU5HKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5jb250ZW50Xy5zY3JvbGxUb3AgPD0gMCAmJiB0aGlzLmhlYWRlcl8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfQ09NUEFDVCkpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5DQVNUSU5HX1NIQURPVyk7XG4gICAgICAgIHRoaXMuaGVhZGVyXy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfQ09NUEFDVCk7XG4gICAgICAgIGlmIChoZWFkZXJWaXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWRlcl8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0FOSU1BVElORyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuLyoqXG4gICAqIEhhbmRsZXMgYSBrZXlib2FyZCBldmVudCBvbiB0aGUgZHJhd2VyLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxMYXlvdXQucHJvdG90eXBlLmtleWJvYXJkRXZlbnRIYW5kbGVyXyA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAvLyBPbmx5IHJlYWN0IHdoZW4gdGhlIGRyYXdlciBpcyBvcGVuLlxuICAgIGlmIChldnQua2V5Q29kZSA9PT0gdGhpcy5LZXljb2Rlc18uRVNDQVBFICYmIHRoaXMuZHJhd2VyXy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5JU19EUkFXRVJfT1BFTikpIHtcbiAgICAgICAgdGhpcy50b2dnbGVEcmF3ZXIoKTtcbiAgICB9XG59O1xuLyoqXG4gICAqIEhhbmRsZXMgY2hhbmdlcyBpbiBzY3JlZW4gc2l6ZS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbExheW91dC5wcm90b3R5cGUuc2NyZWVuU2l6ZUhhbmRsZXJfID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnNjcmVlblNpemVNZWRpYVF1ZXJ5Xy5tYXRjaGVzKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX1NNQUxMX1NDUkVFTik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfU01BTExfU0NSRUVOKTtcbiAgICAgICAgLy8gQ29sbGFwc2UgZHJhd2VyIChpZiBhbnkpIHdoZW4gbW92aW5nIHRvIGEgbGFyZ2Ugc2NyZWVuIHNpemUuXG4gICAgICAgIGlmICh0aGlzLmRyYXdlcl8pIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd2VyXy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfRFJBV0VSX09QRU4pO1xuICAgICAgICAgICAgdGhpcy5vYmZ1c2NhdG9yXy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfRFJBV0VSX09QRU4pO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8qKlxuICAgKiBIYW5kbGVzIGV2ZW50cyBvZiBkcmF3ZXIgYnV0dG9uLlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxMYXlvdXQucHJvdG90eXBlLmRyYXdlclRvZ2dsZUhhbmRsZXJfID0gZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmIChldnQgJiYgZXZ0LnR5cGUgPT09ICdrZXlkb3duJykge1xuICAgICAgICBpZiAoZXZ0LmtleUNvZGUgPT09IHRoaXMuS2V5Y29kZXNfLlNQQUNFIHx8IGV2dC5rZXlDb2RlID09PSB0aGlzLktleWNvZGVzXy5FTlRFUikge1xuICAgICAgICAgICAgLy8gcHJldmVudCBzY3JvbGxpbmcgaW4gZHJhd2VyIG5hdlxuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBwcmV2ZW50IG90aGVyIGtleXNcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRvZ2dsZURyYXdlcigpO1xufTtcbi8qKlxuICAgKiBIYW5kbGVzICh1bilzZXR0aW5nIHRoZSBgaXMtYW5pbWF0aW5nYCBjbGFzc1xuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsTGF5b3V0LnByb3RvdHlwZS5oZWFkZXJUcmFuc2l0aW9uRW5kSGFuZGxlcl8gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5oZWFkZXJfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19BTklNQVRJTkcpO1xufTtcbi8qKlxuICAgKiBIYW5kbGVzIGV4cGFuZGluZyB0aGUgaGVhZGVyIG9uIGNsaWNrXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxMYXlvdXQucHJvdG90eXBlLmhlYWRlckNsaWNrSGFuZGxlcl8gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaGVhZGVyXy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5JU19DT01QQUNUKSkge1xuICAgICAgICB0aGlzLmhlYWRlcl8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0NPTVBBQ1QpO1xuICAgICAgICB0aGlzLmhlYWRlcl8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0FOSU1BVElORyk7XG4gICAgfVxufTtcbi8qKlxuICAgKiBSZXNldCB0YWIgc3RhdGUsIGRyb3BwaW5nIGFjdGl2ZSBjbGFzc2VzXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxMYXlvdXQucHJvdG90eXBlLnJlc2V0VGFiU3RhdGVfID0gZnVuY3Rpb24gKHRhYkJhcikge1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGFiQmFyLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHRhYkJhcltrXS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfQUNUSVZFKTtcbiAgICB9XG59O1xuLyoqXG4gICAqIFJlc2V0IHBhbmVsIHN0YXRlLCBkcm9waW5nIGFjdGl2ZSBjbGFzc2VzXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxMYXlvdXQucHJvdG90eXBlLnJlc2V0UGFuZWxTdGF0ZV8gPSBmdW5jdGlvbiAocGFuZWxzKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBwYW5lbHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgcGFuZWxzW2pdLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5JU19BQ1RJVkUpO1xuICAgIH1cbn07XG4vKipcbiAgKiBUb2dnbGUgZHJhd2VyIHN0YXRlXG4gICpcbiAgKiBAcHVibGljXG4gICovXG5NYXRlcmlhbExheW91dC5wcm90b3R5cGUudG9nZ2xlRHJhd2VyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkcmF3ZXJCdXR0b24gPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5Dc3NDbGFzc2VzXy5EUkFXRVJfQlROKTtcbiAgICB0aGlzLmRyYXdlcl8uY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLkNzc0NsYXNzZXNfLklTX0RSQVdFUl9PUEVOKTtcbiAgICB0aGlzLm9iZnVzY2F0b3JfLmNsYXNzTGlzdC50b2dnbGUodGhpcy5Dc3NDbGFzc2VzXy5JU19EUkFXRVJfT1BFTik7XG4gICAgLy8gU2V0IGFjY2Vzc2liaWxpdHkgcHJvcGVydGllcy5cbiAgICBpZiAodGhpcy5kcmF3ZXJfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLklTX0RSQVdFUl9PUEVOKSkge1xuICAgICAgICB0aGlzLmRyYXdlcl8uc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgICBkcmF3ZXJCdXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRyYXdlcl8uc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICAgIGRyYXdlckJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcbiAgICB9XG59O1xuTWF0ZXJpYWxMYXlvdXQucHJvdG90eXBlWyd0b2dnbGVEcmF3ZXInXSA9IE1hdGVyaWFsTGF5b3V0LnByb3RvdHlwZS50b2dnbGVEcmF3ZXI7XG4vKipcbiAgICogSW5pdGlhbGl6ZSBlbGVtZW50LlxuICAgKi9cbk1hdGVyaWFsTGF5b3V0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfKSB7XG4gICAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5DT05UQUlORVIpO1xuICAgICAgICB2YXIgZm9jdXNlZEVsZW1lbnQgPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoJzpmb2N1cycpO1xuICAgICAgICB0aGlzLmVsZW1lbnRfLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNvbnRhaW5lciwgdGhpcy5lbGVtZW50Xyk7XG4gICAgICAgIHRoaXMuZWxlbWVudF8ucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICAgICAgICBpZiAoZm9jdXNlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGZvY3VzZWRFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRpcmVjdENoaWxkcmVuID0gdGhpcy5lbGVtZW50Xy5jaGlsZE5vZGVzO1xuICAgICAgICB2YXIgbnVtQ2hpbGRyZW4gPSBkaXJlY3RDaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgbnVtQ2hpbGRyZW47IGMrKykge1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gZGlyZWN0Q2hpbGRyZW5bY107XG4gICAgICAgICAgICBpZiAoY2hpbGQuY2xhc3NMaXN0ICYmIGNoaWxkLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLkhFQURFUikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWRlcl8gPSBjaGlsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGlsZC5jbGFzc0xpc3QgJiYgY2hpbGQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uRFJBV0VSKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd2VyXyA9IGNoaWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNoaWxkLmNsYXNzTGlzdCAmJiBjaGlsZC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5DT05URU5UKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudF8gPSBjaGlsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncGFnZXNob3cnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUucGVyc2lzdGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gd2hlbiBwYWdlIGlzIGxvYWRlZCBmcm9tIGJhY2svZm9yd2FyZCBjYWNoZVxuICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgcmVwYWludCB0byBsZXQgbGF5b3V0IHNjcm9sbCBpbiBzYWZhcmlcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRfLnN0eWxlLm92ZXJmbG93WSA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uc3R5bGUub3ZlcmZsb3dZID0gJyc7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgIGlmICh0aGlzLmhlYWRlcl8pIHtcbiAgICAgICAgICAgIHRoaXMudGFiQmFyXyA9IHRoaXMuaGVhZGVyXy5xdWVyeVNlbGVjdG9yKCcuJyArIHRoaXMuQ3NzQ2xhc3Nlc18uVEFCX0JBUik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1vZGUgPSB0aGlzLk1vZGVfLlNUQU5EQVJEO1xuICAgICAgICBpZiAodGhpcy5oZWFkZXJfKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFkZXJfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLkhFQURFUl9TRUFNRUQpKSB7XG4gICAgICAgICAgICAgICAgbW9kZSA9IHRoaXMuTW9kZV8uU0VBTUVEO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhlYWRlcl8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uSEVBREVSX1dBVEVSRkFMTCkpIHtcbiAgICAgICAgICAgICAgICBtb2RlID0gdGhpcy5Nb2RlXy5XQVRFUkZBTEw7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkZXJfLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCB0aGlzLmhlYWRlclRyYW5zaXRpb25FbmRIYW5kbGVyXy5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWRlcl8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhlYWRlckNsaWNrSGFuZGxlcl8uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGVhZGVyXy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5IRUFERVJfU0NST0xMKSkge1xuICAgICAgICAgICAgICAgIG1vZGUgPSB0aGlzLk1vZGVfLlNDUk9MTDtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLkhBU19TQ1JPTExJTkdfSEVBREVSKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtb2RlID09PSB0aGlzLk1vZGVfLlNUQU5EQVJEKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkZXJfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5DQVNUSU5HX1NIQURPVyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGFiQmFyXykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYkJhcl8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLkNBU1RJTkdfU0hBRE9XKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IHRoaXMuTW9kZV8uU0VBTUVEIHx8IG1vZGUgPT09IHRoaXMuTW9kZV8uU0NST0xMKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkZXJfLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5Dc3NDbGFzc2VzXy5DQVNUSU5HX1NIQURPVyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGFiQmFyXykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYkJhcl8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLkNBU1RJTkdfU0hBRE9XKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IHRoaXMuTW9kZV8uV0FURVJGQUxMKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIGFuZCByZW1vdmUgc2hhZG93cyBkZXBlbmRpbmcgb24gc2Nyb2xsIHBvc2l0aW9uLlxuICAgICAgICAgICAgICAgIC8vIEFsc28gYWRkL3JlbW92ZSBhdXhpbGlhcnkgY2xhc3MgZm9yIHN0eWxpbmcgb2YgdGhlIGNvbXBhY3QgdmVyc2lvbiBvZlxuICAgICAgICAgICAgICAgIC8vIHRoZSBoZWFkZXIuXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50Xy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLmNvbnRlbnRTY3JvbGxIYW5kbGVyXy5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRTY3JvbGxIYW5kbGVyXygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCBkcmF3ZXIgdG9nZ2xpbmcgYnV0dG9uIHRvIG91ciBsYXlvdXQsIGlmIHdlIGhhdmUgYW4gb3BlbmFibGUgZHJhd2VyLlxuICAgICAgICBpZiAodGhpcy5kcmF3ZXJfKSB7XG4gICAgICAgICAgICB2YXIgZHJhd2VyQnV0dG9uID0gdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCcuJyArIHRoaXMuQ3NzQ2xhc3Nlc18uRFJBV0VSX0JUTik7XG4gICAgICAgICAgICBpZiAoIWRyYXdlckJ1dHRvbikge1xuICAgICAgICAgICAgICAgIGRyYXdlckJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGRyYXdlckJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICAgICAgICBkcmF3ZXJCdXR0b24uc2V0QXR0cmlidXRlKCdyb2xlJywgJ2J1dHRvbicpO1xuICAgICAgICAgICAgICAgIGRyYXdlckJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcbiAgICAgICAgICAgICAgICBkcmF3ZXJCdXR0b24uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLkRSQVdFUl9CVE4pO1xuICAgICAgICAgICAgICAgIHZhciBkcmF3ZXJCdXR0b25JY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xuICAgICAgICAgICAgICAgIGRyYXdlckJ1dHRvbkljb24uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklDT04pO1xuICAgICAgICAgICAgICAgIGRyYXdlckJ1dHRvbkljb24uaW5uZXJIVE1MID0gdGhpcy5Db25zdGFudF8uTUVOVV9JQ09OO1xuICAgICAgICAgICAgICAgIGRyYXdlckJ1dHRvbi5hcHBlbmRDaGlsZChkcmF3ZXJCdXR0b25JY29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmRyYXdlcl8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uT05fTEFSR0VfU0NSRUVOKSkge1xuICAgICAgICAgICAgICAgIC8vSWYgZHJhd2VyIGhhcyBPTl9MQVJHRV9TQ1JFRU4gY2xhc3MgdGhlbiBhZGQgaXQgdG8gdGhlIGRyYXdlciB0b2dnbGUgYnV0dG9uIGFzIHdlbGwuXG4gICAgICAgICAgICAgICAgZHJhd2VyQnV0dG9uLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5PTl9MQVJHRV9TQ1JFRU4pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRyYXdlcl8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uT05fU01BTExfU0NSRUVOKSkge1xuICAgICAgICAgICAgICAgIC8vSWYgZHJhd2VyIGhhcyBPTl9TTUFMTF9TQ1JFRU4gY2xhc3MgdGhlbiBhZGQgaXQgdG8gdGhlIGRyYXdlciB0b2dnbGUgYnV0dG9uIGFzIHdlbGwuXG4gICAgICAgICAgICAgICAgZHJhd2VyQnV0dG9uLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5PTl9TTUFMTF9TQ1JFRU4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZHJhd2VyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5kcmF3ZXJUb2dnbGVIYW5kbGVyXy5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGRyYXdlckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5kcmF3ZXJUb2dnbGVIYW5kbGVyXy5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIC8vIEFkZCBhIGNsYXNzIGlmIHRoZSBsYXlvdXQgaGFzIGEgZHJhd2VyLCBmb3IgYWx0ZXJpbmcgdGhlIGxlZnQgcGFkZGluZy5cbiAgICAgICAgICAgIC8vIEFkZHMgdGhlIEhBU19EUkFXRVIgdG8gdGhlIGVsZW1lbnRzIHNpbmNlIHRoaXMuaGVhZGVyXyBtYXkgb3IgbWF5XG4gICAgICAgICAgICAvLyBub3QgYmUgcHJlc2VudC5cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLkhBU19EUkFXRVIpO1xuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIGZpeGVkIGhlYWRlciwgYWRkIHRoZSBidXR0b24gdG8gdGhlIGhlYWRlciByYXRoZXIgdGhhblxuICAgICAgICAgICAgLy8gdGhlIGxheW91dC5cbiAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLkZJWEVEX0hFQURFUikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWRlcl8uaW5zZXJ0QmVmb3JlKGRyYXdlckJ1dHRvbiwgdGhpcy5oZWFkZXJfLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmluc2VydEJlZm9yZShkcmF3ZXJCdXR0b24sIHRoaXMuY29udGVudF8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9iZnVzY2F0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIG9iZnVzY2F0b3IuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLk9CRlVTQ0FUT1IpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5hcHBlbmRDaGlsZChvYmZ1c2NhdG9yKTtcbiAgICAgICAgICAgIG9iZnVzY2F0b3IuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRyYXdlclRvZ2dsZUhhbmRsZXJfLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5vYmZ1c2NhdG9yXyA9IG9iZnVzY2F0b3I7XG4gICAgICAgICAgICB0aGlzLmRyYXdlcl8uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5Ym9hcmRFdmVudEhhbmRsZXJfLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5kcmF3ZXJfLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEtlZXAgYW4gZXllIG9uIHNjcmVlbiBzaXplLCBhbmQgYWRkL3JlbW92ZSBhdXhpbGlhcnkgY2xhc3MgZm9yIHN0eWxpbmdcbiAgICAgICAgLy8gb2Ygc21hbGwgc2NyZWVucy5cbiAgICAgICAgdGhpcy5zY3JlZW5TaXplTWVkaWFRdWVyeV8gPSB3aW5kb3cubWF0Y2hNZWRpYSh0aGlzLkNvbnN0YW50Xy5NQVhfV0lEVEgpO1xuICAgICAgICB0aGlzLnNjcmVlblNpemVNZWRpYVF1ZXJ5Xy5hZGRMaXN0ZW5lcih0aGlzLnNjcmVlblNpemVIYW5kbGVyXy5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5zY3JlZW5TaXplSGFuZGxlcl8oKTtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB0YWJzLCBpZiBhbnkuXG4gICAgICAgIGlmICh0aGlzLmhlYWRlcl8gJiYgdGhpcy50YWJCYXJfKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5IQVNfVEFCUyk7XG4gICAgICAgICAgICB2YXIgdGFiQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0YWJDb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlRBQl9DT05UQUlORVIpO1xuICAgICAgICAgICAgdGhpcy5oZWFkZXJfLmluc2VydEJlZm9yZSh0YWJDb250YWluZXIsIHRoaXMudGFiQmFyXyk7XG4gICAgICAgICAgICB0aGlzLmhlYWRlcl8ucmVtb3ZlQ2hpbGQodGhpcy50YWJCYXJfKTtcbiAgICAgICAgICAgIHZhciBsZWZ0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBsZWZ0QnV0dG9uLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5UQUJfQkFSX0JVVFRPTik7XG4gICAgICAgICAgICBsZWZ0QnV0dG9uLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5UQUJfQkFSX0xFRlRfQlVUVE9OKTtcbiAgICAgICAgICAgIHZhciBsZWZ0QnV0dG9uSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2knKTtcbiAgICAgICAgICAgIGxlZnRCdXR0b25JY29uLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JQ09OKTtcbiAgICAgICAgICAgIGxlZnRCdXR0b25JY29uLnRleHRDb250ZW50ID0gdGhpcy5Db25zdGFudF8uQ0hFVlJPTl9MRUZUO1xuICAgICAgICAgICAgbGVmdEJ1dHRvbi5hcHBlbmRDaGlsZChsZWZ0QnV0dG9uSWNvbik7XG4gICAgICAgICAgICBsZWZ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGFiQmFyXy5zY3JvbGxMZWZ0IC09IHRoaXMuQ29uc3RhbnRfLlRBQl9TQ1JPTExfUElYRUxTO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHZhciByaWdodEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgcmlnaHRCdXR0b24uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLlRBQl9CQVJfQlVUVE9OKTtcbiAgICAgICAgICAgIHJpZ2h0QnV0dG9uLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5UQUJfQkFSX1JJR0hUX0JVVFRPTik7XG4gICAgICAgICAgICB2YXIgcmlnaHRCdXR0b25JY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xuICAgICAgICAgICAgcmlnaHRCdXR0b25JY29uLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JQ09OKTtcbiAgICAgICAgICAgIHJpZ2h0QnV0dG9uSWNvbi50ZXh0Q29udGVudCA9IHRoaXMuQ29uc3RhbnRfLkNIRVZST05fUklHSFQ7XG4gICAgICAgICAgICByaWdodEJ1dHRvbi5hcHBlbmRDaGlsZChyaWdodEJ1dHRvbkljb24pO1xuICAgICAgICAgICAgcmlnaHRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJCYXJfLnNjcm9sbExlZnQgKz0gdGhpcy5Db25zdGFudF8uVEFCX1NDUk9MTF9QSVhFTFM7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGFiQ29udGFpbmVyLmFwcGVuZENoaWxkKGxlZnRCdXR0b24pO1xuICAgICAgICAgICAgdGFiQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMudGFiQmFyXyk7XG4gICAgICAgICAgICB0YWJDb250YWluZXIuYXBwZW5kQ2hpbGQocmlnaHRCdXR0b24pO1xuICAgICAgICAgICAgLy8gQWRkIGFuZCByZW1vdmUgdGFiIGJ1dHRvbnMgZGVwZW5kaW5nIG9uIHNjcm9sbCBwb3NpdGlvbiBhbmQgdG90YWxcbiAgICAgICAgICAgIC8vIHdpbmRvdyBzaXplLlxuICAgICAgICAgICAgdmFyIHRhYlVwZGF0ZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGFiQmFyXy5zY3JvbGxMZWZ0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0QnV0dG9uLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19BQ1RJVkUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnRCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0FDVElWRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRhYkJhcl8uc2Nyb2xsTGVmdCA8IHRoaXMudGFiQmFyXy5zY3JvbGxXaWR0aCAtIHRoaXMudGFiQmFyXy5vZmZzZXRXaWR0aCkge1xuICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvbi5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfQUNUSVZFKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfQUNUSVZFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnRhYkJhcl8uYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGFiVXBkYXRlSGFuZGxlcik7XG4gICAgICAgICAgICB0YWJVcGRhdGVIYW5kbGVyKCk7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGFicyB3aGVuIHRoZSB3aW5kb3cgcmVzaXplcy5cbiAgICAgICAgICAgIHZhciB3aW5kb3dSZXNpemVIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIFVzZSB0aW1lb3V0cyB0byBtYWtlIHN1cmUgaXQgZG9lc24ndCBoYXBwZW4gdG9vIG9mdGVuLlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlc2l6ZVRpbWVvdXRJZF8pIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVzaXplVGltZW91dElkXyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucmVzaXplVGltZW91dElkXyA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0YWJVcGRhdGVIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzaXplVGltZW91dElkXyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCB0aGlzLkNvbnN0YW50Xy5SRVNJWkVfVElNRU9VVCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgd2luZG93UmVzaXplSGFuZGxlcik7XG4gICAgICAgICAgICBpZiAodGhpcy50YWJCYXJfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLkpTX1JJUFBMRV9FRkZFQ1QpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJCYXJfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEVfSUdOT1JFX0VWRU5UUyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTZWxlY3QgZWxlbWVudCB0YWJzLCBkb2N1bWVudCBwYW5lbHNcbiAgICAgICAgICAgIHZhciB0YWJzID0gdGhpcy50YWJCYXJfLnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgdGhpcy5Dc3NDbGFzc2VzXy5UQUIpO1xuICAgICAgICAgICAgdmFyIHBhbmVscyA9IHRoaXMuY29udGVudF8ucXVlcnlTZWxlY3RvckFsbCgnLicgKyB0aGlzLkNzc0NsYXNzZXNfLlBBTkVMKTtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgdGFicyBmb3IgZWFjaCB0YWIgZWxlbWVudFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbmV3IE1hdGVyaWFsTGF5b3V0VGFiKHRhYnNbaV0sIHRhYnMsIHBhbmVscywgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVVBHUkFERUQpO1xuICAgIH1cbn07XG4vKipcbiAgICogQ29uc3RydWN0b3IgZm9yIGFuIGluZGl2aWR1YWwgdGFiLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFiIFRoZSBIVE1MIGVsZW1lbnQgZm9yIHRoZSB0YWIuXG4gICAqIEBwYXJhbSB7IUFycmF5PEhUTUxFbGVtZW50Pn0gdGFicyBBcnJheSB3aXRoIEhUTUwgZWxlbWVudHMgZm9yIGFsbCB0YWJzLlxuICAgKiBAcGFyYW0geyFBcnJheTxIVE1MRWxlbWVudD59IHBhbmVscyBBcnJheSB3aXRoIEhUTUwgZWxlbWVudHMgZm9yIGFsbCBwYW5lbHMuXG4gICAqIEBwYXJhbSB7TWF0ZXJpYWxMYXlvdXR9IGxheW91dCBUaGUgTWF0ZXJpYWxMYXlvdXQgb2JqZWN0IHRoYXQgb3ducyB0aGUgdGFiLlxuICAgKi9cbmZ1bmN0aW9uIE1hdGVyaWFsTGF5b3V0VGFiKHRhYiwgdGFicywgcGFuZWxzLCBsYXlvdXQpIHtcbiAgICAvKipcbiAgICAgKiBBdXhpbGlhcnkgbWV0aG9kIHRvIHByb2dyYW1tYXRpY2FsbHkgc2VsZWN0IGEgdGFiIGluIHRoZSBVSS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzZWxlY3RUYWIoKSB7XG4gICAgICAgIHZhciBocmVmID0gdGFiLmhyZWYuc3BsaXQoJyMnKVsxXTtcbiAgICAgICAgdmFyIHBhbmVsID0gbGF5b3V0LmNvbnRlbnRfLnF1ZXJ5U2VsZWN0b3IoJyMnICsgaHJlZik7XG4gICAgICAgIGxheW91dC5yZXNldFRhYlN0YXRlXyh0YWJzKTtcbiAgICAgICAgbGF5b3V0LnJlc2V0UGFuZWxTdGF0ZV8ocGFuZWxzKTtcbiAgICAgICAgdGFiLmNsYXNzTGlzdC5hZGQobGF5b3V0LkNzc0NsYXNzZXNfLklTX0FDVElWRSk7XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC5hZGQobGF5b3V0LkNzc0NsYXNzZXNfLklTX0FDVElWRSk7XG4gICAgfVxuICAgIGlmIChsYXlvdXQudGFiQmFyXy5jbGFzc0xpc3QuY29udGFpbnMobGF5b3V0LkNzc0NsYXNzZXNfLkpTX1JJUFBMRV9FRkZFQ1QpKSB7XG4gICAgICAgIHZhciByaXBwbGVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHJpcHBsZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKGxheW91dC5Dc3NDbGFzc2VzXy5SSVBQTEVfQ09OVEFJTkVSKTtcbiAgICAgICAgcmlwcGxlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQobGF5b3V0LkNzc0NsYXNzZXNfLkpTX1JJUFBMRV9FRkZFQ1QpO1xuICAgICAgICB2YXIgcmlwcGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICByaXBwbGUuY2xhc3NMaXN0LmFkZChsYXlvdXQuQ3NzQ2xhc3Nlc18uUklQUExFKTtcbiAgICAgICAgcmlwcGxlQ29udGFpbmVyLmFwcGVuZENoaWxkKHJpcHBsZSk7XG4gICAgICAgIHRhYi5hcHBlbmRDaGlsZChyaXBwbGVDb250YWluZXIpO1xuICAgIH1cbiAgICBpZiAoIWxheW91dC50YWJCYXJfLmNsYXNzTGlzdC5jb250YWlucyhsYXlvdXQuQ3NzQ2xhc3Nlc18uVEFCX01BTlVBTF9TV0lUQ0gpKSB7XG4gICAgICAgIHRhYi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAodGFiLmdldEF0dHJpYnV0ZSgnaHJlZicpLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHNlbGVjdFRhYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdGFiLnNob3cgPSBzZWxlY3RUYWI7XG59XG53aW5kb3dbJ01hdGVyaWFsTGF5b3V0VGFiJ10gPSBNYXRlcmlhbExheW91dFRhYjtcbi8vIFRoZSBjb21wb25lbnQgcmVnaXN0ZXJzIGl0c2VsZi4gSXQgY2FuIGFzc3VtZSBjb21wb25lbnRIYW5kbGVyIGlzIGF2YWlsYWJsZVxuLy8gaW4gdGhlIGdsb2JhbCBzY29wZS5cbmNvbXBvbmVudEhhbmRsZXIucmVnaXN0ZXIoe1xuICAgIGNvbnN0cnVjdG9yOiBNYXRlcmlhbExheW91dCxcbiAgICBjbGFzc0FzU3RyaW5nOiAnTWF0ZXJpYWxMYXlvdXQnLFxuICAgIGNzc0NsYXNzOiAnbWRsLWpzLWxheW91dCdcbn0pO1xuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG4vKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IgZm9yIERhdGEgVGFibGUgQ2FyZCBNREwgY29tcG9uZW50LlxuICAgKiBJbXBsZW1lbnRzIE1ETCBjb21wb25lbnQgZGVzaWduIHBhdHRlcm4gZGVmaW5lZCBhdDpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2phc29ubWF5ZXMvbWRsLWNvbXBvbmVudC1kZXNpZ24tcGF0dGVyblxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgd2lsbCBiZSB1cGdyYWRlZC5cbiAgICovXG52YXIgTWF0ZXJpYWxEYXRhVGFibGUgPSBmdW5jdGlvbiBNYXRlcmlhbERhdGFUYWJsZShlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG4gICAgLy8gSW5pdGlhbGl6ZSBpbnN0YW5jZS5cbiAgICB0aGlzLmluaXQoKTtcbn07XG53aW5kb3dbJ01hdGVyaWFsRGF0YVRhYmxlJ10gPSBNYXRlcmlhbERhdGFUYWJsZTtcbi8qKlxuICAgKiBTdG9yZSBjb25zdGFudHMgaW4gb25lIHBsYWNlIHNvIHRoZXkgY2FuIGJlIHVwZGF0ZWQgZWFzaWx5LlxuICAgKlxuICAgKiBAZW51bSB7c3RyaW5nIHwgbnVtYmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsRGF0YVRhYmxlLnByb3RvdHlwZS5Db25zdGFudF8gPSB7fTtcbi8qKlxuICAgKiBTdG9yZSBzdHJpbmdzIGZvciBjbGFzcyBuYW1lcyBkZWZpbmVkIGJ5IHRoaXMgY29tcG9uZW50IHRoYXQgYXJlIHVzZWQgaW5cbiAgICogSmF2YVNjcmlwdC4gVGhpcyBhbGxvd3MgdXMgdG8gc2ltcGx5IGNoYW5nZSBpdCBpbiBvbmUgcGxhY2Ugc2hvdWxkIHdlXG4gICAqIGRlY2lkZSB0byBtb2RpZnkgYXQgYSBsYXRlciBkYXRlLlxuICAgKlxuICAgKiBAZW51bSB7c3RyaW5nfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsRGF0YVRhYmxlLnByb3RvdHlwZS5Dc3NDbGFzc2VzXyA9IHtcbiAgICBEQVRBX1RBQkxFOiAnbWRsLWRhdGEtdGFibGUnLFxuICAgIFNFTEVDVEFCTEU6ICdtZGwtZGF0YS10YWJsZS0tc2VsZWN0YWJsZScsXG4gICAgU0VMRUNUX0VMRU1FTlQ6ICdtZGwtZGF0YS10YWJsZV9fc2VsZWN0JyxcbiAgICBJU19TRUxFQ1RFRDogJ2lzLXNlbGVjdGVkJyxcbiAgICBJU19VUEdSQURFRDogJ2lzLXVwZ3JhZGVkJ1xufTtcbi8qKlxuICAgKiBHZW5lcmF0ZXMgYW5kIHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHRvZ2dsZXMgdGhlIHNlbGVjdGlvbiBzdGF0ZSBvZiBhXG4gICAqIHNpbmdsZSByb3cgKG9yIG11bHRpcGxlIHJvd3MpLlxuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGNoZWNrYm94IENoZWNrYm94IHRoYXQgdG9nZ2xlcyB0aGUgc2VsZWN0aW9uIHN0YXRlLlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHJvdyBSb3cgdG8gdG9nZ2xlIHdoZW4gY2hlY2tib3ggY2hhbmdlcy5cbiAgICogQHBhcmFtIHsoQXJyYXk8T2JqZWN0PnxOb2RlTGlzdCk9fSBvcHRfcm93cyBSb3dzIHRvIHRvZ2dsZSB3aGVuIGNoZWNrYm94IGNoYW5nZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxEYXRhVGFibGUucHJvdG90eXBlLnNlbGVjdFJvd18gPSBmdW5jdGlvbiAoY2hlY2tib3gsIHJvdywgb3B0X3Jvd3MpIHtcbiAgICBpZiAocm93KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2tib3guY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHJvdy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfU0VMRUNURUQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3cuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX1NFTEVDVEVEKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgIH1cbiAgICBpZiAob3B0X3Jvd3MpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgdmFyIGVsO1xuICAgICAgICAgICAgaWYgKGNoZWNrYm94LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb3B0X3Jvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZWwgPSBvcHRfcm93c1tpXS5xdWVyeVNlbGVjdG9yKCd0ZCcpLnF1ZXJ5U2VsZWN0b3IoJy5tZGwtY2hlY2tib3gnKTtcbiAgICAgICAgICAgICAgICAgICAgZWxbJ01hdGVyaWFsQ2hlY2tib3gnXS5jaGVjaygpO1xuICAgICAgICAgICAgICAgICAgICBvcHRfcm93c1tpXS5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfU0VMRUNURUQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG9wdF9yb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsID0gb3B0X3Jvd3NbaV0ucXVlcnlTZWxlY3RvcigndGQnKS5xdWVyeVNlbGVjdG9yKCcubWRsLWNoZWNrYm94Jyk7XG4gICAgICAgICAgICAgICAgICAgIGVsWydNYXRlcmlhbENoZWNrYm94J10udW5jaGVjaygpO1xuICAgICAgICAgICAgICAgICAgICBvcHRfcm93c1tpXS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfU0VMRUNURUQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgIH1cbn07XG4vKipcbiAgICogQ3JlYXRlcyBhIGNoZWNrYm94IGZvciBhIHNpbmdsZSBvciBvciBtdWx0aXBsZSByb3dzIGFuZCBob29rcyB1cCB0aGVcbiAgICogZXZlbnQgaGFuZGxpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gcm93IFJvdyB0byB0b2dnbGUgd2hlbiBjaGVja2JveCBjaGFuZ2VzLlxuICAgKiBAcGFyYW0geyhBcnJheTxPYmplY3Q+fE5vZGVMaXN0KT19IG9wdF9yb3dzIFJvd3MgdG8gdG9nZ2xlIHdoZW4gY2hlY2tib3ggY2hhbmdlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbERhdGFUYWJsZS5wcm90b3R5cGUuY3JlYXRlQ2hlY2tib3hfID0gZnVuY3Rpb24gKHJvdywgb3B0X3Jvd3MpIHtcbiAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIHZhciBsYWJlbENsYXNzZXMgPSBbXG4gICAgICAgICdtZGwtY2hlY2tib3gnLFxuICAgICAgICAnbWRsLWpzLWNoZWNrYm94JyxcbiAgICAgICAgJ21kbC1qcy1yaXBwbGUtZWZmZWN0JyxcbiAgICAgICAgdGhpcy5Dc3NDbGFzc2VzXy5TRUxFQ1RfRUxFTUVOVFxuICAgIF07XG4gICAgbGFiZWwuY2xhc3NOYW1lID0gbGFiZWxDbGFzc2VzLmpvaW4oJyAnKTtcbiAgICB2YXIgY2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGNoZWNrYm94LnR5cGUgPSAnY2hlY2tib3gnO1xuICAgIGNoZWNrYm94LmNsYXNzTGlzdC5hZGQoJ21kbC1jaGVja2JveF9faW5wdXQnKTtcbiAgICBpZiAocm93KSB7XG4gICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSByb3cuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfU0VMRUNURUQpO1xuICAgICAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLnNlbGVjdFJvd18oY2hlY2tib3gsIHJvdykpO1xuICAgIH0gZWxzZSBpZiAob3B0X3Jvd3MpIHtcbiAgICAgICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5zZWxlY3RSb3dfKGNoZWNrYm94LCBudWxsLCBvcHRfcm93cykpO1xuICAgIH1cbiAgICBsYWJlbC5hcHBlbmRDaGlsZChjaGVja2JveCk7XG4gICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlRWxlbWVudChsYWJlbCwgJ01hdGVyaWFsQ2hlY2tib3gnKTtcbiAgICByZXR1cm4gbGFiZWw7XG59O1xuLyoqXG4gICAqIEluaXRpYWxpemUgZWxlbWVudC5cbiAgICovXG5NYXRlcmlhbERhdGFUYWJsZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50Xykge1xuICAgICAgICB2YXIgZmlyc3RIZWFkZXIgPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoJ3RoJyk7XG4gICAgICAgIHZhciBib2R5Um93cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvckFsbCgndGJvZHkgdHInKSk7XG4gICAgICAgIHZhciBmb290Um93cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvckFsbCgndGZvb3QgdHInKSk7XG4gICAgICAgIHZhciByb3dzID0gYm9keVJvd3MuY29uY2F0KGZvb3RSb3dzKTtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuQ3NzQ2xhc3Nlc18uU0VMRUNUQUJMRSkpIHtcbiAgICAgICAgICAgIHZhciB0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgICAgICAgICB2YXIgaGVhZGVyQ2hlY2tib3ggPSB0aGlzLmNyZWF0ZUNoZWNrYm94XyhudWxsLCByb3dzKTtcbiAgICAgICAgICAgIHRoLmFwcGVuZENoaWxkKGhlYWRlckNoZWNrYm94KTtcbiAgICAgICAgICAgIGZpcnN0SGVhZGVyLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoLCBmaXJzdEhlYWRlcik7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZmlyc3RDZWxsID0gcm93c1tpXS5xdWVyeVNlbGVjdG9yKCd0ZCcpO1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdENlbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvd3NbaV0ucGFyZW50Tm9kZS5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnVEJPRFknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcm93Q2hlY2tib3ggPSB0aGlzLmNyZWF0ZUNoZWNrYm94Xyhyb3dzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRkLmFwcGVuZENoaWxkKHJvd0NoZWNrYm94KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByb3dzW2ldLmluc2VydEJlZm9yZSh0ZCwgZmlyc3RDZWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19VUEdSQURFRCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuLy8gVGhlIGNvbXBvbmVudCByZWdpc3RlcnMgaXRzZWxmLiBJdCBjYW4gYXNzdW1lIGNvbXBvbmVudEhhbmRsZXIgaXMgYXZhaWxhYmxlXG4vLyBpbiB0aGUgZ2xvYmFsIHNjb3BlLlxuY29tcG9uZW50SGFuZGxlci5yZWdpc3Rlcih7XG4gICAgY29uc3RydWN0b3I6IE1hdGVyaWFsRGF0YVRhYmxlLFxuICAgIGNsYXNzQXNTdHJpbmc6ICdNYXRlcmlhbERhdGFUYWJsZScsXG4gICAgY3NzQ2xhc3M6ICdtZGwtanMtZGF0YS10YWJsZSdcbn0pO1xuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG4vKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IgZm9yIFJpcHBsZSBNREwgY29tcG9uZW50LlxuICAgKiBJbXBsZW1lbnRzIE1ETCBjb21wb25lbnQgZGVzaWduIHBhdHRlcm4gZGVmaW5lZCBhdDpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2phc29ubWF5ZXMvbWRsLWNvbXBvbmVudC1kZXNpZ24tcGF0dGVyblxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBncmFkZWQuXG4gICAqL1xudmFyIE1hdGVyaWFsUmlwcGxlID0gZnVuY3Rpb24gTWF0ZXJpYWxSaXBwbGUoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuICAgIC8vIEluaXRpYWxpemUgaW5zdGFuY2UuXG4gICAgdGhpcy5pbml0KCk7XG59O1xud2luZG93WydNYXRlcmlhbFJpcHBsZSddID0gTWF0ZXJpYWxSaXBwbGU7XG4vKipcbiAgICogU3RvcmUgY29uc3RhbnRzIGluIG9uZSBwbGFjZSBzbyB0aGV5IGNhbiBiZSB1cGRhdGVkIGVhc2lseS5cbiAgICpcbiAgICogQGVudW0ge3N0cmluZyB8IG51bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFJpcHBsZS5wcm90b3R5cGUuQ29uc3RhbnRfID0ge1xuICAgIElOSVRJQUxfU0NBTEU6ICdzY2FsZSgwLjAwMDEsIDAuMDAwMSknLFxuICAgIElOSVRJQUxfU0laRTogJzFweCcsXG4gICAgSU5JVElBTF9PUEFDSVRZOiAnMC40JyxcbiAgICBGSU5BTF9PUEFDSVRZOiAnMCcsXG4gICAgRklOQUxfU0NBTEU6ICcnXG59O1xuLyoqXG4gICAqIFN0b3JlIHN0cmluZ3MgZm9yIGNsYXNzIG5hbWVzIGRlZmluZWQgYnkgdGhpcyBjb21wb25lbnQgdGhhdCBhcmUgdXNlZCBpblxuICAgKiBKYXZhU2NyaXB0LiBUaGlzIGFsbG93cyB1cyB0byBzaW1wbHkgY2hhbmdlIGl0IGluIG9uZSBwbGFjZSBzaG91bGQgd2VcbiAgICogZGVjaWRlIHRvIG1vZGlmeSBhdCBhIGxhdGVyIGRhdGUuXG4gICAqXG4gICAqIEBlbnVtIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuTWF0ZXJpYWxSaXBwbGUucHJvdG90eXBlLkNzc0NsYXNzZXNfID0ge1xuICAgIFJJUFBMRV9DRU5URVI6ICdtZGwtcmlwcGxlLS1jZW50ZXInLFxuICAgIFJJUFBMRV9FRkZFQ1RfSUdOT1JFX0VWRU5UUzogJ21kbC1qcy1yaXBwbGUtZWZmZWN0LS1pZ25vcmUtZXZlbnRzJyxcbiAgICBSSVBQTEU6ICdtZGwtcmlwcGxlJyxcbiAgICBJU19BTklNQVRJTkc6ICdpcy1hbmltYXRpbmcnLFxuICAgIElTX1ZJU0lCTEU6ICdpcy12aXNpYmxlJ1xufTtcbi8qKlxuICAgKiBIYW5kbGUgbW91c2UgLyBmaW5nZXIgZG93biBvbiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG5NYXRlcmlhbFJpcHBsZS5wcm90b3R5cGUuZG93bkhhbmRsZXJfID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLnJpcHBsZUVsZW1lbnRfLnN0eWxlLndpZHRoICYmICF0aGlzLnJpcHBsZUVsZW1lbnRfLnN0eWxlLmhlaWdodCkge1xuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWxlbWVudF8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRoaXMuYm91bmRIZWlnaHQgPSByZWN0LmhlaWdodDtcbiAgICAgICAgdGhpcy5ib3VuZFdpZHRoID0gcmVjdC53aWR0aDtcbiAgICAgICAgdGhpcy5yaXBwbGVTaXplXyA9IE1hdGguc3FydChyZWN0LndpZHRoICogcmVjdC53aWR0aCArIHJlY3QuaGVpZ2h0ICogcmVjdC5oZWlnaHQpICogMiArIDI7XG4gICAgICAgIHRoaXMucmlwcGxlRWxlbWVudF8uc3R5bGUud2lkdGggPSB0aGlzLnJpcHBsZVNpemVfICsgJ3B4JztcbiAgICAgICAgdGhpcy5yaXBwbGVFbGVtZW50Xy5zdHlsZS5oZWlnaHQgPSB0aGlzLnJpcHBsZVNpemVfICsgJ3B4JztcbiAgICB9XG4gICAgdGhpcy5yaXBwbGVFbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVklTSUJMRSk7XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIHRoaXMuaWdub3JpbmdNb3VzZURvd25fKSB7XG4gICAgICAgIHRoaXMuaWdub3JpbmdNb3VzZURvd25fID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuICAgICAgICAgICAgdGhpcy5pZ25vcmluZ01vdXNlRG93bl8gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmcmFtZUNvdW50ID0gdGhpcy5nZXRGcmFtZUNvdW50KCk7XG4gICAgICAgIGlmIChmcmFtZUNvdW50ID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0RnJhbWVDb3VudCgxKTtcbiAgICAgICAgdmFyIGJvdW5kID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdmFyIHg7XG4gICAgICAgIHZhciB5O1xuICAgICAgICAvLyBDaGVjayBpZiB3ZSBhcmUgaGFuZGxpbmcgYSBrZXlib2FyZCBjbGljay5cbiAgICAgICAgaWYgKGV2ZW50LmNsaWVudFggPT09IDAgJiYgZXZlbnQuY2xpZW50WSA9PT0gMCkge1xuICAgICAgICAgICAgeCA9IE1hdGgucm91bmQoYm91bmQud2lkdGggLyAyKTtcbiAgICAgICAgICAgIHkgPSBNYXRoLnJvdW5kKGJvdW5kLmhlaWdodCAvIDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGNsaWVudFggPSBldmVudC5jbGllbnRYICE9PSB1bmRlZmluZWQgPyBldmVudC5jbGllbnRYIDogZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgdmFyIGNsaWVudFkgPSBldmVudC5jbGllbnRZICE9PSB1bmRlZmluZWQgPyBldmVudC5jbGllbnRZIDogZXZlbnQudG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgICAgICAgeCA9IE1hdGgucm91bmQoY2xpZW50WCAtIGJvdW5kLmxlZnQpO1xuICAgICAgICAgICAgeSA9IE1hdGgucm91bmQoY2xpZW50WSAtIGJvdW5kLnRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRSaXBwbGVYWSh4LCB5KTtcbiAgICAgICAgdGhpcy5zZXRSaXBwbGVTdHlsZXModHJ1ZSk7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltRnJhbWVIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgIH1cbn07XG4vKipcbiAgICogSGFuZGxlIG1vdXNlIC8gZmluZ2VyIHVwIG9uIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbk1hdGVyaWFsUmlwcGxlLnByb3RvdHlwZS51cEhhbmRsZXJfID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gRG9uJ3QgZmlyZSBmb3IgdGhlIGFydGlmaWNpYWwgXCJtb3VzZXVwXCIgZ2VuZXJhdGVkIGJ5IGEgZG91YmxlLWNsaWNrLlxuICAgIGlmIChldmVudCAmJiBldmVudC5kZXRhaWwgIT09IDIpIHtcbiAgICAgICAgLy8gQWxsb3cgYSByZXBhaW50IHRvIG9jY3VyIGJlZm9yZSByZW1vdmluZyB0aGlzIGNsYXNzLCBzbyB0aGUgYW5pbWF0aW9uXG4gICAgICAgIC8vIHNob3dzIGZvciB0YXAgZXZlbnRzLCB3aGljaCBzZWVtIHRvIHRyaWdnZXIgYSBtb3VzZXVwIHRvbyBzb29uIGFmdGVyXG4gICAgICAgIC8vIG1vdXNlZG93bi5cbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5yaXBwbGVFbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfVklTSUJMRSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgMCk7XG4gICAgfVxufTtcbi8qKlxuICAgKiBJbml0aWFsaXplIGVsZW1lbnQuXG4gICAqL1xuTWF0ZXJpYWxSaXBwbGUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudF8pIHtcbiAgICAgICAgdmFyIHJlY2VudGVyaW5nID0gdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuY29udGFpbnModGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEVfQ0VOVEVSKTtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLkNzc0NsYXNzZXNfLlJJUFBMRV9FRkZFQ1RfSUdOT1JFX0VWRU5UUykpIHtcbiAgICAgICAgICAgIHRoaXMucmlwcGxlRWxlbWVudF8gPSB0aGlzLmVsZW1lbnRfLnF1ZXJ5U2VsZWN0b3IoJy4nICsgdGhpcy5Dc3NDbGFzc2VzXy5SSVBQTEUpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZUNvdW50XyA9IDA7XG4gICAgICAgICAgICB0aGlzLnJpcHBsZVNpemVfID0gMDtcbiAgICAgICAgICAgIHRoaXMueF8gPSAwO1xuICAgICAgICAgICAgdGhpcy55XyA9IDA7XG4gICAgICAgICAgICAvLyBUb3VjaCBzdGFydCBwcm9kdWNlcyBhIGNvbXBhdCBtb3VzZSBkb3duIGV2ZW50LCB3aGljaCB3b3VsZCBjYXVzZSBhXG4gICAgICAgICAgICAvLyBzZWNvbmQgcmlwcGxlcy4gVG8gYXZvaWQgdGhhdCwgd2UgdXNlIHRoaXMgcHJvcGVydHkgdG8gaWdub3JlIHRoZSBmaXJzdFxuICAgICAgICAgICAgLy8gbW91c2UgZG93biBhZnRlciBhIHRvdWNoIHN0YXJ0LlxuICAgICAgICAgICAgdGhpcy5pZ25vcmluZ01vdXNlRG93bl8gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYm91bmREb3duSGFuZGxlciA9IHRoaXMuZG93bkhhbmRsZXJfLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuYm91bmREb3duSGFuZGxlcik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLmJvdW5kRG93bkhhbmRsZXIpO1xuICAgICAgICAgICAgdGhpcy5ib3VuZFVwSGFuZGxlciA9IHRoaXMudXBIYW5kbGVyXy5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50Xy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5ib3VuZFVwSGFuZGxlcik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRfLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLmJvdW5kVXBIYW5kbGVyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLmJvdW5kVXBIYW5kbGVyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudF8uYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuYm91bmRVcEhhbmRsZXIpO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAqIEdldHRlciBmb3IgZnJhbWVDb3VudF8uXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIGZyYW1lIGNvdW50LlxuICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuZ2V0RnJhbWVDb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mcmFtZUNvdW50XztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICogU2V0dGVyIGZvciBmcmFtZUNvdW50Xy5cbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGZDIHRoZSBmcmFtZSBjb3VudC5cbiAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnNldEZyYW1lQ291bnQgPSBmdW5jdGlvbiAoZkMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lQ291bnRfID0gZkM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAqIEdldHRlciBmb3IgcmlwcGxlRWxlbWVudF8uXG4gICAgICAgICAqIEByZXR1cm4ge0VsZW1lbnR9IHRoZSByaXBwbGUgZWxlbWVudC5cbiAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmdldFJpcHBsZUVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmlwcGxlRWxlbWVudF87XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAqIFNldHMgdGhlIHJpcHBsZSBYIGFuZCBZIGNvb3JkaW5hdGVzLlxuICAgICAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IG5ld1ggdGhlIG5ldyBYIGNvb3JkaW5hdGVcbiAgICAgICAgICogQHBhcmFtICB7bnVtYmVyfSBuZXdZIHRoZSBuZXcgWSBjb29yZGluYXRlXG4gICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5zZXRSaXBwbGVYWSA9IGZ1bmN0aW9uIChuZXdYLCBuZXdZKSB7XG4gICAgICAgICAgICAgICAgdGhpcy54XyA9IG5ld1g7XG4gICAgICAgICAgICAgICAgdGhpcy55XyA9IG5ld1k7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAqIFNldHMgdGhlIHJpcHBsZSBzdHlsZXMuXG4gICAgICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IHN0YXJ0IHdoZXRoZXIgb3Igbm90IHRoaXMgaXMgdGhlIHN0YXJ0IGZyYW1lLlxuICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuc2V0UmlwcGxlU3R5bGVzID0gZnVuY3Rpb24gKHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmlwcGxlRWxlbWVudF8gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zZm9ybVN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjYWxlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICd0cmFuc2xhdGUoJyArIHRoaXMueF8gKyAncHgsICcgKyB0aGlzLnlfICsgJ3B4KSc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGUgPSB0aGlzLkNvbnN0YW50Xy5JTklUSUFMX1NDQUxFO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IHRoaXMuQ29uc3RhbnRfLklOSVRJQUxfU0laRTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlID0gdGhpcy5Db25zdGFudF8uRklOQUxfU0NBTEU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gdGhpcy5yaXBwbGVTaXplXyArICdweCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVjZW50ZXJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAndHJhbnNsYXRlKCcgKyB0aGlzLmJvdW5kV2lkdGggLyAyICsgJ3B4LCAnICsgdGhpcy5ib3VuZEhlaWdodCAvIDIgKyAncHgpJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1TdHJpbmcgPSAndHJhbnNsYXRlKC01MCUsIC01MCUpICcgKyBvZmZzZXQgKyBzY2FsZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yaXBwbGVFbGVtZW50Xy5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0cmFuc2Zvcm1TdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmlwcGxlRWxlbWVudF8uc3R5bGUubXNUcmFuc2Zvcm0gPSB0cmFuc2Zvcm1TdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmlwcGxlRWxlbWVudF8uc3R5bGUudHJhbnNmb3JtID0gdHJhbnNmb3JtU3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmlwcGxlRWxlbWVudF8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0FOSU1BVElORyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJpcHBsZUVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19BTklNQVRJTkcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGVzIGFuIGFuaW1hdGlvbiBmcmFtZS5cbiAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmFuaW1GcmFtZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJhbWVDb3VudF8tLSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1GcmFtZUhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRSaXBwbGVTdHlsZXMoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59O1xuLy8gVGhlIGNvbXBvbmVudCByZWdpc3RlcnMgaXRzZWxmLiBJdCBjYW4gYXNzdW1lIGNvbXBvbmVudEhhbmRsZXIgaXMgYXZhaWxhYmxlXG4vLyBpbiB0aGUgZ2xvYmFsIHNjb3BlLlxuY29tcG9uZW50SGFuZGxlci5yZWdpc3Rlcih7XG4gICAgY29uc3RydWN0b3I6IE1hdGVyaWFsUmlwcGxlLFxuICAgIGNsYXNzQXNTdHJpbmc6ICdNYXRlcmlhbFJpcHBsZScsXG4gICAgY3NzQ2xhc3M6ICdtZGwtanMtcmlwcGxlLWVmZmVjdCcsXG4gICAgd2lkZ2V0OiBmYWxzZVxufSk7XG59KCkpO1xuIl19
