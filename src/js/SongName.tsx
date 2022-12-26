import { FunctionComponent } from "react";

export const SongName: FunctionComponent<{ name?: string, subName?: string }> = ({ name, subName }) => {
    return (
        <div id="song-name">
            <span className="main-name">{name}</span>
            {subName && <>{' '}<span className="sub-name">{subName}</span></>}
        </div>
    )
}
