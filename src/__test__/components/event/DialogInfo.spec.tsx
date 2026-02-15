/** @vitest-environment happy-dom */
import { describe, expect, it, test, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import "../../setupTestDOM.ts";
import { DialogInfo } from '../../../components/tournament/DialogInfo.tsx';

describe('DialogInfo', () => {

    const info = { name: 'My tournament', slotLength: 60 } as const;
    const onOk = vi.fn();
    const onClose = vi.fn();

    test('no change', () => {
        const { getByRole } = render(() => <DialogInfo info={info} onOk={onOk} onClose={onClose} />);
        const buttonOk = getByRole<HTMLButtonElement>('button', { name: /OK/ });

        fireEvent.click(buttonOk);

        expect(onOk).toBeCalledTimes(1);
        expect(onOk).toBeCalledWith(expect.objectContaining({ name: 'My tournament', slotLength: 60 }));
    });

    it('changes name', () => {
        const { getByRole, getAllByRole } = render(() => <DialogInfo info={info} onOk={onOk} onClose={onClose} />);
        const inputName = getAllByRole<HTMLInputElement>('textbox', { name: /name:/i })[0];
        const buttonOk = getByRole<HTMLButtonElement>('button', { name: /OK/ });

        fireEvent.change(inputName, { target: { value: "New name" } });
        expect(inputName.value).toBe("New name");

        fireEvent.click(buttonOk);

        // await waitFor(() => {
        expect(onOk).toBeCalledTimes(1);
        expect(onOk).toBeCalledWith(expect.objectContaining({ name: 'New name' }));
        // });
    });
});