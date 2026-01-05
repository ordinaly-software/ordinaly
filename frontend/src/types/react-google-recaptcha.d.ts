declare module "react-google-recaptcha" {
  import * as React from "react";

  export interface ReCAPTCHAProps {
    sitekey: string;
    size?: "normal" | "compact" | "invisible";
    tabindex?: number;
    theme?: "light" | "dark";
    badge?: "bottomright" | "bottomleft" | "inline";
    hl?: string;
    onChange?: (value: string | null) => void;
    onExpired?: () => void;
    onErrored?: () => void;
    className?: string;
    style?: React.CSSProperties;
  }

  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {
    execute(): Promise<string>;
    executeAsync(): Promise<string>;
    reset(): void;
    getValue(): string | null;
  }
}
