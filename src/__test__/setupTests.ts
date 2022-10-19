import '@testing-library/jest-dom'
import { configure } from 'solid-testing-library'

// waiting for showModal support by jsdom
beforeAll(() => {
    // eslint-disable-next-line no-unused-vars
    HTMLDialogElement.prototype.showModal = jest.fn(function mock(this: HTMLDialogElement) { this.open = true; });
    // eslint-disable-next-line no-unused-vars
    HTMLDialogElement.prototype.close = jest.fn(function mock(this: HTMLDialogElement) { this.open = false; });
});

// let's suggest the best way to get/find DOM element, usually with screen.getByRole()
beforeEach(() => {
    configure({
        throwSuggestions: true,
    })
})
