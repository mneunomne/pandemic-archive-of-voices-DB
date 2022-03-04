const alphabet = "撒健億媒間増感察総負街時哭병体封列効你老呆安发は切짜확로감外年와모ゼДが占乜산今もれすRビコたテパアEスどバウПm가бうクん스РりwАêãХйてシжغõ小éजভकöলレ入धबलخFসeवমوযиथशkحくúoनবएদYンदnuনمッьノкتبهtт一ادіاгرزरjvةзنLxっzэTपнлçşčतلイयしяトüषখথhцहیরこñóহリअعसमペيフdォドрごыСいگдとナZকইм三ョ나gшマで시Sقに口س介Иظ뉴そキやズВ자ص兮ض코격ダるなф리Юめき宅お世吃ま来店呼설진음염론波密怪殺第断態閉粛遇罩孽關警"

const audio = document.createElement('audio');
const source = document.createElement('source');
source.setAttribute("type", "audio/wav")
audio.append(source)

const default_sample_rate = 8000
const default_bits = "8"

const text2Audio = function (text, loop) {
  var loop = loop || false 
  var samples = text.split("").map(c => alphabet.indexOf(c))
  var wav = new wavefile.WaveFile();
  // Create a WaveFile using the samples
  wav.fromScratch(1, default_sample_rate, default_bits, samples);
  let wavDataURI = wav.toDataURI();
  console.log("wavDataURI", wavDataURI)
  source.src = wavDataURI;
  audio.load();
  audio.loop = loop;
  audio.play();
}