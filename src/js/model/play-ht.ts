export interface PlayHtVoiceData {
    /**
     * The unique ID for a PlayHT or Cloned Voice.
     */
    id: string;
    /**
     * The name of the voice.
     */
    name: string;
    language: string;
    language_code: string;

    sample?: string | null;
    /**
     * @example `american` `australian` `british` `canadian`
     */
    accent?: string | null;
    /**
     * @example `adult` `old` `youth`
     */
    age?: string | null;
    /**
     * @example `female` `male`
     */
    gender?: string | null;
    /**
     * @example `low` `neutral` `whisper` `high`
     */
    loudness?: string | null;
    /**
     * @example `narrative` `videos` `training` `advertising` `meditation`
     */
    style?: string | null;
    /**
     * @example `neutral` `slow` `fast`
     */
    tempo?: string | null;
    /**
     * @example `gravelly` `smooth` `round` `thick`
     */
    texture?: string | null;
}
