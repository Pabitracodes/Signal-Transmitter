const morseCode = {

  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",

  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",

  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",

  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",

  Y: "-.--", Z: "--..",

  1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....",

  6: "-....", 7: "--...", 8: "---..", 9: "----.", 0: "-----",

  " ": "/"

};

let track;

async function enableTorch() {

  try {

    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });

    track = stream.getVideoTracks()[0];

    const capabilities = track.getCapabilities();

    if (capabilities.torch) {

      await track.applyConstraints({ advanced: [{ torch: true }] });

      // Torch is now ready; we toggle it in flash()

    } else {

      alert("Torch not supported on this device.");

    }

  } catch (err) {

    console.error("Torch error:", err);

    alert("Unable to access flashlight. Use a compatible mobile browser.");

  }

}

function flash(on) {

  const screen = document.getElementById("flashScreen");

  screen.style.background = on ? "#00ff44" : "black";

  if (track && track.applyConstraints) {

    track.applyConstraints({ advanced: [{ torch: on }] }).catch(console.error);

  }

}

function stopTorch() {

  if (track) {

    track.stop();

    track = null;

  }

}

function playMorse() {

  const input = document.getElementById("textInput").value.toUpperCase();

  let sequence = "";

  for (let char of input) {

    if (morseCode[char]) sequence += morseCode[char] + " ";

  }

  const signals = sequence.trim().split('');

  let index = 0;

  const context = new (window.AudioContext || window.webkitAudioContext)();

  function beep(duration) {

    const osc = context.createOscillator();

    const gain = context.createGain();

    osc.connect(gain);

    gain.connect(context.destination);

    osc.type = "square";

    osc.frequency.value = 750;

    gain.gain.setValueAtTime(0.3, context.currentTime);

    osc.start(context.currentTime);

    osc.stop(context.currentTime + duration);

  }

  function transmitNext() {

    if (index >= signals.length) {

      flash(false);

      stopTorch();

      return;

    }

    const symbol = signals[index++];

    if (symbol === ".") {

      flash(true);

      beep(0.1);

      setTimeout(() => { flash(false); setTimeout(transmitNext, 150); }, 100);

    } else if (symbol === "-") {

      flash(true);

      beep(0.3);

      setTimeout(() => { flash(false); setTimeout(transmitNext, 150); }, 300);

    } else {

      setTimeout(transmitNext, 400);

    }

  }

  transmitNext();

}