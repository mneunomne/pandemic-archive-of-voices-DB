const server_url = (location.hostname.includes('127.0.0.1') || location.hostname.includes('localhost')) ? `http://localhost:3000` : `https://pandemic-archive-of-voices-db.herokuapp.com`

var alphabet = "撒健億媒間増感察総負街時哭병体封列効你老呆安发は切짜확로감外年와모ゼДが占乜산今もれすRビコたテパアEスどバウПm가бうクん스РりwАêãХйてシжغõ小éजভकöলレ入धबलخFসeवমوযиथशkحくúoनবएদYンदnuনمッьノкتبهtт一ادіاгرزरjvةзنLxっzэTपнлçşčतلイयしяトüषখথhцहیরこñóহリअعसमペيフdォドрごыСいگдとナZকইм三ョ나gшマで시Sقに口س介Иظ뉴そキやズВ자ص兮ض코격ダるなф리Юめき宅お世吃ま来店呼설진음염론波密怪殺第断態閉粛遇罩孽關警"

var textarea = $("#textarea")
// Get DOM elements.
const audio = document.getElementById('audio');
const source = document.getElementById('source');

const default_sample_rate = 8000
const default_bits = "8"

var timeout = null
const onTextChange = function () {
  if (timeout == null) {
    timeout = setTimeout(function () {
      submitText(textarea.val())
    }, 1000)  
  } else {
    clearTimeout(timeout)
    timeout = null
  }
}

// var wav = new wavefile.WaveFile();

var submitText = function (text) {
  console.log("submitText", text.length)
  var samples = text.split("").map(c => alphabet.indexOf(c))
  var wav = new wavefile.WaveFile();
  // Create a WaveFile using the samples
  wav.fromScratch(1, default_sample_rate, default_bits, samples);
  let wavDataURI = wav.toDataURI();
  console.log("wavDataURI", wavDataURI)
  source.src = wavDataURI;
  audio.load();
  audio.loop = true;
  audio.play();

  /*
  $.ajax({
    url: `${server_url}/api/gen_audio_from_text`,
    type: "POST",
    data: {text: text},
    success: function(data){
      console.log("data", data);
      
      //var blob = new Blob(data, {type: "audio/wav"});
      const url = data

      console.log("url", url)
      
      // Insert blob object URL into audio element & play.
      source.src = url;
      audio.load();
      // audio.loop = true;
      audio.play();
    },
    error: function(err){
      console.err("err",err);
    }
  })
  */
}

textarea.focus()
textarea.bind('input propertychange', onTextChange);
