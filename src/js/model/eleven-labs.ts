export interface ElevenLabsVoiceData {
    voices: Array<{
        available_for_tiers: string[],
        category: string,
        description: string,
        fine_tuning: {
            fine_tuning_requested: boolean,
            finetuning_state: string,
            is_allowed_to_fine_tune: boolean,
            language: string,
            manual_verification: {
                extra_text: string,
                files: Array<{
                    file_id: string,
                    file_name: string,
                    mime_type: string,
                    size_bytes: number,
                    upload_date_unix: number
                }>,
                request_time_unix: number
            },
            manual_verification_requested: boolean,
            slice_ids: string[],
            verification_attempts: Array<{
                accepted: boolean,
                date_unix: number,
                levenshtein_distance: number,
                recording: {
                    mime_type: string,
                    recording_id: string,
                    size_bytes: number,
                    transcription: string,
                    upload_date_unix: number
                },
                similarity: number,
                text: string
            }>,
            verification_attempts_count: number,
            verification_failures: string[],
        },
        high_quality_base_model_ids: string[],
        labels: Record<string, string>,
        name: string,
        preview_url: string,
        samples: Array<{
            file_name: string,
            hash: string,
            mime_type: string,
            sample_id: string,
            size_bytes: number
        }>,
        settings: {
            similarity_boost: number,
            stability: number,
            style: string,
            use_speaker_boost: boolean
        },
        sharing: {
            cloned_by_count: number,
            description: string,
            enabled_in_library: boolean,
            history_item_sample_id: string,
            labels: unknown,
            liked_by_count: number,
            name: string,
            original_voice_id: string,
            public_owner_id: string,
            review_message: string,
            review_status: string,
            status: string,
            whitelisted_emails: string[]
        },
        voice_id: string
    }>
}
