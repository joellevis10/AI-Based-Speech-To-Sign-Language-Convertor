
// Initialize Lucide Icons
lucide.createIcons();

let recognition;
let isListening = false;
let isPlaying = false;

const micBtn = document.getElementById("micBtn");
const micIndicator = document.getElementById("micIndicator");
const micIndicatorIcon = document.getElementById("micIndicatorIcon");
const micBtnIcon = document.getElementById("micBtnIcon");
const micBtnText = document.getElementById("micBtnText");
const statusMsg = document.getElementById("statusMsg");
const log = document.getElementById("log");
const signGif = document.getElementById("signGif");
const emptyState = document.getElementById("emptyState");
const fallbackText = document.getElementById("fallbackText");
const timingSlider = document.getElementById("timingSlider");
const timingValLabel = document.getElementById("timingVal");

function updateTimingLabel(val) {
    timingValLabel.innerText = (val / 1000).toFixed(1) + "s";
}

function addLog(msg) {
    const p = document.createElement("p");
    p.innerText = `> ${msg}`;
    if (log) log.prepend(p);
}

function updateMicUI(on) {
    if (!micBtn || !micIndicator) return;

    if (on) {
        micBtn.classList.remove("bg-indigo-600", "shadow-indigo-200");
        micBtn.classList.add("bg-rose-500", "shadow-rose-200");
        if (micBtnText) micBtnText.innerText = "Stop Listening";

        micIndicator.classList.add("pulse-ring", "bg-rose-100");
        if (micIndicatorIcon) {
            micIndicatorIcon.classList.remove("text-slate-500");
            micIndicatorIcon.classList.add("text-rose-500");
        }
        if (statusMsg) {
            statusMsg.innerText = "Listening...";
            statusMsg.classList.remove("text-slate-400");
            statusMsg.classList.add("text-rose-500");
        }
    } else {
        micBtn.classList.remove("bg-rose-500", "shadow-rose-200");
        micBtn.classList.add("bg-indigo-600", "shadow-indigo-200");
        if (micBtnText) micBtnText.innerText = "Start Listening";

        micIndicator.classList.remove("pulse-ring", "bg-rose-100");
        if (micIndicatorIcon) {
            micIndicatorIcon.classList.remove("text-rose-500");
            micIndicatorIcon.classList.add("text-slate-500");
        }
        if (statusMsg) {
            statusMsg.innerText = "Standby";
            statusMsg.classList.remove("text-rose-500");
            statusMsg.classList.add("text-slate-400");
        }
    }
}

function toggleMic() {
    if (isListening) {
        stopSpeech();
    } else {
        startSpeech();
    }
}

// function startSpeech() {
//     if (isListening) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//         addLog("Error: Browser does not support Speech Recognition.");
//         return;
//     }

//     if (!recognition) {
//         recognition = new SpeechRecognition();
//         recognition.lang = "en-US";
//         recognition.continuous = true;
//         recognition.interimResults = true;

//         recognition.onresult = (event) => {
//             let finalText = "";
//             let interimText = "";
//             for (let i = event.resultIndex; i < event.results.length; i++) {
//                 const transcript = event.results[i][0].transcript;
//                 if (event.results[i].isFinal) finalText += transcript + " ";
//                 else interimText += transcript;
//             }
//             const fullText = (finalText + interimText).trim();
//             const textOut = document.getElementById("textOut");
//             const manualText = document.getElementById("manualText");

//             if (textOut) textOut.innerText = fullText;
//             if (manualText) manualText.value = fullText;

//             if (finalText.trim().length > 0) {
//                 processManual();
//             }
//         };

//         recognition.onerror = (event) => {
//             addLog(`Speech Error: ${event.error}`);
//             if (event.error === 'not-allowed') stopSpeech();
//         };

//         recognition.onend = () => {
//             if (isListening) {
//                 try { recognition.start(); } catch (e) { }
//             } else {
//                 updateMicUI(false);
//             }
//         };
//     }

//     try {
//         isListening = true;
//         updateMicUI(true);
//         addLog("Microphone activated.");
//         recognition.start();
//     } catch (err) {
//         addLog("Error starting microphone: " + err.message);
//         isListening = false;
//         updateMicUI(false);
//     }
// }

function startSpeech() {
    if (isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        addLog("Error: Speech Recognition not supported. Use Chrome.");
        return;
    }

    // 🔥 ALWAYS create fresh instance (fixes crash/restart issues)
    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalText += transcript + " ";
            else interimText += transcript;
        }

        const fullText = (finalText + interimText).trim();

        const textOut = document.getElementById("textOut");
        const manualText = document.getElementById("manualText");

        if (textOut) textOut.innerText = fullText;
        if (manualText) manualText.value = fullText;

        // 🔥 Only process when FINAL speech is detected
        if (finalText.trim().length > 0) {
            processManual();
        }
    };

    recognition.onerror = (event) => {
        addLog(`Speech Error: ${event.error}`);

        // 🔥 Handle all common errors properly
        if (event.error === "not-allowed") {
            addLog("Microphone permission denied.");
            stopSpeech();
        }

        if (event.error === "no-speech") {
            addLog("No speech detected.");
        }

        if (event.error === "audio-capture") {
            addLog("No microphone found.");
            stopSpeech();
        }

        if (event.error === "network") {
            addLog("Network error.");
        }
    };

    recognition.onend = () => {
        // 🔥 Prevent infinite crash loop
        if (isListening) {
            try {
                recognition.start();
            } catch (e) {
                addLog("Restart blocked (already running)");
            }
        } else {
            updateMicUI(false);
        }
    };

    try {
        recognition.start();
        isListening = true;
        updateMicUI(true);
        addLog("Microphone activated.");
    } catch (err) {
        addLog("Error starting microphone: " + err.message);
        isListening = false;
        updateMicUI(false);
    }
}

function stopSpeech() {
    isListening = false;
    if (recognition) {
        try { recognition.stop(); } catch (e) { }
    }
    updateMicUI(false);
    addLog("Microphone stopped.");
}

function clearText() {
    const manualText = document.getElementById("manualText");
    const textOut = document.getElementById("textOut");
    if (manualText) manualText.value = "";
    if (textOut) textOut.innerText = "---";
}

function quickFill(txt) {
    const manualText = document.getElementById("manualText");
    if (manualText) {
        manualText.value = txt;
        processManual();
    }
}

async function processManual() {
    const manualText = document.getElementById("manualText");
    if (!manualText) return;
    const text = manualText.value;
    if (!text.trim()) return;

    addLog(`Processing: "${text}"`);

    try {
        const res = await fetch("/nlp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        const data = await res.json();

        if (data.signs && data.signs.length > 0) {
            createChips(data.signs);
            playSigns(data.signs);
        } else {
            addLog("No sign data found.");
        }
    } catch (err) {
        addLog("Backend error. Using Demo Mode.");
        const words = text.split(" ").filter(w => w.length > 0);
        const mockSigns = words.map(w => ({ word: w, gif: null }));
        createChips(mockSigns);
        playSigns(mockSigns);
    }
}

function createChips(signs) {
    const container = document.getElementById("chipsContainer");
    if (!container) return;
    container.innerHTML = "";
    signs.forEach((s, i) => {
        const chip = document.createElement("div");
        chip.className = "px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-600 transition-all duration-300 chip-element";
        chip.id = `chip-${i}`;
        chip.innerText = s.word.toUpperCase();
        container.appendChild(chip);
    });
}

async function playSigns(signs) {
    if (isPlaying) return;
    isPlaying = true;

    if (emptyState) emptyState.classList.add("hidden");
    if (signGif) signGif.classList.remove("hidden");

    const label = document.getElementById("currentWordLabel");
    const progress = document.getElementById("progressBar");

    for (let i = 0; i < signs.length; i++) {
        const item = signs[i];
        if (progress) progress.style.width = `${((i + 1) / signs.length) * 100}%`;

        document.querySelectorAll(".chip-element").forEach(c => c.classList.remove("chip-active"));
        const currentChip = document.getElementById(`chip-${i}`);
        if (currentChip) currentChip.classList.add("chip-active");

        if (label) {
            label.innerText = item.word;
            label.classList.remove("opacity-0");
        }

        // Force a reload of the GIF by resetting the src
        if (item.gif && signGif) {
            if (fallbackText) fallbackText.classList.add("hidden");
            signGif.classList.remove("hidden");
            signGif.src = ""; // Clear
            signGif.src = item.gif; // Set
        } else if (fallbackText) {
            if (signGif) signGif.classList.add("hidden");
            fallbackText.innerText = item.word;
            fallbackText.classList.remove("hidden");
        }

        addLog(`Showing: ${item.word}`);

        // Read duration from slider (default 3000ms)
        const duration = parseInt(timingSlider.value);
        await new Promise(r => setTimeout(r, duration));
    }

    isPlaying = false;
    if (label) {
        label.innerText = "DONE ✅";
        setTimeout(() => label.classList.add("opacity-0"), 3000);
    }
    if (progress) progress.style.width = "0%";

    setTimeout(() => {
        if (fallbackText) fallbackText.classList.add("hidden");
        if (emptyState) emptyState.classList.remove("hidden");
        if (signGif) signGif.src = "";
    }, 3000);
}
