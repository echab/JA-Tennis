// import { beforeAll, beforeEach, vi } from 'vitest';
// import '@testing-library/jest-dom/vitest'
import { configure } from '@solidjs/testing-library'

// // waiting for showModal support by jsdom https://github.com/jsdom/jsdom/issues/3294
// beforeAll(() => {
//     HTMLDialogElement.prototype.showModal = vi.fn(function mock(this: HTMLDialogElement) { this.open = true; });
//     HTMLDialogElement.prototype.close = vi.fn(function mock(this: HTMLDialogElement) { this.open = false; });
// });

// let's suggest the best way to get/find DOM element, usually with screen.getByRole()
configure({
    throwSuggestions: true,
})
