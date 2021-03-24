# The Pandemic Archive of Voices - Database & API

## API URL

`https://pandemic-archive-of-voices.herokuapp.com/api/`

## Dependencies

- [SoX](http://sox.sourceforge.net/) for audio conversion from `.ogg` to `.wav` and `.wav`.
- [opus-tools](https://opus-codec.org/downloads/) for Opus `.ogg` file conversion.

## API

* **Get all database data**

  *Returns whole JSON Object containing all audio objects*  

  `/api/data`

* ***Get speaker's audios by speaker's id**

  *Returns all audio objects from speaker*  

  `/api/speaker_id/:id`

* ***Get speaker's audios by speaker's id**
  
  *Returns all spakers who **contain** the `:name` string*

  `/api/speaker/:name`

* **Get audio by id**

  *Returns specific audio object from its id*  

  `/api/audio_id/:id`

* **Get audios by text**
  
  *Returns all audios that **contain** the `text` in the transcription value `text` in audio object*

  `/api/audio_id/:text`

* **Get audios by language name**
  
  *Returns all audios that **contain** the `lang_name` in the `name` paramenter inside `lang` in audio object*

  `/api/audio_lang_name/:lang_name`

* **Get audios by audio text**
  
  *Returns all audios that **contain** the `lang_code` in the `code` paramenter inside `lang` in audio object*

  `/api/audio_lang_code/:lang_code`


## Dowload zipped database 

[https://pandemic-archive-of-voices.herokuapp.com/db.zip](https://pandemic-archive-of-voices.herokuapp.com/db.zip)

## Step-by-step to extract audios from telegram and create json file

A bit of the process on how to extract and later convert the telegram audios and transform them into the comprehensive json file with converted files paths, sender id, audio length, text transcription, etc.

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
    "lang": {                           // language of the audio
        "name": "brazilian portuguese", // name of the language or dialect in english 
        "code": "pt-br",                // language or dialect code
        "standard": "ISO 639-1"         // standard used for code, since some dialects are not in the ISO 639-1 standard
    }
  }
  ```

## Speakers

*I thank all collaborators that contributed with audios:*

```
  ["nilya musaeva","S. C.","ruoxi","Kazuki",
  "Hem","Antônio","Chi Him","Sangbong",
  "Alberto Harres","Josh","Bojana","Victor",
  "Debaditya","Julia","Ayse Seyhan","Anna",
  "Abdulghaffar","Pelin","Bruno","Ivett K.",
  "Slava Romanov","Marcela DM","Lucca","Bonasladybug", 
  "Soumya"]
```


## References

- About converting Opus `.ogg` files used by telegram voice messages: [SoX doesn't work with Opus Audio files](https://stackoverflow.com/questions/22322372/sox-doesnt-work-with-opus-audio-files)

- Sample conversion on [SoX](http://sox.sourceforge.net/) [SoX resample and convert](https://stackoverflow.com/questions/23980283/sox-resample-and-convert)

## License

[MIT](https://opensource.org/licenses/MIT)
