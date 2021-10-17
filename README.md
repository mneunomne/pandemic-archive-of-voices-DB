# The Pandemic Archive of Voices - Database & API

## Description

The Pandemic Archive of Voices is an audio archive constituted by 24 different speakers who contributed 185 audios in 18 different languages. Each of these audios represents a word or expression in the speaker's native language that would translate their own individual experience of the current context of the pandemic.

This repository consists of:
- Database API
- Content Manager
- Contribution Form

## API URL

`https://pandemic-archive-of-voices.herokuapp.com/api/`

## Dependencies

- [Mongoose](https://mongoosejs.com/docs/) Node library dealing with [MongoDB](https://www.mongodb.com/)
- [Amazon S3](https://aws.amazon.com/s3/)
- [Socket.io](https://socket.io/)
- [node-osc](https://www.npmjs.com/package/node-osc)
- [node-ffmpeg](https://www.npmjs.com/package/ffmpeg)
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

* **POST new audio**
   
  *Submits new audio to the database, restrited use*

  `/api/audio`

  ```Javascript
  {
    id: String,
    data: Blob,
    languageInput: String,
    lang_other: String,
    text: String,
    timestamp: Int
  }
  ```


## Dowload zipped database of original audios

[https://pandemic-archive-of-voices.herokuapp.com/db.zip](https://pandemic-archive-of-voices.herokuapp.com/db.zip)

## References

- About converting Opus `.ogg` files used by telegram voice messages: [SoX doesn't work with Opus Audio files](https://stackoverflow.com/questions/22322372/sox-doesnt-work-with-opus-audio-files)

- Sample conversion on [SoX](http://sox.sourceforge.net/) [SoX resample and convert](https://stackoverflow.com/questions/23980283/sox-resample-and-convert)

## License

[MIT](https://opensource.org/licenses/MIT)
