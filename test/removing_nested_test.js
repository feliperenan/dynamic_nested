import DynamicNested from '../js/dynamic_nested'
import '@testing-library/jest-dom/extend-expect'

beforeEach(() => {
  document.body.innerHTML =
    `<div dynamic-nested>
      <div dynamic-nested-index="0">
        <label for="user_colors_0_name">Street</label>
        <input id="user_colors_0_name" name="user[colors][0][name]" type="text">
        <button type="button" dynamic-nested-remove>Remove</button>
      </div>
      <div dynamic-nested-index="1">
        <label for="user_colors_1_name">Street</label>
        <input id="user_colors_1_name" name="user[colors][1][name]" type="text">
        <button id="remove" type="button" dynamic-nested-remove>Remove</button>
      </div>
      <div dynamic-nested-index="2">
        <label for="user_colors_2_name">Street</label>
        <input id="user_colors_2_name" name="user[colors][2][name]" type="text">
        <button type="button" dynamic-nested-remove>Remove</button>
      </div>
    </div>
    <button type="button" dynamic-nested-add>Add more</button>
    `.trim()
})

test('removes the clicked nested and rebuild indexes and support afterRemove callback', () => {
  const element = document.querySelector('[dynamic-nested]')

  const afterRemove = (elements) => {
    Array.from(elements).forEach(element => element.setAttribute('data-after-remove', true))
  }

  new DynamicNested(element, { afterRemove })

  // Simulates a User clicks on second nested association remove's button.
  element
    .querySelector('[dynamic-nested-index="1"]')
    .querySelector('[dynamic-nested-remove]')
    .click()

  expect(element.querySelectorAll('[dynamic-nested-index]').length).toBe(2)

  Array.from(element.querySelectorAll('[dynamic-nested-index]')).forEach(element => {
    expect(element).toHaveAttribute('data-after-remove', 'true')
  })
})
