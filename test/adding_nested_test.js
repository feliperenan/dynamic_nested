import DynamicNested from '../index'
import '@testing-library/jest-dom/extend-expect'

beforeEach(() => {
  document.body.innerHTML =
    `<div dynamic-nested>
      <div dynamic-nested-index="0">
        <input type="hidden" id="user_colors_0_id" dynamic-nested-field-id="true" value="1">
        <label for="user_colors_0_name">Color</label>
        <input id="user_colors_0_name" name="user[colors][0][name]" type="text" value="red">
        <select id="user_countries_0_id">
          <option value="1">Brazil</option>
          <option selected value="2">Estonia</option>
        </select>
        <select id="user_tags_0_id" multiple>
          <option value="1">tag-1</option>
          <option selected value="2">tag-2</option>
          <option selected value="3">tag-3</option>
        </select>
        <button type="button" dynamic-nested-remove>Remove</button>
      </div>
    </div>
    <button type="button" dynamic-nested-add>Add more</button>
    `
})

afterEach(() => {
  document.body.innerHTML = ''
})

test('adds a new nested association markup incrementing +1 from the previous index', () => {
  const element = document.querySelector('[dynamic-nested]')
  const dynamicNested = new DynamicNested(element)

  // Simulates a User clicks on add button.
  document.querySelector('[dynamic-nested-add]').click()

  expect(element.querySelectorAll('[dynamic-nested-index]').length).toBe(2)

  expect(element).toContainHTML(
    '<div dynamic-nested-index="1">'
  )
  expect(element).toContainHTML(
    '<label for="user_colors_1_name">Color</label>'
  )
  expect(element).toContainHTML(
    '<input id="user_colors_1_name" name="user[colors][1][name]" type="text" value="red">'
  )
  expect(element).toContainElement(
    element.querySelector('[dynamic-nested-remove]')
  )

  // copies selected values from the cloned nested
  const select         = element.querySelector('#user_countries_1_id')
  const multipleSelect = element.querySelector('#user_tags_1_id')

  expect(select).toHaveValue('2')
  expect(multipleSelect).toHaveValue(['2', '3'])

  // does not copy hidden ids.
  expect(element).not.toContainElement(
    element.querySelector('#user_colors_1_id')
  )
})

test('supports callbacks beforeClone and afterAdd', () => {
  const element = document.querySelector('[dynamic-nested]')

  const beforeClone = (element) => {
    element.setAttribute("data-before-clone", true)
  }

  const afterAdd = (element, newElement) => {
    element.setAttribute("data-after-added", true)
    newElement.setAttribute("data-after-added", true)
  }

  new DynamicNested(element, { beforeClone, afterAdd })

  // Simulates a User clicks on add button.
  document.querySelector('[dynamic-nested-add]').click()

  const clonedElement = element.querySelector('[dynamic-nested-index="0"]')
  const newElement = element.querySelector('[dynamic-nested-index="1"]')

  expect(clonedElement).toHaveAttribute('data-before-clone', 'true')
  expect(clonedElement).toHaveAttribute('data-after-added', 'true')
  expect(newElement).toHaveAttribute('data-after-added', 'true')
})

