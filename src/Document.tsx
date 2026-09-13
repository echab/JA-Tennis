import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";

export default function Document(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="shortcut icon" type="image/ico" href="/favicon.ico" />
        <title>JA-Tennis</title>
        <link rel="stylesheet" href="/icons.css" />
        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}