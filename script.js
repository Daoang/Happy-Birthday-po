window.onload = function () {
    const startOverlay = document.getElementById("startOverlay");
    const startButton = document.getElementById("startButton");
    const cake = document.querySelector(".cake");
    
    // Exactly matching your filename from screenshot
    let audio = new Audio('HappyBirthdaySong.mp3');
    let celebrationTriggered = false;
    let candles = [];
    let audioContext, analyser;

    function handleStart() {
        // Play audio immediately upon click
        audio.play().catch(e => console.log("Audio block:", e));
        
        startOverlay.style.opacity = "0";
        setTimeout(() => {
            startOverlay.style.display = "none";
        }, 500);

        initMicrophone();
    }

    startButton.onclick = handleStart;
    startButton.ontouchstart = (e) => { e.preventDefault(); handleStart(); };

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
    }

    cake.onclick = (e) => {
        const rect = cake.getBoundingClientRect();
        addCandle(e.clientX - rect.left, e.clientY - rect.top);
    };

    function initMicrophone() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    const microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);
                    analyser.fftSize = 256;
                    setInterval(checkBlowing, 200);
                }).catch(err => alert("Allow microphone to blow out candles!"));
        }
    }

    function checkBlowing() {
        if (candles.length === 0 || !analyser) return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;

        if (avg > 50) {
            candles.forEach(c => {
                if (!c.classList.contains("out") && Math.random() > 0.4) c.classList.add("out");
            });
        }

        if (!celebrationTriggered && candles.length > 0 && candles.every(c => c.classList.contains("out"))) {
            celebrationTriggered = true;
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
        }
    }
};
