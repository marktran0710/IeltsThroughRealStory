(function initApp(root) {
  function fieldMatchesAnswer(value, expected) {
    const normalizedValue = String(value || "").trim().toLowerCase();
    return String(expected || "")
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .every((word) => normalizedValue.includes(word));
  }

  function scoreQuiz(fields) {
    return fields.reduce((score, field) => {
      return score + (fieldMatchesAnswer(field.value, field.answer) ? 1 : 0);
    }, 0);
  }

  function quizFeedback(correct, total) {
    if (correct === total) {
      return {
        text: "Great. You caught the key details.",
        className: "feedback success",
      };
    }

    return {
      text: `${correct}/${total} correct. Check the story details once more.`,
      className: "feedback try",
    };
  }

  function formatTimer(seconds) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const remainder = String(safeSeconds % 60).padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function evaluateStoryExcitement(story) {
    const dimensions = ["stakes", "conflict", "urgency", "emotion", "outcome", "ieltsFit"];
    const total = dimensions.reduce((sum, dimension) => {
      const value = Number(story[dimension]) || 0;
      return sum + Math.max(0, Math.min(2, value));
    }, 0);
    const score = Math.round((total / (dimensions.length * 2)) * 100);

    if (score >= 85) {
      return {
        score,
        verdict: "Exciting",
        reason: "Strong real-life stakes, a clear problem, emotional pressure, and a useful IELTS outcome.",
      };
    }

    if (score >= 75) {
      return {
        score,
        verdict: "Good",
        reason: "Useful and relatable, with enough tension for practice. Add one sharper twist to make it more memorable.",
      };
    }

    return {
      score,
      verdict: "Needs spark",
      reason: "The situation is practical, but it needs higher stakes, a clearer obstacle, or a stronger emotional turn.",
    };
  }

  function bindTabs(documentRef) {
    const tabs = documentRef.querySelectorAll(".skill-tab");
    const panels = documentRef.querySelectorAll(".skill-panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const skill = tab.dataset.skill;
        tabs.forEach((item) => {
          const selected = item === tab;
          item.classList.toggle("active", selected);
          item.setAttribute("aria-selected", String(selected));
        });
        panels.forEach((panel) => {
          panel.classList.toggle("active", panel.dataset.panel === skill);
        });
      });
    });
  }

  function bindQuizzes(documentRef) {
    documentRef.querySelectorAll("[data-check]").forEach((button) => {
      button.addEventListener("click", () => {
        const quiz = documentRef.querySelector(`[data-quiz="${button.dataset.check}"]`);
        const fields = Array.from(quiz.querySelectorAll("[data-answer]"));
        const correct = scoreQuiz(fields.map((field) => ({
          value: field.value,
          answer: field.dataset.answer,
        })));

        fields.forEach((field) => {
          const valid = fieldMatchesAnswer(field.value, field.dataset.answer);
          field.style.borderColor = valid ? "#2ead4b" : "#d03238";
        });

        const feedback = quiz.querySelector(".feedback");
        const result = quizFeedback(correct, fields.length);
        feedback.textContent = result.text;
        feedback.className = result.className;
      });
    });
  }

  function bindTranscriptToggle(documentRef) {
    const playButton = documentRef.querySelector("[data-play]");
    if (!playButton) return;

    playButton.addEventListener("click", () => {
      const transcript = documentRef.querySelector(".transcript");
      transcript.classList.toggle("dimmed");
      playButton.textContent = transcript.classList.contains("dimmed") ? "Show" : "Hide";
    });
  }

  function bindTimer(documentRef) {
    let timerId;
    let remainingSeconds = 60;
    const timer = documentRef.querySelector("[data-timer]");
    const startButton = documentRef.querySelector("[data-timer-start]");
    const resetButton = documentRef.querySelector("[data-timer-reset]");

    function renderTimer() {
      timer.textContent = formatTimer(remainingSeconds);
    }

    function stopTimer() {
      clearInterval(timerId);
      timerId = undefined;
    }

    if (!timer || !startButton || !resetButton) return;

    startButton.addEventListener("click", () => {
      if (timerId) {
        stopTimer();
        startButton.textContent = "Resume prep";
        return;
      }

      startButton.textContent = "Pause";
      timerId = setInterval(() => {
        remainingSeconds = Math.max(0, remainingSeconds - 1);
        renderTimer();
        if (remainingSeconds === 0) {
          stopTimer();
          startButton.textContent = "Start speaking";
        }
      }, 1000);
    });

    resetButton.addEventListener("click", () => {
      stopTimer();
      remainingSeconds = 60;
      renderTimer();
      startButton.textContent = "Start prep";
    });
  }

  const WRITING_DOMAINS = {
    email: {
      label: "Email",
      signals: {
        greeting: [/\b(dear|hello|hi)\b/i, "Start with a greeting (Dear / Hello)"],
        purpose: [/\bi am writing (to|because|regarding|about)\b/i, "State your purpose early (I am writing to…)"],
        polite: [/\b(please|kindly|would you|could you)\b/i, "Use polite request language"],
        closing: [/\b(regards|sincerely|yours|thank you)\b/i, "End with a closing phrase"],
        contact: [/\b(contact|reach|email|phone|feel free)\b/i, "Offer a way to follow up"],
      },
      tips: [
        "Keep paragraphs to 2–3 sentences each.",
        "One clear ask per email.",
        "Avoid informal contractions like 'gonna' or 'wanna'.",
      ],
    },
    job: {
      label: "Job application",
      signals: {
        role: [/\b(position|role|vacancy|applying for|application)\b/i, "Name the specific job you are applying for"],
        experience: [/\b(experience|worked|managed|led|achieved|years)\b/i, "Mention relevant experience or achievement"],
        skills: [/\b(skill|ability|proficient|familiar|expertise)\b/i, "Highlight a key skill"],
        motivation: [/\b(passionate|eager|excited|motivated|interested in)\b/i, "Show genuine motivation"],
        closing: [/\b(interview|discuss|hear from|available|portfolio|cv|resume)\b/i, "Invite next steps (interview / portfolio)"],
      },
      tips: [
        "Open with the job title and where you saw it.",
        "Match your language to keywords in the job description.",
        "Quantify achievements where possible (e.g. 'reduced costs by 20%').",
      ],
    },
    paper: {
      label: "Academic paper",
      signals: {
        claim: [/\b(this (paper|study|article)|we (argue|propose|examine|demonstrate)|the aim)\b/i, "State your central claim or aim"],
        evidence: [/\b(according to|studies show|research (suggests|indicates)|data|findings)\b/i, "Cite or reference evidence"],
        hedging: [/\b(may|might|suggest|appear|tend to|arguably|it is possible)\b/i, "Use hedging language for academic caution"],
        structure: [/\b(first(ly)?|second(ly)?|furthermore|however|in conclusion|therefore)\b/i, "Use discourse markers to guide the reader"],
        formal: [/\b(nevertheless|thus|hence|consequently|significant|demonstrate)\b/i, "Use formal academic vocabulary"],
      },
      tips: [
        "Avoid first-person ('I think') unless your discipline allows it.",
        "Define key terms at the start.",
        "Every paragraph: one idea, evidence, comment.",
      ],
    },
  };

  function evaluateWriting(domain, text) {
    const config = WRITING_DOMAINS[domain];
    if (!config) return null;

    const trimmed = (text || "").trim();
    const wordCount = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

    const checks = Object.entries(config.signals).map(([key, [pattern, label]]) => ({
      key,
      label,
      passed: pattern.test(trimmed),
    }));

    const passed = checks.filter((c) => c.passed).length;
    const total = checks.length;
    const score = Math.round((passed / total) * 100);

    let band;
    if (score >= 80) band = { label: "Strong", className: "band-strong" };
    else if (score >= 60) band = { label: "Developing", className: "band-developing" };
    else band = { label: "Needs work", className: "band-weak" };

    return { score, band, checks, wordCount, tips: config.tips };
  }

  function bindWritingCoach(documentRef) {
    const panel = documentRef.querySelector("#writing-panel");
    if (!panel) return;

    const domainSelect = panel.querySelector("[data-domain]");
    const textarea = panel.querySelector("textarea");
    const analyseBtn = panel.querySelector("[data-analyse]");
    const resultBox = panel.querySelector("[data-writing-result]");

    if (!domainSelect || !textarea || !analyseBtn || !resultBox) return;

    analyseBtn.addEventListener("click", () => {
      const domain = domainSelect.value;
      const result = evaluateWriting(domain, textarea.value);
      if (!result) return;

      const checkItems = result.checks.map((c) => `
        <li class="coach-check ${c.passed ? "pass" : "miss"}">
          <span class="coach-icon">${c.passed ? "✓" : "✗"}</span>
          ${c.label}
        </li>`).join("");

      const tipItems = result.tips.map((t) => `<li>${t}</li>`).join("");

      resultBox.innerHTML = `
        <div class="coach-header">
          <span class="coach-band ${result.band.className}">${result.band.label}</span>
          <span class="coach-score">${result.score}/100</span>
          <span class="coach-words">${result.wordCount} words</span>
        </div>
        <ul class="coach-checklist">${checkItems}</ul>
        <details class="coach-tips">
          <summary>Domain tips</summary>
          <ul>${tipItems}</ul>
        </details>`;
      resultBox.classList.add("visible");
    });
  }

  function bindStoryOptions(documentRef) {
    documentRef.querySelectorAll(".story-option").forEach((option) => {
      option.addEventListener("click", () => {
        documentRef.querySelectorAll(".story-option").forEach((item) => item.classList.remove("active"));
        option.classList.add("active");
      });
    });
  }

  function renderStoryReviews(documentRef) {
    documentRef.querySelectorAll("[data-review]").forEach((card) => {
      const review = evaluateStoryExcitement({
        title: card.dataset.title,
        stakes: card.dataset.stakes,
        conflict: card.dataset.conflict,
        urgency: card.dataset.urgency,
        emotion: card.dataset.emotion,
        outcome: card.dataset.outcome,
        ieltsFit: card.dataset.ieltsFit,
      });

      card.querySelector(".review-badge").textContent = review.verdict;
      card.querySelector("[data-review-reason]").textContent = review.reason;
      card.querySelector("[data-review-score]").textContent = `${review.score}/100`;
      card.dataset.verdict = review.verdict.toLowerCase().replace(" ", "-");
    });
  }

  function init(documentRef) {
    bindTabs(documentRef);
    bindQuizzes(documentRef);
    bindTranscriptToggle(documentRef);
    bindTimer(documentRef);
    bindStoryOptions(documentRef);
    renderStoryReviews(documentRef);
    bindWritingCoach(documentRef);
  }

  const api = {
    fieldMatchesAnswer,
    evaluateStoryExcitement,
    evaluateWriting,
    formatTimer,
    quizFeedback,
    scoreQuiz,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root.document) {
    init(root.document);
    root.IeltsRealStories = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
