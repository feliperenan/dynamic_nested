import DynamicNested from '../index'
import '@testing-library/jest-dom/extend-expect'

beforeAll(() => {
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
    `
})

describe("removing nested associations", () => {
  test('removes the clicked nested and rebuild indexes', () => {
    const element = document.querySelector('[dynamic-nested]')
    const dynamicNested = new DynamicNested(element)

    // Simulates a User clicks on second nested association remove's button.
    element
      .querySelector('[dynamic-nested-index="1"]')
      .querySelector('[dynamic-nested-remove]')
      .click()

    expect(element.querySelectorAll('[dynamic-nested-index]').length).toBe(2)

    expect(element).toContainHTML(
      '<div dynamic-nested-index="0">'
    )
    expect(element).toContainHTML(
      '<div dynamic-nested-index="1">'
    )
  })
})
