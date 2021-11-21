# The Pandemic Archive of Voices - Database & API

## Description

The Pandemic Archive of Voices is an audio archive constituted by 24 different speakers who contributed 185 audios in 18 different languages. Each of these audios represents a word or expression in the speaker's native language that would translate their own individual experience of the current context of the pandemic.

This repository was created especifically to manage the installation project based on this database, but not exclusivelly.

It consists of:
- Database API
- Content Manager
- Contribution Form
- Local server to conntect with the installation API

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

### GET 

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

* **Get sample array from audio id**
  
  *Returns the sample array of a particular audio in the database*

  `/api/get_audio_samples/:audio_id/:bits/:sample_rate`

* **Get compressed audio file**
  
  *Compresses and return the audio file from the databse with a designated bit depth and sample rate*

  `/api/get_compressed_audio_file/:audio_id/:bits/:sample_rate`

* **Get encrypted text from audio id**
   
   *Returns the audio waveform data converted into text based on "alphabet" encryption*
   
   `/api/get_audio_samples_characters/:audio_id/:bits/:sample_rate`

* **Get generated audio file from text string**
  
  *Returns an audio file from a character string, translating the characters into numbers, and then waveform*

  `/api/get_audio_samples_characters/:text`



### POST

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
    timestamp: Int,
    deleted: Boolean,
    disabled: Boolean
  }
  ```

### PUT

* **PUT audio data**

  *Updates a audio object in the database, restrited use*

  `/api/audio`

  ```Javascript
  {
     id: String,
     deleted: Boolean,
     disabled: Boolean,
     text: String
  }
  ```

## Content Manager

Live update content manager

![db_manager](https://user-images.githubusercontent.com/4967860/137624208-6598e592-0325-41b5-b965-273a0b5de319.PNG)


## Contribution Form

Contribition form

![photo_5](https://user-images.githubusercontent.com/4967860/137624225-b6dff4d3-d174-4f1d-bcfa-34f710e512ba.jpg)


## To Do

- Restricted use of content manager
- Restricted use of contribution form
- Clean old code
- Fix contribution form errors on iPhone devices

## References

- About converting Opus `.ogg` files used by telegram voice messages: [SoX doesn't work with Opus Audio files](https://stackoverflow.com/questions/22322372/sox-doesnt-work-with-opus-audio-files)

- Sample conversion on [SoX](http://sox.sourceforge.net/) [SoX resample and convert](https://stackoverflow.com/questions/23980283/sox-resample-and-convert)

## License

[MIT](https://opensource.org/licenses/MIT)
