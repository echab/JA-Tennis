import { createStore, NotWrappable, Part } from "solid-js";
import { defined } from "../../services/util/object";

// copied from private types in store.d.ts
type W<T> = Exclude<T, NotWrappable>;
type KeyOf<T> = number extends keyof T ? 0 extends 1 & T ? keyof T : [T] extends [never] ? never : [T] extends [readonly unknown[]] ? number : keyof T : keyof T;
type MutableKeyOf<T> = KeyOf<T> & keyof PickMutable<T>;
type PickMutable<T> = { [K in keyof T as (<U>() => U extends { [V in K]: T[V] } ? 1 : 2) extends <U>() => U extends { -readonly [V in K]: T[V] } ? 1 : 2 ? K : never]: T[K] };
// type CustomPartial<T> = T extends readonly unknown[] ? "0" extends keyof T ? { [K in Extract<keyof T, `${number}`>]?: T[K] } : { [x: number]: T[number] } : Partial<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type any_ = any;

type NoArray<T> = Extract<T, readonly unknown[]> extends never ? unknown : never;
type StoreInit<T> = (() => T | Promise<T> | AsyncIterable<T>) & NoArray<T>;

// type FormFields = {
//   name?: string;
//   surname?: string;
//   address?: string;
//   shippingAddress?: string;
//   sameAsAddress: boolean;
// };

// const submit = (form: FormFields) => {
//   // here we can:
//   // filter out unneeded data, e.g. the checkbox sameAsAddress
//   // map fields, if needed, e.g. shipping_address
//   const dataToSubmit = {
//     name: form.name,
//     surname: form.surname,
//     address: form.address,
//     shipping_address: form.shippingAddress
//   };
//   // should be submitting your form to some backend service
//   console.log(`submitting ${JSON.stringify(dataToSubmit)}`);
// };

export function useForm<FormFields extends {} = Record<string, string | number | boolean | Date>>(
    initFieldsGetter: StoreInit<FormFields>,
) {
    const [form, setForm] = createStore(initFieldsGetter, null, { name: 'formStore' });
    // Object.entries(initFields).forEach(([k,v]) => updateField)

    const clearField = (fieldName: keyof FormFields) => {
        setForm((draft) => {
            draft[fieldName] = '' as any_;
        });
    };

    const updateField = (fieldName: keyof FormFields) => (event: Event) => {
        const input = event.currentTarget as HTMLInputElement;
        setForm((draft) => {
            if (input.type === "checkbox") {
                draft[fieldName] = !!input.checked as any_;
            } else if (input.type === "radio") {
                if (input.checked) {
                    const v = input.value;
                    draft[fieldName] = input.dataset.json ? JSON.parse(v) : v;
                }
            } else if (input.type === "number") {
                draft[fieldName] = input.valueAsNumber as any_;
            } else if (input.type === "date") {
                draft[fieldName] = input.valueAsDate as any_;
            } else if (input.type === "datetime-local") {
                draft[fieldName] = new Date(input.value) as any_;
            } else {
                draft[fieldName] = input.value as any_;
            }
        });
    };

    const updateSubField = <K1 extends MutableKeyOf<W<FormFields>>>(
        fieldName: Part<W<FormFields>, K1>,
        subFieldName: string,
        // subFieldName: Part<
        //   W<W<FormFields>[KeyOf<W<FormFields>>]>,
        //   KeyOf<W<W<FormFields>[KeyOf<W<FormFields>>]>>
        // >,
    ) =>
        (event: Event) => {
            const input = event.currentTarget as HTMLInputElement;
            setForm((draft) => {
                const field = (draft as any_)[fieldName];
                if (input.type === "checkbox" || input.type === "radio") {
                    field[subFieldName] = !!input.checked;
                } else if (input.type === "number") {
                    field[subFieldName] = input.valueAsNumber;
                } else if (input.type === "date") {
                    field[subFieldName] = input.valueAsDate;
                } else {
                    field[subFieldName] = input.value;
                }
            });
        };

    const getCheckboxes = (radio: RadioNodeList): string[] => {
        const radios =
            (radio.length
                ? Array.from(radio)
                : Array.of(radio)) as HTMLInputElement[];
        return radios.map((e) => e.checked ? e.value : undefined).filter(defined);
    };

    return { form, updateField, updateSubField, clearField, getCheckboxes };
}
