import { createStore, NotWrappable, Part } from "solid-js/store";
import { defined } from "../../services/util/object";

// copied from private types in store.d.ts
type W<T> = Exclude<T, NotWrappable>;
type KeyOf<T> = number extends keyof T ? 0 extends 1 & T ? keyof T : [T] extends [never] ? never : [T] extends [readonly unknown[]] ? number : keyof T : keyof T;
type MutableKeyOf<T> = KeyOf<T> & keyof PickMutable<T>;
type PickMutable<T> = { [K in keyof T as (<U>() => U extends { [V in K]: T[V] } ? 1 : 2) extends <U>() => U extends { -readonly [V in K]: T[V] } ? 1 : 2 ? K : never]: T[K] };
type CustomPartial<T> = T extends readonly unknown[] ? "0" extends keyof T ? { [K in Extract<keyof T, `${number}`>]?: T[K] } : { [x: number]: T[number] } : Partial<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type any_ = any;

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

export function useForm<FormFields extends object = Record<string, unknown>>(
    initFields: FormFields,
) {
    const [form, setForm] = createStore<FormFields>(initFields);
    // Object.entries(initFields).forEach(([k,v]) => updateField)

    const clearField = (fieldName: keyof FormFields) => {
        setForm({
            [fieldName]: "",
        } as CustomPartial<FormFields>);
    };

    const updateField = (fieldName: keyof FormFields) => (event: Event) => {
        const inputElement = event.currentTarget as HTMLInputElement;
        if (inputElement.type === "checkbox") {
            setForm({ [fieldName]: !!inputElement.checked } as CustomPartial<FormFields>);
        } else if (inputElement.type === "radio") {
            if (inputElement.checked) {
                const v = inputElement.value;
                setForm({ [fieldName]: inputElement.dataset.json ? JSON.parse(v) : v } as CustomPartial<FormFields>);
            }
        } else if (inputElement.type === "number") {
            setForm({ [fieldName]: inputElement.valueAsNumber } as CustomPartial<FormFields>);
        } else if (inputElement.type === "date") {
            setForm({ [fieldName]: inputElement.valueAsDate } as CustomPartial<FormFields>);
        } else if (inputElement.type === "datetime-local") {
            setForm({ [fieldName]: new Date(inputElement.value) } as CustomPartial<FormFields>);
        } else {
            setForm({ [fieldName]: inputElement.value } as CustomPartial<FormFields>);
        }
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
            const inputElement = event.currentTarget as HTMLInputElement;
            if (inputElement.type === "checkbox" || inputElement.type === "radio") {
                setForm(fieldName, { [subFieldName]: !!inputElement.checked } as any_);
            } else if (inputElement.type === "number") {
                setForm(fieldName, { [subFieldName]: inputElement.valueAsNumber } as any_);
            } else if (inputElement.type === "date") {
                setForm(fieldName, { [subFieldName]: inputElement.valueAsDate } as any_);
            } else {
                setForm(fieldName, { [subFieldName]: inputElement.value } as any_);
            }
        };

    const getCheckboxes = (radio: RadioNodeList): string[] => {
        const radios =
            (radio.length
                ? Array.from(radio)
                : Array.of(radio)) as HTMLInputElement[];
        return radios.map((e) => e.checked ? e.value : undefined).filter(defined);
    };

    return { form, setForm, updateField, updateSubField, clearField, getCheckboxes };
}
