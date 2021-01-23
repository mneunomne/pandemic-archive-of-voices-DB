# The Pandemic Archive of Voices

Database for the Pandemic Archive of Voices.

## Dependencies

- [SoX](http://sox.sourceforge.net/) for audio conversion from `.ogg` to `.wav` and `.wav`.
- [opus-tools](https://opus-codec.org/downloads/) for Opus `.ogg` file conversion.

## Step-by-step to extract audios from telegram and create json file

### Download Telegram Data

- Download telegram data from groups, downloading only the voice messages

- Clean DataExport folder, excluding data other groups

### Clean JSON file

- Clean `result.json` file, leaving only the array of messages from Archive of Voices group

- Exclude pined message and other actions from message array

- Reorder messages to make sure that all audios have the text version following the audio message right away. 

### Convert to .wav

- Convert `.ogg` audio files to `.wav` files, copying them to the `data/` folder using `npm run convert` command. The files are exported in the following folder structure: `db/audios/${speaker_id}/`.

### Generate final json file

- Extract `results.json` with `npm run extract`, generating, among other data, audio data elements with the folowing values:
  ```
  {
    "from": "alberto harres",           // speaker name
    "id": 0,                            // audio file id
    "file": "db/audios/filename.wav",   // path to audio file
    "text": "audio text"                // audio text
    "from_id": 0,                       // speaker id
    "duration_seconds": 2               // audio duration in seconds
  }
  ```

## refs

- About converting Opus `.ogg` files used by telegram voice messages: [SoX doesn't work with Opus Audio files](https://stackoverflow.com/questions/22322372/sox-doesnt-work-with-opus-audio-files)

- Sample conversion on [SoX](http://sox.sourceforge.net/) [SoX resample and convert](https://stackoverflow.com/questions/23980283/sox-resample-and-convert)