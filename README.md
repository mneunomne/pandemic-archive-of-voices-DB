# The Pandemic Archive of Voices

Database for the Pandemic Archive of Voices.

## Dependencies

- [SoX](http://sox.sourceforge.net/) for audio conversion from `.ogg` to `.wav` and `.wav`.
- [opus-tools](https://opus-codec.org/downloads/) for Opus `.ogg` file conversion.

## API

* **Get all database data**

  *Returns whole JSON Object containing all audio objects*  

  `/data`

* ***Get speaker's audio by speaker's id**

  *Returns all audio objects from speaker*  

  `/speaker_id/:id`

* ***Get speaker's audio by speaker's id**
  
  *Returns all spakers who **contain** the `:name` string*

  `/speaker/:name`

* **Get audio by audio id**

  *Returns specific audio object from its id*  

  `/audio_id/:id`

* **Get audio by audio text**
  
  *Returns all audios that **contain** the `text` in the transcription value `text` in audio object*

  `/audio_id/:text`

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