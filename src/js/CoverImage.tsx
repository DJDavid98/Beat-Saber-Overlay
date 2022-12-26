import { FunctionComponent } from "react";

export const CoverImage: FunctionComponent<{ url?: string }> = ({ url }) => {
    return <img id="cover-image" src={url} alt="" />;
}
