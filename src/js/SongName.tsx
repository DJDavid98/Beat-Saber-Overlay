import { FunctionComponent } from "react";

export interface SongNameProps {
    name?: string,
    subName?: string
}

export const SongName: FunctionComponent<SongNameProps> = ({ name, subName }) => {
    return (
        <div id="song-name">
            <span className="main-name">{name}</span>
            {subName && <>{' '}<span className="sub-name">{subName}</span></>}
        </div>
    )
}
