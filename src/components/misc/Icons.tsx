import { Component, Match, Switch } from "solid-js";
import { MarsIcon, VenusIcon, type LucideProps } from "@lucide/solid";
import type { SexeString } from "../../domain/player";

export const BallIcon: Component = () => (
    <img src="/ball.png" width="16" height="16" class="lucide" />
);

export const DrawIcon: Component<LucideProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide" {...props}>
        <path d="M2 5h8v5h-8M2 14h8v5h-8M10 8h8v8h-8M16 12h7"/>
    </svg>
);

export const MatchIcon: Component<LucideProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="lucide" {...props}>
        <circle cx="6" cy="19" r="2.5"/>
        <ellipse cx="16.328" cy="8.407" rx="5.299" ry="6.238" transform="rotate(-43 12.132 17.655)"/>
        <path d="M9.791 13.833s3.531.211 5.082 1.018c1.252.651 5.988 6.094 5.988 6.094M14.605 9.344s-.035 3.537.661 5.141c.562 1.294 5.661 6.398 5.661 6.398"/>
    </svg>
);

export const QualifInIcon: Component<LucideProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide" {...props}>
        <ellipse cx="6" cy="12" rx="5" ry="6" />
        <path d="m10 18-2.5-2.5M20 3h-6v18h6" />
    </svg>
);
export const QualifOutIcon: Component<LucideProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide" {...props}>
        <ellipse cx="16" cy="12" rx="5" ry="6" />
        <path d="m20 18-2.5-2.5M1 3h6v18h-6" />
    </svg>
);

export const DrawLeftIcon: Component<LucideProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide" {...props}>
        <path d="M2 1h8v5h-8M10 4h8v8h-8M16 8h7"/>
        <path d="M3 16h7M6 13l-3 3l3 3"/>
    </svg>
);

export const DrawBottomIcon: Component<LucideProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide" {...props}>
        <path d="M2 1h8v5h-8M10 4h8v8h-8M16 8h7"/>
        <path d="M6 9v7M3 16l3 3l3-3"/>
    </svg>
);

type Props = {
    sexe?: SexeString;
    double?: boolean;
}
export const IconSexe: Component<LucideProps & Props> = (props) => (
    <Switch>
        <Match when={props.sexe === 'H' && !props.double}><MarsIcon {...props} color="var(--color-male)" /></Match>
        <Match when={props.sexe === 'F' && !props.double}><VenusIcon {...props} color="var(--color-female)" /></Match>
        <Match when={props.sexe === 'M' && !props.double}><MarsIcon color="var(--color-male)" /><VenusIcon class="-ml-1" color="var(--color-female)" /></Match>
        <Match when={props.sexe === 'H' && props.double}><MarsIcon color="var(--color-male)" /><MarsIcon class="-ml-1" color="var(--color-male)" /></Match>
        <Match when={props.sexe === 'F' && props.double}><VenusIcon color="var(--color-female)" /><VenusIcon class="-ml-1" color="var(--color-female)" /></Match>
        <Match when={props.sexe === 'M' && props.double}><MarsIcon color="var(--color-male)" /><VenusIcon class="-ml-1" color="var(--color-female)" /></Match>
    </Switch>
)