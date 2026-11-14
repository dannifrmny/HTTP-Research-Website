
/* HTTP Quiz - IT 3203
   Handles grading, feedback, timer, and retakes.
*/

const quizForm = document.getElementById("quiz-form");
const results = document.getElementById("quiz-results");
const timerDisplay = document.getElementById("timer");
const resetButton = document.getElementById("reset-quiz");
const submitButton = document.getElementById("submit-quiz");

// Each question is worth one point.
const answers = [
    {
        name: "q1",
        correct: "hypertext transfer protocol",
        display: "Hypertext Transfer Protocol",
        type: "text"
    },
    {
        name: "q2",
        correct: "get",
        display: "GET",
        type: "text"
    },
    {
        name: "q3",
        correct: "404",
        display: "404",
        type: "radio"
    },
    {
        name: "q4",
        correct: "3",
        display: "HTTP/3",
        type: "radio"
    },
    {
        name: "q5",
        correct: "success",
        display: "Success",
        type: "radio"
    },
    {
        name: "q6",
        correct: ["GET", "POST", "DELETE"],
        display: "GET, POST, DELETE",
        type: "checkbox"
    },
    {
        name: "q7",
        correct: "TLS",
        display: "TLS",
        type: "radio"
    },
    {
        name: "q8",
        correct: "stateless",
        display: "Stateless",
        type: "radio"
    },
    {
        name: "q9",
        correct: "500",
        display: "500",
        type: "text"
    },
    {
        name: "q10",
        correct: "communication",
        display: "Client-server communication",
        type: "radio"
    }
];

const timeLimit = 600; // 10 minutes in seconds
let remaining = timeLimit;
let startTime;
let intervalId;
let finished = false;

// Format seconds as minutes:seconds.
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes}:${String(secs).padStart(2, "0")}`;
}

// Read the user's answer from the HTML form.
function getAnswer(question) {
    const name = question.name;

    if (question.type === "text") {
        const input = quizForm.querySelector(
            `input[name="${name}"]`
        );

        return input.value.trim().toLowerCase()
            .replace(/\s+/g, " ");
    }

    if (question.type === "checkbox") {
        return Array.from(
            quizForm.querySelectorAll(
                `input[name="${name}"]:checked`
            )
        ).map(input => input.value);
    }

    const selected = quizForm.querySelector(
        `input[name="${name}"]:checked`
    );

    return selected ? selected.value : "";
}

// Check whether the answer is correct.
function isCorrect(question, answer) {
    if (question.type === "checkbox") {
        return answer.length === question.correct.length &&
            question.correct.every(value => answer.includes(value));
    }

    return answer === question.correct;
}

// Update the countdown.
function updateTimer() {
    if (finished) return;

    const elapsed = Math.floor(
        (Date.now() - startTime) / 1000
    );

    remaining = Math.max(0, timeLimit - elapsed);

    timerDisplay.textContent =
        `Time Remaining: ${formatTime(remaining)}`;

    if (remaining === 0) {
        gradeQuiz();
    }
}

// Grade and display results.
function gradeQuiz() {
    if (finished) return;

    updateTimer();
    finished = true;
    clearInterval(intervalId);

    const elapsed = Math.min(
        timeLimit,
        Math.floor((Date.now() - startTime) / 1000)
    );

    let score = 0;
    results.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = "Your Quiz Results";
    results.appendChild(heading);

    const feedback = document.createElement("div");

    answers.forEach((question, index) => {
        const answer = getAnswer(question);
        const correct = isCorrect(question, answer);

        if (correct) score++;

        const item = document.createElement("div");
        item.className = correct
            ? "feedback-correct"
            : "feedback-incorrect";

        const title = document.createElement("h3");
        title.textContent =
            `Question ${index + 1}: ${correct ? "Correct" : "Incorrect"}`;

        const userAnswer = document.createElement("p");

        const displayedAnswer = Array.isArray(answer)
            ? answer.join(", ") || "No answer"
            : answer || "No answer";

        userAnswer.textContent =
            `Your answer: ${displayedAnswer}`;

        const correctAnswer = document.createElement("p");
        correctAnswer.textContent =
            `Correct answer: ${question.display}`;

        item.append(title, userAnswer, correctAnswer);
        feedback.appendChild(item);
    });

    const summary = document.createElement("div");
    summary.className = score >= 7
        ? "quiz-pass"
        : "quiz-fail";

    summary.innerHTML = `
        <h3>${score >= 7 ? "PASS" : "FAIL"}</h3>
        <p>Score: ${score}/10 (${score * 10}%)</p>
        <p>Time spent: ${formatTime(elapsed)}</p>
    `;

    results.append(summary, feedback);
    results.hidden = false;

    // Prevent answers from changing after submission.
    quizForm.querySelectorAll("input").forEach(input => {
        input.disabled = true;
    });

    submitButton.disabled = true;

    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Start or restart the quiz.
function startQuiz() {
    clearInterval(intervalId);

    quizForm.reset();

    quizForm.querySelectorAll("input").forEach(input => {
        input.disabled = false;
    });

    submitButton.disabled = false;

    results.innerHTML = "";
    results.hidden = true;

    finished = false;
    remaining = timeLimit;
    startTime = Date.now();

    timerDisplay.textContent = "Time Remaining: 10:00";

    intervalId = setInterval(updateTimer, 1000);
}

// Submit without reloading the page.
quizForm.addEventListener("submit", function(event) {
    event.preventDefault();
    gradeQuiz();
});

// Retake the quiz.
resetButton.addEventListener("click", startQuiz);

// Begin the countdown when the page loads.
startQuiz();
