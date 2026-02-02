window.addEventListener("load", function () {
    const startOverlay = document.getElementById("startOverlay");
    const startButton = document.getElementById("startButton");
    const cake = document.querySelector(".cake");
    
    // Exact filename from your Vercel static assets
    let audio = new Audio('HappyBirthdaySong.mp3');
    let audioContext, analyser, microphone;
    let candles = [];
    let celebrationTriggered = false;

    function handleStart() {
        // Music starts singing IMMEDIATELY upon clicking the button
        audio.play().catch(err => {
            console.log("Audio play blocked by browser settings:", err);
        });

        // Remove overlay to show the cake
        startOverlay.style.opacity = "0";
        setTimeout(() => {
            startOverlay.style.display = "none";
        }, 500);

        // Start microphone for the candle-blowing mechanic
        initMicrophone();
    }

    // Support both mouse and touch for mobile compatibility
    startButton.addEventListener("click", handleStart);
    startButton.addEventListener("touchstart", function(e) {
        e.preventDefault(); 
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
                }).catch(err => console.log("Mic access denied."));
        }
    }

    function checkBlowing() {
        if (candles.length === 0 || !analyser) return;

        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;

        // Threshold for blowing detection
        if (avg > 50) {
            candles.forEach(c => {
                if (!c.classList.contains("out") && Math.random() > 0.4) {
                    c.classList.add("out");
                }
            });
        }

        // Trigger fireworks if all candles are blown out
        if (!celebrationTriggered && candles.length > 0 && candles.every(c => c.classList.contains("out"))) {
            celebrationTriggered = true;
            triggerCelebration();
        }
    }

    function triggerCelebration() {
        // Fireworks/Confetti effect
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
        
        // Loop extra confetti every few seconds
        setInterval(() => {
            confetti({ 
                particleCount: 50, 
                origin: { x: Math.random(), y: Math.random() - 0.2 },
                colors: ['#ffc2d1', '#ff8fab', '#fb6f92']
            });
        }, 2000);
    }
});
