import { FunctionComponent } from "react";

export interface CoverImageProps {
    url?: string
}

export const CoverImage: FunctionComponent<CoverImageProps> = ({ url }) => {
    return <img id="cover-image" src={url} alt="" />;
}
