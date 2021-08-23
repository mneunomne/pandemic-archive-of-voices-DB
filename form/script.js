
var wavesurferMic = WaveSurfer.create({
    container: '#waveformMic',
    waveColor: '#000000',
    progressColor: '#46B54D',
    barHeight: 2,
    barWidth: 5,
    plugins: [
        WaveSurfer.microphone.create()
      ]
});

var wavesurferAudio = WaveSurfer.create({
    container: '#waveformAudio',
    waveColor: '#000000',
    progressColor: '#46B54D',
    barHeight: 2,
    barWidth: 1,
});

wavesurferMic.microphone.start();

var mediaRecorder = null;

var stream = false

$("#record").on('click', function () {
    if (!stream) return

    $("#waveformAudio").hide()
    $("#waveformMic").show()

    var audioChunks = []
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    mediaRecorder.addEventListener('dataavailable', event=>{
        audioChunks.push(event.data);              
    })

    mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        // audio.play();
        wavesurferAudio.load(audioUrl)
        $("#waveformMic").hide()
        $("#waveformAudio").show()
    });
})

$("#stop").on('click', function () {
    mediaRecorder.stop()
})

wavesurferMic.microphone.on('deviceReady', function(s) {
    console.log('Device ready!', stream);  
    stream = s
});
wavesurferMic.microphone.on('deviceError', function(code) {
    console.warn('Device error: ' + code);
});

