// Constants to configure the lesson behavior
const CORRECT_STREAK_THRESHOLD = 3;  // Number of correct answers in a row to advance a stage
const CORRECT_ANSWER_TIMEOUT = 1000; // Timeout before showing the next question after correct answer
const HIGHLIGHT_TIMEOUT = 3500;      // Timeout for highlighting the correct answer after incorrect attempts

// Declare elements (DOM references)
let startButton, retryButton, lessonScreen, completionScreen, initialScreen, questionElement, numberLineContainer, progressElement, feedbackElement;

// Variables to track the state of the lesson
let currentStage = 1;        // Tracks the current difficulty stage
let correctStreak = 0;       // Tracks the user's current streak of correct answers
let currentQuestion = 1;     // Tracks the current question number
let totalQuestions = 10;     // Total number of questions in the lesson
let correctNumber = 0;       // The correct answer number
let targetRange = null;      // The correct range for questions requiring a range answer
let currentQuestionClass = "";// Current type of question being asked
let incorrectAttempts = 0;   // Number of incorrect attempts for the current question

// Stages representing different number ranges for the number line
const stages = [
  { min: 1, max: 10 },
  { min: 0, max: 10 },
  { min: -10, max: 10 },
  { min: -20, max: 20 },
];

// Different types of questions that can be asked during the lesson
const questionClasses = [
  "IdentifySpecificNumber", "IdentifyGreaterThanNumber", "IdentifyLessThanNumber", 
  "IdentifyBetweenNumbers", "LocateZero", "IdentifyLargestNumber", "IdentifySmallestNumber", 
  "IdentifyPositiveNumber", "IdentifyNegativeNumber", "OrderNumbers", 
  "DistanceFromZero", "IdentifyEvenNumber", "IdentifyOddNumber"
];

// Wait for the DOM to load before initializing elements
document.addEventListener("DOMContentLoaded", () => {
  initializeDomElements();  // Initialize DOM elements
  addEventListeners();      // Set up event listeners
});

// Function to initialize all required DOM elements
function initializeDomElements() {
  startButton = document.getElementById("start-button");
  retryButton = document.getElementById("retry-button");
  lessonScreen = document.getElementById("lesson-screen");
  completionScreen = document.getElementById("completion-screen");
  initialScreen = document.getElementById("initial-screen");
  questionElement = document.getElementById("question");
  numberLineContainer = document.getElementById("number-line-container");
  progressElement = document.getElementById("progress");
  feedbackElement = document.getElementById("feedback");
}

// Function to add event listeners for starting and retrying the lesson
function addEventListeners() {
  if (startButton && retryButton) {
    startButton.addEventListener("click", startLesson);
    retryButton.addEventListener("click", startLesson);
  } else {
  }
}

// Start a new lesson by resetting variables and showing the first question
function startLesson() {
  resetProgress();
  initialScreen.style.display = "none";
  completionScreen.style.display = "none";
  lessonScreen.style.display = "block";
  nextQuestion();
}

// Reset all tracking variables for a fresh start
function resetProgress() {
  currentStage = 1;
  correctStreak = 0;
  currentQuestion = 1;
  incorrectAttempts = 0;
}

// Generate a new question based on the current stage and update the question text
function generateQuestion() {
    const stage = stages[currentStage - 1];
    const validQuestions = questionClasses.filter(isQuestionValidForStage(stage));
    
    if (validQuestions.length === 0) {
      console.error("No valid questions available for this stage. Check stage boundaries.");
      return;
    }
  
    currentQuestionClass = randomFromArray(validQuestions);
    setQuestionAndTarget(currentQuestionClass, stage);
  }
  

// Determine if a question type is valid for the current stage range
function isQuestionValidForStage(stage) {
    return (questionClass) => {
      switch (questionClass) {
        case "LocateZero":
          // Only valid if zero is within the stage range
          return stage.min <= 0 && stage.max >= 0;
  
        case "IdentifyPositiveNumber":
          // Only valid if there are positive numbers in the range
          return stage.max > 0;
  
        case "IdentifyNegativeNumber":
          // Only valid if there are negative numbers in the range
          return stage.min < 0;
  
        case "IdentifyGreaterThanNumber":
          // Only valid if there's room for a number greater than a selected number
          return stage.min < stage.max;
  
        case "IdentifyLessThanNumber":
          // Only valid if there's room for a number less than a selected number
          return stage.min < stage.max && stage.min > Number.NEGATIVE_INFINITY;
  
        case "DistanceFromZero":
          // Only valid if zero is within the range
          return stage.min <= 0 && stage.max >= 0;
  
        default:
          // All other questions are generally valid
          return true;
      }
    };
  }
  

// Set the question text and the correct answer or range for the generated question
function setQuestionAndTarget(questionType, stage) {
    const range = stage.max - stage.min;
    targetRange = null;
    switch (questionType) {
      case "IdentifySpecificNumber":
        correctNumber = randomInRange(stage.min, stage.max);
        setQuestionText(`Click on the point that represents ${correctNumber}.`);
        console.log(`Target number set to: ${correctNumber}`);
        break;
  
      case "IdentifyGreaterThanNumber":
        // Avoid selecting the maximum value to ensure there's a greater value
        correctNumber = randomInRange(stage.min, stage.max - 1);
        setQuestionText(`Click on a number greater than ${correctNumber}.`);
        targetRange = { min: correctNumber + 1, max: stage.max };
        console.log(`Target range set to greater than ${correctNumber} (Range: ${targetRange.min} - ${targetRange.max})`);
        break;
  
      case "IdentifyLessThanNumber":
        // Avoid selecting the minimum value to ensure there's a lesser value
        correctNumber = randomInRange(stage.min + 1, stage.max);
        setQuestionText(`Click on a number less than ${correctNumber}.`);
        targetRange = { min: stage.min, max: correctNumber - 1 };
        console.log(`Target range set to less than ${correctNumber} (Range: ${targetRange.min} - ${targetRange.max})`);
        break;
  
      case "IdentifyBetweenNumbers":
        setRangeQuestion(stage);
        break;
  
      case "LocateZero":
        correctNumber = 0;
        setQuestionText(`Click on the point that represents 0.`);
        console.log(`Target number set to: ${correctNumber}`);
        break;
  
      case "IdentifyLargestNumber":
        correctNumber = stage.max;
        setQuestionText(`Click on the largest number on the number line.`);
        console.log(`Target number (largest) set to: ${correctNumber}`);
        break;
  
      case "IdentifySmallestNumber":
        correctNumber = stage.min;
        setQuestionText(`Click on the smallest number on the number line.`);
        console.log(`Target number (smallest) set to: ${correctNumber}`);
        break;
  
      case "IdentifyPositiveNumber":
        targetRange = { min: Math.max(stage.min, 1), max: stage.max };
        setQuestionText(`Click on a positive number.`);
        console.log(`Target range for positive numbers set to: ${targetRange.min} - ${targetRange.max}`);
        break;
  
      case "IdentifyNegativeNumber":
        targetRange = { min: stage.min, max: Math.min(stage.max, -1) };
        setQuestionText(`Click on a negative number.`);
        console.log(`Target range for negative numbers set to: ${targetRange.min} - ${targetRange.max}`);
        break;
  
      case "OrderNumbers":
        const [num1, num2] = [randomInRange(stage.min, stage.max), randomInRange(stage.min, stage.max)];
        correctNumber = Math.max(num1, num2);
        setQuestionText(`Which number is greater: ${num1} or ${num2}? Click on the greater one.`);
        console.log(`Target number (greater) set to: ${correctNumber}`);
        break;
  
      case "DistanceFromZero":
        setDistanceFromZeroQuestion(range);
        break;
  
      case "IdentifyEvenNumber":
        setQuestionText(`Click on an even number.`);
        console.log("Set question to identify an even number.");
        break;
  
      case "IdentifyOddNumber":
        setQuestionText(`Click on an odd number.`);
        console.log("Set question to identify an odd number.");
        break;
    }
  }
  

// Set the question text to identify a number within a range, ensuring there is at least one valid option
function setRangeQuestion(stage) {
    let num1, num2, min, max;
  
    // Loop until a valid range is found (i.e., a range where there is at least one number between min and max)
    do {
      num1 = randomInRange(stage.min, stage.max);
      num2 = randomInRange(stage.min, stage.max);
      min = Math.min(num1, num2);
      max = Math.max(num1, num2);
    } while (max - min <= 1); // Repeat until there is at least one integer between min and max
  
    setQuestionText(`Click on a number between ${min} and ${max}.`);
    targetRange = { min, max };
    console.log(`Target range for between numbers set to: ${targetRange.min} - ${targetRange.max}`);
  }
  

// Set the question text for identifying a number a certain distance from zero
function setDistanceFromZeroQuestion(range) {
  const distance = randomInRange(0, Math.min(range, 5));
  correctNumber = Math.random() < 0.5 ? -distance : distance;
  setQuestionText(`Click on the number that is ${Math.abs(distance)} units away from 0.`);
}

// Function to draw the number line and add event listeners for each tick mark
function drawNumberLine() {
  numberLineContainer.innerHTML = '<div id="number-line"></div>'; // Clear previous number line
  const stage = stages[currentStage - 1];
  for (let i = stage.min; i <= stage.max; i++) {
    const tick = createTickElement(i, stage);
    numberLineContainer.appendChild(tick);
  }

  numberLineContainer.addEventListener("click", handleNumberLineClick);
}

// Handle clicks on the number line to determine user answer
function handleNumberLineClick(e) {
 
    // Ensure that we are getting the value from the correct element
    if (e.target.classList.contains("label")) {
      // Parse the value from the data attribute of the clicked label
      const selectedNumber = parseInt(e.target.dataset.value, 10);
  
      // Check if the value is properly parsed and is not NaN
      if (!isNaN(selectedNumber)) {
        handleAnswer(selectedNumber);
      } else {
        console.error("Failed to parse selected number. Dataset value was:", e.target.dataset.value);
      }
    } else {
      console.warn("Clicked element was not a label. Event target:", e.target);
    }
  }
  

// Create a tick mark element with label for the number line
function createTickElement(value, stage) {
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.left = ((value - stage.min) / (stage.max - stage.min)) * 100 + "%";
    tick.dataset.value = value; // Ensure data-value is correctly set
  
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = value;
    label.dataset.value = value; // Adding data-value to the label for easier access
  
    tick.appendChild(label);
    return tick;
  }
  

// Handle user answers and provide feedback
function handleAnswer(selectedNumber) {
  console.log(`User selected: ${selectedNumber}`);
  const isCorrect = checkAnswer(selectedNumber);
  console.log(`Is the answer correct? ${isCorrect}`);
  displayFeedback(isCorrect);
}

// Check if the selected answer is correct based on the current question type
function checkAnswer(selectedNumber) {
  switch (currentQuestionClass) {
    case "IdentifySpecificNumber":
      return selectedNumber === correctNumber;
    case "LocateZero":
      return selectedNumber === 0;
    case "IdentifyLargestNumber":
      return selectedNumber === stages[currentStage - 1].max;
    case "IdentifySmallestNumber":
      return selectedNumber === stages[currentStage - 1].min;
    case "OrderNumbers":
      return selectedNumber === correctNumber;
    case "DistanceFromZero":
      return Math.abs(selectedNumber) === Math.abs(correctNumber);
    case "IdentifyGreaterThanNumber":
      return selectedNumber > correctNumber;
    case "IdentifyLessThanNumber":
      return selectedNumber < correctNumber;
    case "IdentifyBetweenNumbers":
      return selectedNumber > targetRange.min && selectedNumber < targetRange.max;
    case "IdentifyPositiveNumber":
      return selectedNumber > 0;
    case "IdentifyNegativeNumber":
      return selectedNumber < 0;
    case "IdentifyEvenNumber":
      return selectedNumber % 2 === 0;
    case "IdentifyOddNumber":
      return selectedNumber % 2 !== 0;
    default:
      console.error(`Unexpected question class: ${currentQuestionClass}`);
      return false;
  }
}

// Display feedback to the user, handling both correct and incorrect answers
// Display feedback to the user, handling both correct and incorrect answers
function displayFeedback(isCorrect) {
    if (!feedbackElement) {
      console.error("Feedback element is not defined. Cannot append feedback.");
      return;
    }
  
    const feedbackMessage = createFeedbackMessage(isCorrect, `Question ${currentQuestion}: `);
    feedbackElement.appendChild(feedbackMessage);
  
    // Scroll to the bottom to show the latest feedback
    feedbackElement.scrollTop = feedbackElement.scrollHeight;
  
    // Ensure that feedback does not exceed a certain limit
    while (feedbackElement.children.length > 10) {
      feedbackElement.removeChild(feedbackElement.firstChild);
    }
  
    if (isCorrect) {
      // Handling correct answers
      correctStreak++;
      feedbackMessage.textContent += ` Correct! Well done.`;
  
      // Check if correct streak threshold is met to progress to the next stage
      if (correctStreak >= CORRECT_STREAK_THRESHOLD) {
        if (currentStage < stages.length) {
          currentStage++;
          correctStreak = 0; // Reset correct streak after advancing to next stage
        } else {
          console.log("Maximum stage reached. Continuing at the current stage.");
        }
      }
  
      currentQuestion++;
      incorrectAttempts = 0; // Reset incorrect attempts for new question
      setTimeout(nextQuestion, CORRECT_ANSWER_TIMEOUT);
  
    } else {
      // Handling incorrect answers
      incorrectAttempts++;
  
      if (incorrectAttempts === 1) {
        // First incorrect attempt: Give another chance
        feedbackMessage.textContent += " Incorrect. Please try again.";
      } else if (incorrectAttempts === 2) {
        // Second incorrect attempt: Show correct answer and highlight
        feedbackMessage.textContent += ` Incorrect again. The correct answer is ${getCorrectAnswerText()}. Highlighting the correct answer on the number line.`;
  
        // Highlight the correct answer on the number line
        highlightCorrectAnswer();
  
        // Reset incorrect attempts and move to the next question after a delay
        incorrectAttempts = 0; // Reset incorrect attempts for next question
        currentQuestion++;
        setTimeout(nextQuestion, HIGHLIGHT_TIMEOUT);
      }
    }
  }

// Function to provide the correct answer text for feedback
function getCorrectAnswerText() {
  switch (currentQuestionClass) {
    case "IdentifySpecificNumber":
      return `the number ${correctNumber}`;
    case "LocateZero":
      return `the number 0`;
    case "IdentifyLargestNumber":
      return `the largest number, which is ${stages[currentStage - 1].max}`;
    case "IdentifySmallestNumber":
      return `the smallest number, which is ${stages[currentStage - 1].min}`;
    case "OrderNumbers":
      return `the greater number, which is ${correctNumber}`;
    case "DistanceFromZero":
      return `${correctNumber}, which is ${Math.abs(correctNumber)} units away from 0`;
    case "IdentifyGreaterThanNumber":
      return `any number greater than ${correctNumber}`;
    case "IdentifyLessThanNumber":
      return `any number less than ${correctNumber}`;
    case "IdentifyBetweenNumbers":
      return `any number between ${targetRange.min} and ${targetRange.max}`;
    case "IdentifyPositiveNumber":
      return `any positive number greater than 0`;
    case "IdentifyNegativeNumber":
      return `any negative number less than 0`;
    case "IdentifyEvenNumber":
      return `an even number`;
    case "IdentifyOddNumber":
      return `an odd number`;
    default:
      console.error(`Unexpected question class for correct answer: ${currentQuestionClass}`);
      return "the correct answer";
  }
}

// Function to move to the next question or complete the lesson if finished
function nextQuestion() {
  if (currentQuestion <= totalQuestions) {
    incorrectAttempts = 0;
    drawNumberLine();
    generateQuestion();
    updateProgressText();
  } else {
    completeLesson();
  }
}

// Update progress text to reflect the current question number
function updateProgressText() {
  progressElement.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
}

// Function to complete the lesson and show a summary
function completeLesson() {
  lessonScreen.style.display = "none";
  completionScreen.style.display = "block";
  document.getElementById("summary").textContent = `You have completed the lesson with ${correctStreak} correct answers in a row.`;
}

// Highlight the correct answer or range on the number line
function highlightCorrectAnswer() {
    console.log("Highlighting the correct answer... correctNumber, targetRange.min/max", correctNumber, targetRange ? targetRange.min : "N/A", targetRange ? targetRange.max : "N/A");
    
    document.querySelectorAll(".label").forEach((label) => {
      const value = parseInt(label.textContent);
  
      let shouldHighlight = false;
  
      switch (currentQuestionClass) {
        case "IdentifySpecificNumber":
          shouldHighlight = value === correctNumber;
          break;
  
        case "LocateZero":
          shouldHighlight = value === 0;
          break;
  
        case "IdentifyLargestNumber":
          shouldHighlight = value === stages[currentStage - 1].max;
          break;
  
        case "IdentifySmallestNumber":
          shouldHighlight = value === stages[currentStage - 1].min;
          break;
  
        case "OrderNumbers":
          shouldHighlight = value === correctNumber;
          break;
  
        case "DistanceFromZero":
          shouldHighlight = Math.abs(value) === Math.abs(correctNumber);
          break;
  
        case "IdentifyGreaterThanNumber":
          shouldHighlight = value > correctNumber;
          break;
  
        case "IdentifyLessThanNumber":
          shouldHighlight = value < correctNumber;
          break;
  
        case "IdentifyBetweenNumbers":
          shouldHighlight = value > targetRange.min && value < targetRange.max;
          break;
  
        case "IdentifyPositiveNumber":
          shouldHighlight = value > 0;
          break;
  
        case "IdentifyNegativeNumber":
          shouldHighlight = value < 0;
          break;
  
        case "IdentifyEvenNumber":
          shouldHighlight = value % 2 === 0;
          break;
  
        case "IdentifyOddNumber":
          shouldHighlight = value % 2 !== 0;
          break;
  
        default:
          console.error(`Unexpected question class for highlighting: ${currentQuestionClass}`);
      }
  
      if (shouldHighlight) {
        label.classList.add("labelHighlight");
      }
    });
  }
  

// Utility function to generate a random number within a specified range
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility function to pick a random item from an array
function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Utility function to set the question text
function setQuestionText(text) {
  questionElement.textContent = text;
}

// Utility function to create a feedback message element
function createFeedbackMessage(isCorrect, text) {
  const feedbackMessage = document.createElement("div");
  feedbackMessage.classList.add("feedback-entry");
  feedbackMessage.textContent = text;
  feedbackMessage.classList.add(isCorrect ? "correct" : "incorrect");
  return feedbackMessage;
}
