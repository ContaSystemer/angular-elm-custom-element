/**
 * @ngdoc service
 * @module shared
 * @name customElementWrapper
 * @subtitle A helper service to wrap AngularJS components/directives with custom elements
 *
 * @description
 * We would like to reuse some of existing AngularJS components in Elm.
 * Thus we need a way to wrap AngularJS components with custom elements.
 * So this service contains helper functions for that.
 */
angular
    .module('shared', [])
    .factory('customElementWrapper', function (_, $rootScope, $compile, $window, $injector) {
        'use strict';

        var service = {
            create: create,
            helper: {
                decode: decode,
            },
            decode: {
                /**
                 * @ngdoc method
                 * @name customElementWrapper#decode.boolean
                 *
                 * @description
                 * Creates a setter to decode boolean
                 *
                 * @param {boolean} value Boolean value.
                 */
                boolean: decode({
                    assert: _.isBoolean,
                    type: 'boolean',
                }),
                /**
                 * @ngdoc method
                 * @name customElementWrapper#decode.integer
                 *
                 * @description
                 * Creates a setter to decode integer
                 *
                 * @param {number} value Integer value.
                 */
                integer: decode({
                    assert: _.isInteger,
                    type: 'integer',
                }),
                /**
                 * @ngdoc method
                 * @name customElementWrapper#decode.string
                 *
                 * @description
                 * Creates a setter to decode string
                 *
                 * @param {string} value String value.
                 */
                string: decode({
                    assert: _.isString,
                    type: 'string',
                }),
                /**
                 * @ngdoc method
                 * @name customElementWrapper#decode.object
                 *
                 * @description
                 * Creates a setter to decode object
                 *
                 * @param {Object} value Object value.
                 */
                object: decode({
                    assert: _.isPlainObject,
                    type: 'object',
                }),
            },
            encode: {
                /**
                 * @ngdoc method
                 * @name customElementWrapper#encode.identity
                 *
                 * @description
                 * Encodes value as is.
                 *
                 * @param {*} value Any value to encode.
                 * @returns {*} Same value as given. If value is undefined `null` will be returns.
                 */
                identity: _.identity,
            },
        };

        service.private = {
            customElements: {},
        };

        return service;

        /**
         * @ngdoc type
         * @module shared
         * @name CustomElementWrapperCreateOptions
         * @subtitle Represents create options for custom element wrapper
         *
         * @description
         * This type is used for {@link customElementWrapper} service `create` method.
         *
         * @property {Array} [attrs] An array of attribute strings. If attributes from the list will be found in custom element
         * they will be replicated to AngularJS component. This is useful when in AngularJS component one uses `$attrs[attrName]` directly.
         *
         * Example usage:
         * ```
         * attrs: ['attr-1', 'attr-2',...]
         * ```
         *
         * On Elm side to specify an attribute one can do following
         * ```
         * import Shared.Html.Attributes.Extra as Attrs
         *
         * ...
         *
         * [ Attrs.conditional condition <|
         *     Attrs.attribute "attr-1" ""
         * , Attrs.conditional condition <|
         *     Attrs.attribute "attr-2" ""
         * , ...
         * ]
         * ```
         * @property {Array} [interpolations] An array of interpolation strings.
         * An interpolation is a `@` binding in AngularJS component.
         * String decoder always will be used for interpolations.
         *
         * Example usage:
         * ```
         * interpolations: ['interpolationAttr1', 'interpolationAttr2',...]
         * ```
         *
         * On Elm side to specify an interpolation one can do following
         * ```
         * ...
         *
         * [ Attrs.property "interpolationAttr1" (Encode.string "interpolated value 1")
         * , Attrs.property "interpolationAttr2" (Encode.string "interpolated value 2")
         * , ...
         * ]
         * ```
         * @property {Object} [bindings] An object of bindings. Key of binding will be used as a name for scope property.
         * A value of binding is either a getter/setter or function which returns a getter/setter.
         * Most of the time we care about setter only. Because this is what will be called when value changes of Elm side.
         * On this stage we have to decode a value received from Elm to value for AngularJS component.
         * This is useful when in AngularJS component one specifies a binding.
         *
         * Example usage:
         * ```
         * bindings: {
         *     integerBinding: customElementWrapper.decode.integer,
         *     booleanBinding: customElementWrapper.decode.boolean,
         * }
         * ```
         *
         * On Elm side to specify a property one can do following
         * ```
         * [ Attrs.property "integerBinding" (Encode.int 123)
         * , Attrs.property "booleanBinding" (Encode.bool True)
         * , ...
         * ]
         * ```
         * @property {Object} [customBindings] An object of custom bindings.
         * A custom binding is a binding with custom attribute name and attribute value.
         * Key of binding will be used as a name for scope property.
         * A value of binding should be an object with three properties.
         * - `attr` - name of attribute which will be added to AngularJS component.
         * - `attrValue` - a value of attribute
         * - `decode` - either a getter/setter or function which returns a getter setter.
         * Most of the time we care about setter only. Because this is what will be called when value changes of Elm side.
         * On this stage we have to decode a value received from Elm to value for AngularJS component.
         * This is useful when in AngularJS component one specifies a binding.
         *
         * Example usage:
         * ```
         * customBindings: {
         *     customBinding: {
         *         attr: 'custom-attribute-name',
         *         attrValue: '{{ someCustomValue }}',
         *         decode: {
         *             set: function (value) {
         *                 this.$scope.someCustomValue = value;
         *             }
         *         }
         *     }
         * }
         * ```
         *
         * On Elm side to specify a property one can do following
         * ```
         * [ Attrs.property "customBinding" (Encode.string "some custom value")
         * , ...
         * ]
         * ```
         * @property {Object} [events] An object of events.
         * When AngularJS calls a callback function a new custom event will be dispatched with injectable details.
         * Let's say AngularJS component has a `onChange` callback with two injectables, `model` and init`.
         * We can describe it in following way
         * ```
         * events: {
         *     onChange: {
         *         model: function (value) {
         *             return value === 'my string' : 'Yes, I have got what I wanted' : 'Oops, failed';
         *         },
         *         init: customElementWrapper.encode.identity
         *     }
         * }
         * ```
         *
         * On Elm side to specify an event one can do following
         * ```
         * type Msg = MyMessage String Bool
         *
         * [ Events.on "onChange"
         *     (Decode.decode MyMessage
         *         |> Decode.requiredAt [ "detail", "model" ] Decode.string
         *         |> Decode.requiredAt [ "detail", "init" ] Decode.bool
         *     )
         * , ...
         * ]
         * ```
         */

        /**
         * @ngdoc method
         * @name customElementWrapper#create
         *
         * @description
         * Creates a custom element wrapper for AngularJS component.
         *
         * Basic usage from JS:
         * ```
         * customElementWrapper.create('component-name', {
         *     attrs: ['required', 'change-year'],
         *     interpolations: ['apiUrl', 'mainAddressLabel'],
         *     bindings: {
         *         integerBinding: customElementWrapper.decode.integer,
         *         booleanBinding: customElementWrapper.decode.boolean,
         *     },
         *     customBindings: {
         *         customBinding: {
         *             attr: 'custom-attribute',
         *             attrValue: '{{ someCustomValue }}',
         *             decode: {
         *                 set: function (value) {
         *                     this.$scope.someCustomValue = value;
         *                 }
         *             }
         *         }
         *     },
         *     events: {
         *         onChange: {
         *             model: function (value) {
         *                 return value === 'my string' : 'Yes, I have got what I wanted' : 'Oops, failed';
         *             },
         *             init: customElementWrapper.encode.identity
         *         }
         *     }
         * });
         * ```
         *
         * Basic usage from Elm:
         * ```
         * import Shared.Html.Extra as Html
         *
         * viewComponent : Html Msg
         * viewComponent =
         *     Html.node "custom-component-name"
         *         [ Attrs.attribute "required" ""
         *         , Attrs.attribute "change-year" ""
         *         , Attrs.property "apiUrl" (Encode.string "some/url")
         *         , Attrs.property "mainAddressLabel" (Encode.string "My address in Oslo")
         *         , Attrs.property "integerBinding" (Encode.int 42)
         *         , Attrs.property "booleanBinding" (Encode.bool True)
         *         , Attrs.property "customBinding" (Encode.string "My custom string")
         *         , Events.on "onChange"
         *             (Decode.decode MyMessage
         *                 |> Decode.requiredAt [ "detail", "model" ] Decode.string
         *                 |> Decode.requiredAt [ "detail", "init" ] Decode.bool
         *             )
         *         ]
         *         [ Html.customElementComponentWrapper
         *         -- `Html.customElementTranscludeWrapper` takes one parameter with type `List (Html Never)`.
         *         -- Which means any content which does not produce any messages.
         *         , Html.customElementTranscludeWrapper [ Html.text "Add some extra content here." ]
         *         ]
         * ```
         *
         * From `component-name` a custom element will be created with name `custom-component-name`.
         *
         * @param {string} componentName AngularJS component name.
         * @param {CustomElementWrapperCreateOptions} options Custom element options.
         * Find out more {@link CustomElementWrapperCreateOptions here}.
         */
        function create(componentName, options) {
            options = options || {};

            // ASSERT CHECKS

            assert(service.private.customElements.hasOwnProperty(componentName) === false,
                'Component with name ' + componentName + ' already registered');
            assert($injector.has(_.camelCase(componentName) + 'Directive'), 'There is no component defined for name: ' + componentName);
            assert(_.isPlainObject(options), 'Options should be an object');

            var attrs = options.attrs;
            var interpolations = options.interpolations;
            var bindings = options.bindings;
            var customBindings = options.customBindings;
            var events = options.events;

            assert(Array.isArray(attrs) && attrs.every(_.isString) || angular.isUndefined(attrs),
                'Options attributes should be an array of strings');
            assert(Array.isArray(interpolations) && interpolations.every(_.isString) || angular.isUndefined(interpolations),
                'Options interpolations should be an array of strings');
            assert(_.isPlainObject(bindings) || angular.isUndefined(bindings),
                'Options bindings should be an object');
            assert(_.isPlainObject(customBindings) || angular.isUndefined(customBindings),
                'Options custom bindings should be an object');
            assert(_.isPlainObject(events) || angular.isUndefined(events),
                'Options events should be an object');

            if (events) {
                Object.keys(events).forEach(function (event) {
                    assert(_.isPlainObject(events[event]), 'Value of event should be an object with injectables');
                    assert(Object.keys(events[event]).map(_.propertyOf(events[event])).every(_.isFunction),
                        'Value of injectable should be a function');
                });
            }

            // CUSTOM ELEMENT CONSTRUCTOR

            service.private.customElements[componentName] = function () {
                // Super call
                var self = HTMLElement.call(this) || this;

                self.$scope = $rootScope.$new();

                return self;
            };

            // CUSTOM ELEMENT PROTOTYPE

            var prototype = {
                constructor: {
                    value: service.private.customElements[componentName],
                },
                connectedCallback: {
                    /**
                     * Connected callback.
                     */
                    value: function () {
                        var self = this;

                        // ANGULAR COMPONENT ELEMENT

                        var componentElementWrapper = self.querySelector('custom-element-component');
                        var componentElementTransclude = self.querySelector('custom-element-transclude');

                        assert(componentElementWrapper !== null, '`custom-element-component` element should be defined');

                        self.componentElement = angular.element(document.createElement(componentName));

                        // TRANSCLUDE

                        if (componentElementTransclude !== null) {
                            // Copy content for transclusion
                            self.componentElement[0].innerHTML = componentElementTransclude.innerHTML;
                        }

                        // ATTRIBUTES

                        if (attrs) {
                            attrs.forEach(function (attr) {
                                // If attribute exist on custom element then replicate it to AngularJS component
                                if (self.hasAttribute(attr)) {
                                    self.componentElement.attr(attr, '');
                                }
                            });
                        }

                        // INTERPOLATIONS

                        if (interpolations) {
                            // Adds each interpolation to AngularJS component in following way `attr-name="{{ attrName }}"`
                            interpolations.forEach(function (interpolation) {
                                self.componentElement.attr(_.kebabCase(interpolation), '{{ ' + interpolation + ' }}');
                            });
                        }

                        // BINDINGS

                        if (bindings) {
                            // Adds each binding to AngularJS component in following way `attr-name="attrName"`
                            Object.keys(bindings).forEach(function (binding) {
                                self.componentElement.attr(_.kebabCase(binding), binding);
                            });
                        }

                        // CUSTOM BINDINGS

                        if (customBindings) {
                            // Adds each custom binding to AngularJS component in following way
                            // `{{ binding.attr }}="{{ binding.attrValue }}"`
                            Object.keys(customBindings).forEach(function (binding) {
                                self.componentElement.attr(customBindings[binding].attr, customBindings[binding].attrValue);
                            });
                        }

                        // EVENTS

                        if (events) {
                            // Adds each event to AngularJS component in following way
                            // `event-name="eventName(injectable1, injectable2, ...)"`
                            // Custom event will be dispatched with encoded injectables as detail for each AngularJS component event
                            Object.keys(events).forEach(function (event) {
                                var injectables = Object.keys(events[event]);

                                self.$scope[event] = function () {
                                    var args = arguments;

                                    self.dispatchEvent(new CustomEvent(event, {
                                        detail: injectables.reduce(function (detail, injectable, index) {
                                            // Encode each injectable
                                            detail[injectable] = events[event][injectable](args[index]);

                                            // Elm understands only null and not undefined
                                            if (angular.isUndefined(detail[injectable])) {
                                                detail[injectable] = null;
                                            }

                                            return detail;
                                        }, {}),
                                    }));
                                };

                                self.componentElement.attr(_.kebabCase(event), event + '(' + injectables.join(', ') + ')');
                            });
                        }

                        // COMPILE AND APPEND

                        $compile(self.componentElement)(self.$scope);
                        angular.element(componentElementWrapper).append(self.componentElement);
                    },
                },
                disconnectedCallback: {
                    /**
                     * Disconnected callback.
                     */
                    value: function () {
                        this.$scope.$destroy();
                    },
                },
            };

            if (interpolations) {
                // Extends prototype with getter/setter for each interpolation
                interpolations.forEach(function (interpolation) {
                    prototype[interpolation] = service.decode.string(interpolation);
                });
            }

            if (bindings) {
                // Extends prototype with getter/setter for each binding
                Object.keys(bindings).forEach(function (binding) {
                    var isBindingFunction = _.isFunction(bindings[binding]);

                    assert(isBindingFunction || _.isPlainObject(bindings[binding]),
                        'Value of binding should be a function or an object');

                    if (isBindingFunction) {
                        prototype[binding] = bindings[binding](binding);
                    } else {
                        prototype[binding] = bindings[binding];
                    }

                    hasGetterOrSetter(prototype[binding], binding);
                });
            }

            if (customBindings) {
                // Extends prototype with getter/setter for each custom binding
                Object.keys(customBindings).forEach(function (binding) {
                    assert(_.isPlainObject(customBindings[binding]), 'Value of custom binding should be an object');
                    assert(_.isString(customBindings[binding].attr),
                        'Value of custom binding should have a string value of "attr" property');
                    assert(_.isString(customBindings[binding].attrValue),
                        'Value of custom binding should have a string value of "attrValue" property');

                    var isDecodeFunction = _.isFunction(customBindings[binding].decode);

                    assert(isDecodeFunction || _.isPlainObject(customBindings[binding].decode),
                        'Value of custom binding should have a "decode" method or property with object type');

                    if (isDecodeFunction) {
                        prototype[binding] = customBindings[binding].decode(binding);
                    } else {
                        prototype[binding] = customBindings[binding].decode;
                    }

                    hasGetterOrSetter(prototype[binding], binding);
                });
            }

            service.private.customElements[componentName].prototype = Object.create(HTMLElement.prototype, prototype);

            // REGISTER CUSTOM ELEMENT

            $window.customElements.define('custom-' + componentName, service.private.customElements[componentName]);
        }

        // CREATE HELPERS

        /**
         * Checks if property has getter or setter or both.
         *
         * @param {Object} property Property to check.
         * @param {string} bindingName Binding name.
         */
        function hasGetterOrSetter(property, bindingName) {
            var getSetKeys = Object.keys(property);
            var hasGetSetProperties = _.isEqual(getSetKeys, ['set', 'get']) ||
                _.isEqual(getSetKeys, ['get', 'set']) ||
                _.isEqual(getSetKeys, ['get']) ||
                _.isEqual(getSetKeys, ['set']);

            assert(_.isPlainObject(property) && hasGetSetProperties,
                'Binding "' + bindingName + '" should be have either setter or getter or both');
        }

        // DECODERS

        /**
         * @ngdoc type
         * @module shared
         * @name CustomElementWrapperDecodeOptions
         * @subtitle Represents decode options
         *
         * @description
         * This type is used for {@link customElementWrapper} service `helper.decode` method.
         *
         * @property {Function} [valueTransformation] A function to transform a value before equality check.
         * @property {Function} [equalityCheck=_.isEqual] A function to perform equality check for.
         * @property {Function} assert An assertion function to check that incoming value has correct type.
         * @property {string} type A type of incoming value. Used for error message.
         * @property {*} [nullValue=undefined] A null value which is used when incoming value is `null`.
         */

        /**
         * @ngdoc method
         * @name customElementWrapper#helper.decode
         *
         * @description
         * Helper function to decode value from Elm to values for AngularJS.
         *
         * @param {CustomElementWrapperDecodeOptions} options Decode options.
         * Find out more {@link CustomElementWrapperDecodeOptions here}.
         * @returns {Function} Function to decode incoming value.
         */
        function decode(options) {
            var isValueTransformationFunction = _.isFunction(options.valueTransformation);
            var equalityCheck = options.equalityCheck || _.isEqual;

            assert(isValueTransformationFunction || angular.isUndefined(options.valueTransformation),
                'Value transformation should be a function');
            assert(_.isFunction(equalityCheck), 'Equality check should be a function');
            assert(_.isFunction(options.assert), 'Assertion should be a function');
            assert(_.isString(options.type), 'Value type should be a string');

            var nullValue;

            if (options.hasOwnProperty('nullValue')) {
                nullValue = options.nullValue;
            }

            return function (bindingName) {
                assert(_.isString(bindingName), 'Binding name should be a string');

                return {
                /**
                 * Setter.
                 */
                    set: function (value) {
                        var shouldDigestChanges = false;

                        if (value === null) {
                            this.$scope[bindingName] = nullValue;
                            shouldDigestChanges = true;
                        } else {
                            if (options.assert(value)) {
                                var newValue = isValueTransformationFunction ? options.valueTransformation(value) : value;

                                if (equalityCheck(newValue, this.$scope[bindingName]) === false) {
                                    this.$scope[bindingName] = newValue;
                                    shouldDigestChanges = true;
                                }
                            } else {
                                // Means something went wrong in the code when sending value from ELm,
                                // because actual type of a value does not equal to expected one.
                                // So we notify ourselves about it. Self compiler ;)
                                throw new Error('Expected a ' + options.type + ' or null, but got ' + typeof value);
                            }
                        }

                        if (shouldDigestChanges) {
                            // Let Angular digest changes
                            this.$scope.$evalAsync();
                        }
                    },
                };
            };
        }

        // HELPERS

        /**
         * Checks the assertion and if it's false then throws an error with given message,
         * otherwise does nothing.
         *
         * @param {boolean} assertion The assertion to be checked.
         * @param {string} message Message to be thrown.
         *
         * @usage
         * assert(angular.isObject(result), 'Result should be and object');
         */
        function assert(assertion, message) {
            if (!assertion) {
                throw new Error(message);
            }
        }
    });