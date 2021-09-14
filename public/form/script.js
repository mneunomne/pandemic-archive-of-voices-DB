
var wavesurferMic;

var wavesurferAudio;

const server_url = `https://pandemic-archive-of-voices-db.herokuapp.com`
// const server_url = (location.hostname.includes('127.0.0.1') || location.hostname.includes('localhost')) ? `http://localhost:7777` : `https://pandemic-archive-of-voices-db.herokuapp.com`

var $record = $("#record")
var $stop = $("#stop")
var $again = $("#again")
var $start = $("#start")
var $play = $("#play")
var $submit = $("#submit")
var $textInput = $("#textInput")
var $languageInput = $("#languageInput")
var $otherLanguage = $("#otherLanguage")
var $start = $("#start")

var mediaRecorder = null;
var stream = false
var audioBlob = null

const maxRecordingTime = 10000
var startRecordingTimestamp = null


const init = function () {
    // start()
    addEvents()
}

const addEvents = function () {
    $start.on('click', start)
    $record.on('click', startRecording)
    $("#clear-form").on('click', clearForm)
    $stop.on('click', onStop)
    $again.on('click', function () {
        audioBlob = null
        $again.hide()
        $submit.addClass("disabled")
        startRecording()
    })

    var removeInvalid = function (el) {
        $( this ).removeClass("is-invalid")
    }
    $textInput.change(removeInvalid)
    $languageInput.change(removeInvalid)
    $otherLanguage.change(removeInvalid)

    $play.on('click', onPlay)
    $submit.on('click', onSubmit)
}

const addMicEvents = function () {
    wavesurferMic.microphone.on('deviceReady', function(s) {
        console.log('Device ready!');  
        stream = s
        $record.show()
    });
    wavesurferMic.microphone.on('deviceError', function(code) {
        console.warn('Device error: ' + code);
    });
}

const clearForm = function () {
    $again.hide()
    $play.hide()
    $textInput.val("")
    $record.show()
    audioBlob = null
    $submit.addClass("disabled")
    $("#success").hide()
    $("#error").hide()
    $("#clear-form").hide()

    $("#waveformMic").show()
    $("#waveformAudio").hide()

    $submit.show();
}

const start = function () {
    wavesurferMic = WaveSurfer.create({
        container: '#waveformMic',
        waveColor: '#ffffff',
        progressColor: '#000000',
        barHeight: 2,
        barWidth: 2,
        backgroundColor: 'black',
        cursorWidth: 0,
        interact: false,
        plugins: [
            WaveSurfer.microphone.create()
          ]
    });
    
    wavesurferAudio = WaveSurfer.create({
        container: '#waveformAudio',
        waveColor: '#ffffff',
        progressColor: 'red',
        barHeight: 2,
        barWidth: 2,
        mediaControls: true
    });

    addMicEvents()
    $("#waveform-container").removeClass("hidden")
    $("#text-container").removeClass("hidden")
    $("#submit-container").removeClass("hidden")
    $("#start-container").addClass("get-rid")
    // addMicEvents()
    wavesurferMic.microphone.start();
    $record.show()
}

const startRecording = function () {
    console.log('stream', stream)
    if (!stream) return

    startRecordingTimestamp = Date.now()

    wavesurferMic.setWaveColor('#46B54D')

    $record.hide()
    $play.hide()
    $stop.show()

    $("#waveformAudio").hide()
    $("#waveformMic").show()

    var audioChunks = []
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    mediaRecorder.addEventListener('dataavailable', event=>{
        audioChunks.push(event.data);              
    })

    window.timer = setInterval(function () {
        console.log(Date.now() - startRecordingTimestamp)
        if (Date.now() - startRecordingTimestamp > maxRecordingTime) {
            onStop();
            clearInterval(window.timer)
            window.timer = null
        }
    }, 100)

    mediaRecorder.addEventListener("stop", () => {
        audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
        console.log("audioBlob", audioBlob)
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        // audio.play();
        wavesurferAudio.load(audioUrl)
        $("#waveformMic").hide()
        $("#waveformAudio").show()
    });
} 

const onStop = function () {
    if (window.timer) clearInterval(window.timer)
    wavesurferMic.setWaveColor('white')
    $stop.hide()
    $again.show()
    $play.show()
    $submit.removeClass("disabled")
    mediaRecorder.stop()
    
}

const onPlay = function () {
    wavesurferAudio.playPause();
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


const getUserId = function () {
    var voice_id = localStorage.getItem('voice_id')
    if (voice_id === null) {
        // new id
        voice_id = makeid(8);
        localStorage.setItem('voice_id', voice_id)
    }
    return voice_id;
}


var textInput, languageInput, otherLanguage

const validateFields = function () {
    var isValid = true
    
    textInput = $textInput.val()
    languageInput = $languageInput.val()
    otherLanguage = $otherLanguage.val()

    console.log('validateFields', textInput, languageInput, otherLanguage)

    if (audioBlob === null) {
        isValid = false
    }

    if (textInput.length === 0) {
        $textInput.addClass('is-invalid')
        isValid = false
    }
    if (languageInput === null && otherLanguage.length === 0) {
        $languageInput.addClass('is-invalid')
        isValid = false
    }
    return isValid
}

const onSubmit = function () {
    
    var isValid = validateFields()

    if (isValid === false) return

    $submit.addClass("disabled")

    let id = getUserId();
    console.log("audioBlob", audioBlob.text())

    var reader = new FileReader();
    reader.onload = function(event){

        var fd = new FormData();
        fd.append('data', event.target.result);
        fd.append('id', id);
        fd.append('textInput', textInput);
        fd.append('languageInput', "no_language");
        fd.append('otherLanguage', "no_language");
        fd.append('timestamp', Date.now());


        $.ajax({
            type: "POST",
            url: `${server_url}/api/audio`,
            data: fd,
            processData: false,
            contentType:false,
            success: onPostSuccess,
            error: onPostError,
          });
    }

    reader.readAsDataURL(audioBlob);

}

const onPostSuccess = function (res) {
    console.log("Sucess!", res)
    $submit.hide()
    $("#success").show()
    $("#clear-form").show()
}
const onPostError = function (res) {
    console.error("Error!", res)
    $submit.hide()
    $("#error").show()
    $("#clear-form").show()
}


init()
