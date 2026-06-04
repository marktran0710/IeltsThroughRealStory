const assert = require("node:assert/strict");
const test = require("node:test");

const {
  evaluateStoryExcitement,
  fieldMatchesAnswer,
  formatTimer,
  quizFeedback,
  scoreQuiz,
} = require("../app.js");

test("fieldMatchesAnswer accepts case-insensitive answers with extra words", () => {
  assert.equal(fieldMatchesAnswer("Please go to Counter 3 today", "counter 3"), true);
  assert.equal(fieldMatchesAnswer("Item description and journey details", "description journey"), true);
});

test("fieldMatchesAnswer rejects answers missing required keywords", () => {
  assert.equal(fieldMatchesAnswer("Counter 2", "counter 3"), false);
  assert.equal(fieldMatchesAnswer("", "photo id"), false);
});

test("scoreQuiz counts only correct answers", () => {
  const fields = [
    { value: "Photo ID", answer: "photo id" },
    { value: "one week", answer: "48 hours" },
    { value: "description and journey", answer: "description journey" },
  ];

  assert.equal(scoreQuiz(fields), 2);
});

test("quizFeedback returns success message when all answers are correct", () => {
  assert.deepEqual(quizFeedback(2, 2), {
    text: "Great. You caught the key details.",
    className: "feedback success",
  });
});

test("quizFeedback returns retry message with score when incomplete", () => {
  assert.deepEqual(quizFeedback(1, 2), {
    text: "1/2 correct. Check the story details once more.",
    className: "feedback try",
  });
});

test("formatTimer renders preparation time as mm:ss", () => {
  assert.equal(formatTimer(60), "01:00");
  assert.equal(formatTimer(9), "00:09");
  assert.equal(formatTimer(0), "00:00");
});

test("formatTimer clamps negative and invalid values to zero", () => {
  assert.equal(formatTimer(-4), "00:00");
  assert.equal(formatTimer("not a number"), "00:00");
});

test("evaluateStoryExcitement marks high-scoring stories as exciting", () => {
  const review = evaluateStoryExcitement({
    stakes: 2,
    conflict: 2,
    urgency: 2,
    emotion: 2,
    outcome: 2,
    ieltsFit: 2,
  });

  assert.equal(review.score, 100);
  assert.equal(review.verdict, "Exciting");
});

test("evaluateStoryExcitement identifies practical stories that need more spark", () => {
  const review = evaluateStoryExcitement({
    stakes: 1,
    conflict: 1,
    urgency: 1,
    emotion: 1,
    outcome: 2,
    ieltsFit: 2,
  });

  assert.equal(review.score, 67);
  assert.equal(review.verdict, "Needs spark");
});
