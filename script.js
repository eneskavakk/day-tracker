// Theme switching
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
}

// Tab switching
function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById(tabId).classList.add("active");
  document
    .querySelector(`[onclick="switchTab('${tabId}')"]`)
    .classList.add("active");

  if (tabId === "timer") {
    updateTaskSelect();
  }

  if (tabId === "data") {
    updateStats();
  }

  if (tabId === "todo") {
    updateMotivationalQuote();
  }
}

// Task operations
function getSelectedPriority() {
  const activeBtn = document.querySelector(".priority-btn.active");
  return activeBtn ? activeBtn.dataset.priority : "medium";
}

function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach((li) => {
    const taskText = li.querySelector(".task-text");
    const note = li.querySelector(".task-notes");
    tasks.push({
      text: taskText.textContent,
      priority: taskText.className
        .split(" ")
        .find((cls) => cls.startsWith("priority-"))
        .replace("priority-", ""),
      isCompleted: li.classList.contains("completed"),
      note: note ? note.textContent : "",
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    if (task.isCompleted) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <div class="task-content" ondblclick="toggleTaskNotes(this)">
        <span class="task-text priority-${task.priority} ${
      task.isCompleted ? "completed" : ""
    }">${task.text}</span>
        <div class="task-actions">
          <button class="complete-btn priority-${
            task.priority
          }" onclick="toggleComplete(this)">✓</button>
          <button class="delete-btn" onclick="deleteTask(this)">🗑️</button>
        </div>
      </div>
      ${
        task.note
          ? `<div class="task-notes" style="display: none;">${task.note}</div>`
          : ""
      }
    `;

    taskList.appendChild(li);
  });

  updateStats();
  updateTaskSelect();
}

function addTask() {
  const input = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const taskNote = document.getElementById("taskNote");

  if (input.value.trim() === "") return;

  const li = document.createElement("li");
  const priority = getSelectedPriority();
  const note = taskNote.value.trim();

  li.innerHTML = `
    <div class="task-content" ondblclick="toggleTaskNotes(this)">
      <span class="task-text priority-${priority}">${input.value}</span>
      <div class="task-actions">
        <button class="complete-btn priority-${priority}" onclick="toggleComplete(this)">✓</button>
        <button class="delete-btn" onclick="deleteTask(this)">🗑️</button>
      </div>
    </div>
    ${
      note ? `<div class="task-notes" style="display: none;">${note}</div>` : ""
    }
  `;

  taskList.appendChild(li);
  input.value = "";
  taskNote.value = "";
  updateStats();
  updateTaskSelect();
  saveTasksToLocalStorage();
}

function toggleTaskNotes(taskContent) {
  const notesDiv = taskContent.parentElement.querySelector(".task-notes");
  if (notesDiv) {
    const isVisible = notesDiv.style.display !== "none";
    notesDiv.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
      // Scroll to make the notes visible
      setTimeout(() => {
        notesDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }
}

function deleteTask(btn) {
  const li = btn.closest("li");
  li.classList.add("task-deleting");
  playTrashSound();

  setTimeout(() => {
    li.remove();
    updateStats();
    updateTaskSelect();
    saveTasksToLocalStorage();
  }, 500);
}

function toggleComplete(btn) {
  const li = btn.closest("li");
  const wasCompleted = li.classList.contains("completed");

  if (!wasCompleted) {
    li.classList.add("task-completing");
    playPencilSound();

    setTimeout(() => {
      li.classList.remove("task-completing");
      li.classList.add("completed");
      li.querySelector(".task-text").classList.add("completed");
      updateTaskSelect();
      saveTasksToLocalStorage();
    }, 300);
  } else {
    li.classList.remove("completed");
    li.querySelector(".task-text").classList.remove("completed");
    updateTaskSelect();
    saveTasksToLocalStorage();
  }

  updateStats();
}

// Sound effects
function playCompleteSound() {
  const sound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
  );
  sound.volume = 0.5;
  sound.play().catch((error) => {
    console.log("Sound could not be played:", error);
    const backupSound = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"
    );
    backupSound.volume = 0.5;
    backupSound
      .play()
      .catch((e) => console.log("Backup sound could not be played:", e));
  });
}

function playTrashSound() {
  const audio = new Audio("assets/trash.mp3");
  audio.volume = 0.3;
  audio.play();
}

function playPencilSound() {
  const audio = new Audio("assets/pencil.mp3");
  audio.volume = 0.3;
  audio.play();
}

function playTimerEndSound() {
  const audio = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
  );
  audio.volume = 0.5;
  audio.play();
}

// Statistics
let taskTimes = [];

function saveTaskTime(taskName, duration, priority) {
  taskTimes.push({
    name: taskName,
    duration: duration,
    priority: priority,
    timestamp: new Date(),
  });

  localStorage.setItem("taskTimes", JSON.stringify(taskTimes));
  updateTimeStats();
}

function updateTimeStats() {
  const totalMinutes = taskTimes.reduce((sum, task) => sum + task.duration, 0);
  const avgMinutes =
    taskTimes.length > 0 ? Math.round(totalMinutes / taskTimes.length) : 0;

  document.getElementById("totalWorkTime").textContent = `${totalMinutes} min`;
  document.getElementById("avgTaskTime").textContent = `${avgMinutes} min`;

  const taskTimeList = document.getElementById("taskTimeList");
  taskTimeList.innerHTML = "";

  // Combine tasks with the same name (case insensitive)
  const combinedTasks = taskTimes.reduce((acc, task) => {
    // Convert task name to lowercase
    const taskNameLower = task.name.toLowerCase();

    // Find task with the same name (case insensitive comparison)
    const existingTask = acc.find(
      (t) => t.name.toLowerCase() === taskNameLower
    );

    if (existingTask) {
      // Add duration
      existingTask.duration += task.duration;

      // Update last timestamp
      if (new Date(task.timestamp) > new Date(existingTask.timestamp)) {
        existingTask.timestamp = task.timestamp;
        // Use the original name and priority of the most recently added task
        existingTask.name = task.name;
        existingTask.priority = task.priority;
      }
    } else {
      // Add new task
      acc.push({ ...task });
    }
    return acc;
  }, []);

  // Show last 10 tasks (sorted by date)
  combinedTasks
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
    .forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.className = `task-time-item priority-${task.priority}`;
      taskItem.innerHTML = `
        <span class="task-time-name">${task.name.toUpperCase()}</span>
        <span class="task-time-duration">${task.duration} min</span>
      `;
      taskTimeList.appendChild(taskItem);
    });
}

function updateStats(period = "today") {
  const tasks = document.querySelectorAll("#taskList li");
  const completed = document.querySelectorAll("#taskList li.completed");
  const total = tasks.length;
  const completedCount = completed.length;
  const pending = total - completedCount;

  let totalWeight = 0;
  let completedWeight = 0;

  tasks.forEach((task) => {
    const taskText = task.querySelector(".task-text");
    const isCompleted = task.classList.contains("completed");

    let weight = 1;
    if (taskText.classList.contains("priority-high")) weight = 3;
    else if (taskText.classList.contains("priority-medium")) weight = 2;

    totalWeight += weight;
    if (isCompleted) completedWeight += weight;
  });

  const efficiency =
    totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completedCount;
  document.getElementById("pendingTasks").textContent = pending;
  document.getElementById("efficiency").textContent = `${efficiency}%`;

  updatePriorityStats();
}

function updatePriorityStats() {
  const priorities = {
    high: document.querySelectorAll(".task-text.priority-high").length,
    medium: document.querySelectorAll(".task-text.priority-medium").length,
    low: document.querySelectorAll(".task-text.priority-low").length,
  };

  const total = priorities.high + priorities.medium + priorities.low;

  document.getElementById("highPriorityBar").style.width =
    total > 0 ? `${(priorities.high / total) * 100}%` : "0%";
  document.getElementById("mediumPriorityBar").style.width =
    total > 0 ? `${(priorities.medium / total) * 100}%` : "0%";
  document.getElementById("lowPriorityBar").style.width =
    total > 0 ? `${(priorities.low / total) * 100}%` : "0%";

  document.getElementById("highPriorityCount").textContent = priorities.high;
  document.getElementById("mediumPriorityCount").textContent =
    priorities.medium;
  document.getElementById("lowPriorityCount").textContent = priorities.low;
}

function filterStats(period) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document
    .querySelector(`[onclick="filterStats('${period}')"]`)
    .classList.add("active");

  updateStats(period);
}

function resetAllStats() {
  const confirmation = confirm(
    "Are you sure you want to reset all data? This action cannot be undone."
  );

  if (confirmation) {
    // Reset button animation
    const resetBtn = document.getElementById("resetStatsBtn");
    resetBtn.classList.add("active");

    // Clear task list
    document.getElementById("taskList").innerHTML = "";

    // Reset timer data
    taskTimes = [];
    localStorage.removeItem("taskTimes");

    // Reset statistics
    document.getElementById("totalTasks").textContent = "0";
    document.getElementById("completedTasks").textContent = "0";
    document.getElementById("pendingTasks").textContent = "0";
    document.getElementById("efficiency").textContent = "0%";
    document.getElementById("totalWorkTime").textContent = "0 min";
    document.getElementById("avgTaskTime").textContent = "0 min";

    // Reset priority bars
    document.getElementById("highPriorityBar").style.width = "0%";
    document.getElementById("mediumPriorityBar").style.width = "0%";
    document.getElementById("lowPriorityBar").style.width = "0%";

    // Reset priority counts
    document.getElementById("highPriorityCount").textContent = "0";
    document.getElementById("mediumPriorityCount").textContent = "0";
    document.getElementById("lowPriorityCount").textContent = "0";

    // Clear task time list
    document.getElementById("taskTimeList").innerHTML = "";

    // Update timer options
    updateTaskSelect();

    // Remove active class after animation
    setTimeout(() => {
      resetBtn.classList.remove("active");
    }, 300);
  }
}

// Timer
let timerInterval;
let timeLeft;
let isPaused = false;

function updateTaskSelect() {
  const select = document.getElementById("timerTaskSelect");
  const tasks = document.querySelectorAll("#taskList li:not(.completed)");

  select.innerHTML = '<option value="">Select a task</option>';

  tasks.forEach((task, index) => {
    const taskText = task.querySelector(".task-text").textContent;
    const priority = task
      .querySelector(".task-text")
      .className.split(" ")
      .find((cls) => cls.startsWith("priority-"))
      .replace("priority-", "");

    const option = document.createElement("option");
    option.value = index;
    option.textContent = taskText;
    option.className = `priority-${priority}`;
    select.appendChild(option);
  });
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function updateTimerDisplay() {
  document.querySelector(".time-left").textContent = formatTime(timeLeft);

  const hourglass = document.querySelector(".hourglass");
  const progress = 1 - timeLeft / getInitialTime();

  document.documentElement.style.setProperty(
    "--timer-duration",
    `${timeLeft}s`
  );

  if (!isPaused) {
    hourglass.classList.add("running");
    hourglass.classList.remove("paused");
  } else {
    hourglass.classList.add("paused");
    hourglass.classList.remove("running");
  }
}

function getInitialTime() {
  const minutes = parseInt(document.getElementById("timerMinutes").value) || 0;
  const seconds = parseInt(document.getElementById("timerSeconds").value) || 0;
  return minutes * 60 + seconds;
}

function startTimer() {
  const initialTime = getInitialTime();
  if (initialTime <= 0) return;

  const taskSelect = document.getElementById("timerTaskSelect");
  const newTimerTask = document.getElementById("newTimerTask");

  let taskName = "";
  let priority = "";
  let isNewTask = false;

  if (taskSelect.value !== "") {
    const selectedTask =
      document.querySelectorAll("#taskList li")[taskSelect.value];
    taskName = selectedTask.querySelector(".task-text").textContent;
    priority = selectedTask
      .querySelector(".task-text")
      .className.split(" ")
      .find((cls) => cls.startsWith("priority-"))
      .replace("priority-", "");
  } else {
    taskName = newTimerTask.value.trim();
    if (taskName === "") {
      alert("Please select a task or enter a new one");
      return;
    }
    priority = document.querySelector(".timer-priority .priority-btn.active")
      .dataset.priority;
    isNewTask = true;

    const taskList = document.getElementById("taskList");
    const li = document.createElement("li");
    li.innerHTML = `
            <span class="task-text priority-${priority}">${taskName}</span>
            <div class="task-actions">
                <button class="complete-btn priority-${priority}" onclick="toggleComplete(this)">✓</button>
                <button class="delete-btn" onclick="deleteTask(this)">🗑️</button>
            </div>
        `;
    taskList.appendChild(li);
    updateStats();
    updateTaskSelect();
  }

  document.querySelector(".timer-container").classList.add("timer-active");

  // Scroll to timer display smoothly
  const timerDisplay = document.querySelector(".timer-display");
  timerDisplay.scrollIntoView({ behavior: "smooth", block: "center" });

  document.getElementById("taskSetupOptions").style.display = "none";
  document.querySelector(".time-inputs").style.display = "none";
  document.getElementById("startTimer").style.display = "none";
  const activeTask = document.getElementById("activeTask");
  activeTask.style.display = "block";
  activeTask.querySelector(".active-task-name").textContent = taskName;

  // Add motivational quote under active task
  const randomQuote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const quoteDiv = document.createElement("div");
  quoteDiv.className = "active-task-quote";
  quoteDiv.textContent = randomQuote;
  activeTask.appendChild(quoteDiv);

  timeLeft = initialTime;
  updateTimerDisplay();

  document.getElementById("pauseTimer").style.display = "block";
  document.getElementById("resetTimer").style.display = "block";

  document.getElementById("timerMinutes").disabled = true;
  document.getElementById("timerSeconds").disabled = true;
  taskSelect.disabled = true;
  newTimerTask.disabled = true;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        const duration = Math.ceil(initialTime / 60);
        saveTaskTime(taskName, duration, priority);

        let taskToComplete;
        if (isNewTask) {
          taskToComplete = document.querySelector("#taskList li:last-child");
        } else {
          taskToComplete =
            document.querySelectorAll("#taskList li")[taskSelect.value];
        }

        if (taskToComplete && !taskToComplete.classList.contains("completed")) {
          taskToComplete.classList.add("task-completing");
          playPencilSound();

          setTimeout(() => {
            taskToComplete.classList.remove("task-completing");
            taskToComplete.classList.add("completed");
            updateStats();
            updateTaskSelect();
          }, 300);
        }

        playTimerEndSound();
        resetTimer();
      }
    }
  }, 1000);
}

function pauseTimer() {
  isPaused = !isPaused;
  const pauseBtn = document.getElementById("pauseTimer");
  pauseBtn.innerHTML = isPaused
    ? '<span class="play-icon">▶</span>'
    : '<span class="pause-icon">⏸</span>';
  updateTimerDisplay();
}

function resetTimer() {
  clearInterval(timerInterval);
  isPaused = false;

  document.querySelector(".timer-container").classList.remove("timer-active");

  // Remove quote when timer resets
  const activeTaskQuote = document.querySelector(".active-task-quote");
  if (activeTaskQuote) {
    activeTaskQuote.remove();
  }

  document.getElementById("taskSetupOptions").style.display = "flex";
  document.querySelector(".time-inputs").style.display = "flex";
  document.getElementById("startTimer").style.display = "block";
  document.getElementById("activeTask").style.display = "none";

  document.getElementById("pauseTimer").style.display = "none";
  document.getElementById("resetTimer").style.display = "none";

  document.getElementById("timerMinutes").disabled = false;
  document.getElementById("timerSeconds").disabled = false;
  document.getElementById("timerTaskSelect").disabled = false;
  document.getElementById("newTimerTask").disabled = false;

  document.getElementById("timerMinutes").value = "25";
  document.getElementById("timerSeconds").value = "00";
  document.querySelector(".time-left").textContent = "25:00";

  const hourglass = document.querySelector(".hourglass");
  hourglass.classList.remove("running", "paused");
}

// Motivasyon sözleri
const motivationalQuotes = [
  "Don't put off until tomorrow what you can do today!",
  "Every new day is a new beginning.",
  "Small steps lead to big changes.",
  "Success is the sum of small efforts repeated daily.",
  "The best time to improve yourself is now.",
  "Everything you can imagine is achievable.",
  "Challenges make you stronger.",
  "Every failure is a lesson on the path to success.",
  "Believing is half of achieving.",
  "Focus, work, succeed!",
  "Take one step every day towards your goals.",
  "The greatest achievements begin with the biggest dreams.",
  "Never give up, everything is possible!",
  "Be better today than yesterday.",
  "Every step matters on the journey to success.",
];

function updateMotivationalQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  const quoteElement = document.getElementById("motivationalQuote");
  if (quoteElement) {
    quoteElement.textContent = motivationalQuotes[randomIndex];
  }
}

function toggleNotes(btn) {
  const li = btn.closest("li");
  const notesDiv = li.querySelector(".task-notes");
  const isVisible = notesDiv.style.display !== "none";

  notesDiv.style.display = isVisible ? "none" : "block";

  if (!isVisible) {
    const textarea = notesDiv.querySelector("textarea");
    textarea.focus();
  }
}

function saveNotes(textarea) {
  const li = textarea.closest("li");
  const taskText = li.querySelector(".task-text").textContent;
  const notes = textarea.value;

  // Save notes to localStorage
  const savedNotes = JSON.parse(localStorage.getItem("taskNotes") || "{}");
  savedNotes[taskText] = notes;
  localStorage.setItem("taskNotes", JSON.stringify(savedNotes));
}

function toggleNoteInput() {
  const taskNote = document.getElementById("taskNote");
  const toggleBtn = document.getElementById("toggleNoteBtn");
  const isVisible = taskNote.style.display !== "none";

  taskNote.style.display = isVisible ? "none" : "block";
  toggleBtn.classList.toggle("active");

  if (!isVisible) {
    taskNote.focus();
  }
}

// When page loads
document.addEventListener("DOMContentLoaded", () => {
  // Theme setting
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);

  // Load saved tasks
  loadTasksFromLocalStorage();

  // Load saved durations
  const savedTimes = localStorage.getItem("taskTimes");
  if (savedTimes) {
    taskTimes = JSON.parse(savedTimes);
    updateTimeStats();
  }

  // Event listener for priority buttons
  document.querySelectorAll(".priority-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const container = this.closest(".priority-selector");
      container
        .querySelectorAll(".priority-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      if (container.closest(".form-container")) {
        const inputGroup = document.querySelector(".input-group");
        inputGroup.classList.remove(
          "priority-high-border",
          "priority-medium-border",
          "priority-low-border"
        );
        const priority = this.dataset.priority;
        inputGroup.classList.add(`priority-${priority}-border`);
      }
    });
  });

  // Add task with Enter key
  document
    .getElementById("taskInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        addTask();
      }
    });

  // Add task note with Shift+Enter
  document
    .getElementById("taskNote")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        addTask();
      }
    });

  // Timer task select change
  document
    .getElementById("timerTaskSelect")
    .addEventListener("change", function (e) {
      const newTimerTask = document.getElementById("newTimerTask");
      const timerPrioritySelector = document.querySelector(".timer-priority");

      if (e.target.value === "") {
        newTimerTask.style.display = "block";
        timerPrioritySelector.style.display = "flex";
        newTimerTask.value = "";
        newTimerTask.focus();
      } else {
        newTimerTask.style.display = "none";
        timerPrioritySelector.style.display = "none";
        newTimerTask.value = "";
      }
    });

  // Timer kontrol butonları için event listener'lar
  document.getElementById("startTimer").addEventListener("click", startTimer);
  document.getElementById("pauseTimer").addEventListener("click", pauseTimer);
  document.getElementById("resetTimer").addEventListener("click", resetTimer);

  // Initial quote update
  updateMotivationalQuote();

  // Load saved notes
  const savedNotes = JSON.parse(localStorage.getItem("taskNotes") || "{}");
  document.querySelectorAll("#taskList li").forEach((li) => {
    const taskText = li.querySelector(".task-text").textContent;
    const notes = savedNotes[taskText];
    if (notes) {
      const textarea = li.querySelector(".task-notes textarea");
      if (textarea) {
        textarea.value = notes;
      }
    }
  });

  // Reset note input when task is added
  const originalAddTask = addTask;
  addTask = function () {
    originalAddTask();
    const taskNote = document.getElementById("taskNote");
    const toggleBtn = document.getElementById("toggleNoteBtn");
    taskNote.style.display = "none";
    toggleBtn.classList.remove("active");
  };
});
