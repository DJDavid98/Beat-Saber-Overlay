import { FunctionComponent } from "react";

export const SongAuthor: FunctionComponent<{ author?: string; mapper?: string }> = ({ author, mapper }) => {
    return (
        <div id="song-author">
            <span className="author">{author}</span>
            {mapper && <>{' '}[<span className="mapper">{mapper}</span>]</>}
        </div>
    )
}
