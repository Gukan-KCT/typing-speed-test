let easyButton = document.querySelector("#easy-btn");
let mediumButton = document.querySelector("#medium-btn");
let hardButton = document.querySelector("#hard-btn");
let clearHistoryButton = document.querySelector("#clear-history-btn");
let secondsDisplay = document.querySelector("#seconds");
let textBox = document.querySelector("#text-box");
let timerSelect = document.querySelector("#timer-select");
let historyTable = document.querySelector(".history table");
let personalBest = document.querySelector(".history h4");
let easyBestDisplay = document.querySelector("#easy-best");
let mediumBestDisplay = document.querySelector("#medium-best");
let hardBestDisplay = document.querySelector("#hard-best");
let inputMessage = document.querySelector("#input-message");
let displayArea = document.querySelector(".display-content");


timerSelect.addEventListener("change", () => {
    second = Number(timerSelect.value);
    secondsDisplay.textContent = second;

    textBox.disabled = false;
    inputMessage.textContent = "";
});

async function getPassage(difficulty) {

    resetTest();

    displayArea.textContent = "";

    console.log(difficulty);

    let minLength;
    let maxLength;

    if (difficulty === "easy") {
        minLength = 40;
        maxLength = 70;
    }
    else if (difficulty === "medium") {
        minLength = 70;
        maxLength = 110;
    }
    else if (difficulty === "hard") {
        minLength = 110;
        maxLength = 160;
    }

    let attempts = 0;

    while (attempts < 10) {
        attempts++;
        const response = await fetch(
            "https://dummyjson.com/quotes/random"
        );

        const data = await response.json();

        console.log(data.quote.length);

        if (data.quote.length >= minLength && data.quote.length <= maxLength) {
            displayCharacters(data.quote);
            passageSelected = true;

            textBox.disabled = false;
            inputMessage.textContent = "";

            break;
        }
    }

    if (!passageSelected) {
        displayArea.textContent = "Could not find a suitable passage. Please try again.";
    }
}


let currentDifficulty = null;

let retryButton = document.querySelector("#retry-btn");

function setActiveDifficulty(button) {
    easyButton.classList.remove("active");
    mediumButton.classList.remove("active");
    hardButton.classList.remove("active");

    button.classList.add("active");
}

easyButton.addEventListener("click", () => {
    currentDifficulty = "easy";
    setActiveDifficulty(easyButton);
    timerSelect.disabled = false;
    inputMessage.textContent = "Select a timer to start typing.";
    getPassage("easy");

})

mediumButton.addEventListener("click", () => {
    currentDifficulty = "medium";
    setActiveDifficulty(mediumButton);
    timerSelect.disabled = false;
    inputMessage.textContent = "Select a timer to start typing.";
    getPassage("medium");

})


hardButton.addEventListener("click", () => {
    currentDifficulty = "hard";
    setActiveDifficulty(hardButton);
    timerSelect.disabled = false;
    inputMessage.textContent = "Select a timer to start typing !!!";
    getPassage("hard");

})

clearHistoryButton.addEventListener("click", () => {
    let confirmClear = confirm("Are you sure you want to clear your typing history?");

    if (confirmClear) {
        localStorage.removeItem("typingResults");
        loadHistory();
    }
});

retryButton.addEventListener("click", () => {
    getPassage(currentDifficulty);
})

let liveWPM = document.querySelector("#live-wpm");


function finishTest(interval) {

    if (testFinished) {
        return;
    }

    testFinished = true;

    clearInterval(interval);
    textBox.disabled = true;
    let endTime = Date.now();
    let elapsedTime = endTime - startTime;
    let preciseSeconds = elapsedTime / 1000;

    if (preciseSeconds < 1) {
        preciseSeconds = 1;
    }

    let typedText = textBox.value.split("");
    let spans = displayArea.querySelectorAll("span");
    let mistakes = 0;

    spans.forEach((element, index) => {
        if (
            typedText[index] !== undefined &&
            typedText[index] !== element.textContent
        ) {
            mistakes++;
        }
    });

    let correct = typedText.length - mistakes;
    let elapsedMinutes = preciseSeconds / 60;
    let wpm = (correct / 5) / elapsedMinutes;
    let accuracy;

    if (typedText.length === 0) {
        accuracy = 0;
    }
    else {
        accuracy = correct / typedText.length * 100;
    }

    let result = {
        difficulty: currentDifficulty,
        wpm: Number(wpm.toFixed(1)),
        accuracy: Number(accuracy.toFixed(1)),
        mistakes: mistakes
    };

    let results = JSON.parse(localStorage.getItem("typingResults")) || [];
    console.log(results);
    console.log(JSON.stringify(results));
    results.push(result);
    localStorage.setItem("typingResults", JSON.stringify(results));
    loadHistory();

    liveWPM.textContent = `${wpm.toFixed(1)} WPM`;
    liveMistakes.textContent = mistakes;
    liveAccuracy.textContent = accuracy.toFixed(1);
    resultMesssage.textContent = "Test Complete!";

}

function loadHistory() {
    let results = JSON.parse(localStorage.getItem("typingResults")) || [];

    let easyBest = 0;
    let mediumBest = 0;
    let hardBest = 0;



    results.forEach(result => {
        if (result.difficulty === "easy" && result.wpm > easyBest) {
            easyBest = result.wpm;
        }

        if (result.difficulty === "medium" && result.wpm > mediumBest) {
            mediumBest = result.wpm;
        }

        if (result.difficulty === "hard" && result.wpm > hardBest) {
            hardBest = result.wpm;
        }
    });

    easyBestDisplay.textContent = `Easy: ${easyBest} WPM`;
    mediumBestDisplay.textContent = `Medium: ${mediumBest} WPM`;
    hardBestDisplay.textContent = `Hard: ${hardBest} WPM`;

    historyTable.innerHTML = `
        <tr>
            <th>Difficulty</th>
            <th>WPM</th>
            <th>Accuracy</th>
            <th>Mistakes</th>
        </tr>
    `;

    results.forEach(result => {
        let row = document.createElement("tr");

        let difficulty = result.difficulty;

        if (difficulty === "easy") {
            difficulty = "Easy";
        }
        else if (difficulty === "medium") {
            difficulty = "Medium";
        }
        else if (difficulty === "hard") {
            difficulty = "Hard";
        }

        row.innerHTML = `
            <td>${difficulty}</td>
            <td>${result.wpm} WPM</td>
            <td>${result.accuracy}%</td>
            <td>${result.mistakes}</td>
        `;

        historyTable.appendChild(row);
    });
}
loadHistory();


function resetTest() {
    if (interval) {
        clearInterval(interval);
    }
    textBox.disabled = true;
    timerSelect.disabled = false;
    textBox.value = "";
    startflag = false;
    testFinished = false;
    second = Number(timerSelect.value);
    secondsDisplay.textContent = second;
    liveAccuracy.textContent = 0;
    liveMistakes.textContent = 0;
    liveWPM.textContent = "0 WPM";
    interval = null;
    passageSelected = false;

    if (currentDifficulty === "easy") {
        setActiveDifficulty(easyButton);
    }
    else if (currentDifficulty === "medium") {
        setActiveDifficulty(mediumButton);
    }
    else if (currentDifficulty === "hard") {
        setActiveDifficulty(hardButton);
    }
}


function displayCharacters(text) {
    let letters = text.split("");
    letters.forEach(element => {
        let char = document.createElement("span");

        char.textContent = element;
        displayArea.appendChild(char);
    });
}

let liveMistakes = document.querySelector("#live-mistakes");
let liveAccuracy = document.querySelector("#live-accuracy");
let resultMesssage = document.querySelector("#result-message");
let startflag = false;
let passageSelected = false;
let startTime;
let second = Number(timerSelect.value);

let interval;
let testFinished = false;

textBox.disabled = true;
secondsDisplay.textContent = second;
timerSelect.disabled = true;

displayArea.addEventListener("click", () => {
    if (!textBox.disabled) {
        textBox.focus();
    }
});

textBox.addEventListener("input", () => {
    let spans = displayArea.querySelectorAll("span");
    let typedText = textBox.value.split("");
    let mistakes = 0;
    let accuracy;

    if (typedText.length > spans.length) {
        textBox.value = textBox.value.slice(0, spans.length);
        typedText = textBox.value.split("");
    }


    if (startflag == false && passageSelected == true) {
        startTime = Date.now();
        interval = setInterval(() => {
            secondsDisplay.textContent = --second;


            if (second === 0) {
                finishTest(interval);
            }

        }, 1000);
        timerSelect.disabled = true;
        startflag = true;
    }


    spans.forEach((element, index) => {
        if (typedText[index] == undefined) {
            element.classList.remove("correct");
            element.classList.remove("incorrect");
        }
        else if (element.textContent == typedText[index]) {
            element.classList.add("correct");
            element.classList.remove("incorrect");

        }
        else {
            element.classList.add("incorrect");
            element.classList.remove("correct");
            mistakes++;

        }


    });

    let correct = typedText.length - mistakes;
    if (typedText.length == 0) {
        accuracy = 0;
    }
    else {
        accuracy = (correct / typedText.length) * 100;
    }
    liveMistakes.textContent = mistakes;
    liveAccuracy.textContent = `${accuracy.toFixed(1)} %`;

    if (typedText.length === spans.length && mistakes === 0) {
        finishTest(interval);
    }

})


