import { screen, render, fireEvent } from "solid-testing-library";
import { DialogInfo } from '../../../components/event/DialogInfo';

describe('DialogInfo', () => {

    const info = { name: 'My tournament', slotLength: 60 } as const;
    const onOk = jest.fn();
    const onClose = jest.fn();

    it('no change', () => {
        onOk.mockClear();

        render(() => <DialogInfo info={info} onOk={onOk} onClose={onClose} />);

        // const buttonOk = await screen.findByRole('button', {name:/OK/});
        fireEvent.click(screen.getByRole('button', { name: /OK/ }));

        expect(onOk).toBeCalledTimes(1);
        expect(onOk).toBeCalledWith(expect.objectContaining({ name: 'My tournament', slotLength: 60 }));
    });

    it('changes name', () => {
        onOk.mockClear();

        render(() => <DialogInfo info={info} onOk={onOk} onClose={onClose} />);

        const inputName = screen.getAllByRole('textbox', { name: /name:/i })[0] as HTMLInputElement;
        fireEvent.change(inputName, { target: { value: "New name" } });
        expect(inputName.value).toBe("New name");

        screen.getByRole('button', { name: /OK/ }).click();

        // await waitFor(() => {
        expect(onOk).toBeCalledTimes(1);
        expect(onOk).toBeCalledWith(expect.objectContaining({ name: 'New name' }));
        // });
    });
});