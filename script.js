// Wrap everything in a load check to ensure elements exist
window.addEventListener("load", function () {
    const startOverlay = document.getElementById("startOverlay");
    const startButton = document.getElementById("startButton");
    const cake = document.querySelector(".cake");
    
    let audio = new Audio('HappyBirthdaySong.mp3');
    let audioContext, analyser, microphone;
    let candles = [];
    let celebrationStarted = false;

    function handleStart() {
        // Unlock audio for mobile
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(err => console.log("Audio unlock error:", err));

        // Smoothly hide overlay
        startOverlay.style.opacity = "0";
        setTimeout(() => {
            startOverlay.style.display = "none";
        }, 500);

        initMicrophone();
    }

    // Add both click and touch listeners for better mobile support
    startButton.addEventListener("click", handleStart);
    startButton.addEventListener("touchstart", function(e) {
        e.preventDefault(); // Prevents double-firing
        handleStart();
    }, {passive: false});

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

    cake.addEventListener("click", (e) => {
        const rect = cake.getBoundingClientRect();
        addCandle(e.clientX - rect.left, e.clientY - rect.top);
    });

    function initMicrophone() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);
                    analyser.fftSize = 256;
                    setInterval(checkBlowing, 200);
                }).catch(err => alert("Please allow microphone access to blow out candles!"));
        }
    }

    function checkBlowing() {
        if (candles.length === 0 || celebrationStarted || !analyser) return;

        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;

        if (avg > 50) {
            candles.forEach(c => {
                if (!c.classList.contains("out") && Math.random() > 0.4) {
                    c.classList.add("out");
                }
            });
        }

        if (candles.length > 0 && candles.every(c => c.classList.contains("out"))) {
            celebrationStarted = true;
            triggerCelebration();
        }
    }

    function triggerCelebration() {
        audio.play();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setInterval(() => {
            confetti({ particleCount: 50, origin: { x: Math.random(), y: Math.random() - 0.2 } });
        }, 2000);
    }
});
