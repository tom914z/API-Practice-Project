let score = 0;
let currentQuestionIndex = 0;
let timeLeft = 15;
let timerInterval;
let questionsData = [];
let totalQuestions = 0; // To store the number of questions user requested

document.getElementById('triviaForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    score = 0;
    currentQuestionIndex = 0;
    updateScore();
    document.getElementById('finalScore').textContent = '';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('skipButton').style.display = 'block';

    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const numQuestions = parseInt(document.getElementById('numQuestions').value); // Number of questions
    totalQuestions = numQuestions; // Store the total number of questions

    const apiUrl1 = `https://opentdb.com/api.php?amount=${numQuestions}&category=${category}&difficulty=${difficulty}&type=multiple`;
    const apiUrl2 = `https://opentdb.com/api.php?amount=${numQuestions}&category=9&difficulty=medium&type=multiple`; // Another category for demonstration

    // Use Promise.all() to fetch two categories at once
    Promise.all([fetch(apiUrl1), fetch(apiUrl2)])
        .then(responses => Promise.all(responses.map(res => res.json()))) // Handle all responses
        .then(dataArray => {
            // Combine results from both API responses and limit the number of questions
            questionsData = dataArray.flatMap(data => data.results).slice(0, totalQuestions);
            displayQuestion();
        })
        .catch(error => console.error('Error fetching trivia data:', error));
});

document.getElementById('skipButton').addEventListener('click', function () {
    clearInterval(timerInterval);
    currentQuestionIndex++;
    displayQuestion();
});

document.getElementById('restartButton').addEventListener('click', function () {
    document.getElementById('triviaForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('finalScore').textContent = '';
    score = 0;
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('skipButton').style.display = 'none';
});

// Add the HTML entity decoding function here
function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

// Replace the old displayQuestion function with this updated one
function displayQuestion() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    // Check if we have reached the end of the questions
    if (currentQuestionIndex >= totalQuestions) {
        calculateFinalScoreWithWorker();
        return;
    }

    const questionObj = questionsData[currentQuestionIndex];
    const questionElement = document.createElement('div');
    questionElement.classList.add('question');
    // Decode the question text before displaying it
    questionElement.innerHTML = `<h3>${currentQuestionIndex + 1}. ${decodeHtmlEntities(questionObj.question)}</h3>`;

    const answers = [...questionObj.incorrect_answers, questionObj.correct_answer];
    shuffleArray(answers).forEach(answer => {
        const answerButton = document.createElement('button');
        // Decode the answer text before displaying it
        answerButton.textContent = decodeHtmlEntities(answer);
        answerButton.addEventListener('click', () => checkAnswer(answer, questionObj.correct_answer));
        questionElement.appendChild(answerButton);
    });

    container.appendChild(questionElement);

    startTimer();
}

function checkAnswer(selectedAnswer, correctAnswer) {
    clearInterval(timerInterval);
    if (selectedAnswer === correctAnswer) {
        alert('Correct!');
        score++;
    } else {
        alert(`Incorrect! The correct answer was: ${correctAnswer}`);
    }

    currentQuestionIndex++;
    updateScore();
    displayQuestion();
}

function startTimer() {
    timeLeft = 15;
    document.getElementById('timer').textContent = `Time left: ${timeLeft} seconds`;

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Time left: ${timeLeft} seconds`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Time up!');
            currentQuestionIndex++;
            displayQuestion();
        }
    }, 1000);
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function calculateFinalScoreWithWorker() {
    // Web Worker to calculate final score
    if (typeof(Worker) !== "undefined") {
        const worker = new Worker("worker.js");
        worker.postMessage(score);
        worker.onmessage = function(event) {
            const correctAnswers = event.data;
            const totalQuestions = questionsData.length; // Get total number of questions
            document.getElementById('finalScore').textContent = `Quiz Finished! You got ${correctAnswers} out of ${totalQuestions} correct!`;
            document.getElementById('restartButton').style.display = 'block';
            document.getElementById('skipButton').style.display = 'none';
        };
    } else {
        // Fallback if Web Workers are not supported
        alert('Web Workers are not supported by your browser.');
        document.getElementById('finalScore').textContent = `Quiz Finished! You got ${score} out of ${totalQuestions} correct!`;
        document.getElementById('restartButton').style.display = 'block';
        document.getElementById('skipButton').style.display = 'none';
    }
}


// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
