let score = 0;
let currentQuestionIndex = 0;
let timeLeft = 30;
let timerInterval;
let questionsData = [];

document.getElementById('triviaForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    score = 0;  // Reset score
    currentQuestionIndex = 0;
    updateScore();
    document.getElementById('finalScore').textContent = '';  // Clear final score
    document.getElementById('restartButton').style.display = 'none';  // Hide restart button
    document.getElementById('skipButton').style.display = 'block';  // Show skip button

    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const numQuestions = document.getElementById('numQuestions').value;

    // Trivia API URL with dynamic parameters
    const apiUrl = `https://opentdb.com/api.php?amount=${numQuestions}&category=${category}&difficulty=${difficulty}&type=multiple`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        questionsData = data.results;  // Store questions data globally
        displayQuestion();
    } catch (error) {
        console.error('Error fetching trivia data:', error);
    }
});

document.getElementById('skipButton').addEventListener('click', function () {
    clearInterval(timerInterval);
    currentQuestionIndex++;
    displayQuestion();
});

document.getElementById('restartButton').addEventListener('click', function () {
    document.getElementById('triviaForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';  // Clear questions
    document.getElementById('score').textContent = 'Score: 0';  // Reset score display
    document.getElementById('finalScore').textContent = '';  // Clear final score
    score = 0;
    document.getElementById('restartButton').style.display = 'none';  // Hide restart button
    document.getElementById('skipButton').style.display = 'none';  // Hide skip button
});

function displayQuestion() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';  // Clear previous question

    if (currentQuestionIndex >= questionsData.length) {
        displayFinalScore();
        return;
    }

    const questionObj = questionsData[currentQuestionIndex];
    const questionElement = document.createElement('div');
    questionElement.classList.add('question');
    questionElement.innerHTML = `<h3>${currentQuestionIndex + 1}. ${questionObj.question}</h3>`;

    // Create a list of answers (shuffling correct and incorrect answers)
    const answers = [...questionObj.incorrect_answers, questionObj.correct_answer];
    shuffleArray(answers).forEach(answer => {
        const answerButton = document.createElement('button');
        answerButton.textContent = answer;
        answerButton.addEventListener('click', () => checkAnswer(answer, questionObj.correct_answer));
        questionElement.appendChild(answerButton);
    });

    container.appendChild(questionElement);

    startTimer();  // Start timer for this question
}

function checkAnswer(selectedAnswer, correctAnswer) {
    clearInterval(timerInterval);  // Stop the timer when an answer is selected
    if (selectedAnswer === correctAnswer) {
        alert('Correct!');
        score++;
    } else {
        alert(`Incorrect! The correct answer was: ${correctAnswer}`);
    }

    currentQuestionIndex++;
    updateScore();
    displayQuestion();  // Display next question
}

function startTimer() {
    timeLeft = 30;
    document.getElementById('timer').textContent = `Time left: ${timeLeft} seconds`;

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Time left: ${timeLeft} seconds`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Time up!');
            currentQuestionIndex++;
            displayQuestion();  // Move to the next question
        }
    }, 1000);
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function displayFinalScore() {
    document.getElementById('questionsContainer').innerHTML = '';  // Clear questions
    document.getElementById('finalScore').textContent = `Quiz Finished! Your final score is: ${score}`;
    document.getElementById('restartButton').style.display = 'block';  // Show restart button
    document.getElementById('skipButton').style.display = 'none';  // Hide skip button
}

// Helper function to shuffle array (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
