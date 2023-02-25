declare module '*.svg' {
    import { FunctionComponent } from "react";
    const SVGComponent: FunctionComponent;
    export default SVGComponent;
}

declare module '*.webm' {
    const url: string;
    export default url;
}
