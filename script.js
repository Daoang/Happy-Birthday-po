document.addEventListener("DOMContentLoaded", function () {
    const cake = document.querySelector(".cake");
    const candleCountDisplay = document.getElementById("candleCount");
    const startOverlay = document.getElementById("start-overlay");
    const startBtn = document.getElementById("start-btn");

    let candles = [];
    let audioContext;
    let analyser;
    let microphone;
    let audio = new Audio('HappyBirthdaySong.mp3'); 
    audio.loop = true;

    function updateCandleCount() {
        const activeCandles = candles.filter(
            (candle) => !candle.classList.contains("out")
        ).length;
        candleCountDisplay.textContent = activeCandles;
    }

    function addCandle(left, top) {
        const candle = document.createElement("div");
        candle.className = "candle";
        candle.style.left = left + "px";
        candle.style.top = top + "px";

        const flame = document.createElement("div");
        flame.className = "flame";
        candle.appendChild(flame);

        cake.appendChild(candle);
        candles.push(candle);
        updateCandleCount();
    }

    cake.addEventListener("click", function (event) {
        const rect = cake.getBoundingClientRect();
        const left = event.clientX - rect.left;
        const top = event.clientY - rect.top;
        addCandle(left, top);
    });

    function isBlowing() {
        // SAFETY CHECK: If mic isn't ready, don't try to read it
        if (!analyser) return false;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        let average = sum / bufferLength;

        // Lowered threshold to 40 so it's easier to blow out
        return average > 40; 
    }

    function blowOutCandles() {
        let blownOut = 0;

        // Only check if we have candles
        if (candles.length > 0 && candles.some((candle) => !candle.classList.contains("out"))) {
            if (isBlowing()) {
                candles.forEach((candle) => {
                    if (!candle.classList.contains("out") && Math.random() > 0.5) {
                        candle.classList.add("out");
                        blownOut++;
                    }
                });
            }

            if (blownOut > 0) {
                updateCandleCount();
            }

            if (candles.every((candle) => candle.classList.contains("out"))) {
                setTimeout(function () {
                    triggerConfetti();
                    endlessConfetti();
                }, 200);
            }
        }
    }

    // --- BUTTON CLICK HANDLER ---
    startBtn.addEventListener("click", function () {
        // 1. Hide Overlay
        startOverlay.classList.add("hidden");

        // 2. Play Music
        audio.play().catch((err) => console.warn("Audio play error:", err));

        // 3. Auto-add one candle to the center so there is something to blow!
        addCandle(125, 85);

        // 4. Initialize Microphone
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(function (stream) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);
                    analyser.fftSize = 256;
                    
                    // Start checking for blowing
                    setInterval(blowOutCandles, 200);
                })
                .catch(function (err) {
                    console.log("Unable to access microphone: " + err);
                    alert("⚠️ Microphone access denied! You won't be able to blow out candles. Check your browser settings.");
                });
        } else {
            alert("Your browser does not support microphone access.");
        }
    });
});

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function endlessConfetti() {
    setInterval(function () {
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0 }
        });
    }, 1000);
}
