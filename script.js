const wrapper = document.querySelector(".wrapper"),
    searchInput = wrapper.querySelector("input"),
    volume = wrapper.querySelector(".word i"),
    meaningVolume = wrapper.querySelector(".meaning i"), // Select the volume icon for the meaning
    infoText = wrapper.querySelector(".info-text"),
    synonyms = wrapper.querySelector(".synonyms .list"),
    removeIcon = wrapper.querySelector(".search span");
let audio;

function data(result, word) {
    if (result.title) {
        infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
    } else {
        wrapper.classList.add("active");
        let definitions = result[0].meanings[0].definitions[0],
            phonetics = `${result[0].meanings[0].partOfSpeech}  /${result[0].phonetics[0].text}/`;
        document.querySelector(".word p").innerText = result[0].word;
        document.querySelector(".word span").innerText = phonetics;
        document.querySelector(".meaning span").innerText = definitions.definition;

        // Meaning volume icon
        meaningVolume.style.display = "inline-block";  // Show the volume icon for meaning

        // Check if there is an audio pronunciation available
        if (result[0].phonetics[0] && result[0].phonetics[0].audio) {
            audio = new Audio(result[0].phonetics[0].audio);
            volume.style.display = "inline-block";  // Show the volume icon if audio is available
        } else {
            audio = null;  // No audio available
            volume.style.display = "none";  // Hide the volume icon if no audio is available
        }

        if (!definitions.synonyms || definitions.synonyms.length === 0) {
            synonyms.parentElement.style.display = "none";
        } else {
            synonyms.parentElement.style.display = "block";
            synonyms.innerHTML = "";
            for (let i = 0; i < Math.min(5, definitions.synonyms.length); i++) {
                let tag = `<span onclick="search('${definitions.synonyms[i]}')">${definitions.synonyms[i]}</span>`;
                if (i < 4) tag += ',';
                synonyms.insertAdjacentHTML("beforeend", tag);
            }
        }
    }
}

function search(word) {
    fetchApi(word);
    searchInput.value = word;
}

function fetchApi(word) {
    wrapper.classList.remove("active");
    infoText.style.color = "#000";
    infoText.innerHTML = `Searching the meaning of <span>"${word}"</span>`;
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => data(result, word))
        .catch(() => {
            infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
        });
}

searchInput.addEventListener("keyup", e => {
    let word = e.target.value.trim();
    if (e.key === "Enter" && word) {
        fetchApi(word);
    }
});

volume.addEventListener("click", () => {
    if (audio) {
        volume.style.color = "#4D59FB";
        audio.play();
        setTimeout(() => {
            volume.style.color = "#999";
        }, 800);
    }
});

meaningVolume.addEventListener("click", () => {
    const meaningText = document.querySelector(".meaning span").innerText;
    if (meaningText) {
        const utterance = new SpeechSynthesisUtterance(meaningText);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    }
});

removeIcon.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    wrapper.classList.remove("active");
    infoText.style.color = "#9A9A9A";
    infoText.innerHTML = "Type any existing word and press enter to get meaning, example, synonyms, etc.";
});
