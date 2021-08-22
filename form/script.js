var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#000000',
    progressColor: '#46B54D',
    barHeight: 2,
    barWidth: 5,
    plugins: [
        WaveSurfer.microphone.create()
      ]
});

// wavesurfer.microphone.start();

wavesurfer.microphone.on('deviceReady', function(stream) {
    console.log('Device ready!', stream);
});
wavesurfer.microphone.on('deviceError', function(code) {
    console.warn('Device error: ' + code);
});

