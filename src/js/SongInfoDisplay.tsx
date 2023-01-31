import { FC } from "react";
import { MapData } from "./utils/validate-map-data";
import { SongName } from "./SongName";
import { SongAuthor } from "./SongAuthor";
import { SongDetails } from "./SongDetails";
import { CoverImage } from "./CoverImage";
import { defaultCoverImage } from "./utils/constants";

export const SongInfoDisplay: FC<{ mapData: MapData }> = ({ mapData }) => {
    return <>
        <div>
            <SongName name={mapData.SongName} subName={mapData.SongSubName} />
            <SongAuthor author={mapData.SongAuthor} mapper={mapData.Mapper} />
            <SongDetails
                difficulty={mapData.Difficulty}
                bsr={mapData.BSRKey}
                star={mapData.Star}
                duration={mapData.Duration}
                pp={mapData.PP}
            />
        </div>
        <CoverImage url={mapData.CoverImage || defaultCoverImage} />
    </>;
}
