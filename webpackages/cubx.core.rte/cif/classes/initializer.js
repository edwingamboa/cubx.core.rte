/* globals _*/
(function () {
  'use strict';
  /**
   * A Class realise the initialization of compound components
   * @constructor
   * @global
   */
  var Initializer = function () {
    /**
     * List of Slots to initalize
     * @type {Array}
     * @private
     */
    this._initList = [];
    /**
     * optimized List of Slots to initalize
     * @type {Array}
     * @private
     */
    this._optimizedInitList = [];

    /**
     * @type {EventFactory}
     * @private
     */
    this._eventFactory = new window.cubx.EventFactory();
  };

  /**
   * parse the elements for cubx-core-init  for the given context
   * all subelement cubx-core-slot will readed and add to the init list
   * @param {Context} context
   * @memberOf Initializer
   */
  Initializer.prototype.parseInitSlotsForContext = function (context) {
    // console.log('Initializer.parseInitSlotsForContext:context',context)
    // console.log('parseInitSlotsForContext --> context', context);
    this._parseInitSlotsForElement(context.getRootElement(), context);
    var children = context.getChildren();
    // console.log('context has ', children.length, 'element');
    for (var i = 0; i < children.length; i++) {
      this.parseInitSlotsForContext(children[ i ]);
    }
  };

  /**
   * Sort the _initList.
   * @memberOf Initializer
   */
  Initializer.prototype.sortInitList = function () {
    this._initList = this._sortInitList(this._initList);
  };
  /**
   * Init the Slots by using the optimized InitList (#_optimizedInitList).
   * @memberOf Initializer
   */
  Initializer.prototype.initSlots = function () {
    _.forEach(this._initList, function (init) {
      // console.log('init slot (runtime-id, slot, value)', init._component.getAttribute('runtime-id'), init._slot,
      //     init._value);
      this._initSlot(init);
    }, this);
  };

  /**
   * Init one Slot from an item of optimized init
   * @param {SlotInit} init
   * @private
   * @memberOf Initializer
   */
  Initializer.prototype._initSlot = function (init) {
    init._component.setInputSlot(init._slot,
      this._eventFactory.createModelChangePayloadObject(init._slot, init._value,
        null));
  };
  /**
   * Sorted an List of InitElements by the deeplevel and order property, backwards.
   * @param {array} initList Array of SlotInit objects
   * @return {Array.<SlotInit>}
   * @private
   * @memberOf Initializer
   */
  Initializer.prototype._sortInitList = function (initList) {
    var sortedList = _.sortByOrder(initList, [ '_deepLevel', '_internal', '_order' ], [ 'desc', 'asc', 'asc' ]);
    return sortedList;
  };

  /**
   * Parse the cubx-core-slot Tags and create a new SlotInit item.
   * @param {HTMLelement} component
   * @param {Context} context
   * @private
   * @memberOf Initializer
   */
  Initializer.prototype._parseInitSlotsForElement = function (component, context) {
    // console.log('_parseInitSlotsForElement for ', component, ' context', context);

    var initElements = component.querySelectorAll('CUBX-CORE-INIT');
    _.forEach(initElements, function (initElement) {
      var parent = initElement.parentNode;
      // The parent is the coponent self (internal init, or an elementary component
      // For compound in the subtree of component will this Method called separate
      if (parent === component || this._isElementaryComponent(parent) && context.findParentContextOfElement(parent).isSame(context)) {
        this._addAllInitSlotEntriesToInitList(parent, context, initElement.children);
      }
    }, this);
  };

  /**
   * Iterate the cubx-core-slot HTMLElements, create for each an Initializer.SlotInit object and add to #_initList.
   * @param {HTMLElement} element
   * @param {Context} context
   * @param {Array.<HTMLElement<InitSlotPrototype>>} initSlotElements
   * @private
   * @memberOf Initializer
   */
  Initializer.prototype._addAllInitSlotEntriesToInitList = function (element, context, initSlotElements) {
    _.forEach(initSlotElements, function (initElement) {
      this._addInitSlotEntryToInitList(element, context, initElement);
    }, this);
  };
  /**
   * Create  an Initializer.SlotInit object and add to #_initList.
   * @param {HTMLElement} element
   * @param {Context} context
   * @param {HTMLElement<InitSlotPrototype>} initSlotElement
   * @private
   * @memberOf Initializer
   */
  Initializer.prototype._addInitSlotEntryToInitList = function (element, context, initSlotElement) {
    //  check if the slot is an inputSlot
    if (element.isInputSlot(initSlotElement.getSlot())) {
      var init = new Initializer.SlotInit(element, context, initSlotElement);
      this._initList.push(init);
    }
  };

  /**
   * Check if the HTMLelement is an elementary component.
   * @param {HTMLElement} element
   * @return {boolean} true, if the element is an elemntary component.
   * @private
   * @memberOf Initializer
   */
  Initializer.prototype._isElementaryComponent = function (element) {
    if (!element || !element.tagName) {
      console.error('parameter element is not a HTMLElement');
      return false;
    }
    if (!window.cubx.CRC.getCache().getComponentCacheEntry(element.tagName.toLowerCase())) {
      console.error(element.tagName.toLowerCase() + ' is not contained in ManifestCache');
      return false;
    }
    return window.cubx.CRC.getCache().getComponentCacheEntry(element.tagName.toLowerCase()).artifactType ===
      'elementaryComponent';
  };

  /**
   * The HTMLLement is a connection tag (<cubx-core-connection>)
   * @param {HTMLElement} element
   * @return {boolean}
   * @private
   * @memberOf Initializer
   */
  Initializer.prototype._isConnectionElement = function (element) {
    if (!element || !element.tagName) {
      console.error('parameter element is not a HTMLElement');
      return false;
    }
    if (element.tagName === 'CUBX-CORE-CONNECTIONS' || element.tagName === 'CUBX-CORE-CONNECTION') {
      return true;
    }
    return false;
  };

  /**
   * Represented one slot initialization
   * @param {HTMLElement} element
   * @param {Context} context
   * @param {HTMLElement} initSlotElement
   * @global
   * @memberOf Initializer
   * @constructor
   */
  Initializer.SlotInit = function (element, context, initSlotElement) {
    /**
     * @type {Context}
     * @private
     * @memberOf SlotInit
     */
    this._context = context;
    /**
     * @type {HTMLElement}
     * @private
     * @memberOf SlotInit
     */
    this._component = element;

    /**
     * @type {string}
     * @private
     * @memberOf SlotInit
     */
    this._slot = initSlotElement.getSlot();
    /**
     * @type {string}
     * @private
     * @memberOf SlotInit
     */
    this._value = JSON.parse(initSlotElement.innerHTML);

    /**
     * @type {number}
     * @private
     * @memberOf SlotInit
     */
    this._order = Number(initSlotElement.getOrder());

    /**
     * @type {number}
     * @private
     * @memberOf SlotInit
     */
    this._deepLevel = Number(initSlotElement.getDeepLevel());

    /**
     *
     * @type {boolean}
     * @private
     * @memberOf SlotInit
     */
    this._internal = initSlotElement.getType() && initSlotElement.getType() === 'internal';
  };
  // provide ConnectionManager class in global scope
  if (!window.cubx.__cifError__) {
    window.cubx.cif.Initializer = Initializer;
  }
})();