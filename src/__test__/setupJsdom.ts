import { vi as jest } from 'vitest';
import '@testing-library/jest-dom'
import { configure } from '@solidjs/testing-library'

// waiting for showModal support by jsdom
beforeAll(() => {
    HTMLDialogElement.prototype.showModal = jest.fn(function mock(this: HTMLDialogElement) { this.open = true; });
    HTMLDialogElement.prototype.close = jest.fn(function mock(this: HTMLDialogElement) { this.open = false; });
});

// let's suggest the best way to get/find DOM element, usually with screen.getByRole()
beforeEach(() => {
    configure({
        throwSuggestions: true,
    })
})
