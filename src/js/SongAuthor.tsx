import { FunctionComponent } from "react";

export interface SongAuthorProps {
    author?: string;
    mapper?: string
}

export const SongAuthor: FunctionComponent<SongAuthorProps> = ({ author, mapper }) => {
    return (
        <div id="song-author">
            <span className="author">{author}</span>
            {mapper && <>{' '}[<span className="mapper">{mapper}</span>]</>}
        </div>
    )
}
