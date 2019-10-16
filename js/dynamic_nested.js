/**
 * Add dynamic support to add and remove nested associations generated by `Phoenix.HTML.inputs_for`.
 *
 * In order to get it working, the following attributes must be added in the markup:
 *
 * [dynamic-nested]                 - to active this component.
 * [dynamic-nested-index=${index}]  - to get nested association.
 * [dynamic-nested-add]             - to add nested.
 * [dynamic-nested-remove]          - to remove nested.
 *
 * ## Examples
 *
 * ```
 * <div dynamic-nested>
 *   <%= inputs_for @f, :categories, [skip_hidden: true], fn c -> %>
 *     <%= content_tag :div, dynamic_nested_index: c.index do %>
 *       # PS: generate hidden fields manually for handling them easily.
 *       = for {key, value} <- c.hidden do
 *         = hidden_input c, key, value: value, dynamic_nested_field_id: true
 *      <%= text_input c, :name %>
 *       <button type="button" dynamic-nested-remove>Remove</button>
 *     <% end %>
 *   <% end %>
 * </div>
 * ```
 *
 * <button type="button" dynamic-nested-add>Add</button>
 *
 * Everytime a User adds a new nested, it is going to generate a new index for that nested incrementing
 * +1 from the last nested on the page. As soon as an User removes one, all indexes will be updated
 * accordingly to reflect their position on the page.
 *
 * Also, make sure to initialize this script after importing it on your application.
 *
 * ```JS
 * import DynamicNested from 'dynamic-nested'
 *
 * document.querySelectorAll('[dynamic-nested]').forEach(element => DynamicNested(element))
 * ```
 *
 * It supports the following callbacks:
 *
 * * beforeClone  - You might want to do something before cloning the element.
 * * afterAdd     - You might want to do something after adding the new element.
 * * afterRemove  - You might want to do something after removing the element.
 *
 * ```JS
 * const beforeClone = (element) => { ... }
 * const afterAdd    = (element, newElement) => { ... }
 * const afterRemove = (elements) => { ... }
 *
 * new DynamicNested(element, { beforeClone, afterAdd, afterRemove })
 * ```
 *
 * ## Know caveats
 *
 * * It must contains at least one nested markup rendered on the page since `DinamicNested` will
 *   use it as a template to clone.
 * * You must be using the last version of `Phoenix.HTML` that supports `skip_hidden` fields.
 **/
class DynamicNested {
  constructor(element, options = {}) {
    this.element = element
    this.options = options

    this.toggleRemoveButtonDisplay()

    document.addEventListener('click', event => {
      if(event.target.matches('[dynamic-nested-add]')) {
        const $allNested = this.element.querySelectorAll('[dynamic-nested-index]')

        this.add($allNested)
        this.toggleRemoveButtonDisplay()
      }

      if(event.target.matches('[dynamic-nested-remove]')) {
        const $nested = event.target.closest('[dynamic-nested-index]')

        this.remove($nested)
        this.toggleRemoveButtonDisplay()
      }
    }, false)
  }

  toggleRemoveButtonDisplay() {
    const $allNested = this.element.querySelectorAll('[dynamic-nested-index]')

    if($allNested.length <= 1) {
      const $button = $allNested[0].querySelector('[dynamic-nested-remove]')

      $button.style.display = 'none'
    } else {
      for(let $button of this.element.querySelectorAll('[dynamic-nested-remove]')) {
        $button.style.display = 'block'
      }
    }
  }

  add($allNested) {
    const $lastNested = $allNested[$allNested.length -1]

    if (this.options.beforeClone) { this.options.beforeClone($lastNested) }

    const $newNested  = $lastNested.cloneNode(true)

    // copy selected options from the cloned to the new nested since they are not copied when cloned.
    $newNested.querySelectorAll('select').forEach((select, index) => {
      const cloneSelect = $lastNested.querySelectorAll('select')[index]

      if(select.multiple) {
        for(let option of select.options) {
          const cloneSelectOption = Array.from(cloneSelect.options).find(o => o.value == option.value)

          if(cloneSelectOption.selected) {
            option.selected = true
          } else {
            option.selected = false
          }
        }
      } else {
        select.selectedIndex = cloneSelect.selectedIndex
      }
    })

    // When editing the form, the cloned element will have hidden ids. They must be removed from
    // the new element.
    const hiddenId = $newNested.querySelector('[dynamic-nested-field-id]')
    if (hiddenId) { $newNested.removeChild(hiddenId) }

    // Create a new index according to the last nested.
    const index = +$lastNested.getAttribute('dynamic-nested-index') + 1
    this.replaceIndex($newNested, index)

    // Add new nested on the page.
    this.element.appendChild($newNested)

    if (this.options.afterAdd) { this.options.afterAdd($lastNested, $newNested) }
  }

  remove($nested) {
    this.element.removeChild($nested)

    const $allNested = this.element.querySelectorAll('[dynamic-nested-index]')

    Array.from($allNested).forEach(($nested, index) => {
      this.replaceIndex($nested, index)
    })

    if (this.options.afterRemove) { this.options.afterRemove($allNested) }
  }

  /**
   * Replace indexes in `id`, `name` and `for` for all children from the given nested element.
   *
   * @param {object} element - DOM element.
   * @param {string} index   - The new index that will be used in the attribute name.
   *
   * Examples
   *
   *   Given the following nested element:
   *   <div dynamic-nested-index="0">
   *     <input id="user_categories_0_name" name="user[categories][0][name]">
   *   </div>
   *
   *   replaceIndex(element, "1")
   *
   *   Will replace indexes in the <input /> and changes the DOM to:
   *   <div dynamic-nested-index="1">
   *     <input id="user_categories_1_name" name="user[categories][1][name]">
   *   </div>
   **/
  replaceIndex($nested, newIndex) {
    for(let attribute of ['id', 'name', 'for']) {
      const $children = $nested.querySelectorAll(`[${attribute}]`)

      Array.from($children).forEach($child => {
        const value = this.newAttributeName($child, attribute, newIndex)

        $child.setAttribute(attribute, value)
      })

      $nested.setAttribute('dynamic-nested-index', newIndex)
    }
  }

  /**
   * Build a new attribute name according to the previous attribute name and new index.
   *
   * @param {object} element   - DOM element that contains the attributes' name as base.
   * @param {string} attribute - Attribute name present in the given element.
   * @param {string} index     - The new index that will be used in the attribute name.
   *
   * Examples
   *
   *    newAttributeName(<input name="user[categories][0][name]">, "name", 1)
   *    => "user[categories][1][name]"
   *
   *    newAttributeName(<input id="user_categories_0">, "id", 1)
   *    => "user_categories_1"
   **/
  newAttributeName(element, attribute, index) {
    return element.getAttribute(attribute).replace(/[0-9]/g, index)
  }
}

export default DynamicNested