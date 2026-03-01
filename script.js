const STORAGE_KEY = 'mes-habitudes-sportives-v2';
const LEGACY_STORAGE_KEYS = ['mes-habitudes-data'];

const defaultHabits = [
  {
    id: 4,
    name: 'Marcher 10 000 pas ou courir 5 km',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:07:00.527Z',
    logs: [],
    streak: 0,
  },
  {
    id: 5,
    name: '20 pull up',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:12:28.727Z',
    logs: [],
    streak: 0,
  },
  {
    id: 6,
    name: '20 dip',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:12:39.163Z',
    logs: [],
    streak: 0,
  },
  {
    id: 7,
    name: '20 bench',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:12:48.245Z',
    logs: [],
    streak: 0,
  },
];

const normalizeHabit = (habit, fallbackIdSeed = Date.now() + Math.random()) => ({
  id: Number(habit.id) || fallbackIdSeed,
  name: typeof habit.name === 'string' ? habit.name : 'Habitude sans nom',
  description: null,
  frequency: ['daily', 'weekly', 'monthly'].includes(habit.frequency) ? habit.frequency : 'daily',
  createdAt: typeof habit.createdAt === 'string' ? habit.createdAt : new Date().toISOString(),
  logs: Array.isArray(habit.logs) ? habit.logs.filter((entry) => typeof entry === 'string') : [],
  streak: 0,
});

const mergeHabits = (storedHabits, fallbackHabits) => {
  const fallbackByName = new Map(
    fallbackHabits.map((habit) => [habit.name.trim().toLowerCase(), normalizeHabit(habit)]),
  );
  const merged = [];

  storedHabits.forEach((habit, index) => {
    const normalizedStored = normalizeHabit(habit, Date.now() + index + Math.random());
    const key = normalizedStored.name.trim().toLowerCase();

    if (fallbackByName.has(key)) {
      const fallbackHabit = fallbackByName.get(key);
      merged.push({
        ...fallbackHabit,
        ...normalizedStored,
        id: normalizedStored.id,
      });
      fallbackByName.delete(key);
      return;
    }

    merged.push(normalizedStored);
  });

  return [...merged, ...fallbackByName.values()];
};


const getStoredHabitsRaw = () => {
  const current = localStorage.getItem(STORAGE_KEY);
  if (typeof current === 'string') {
    return current;
  }

  for (const key of LEGACY_STORAGE_KEYS) {
    const legacyValue = localStorage.getItem(key);
    if (typeof legacyValue === 'string') {
      return legacyValue;
    }
  }

  return null;
};

const loadHabits = () => {
  const storedHabits = getStoredHabitsRaw();
  if (!storedHabits) {
    return defaultHabits.map((habit, index) => normalizeHabit(habit, Date.now() + index + Math.random()));
  }

  try {
    const parsedHabits = JSON.parse(storedHabits);
    if (!Array.isArray(parsedHabits)) {
      return defaultHabits.map((habit, index) => normalizeHabit(habit, Date.now() + index + Math.random()));
    }

    const safeHabits = parsedHabits.filter((habit) => typeof habit === 'object' && habit !== null);
    return mergeHabits(safeHabits, defaultHabits);
  } catch (error) {
    return defaultHabits.map((habit, index) => normalizeHabit(habit, Date.now() + index + Math.random()));
  }
};

let habits = loadHabits();
let activeFilter = 'all';
const now = new Date();
let selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
let displayedMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

const saveHabits = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  LEGACY_STORAGE_KEYS.forEach((legacyKey) => {
    if (legacyKey !== STORAGE_KEY) {
      localStorage.removeItem(legacyKey);
    }
  });
};

const habitList = document.getElementById('habitList');
const totalHabits = document.getElementById('totalHabits');
const dailyHabits = document.getElementById('dailyHabits');
const weeklyHabits = document.getElementById('weeklyHabits');
const monthlyHabits = document.getElementById('monthlyHabits');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressHeading = document.getElementById('progressHeading');
const habitForm = document.getElementById('habitForm');
const habitName = document.getElementById('habitName');
const habitFrequency = document.getElementById('habitFrequency');
const calendarGrid = document.getElementById('calendarGrid');
const calendarTitle = document.getElementById('calendarTitle');
const monthPicker = document.getElementById('monthPicker');
const goMonth = document.getElementById('goMonth');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const prevDay = document.getElementById('prevDay');
const nextDay = document.getElementById('nextDay');
const todayButton = document.getElementById('todayButton');
const selectedDayLabel = document.getElementById('selectedDayLabel');
const displayedMonth = document.getElementById('displayedMonth');
const filterChips = [...document.querySelectorAll('.filter-chip')];

const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const frequencyLabels = {
  daily: 'Quotidienne',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle',
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDayLabel = (date) => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatMonthLabel = (date) => {
  return date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
};

const hasLogForDay = (habit, dayKey) => {
  return habit.logs.some((isoDate) => toDateKey(new Date(isoDate)) === dayKey);
};

const getDueHabitsForDate = (date) => {
  return habits.filter((habit) => {
    const createdAt = new Date(habit.createdAt);
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const createdDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());

    if (compareDate < createdDate) {
      return false;
    }

    if (habit.frequency === 'daily') {
      return true;
    }

    if (habit.frequency === 'weekly') {
      return compareDate.getDay() === createdDate.getDay();
    }

    if (habit.frequency === 'monthly') {
      const lastDayOfMonth = new Date(compareDate.getFullYear(), compareDate.getMonth() + 1, 0).getDate();
      const createdDay = createdDate.getDate();
      const targetDay = Math.min(createdDay, lastDayOfMonth);
      return compareDate.getDate() === targetDay;
    }

    return false;
  });
};

const getProgressForDate = (date) => {
  const dayKey = toDateKey(date);
  const dueHabits = getDueHabitsForDate(date);
  const completed = dueHabits.filter((habit) => hasLogForDay(habit, dayKey)).length;
  return {
    dueCount: dueHabits.length,
    completedCount: completed,
    rate: dueHabits.length === 0 ? 0 : Math.round((completed / dueHabits.length) * 100),
  };
};

const isPerfectDay = (dayDate) => {
  const dueHabits = getDueHabitsForDate(dayDate);
  if (dueHabits.length === 0) {
    return false;
  }

  const dayKey = toDateKey(dayDate);
  return dueHabits.every((habit) => hasLogForDay(habit, dayKey));
};

const computeStreak = (habit) => {
  const uniqueKeys = [...new Set(habit.logs.map((isoDate) => toDateKey(new Date(isoDate))))].sort((a, b) => (a < b ? 1 : -1));
  if (uniqueKeys.length === 0) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < uniqueKeys.length; index += 1) {
    const currentDate = parseDateKey(uniqueKeys[index - 1]);
    const nextDate = parseDateKey(uniqueKeys[index]);

    const expectedPrevious = new Date(currentDate);
    expectedPrevious.setDate(expectedPrevious.getDate() - 1);

    if (toDateKey(expectedPrevious) === toDateKey(nextDate)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

const setDisplayedMonthFromSelectedDate = () => {
  displayedMonthDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
};

const toggleDone = (habitId) => {
  const habit = habits.find((entry) => entry.id === habitId);
  if (!habit) {
    return;
  }

  const targetKey = toDateKey(selectedDate);

  if (hasLogForDay(habit, targetKey)) {
    habit.logs = habit.logs.filter((isoDate) => toDateKey(new Date(isoDate)) !== targetKey);
  } else {
    const logDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
    habit.logs.push(logDate.toISOString());
  }

  habit.streak = computeStreak(habit);

  saveHabits();
  renderStats();
  renderHabits();
  renderCalendar();
};

const removeHabit = (habitId) => {
  const index = habits.findIndex((entry) => entry.id === habitId);
  if (index === -1) {
    return;
  }

  habits.splice(index, 1);
  saveHabits();
  renderStats();
  renderHabits();
  renderCalendar();
};

const getFilteredHabits = () => {
  if (activeFilter === 'all') {
    return habits;
  }

  return habits.filter((habit) => habit.frequency === activeFilter);
};

const populateMonthPicker = () => {
  monthPicker.innerHTML = '';
  const baseYear = displayedMonthDate.getFullYear();

  for (let month = 0; month < 12; month += 1) {
    const optionDate = new Date(baseYear, month, 1);
    const option = document.createElement('option');
    option.value = `${baseYear}-${String(month + 1).padStart(2, '0')}`;
    option.textContent = optionDate.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    option.selected = month === displayedMonthDate.getMonth();
    monthPicker.appendChild(option);
  }
};

const renderHabits = () => {
  habitList.innerHTML = '';

  const visibleHabits = getFilteredHabits();
  if (visibleHabits.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = activeFilter === 'all'
      ? 'Aucune habitude pour le moment. Ajoute-en une ci-dessus.'
      : "Aucune habitude ne correspond à ce filtre pour l'instant.";
    habitList.appendChild(empty);
    return;
  }

  const selectedDayKey = toDateKey(selectedDate);

  visibleHabits.forEach((habit) => {
    const item = document.createElement('li');
    item.className = `habit-card ${hasLogForDay(habit, selectedDayKey) ? 'done' : ''}`;

    const frequency = frequencyLabels[habit.frequency] ?? habit.frequency;
    const details = `Créée le ${formatDate(habit.createdAt)} • Logs: ${habit.logs.length} • Streak: ${habit.streak}`;

    item.innerHTML = `
      <div class="habit-card-layout">
        <div class="habit-main">
          <button type="button" class="trash-icon" data-action="delete" aria-label="Supprimer ${habit.name}" title="Supprimer">🗑️</button>
          <div class="habit-title-row">
            <h3>${habit.name}</h3>
            <span class="badge">${frequency}</span>
          </div>
          <p class="meta">${details}</p>
        </div>
        <button type="button" class="check-icon ${hasLogForDay(habit, selectedDayKey) ? 'is-done' : ''}" data-action="toggle" aria-label="Valider ${habit.name}" title="Valider le jour sélectionné">✓</button>
      </div>
    `;

    item.querySelector('[data-action="toggle"]').addEventListener('click', () => {
      toggleDone(habit.id);
    });

    item.querySelector('[data-action="delete"]').addEventListener('click', () => {
      removeHabit(habit.id);
    });

    habitList.appendChild(item);
  });
};

const renderCalendar = () => {
  calendarGrid.innerHTML = '';

  const monthStart = new Date(displayedMonthDate.getFullYear(), displayedMonthDate.getMonth(), 1);
  const monthEnd = new Date(displayedMonthDate.getFullYear(), displayedMonthDate.getMonth() + 1, 0);
  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(selectedDate);

  calendarTitle.textContent = `Calendrier - ${formatMonthLabel(displayedMonthDate)}`;
  displayedMonth.textContent = formatMonthLabel(displayedMonthDate);
  selectedDayLabel.textContent = formatDayLabel(selectedDate);

  weekdayLabels.forEach((label) => {
    const weekdayCell = document.createElement('div');
    weekdayCell.className = 'calendar-weekday';
    weekdayCell.textContent = label;
    calendarGrid.appendChild(weekdayCell);
  });

  const mondayBasedOffset = (monthStart.getDay() + 6) % 7;
  for (let i = 0; i < mondayBasedOffset; i += 1) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day is-empty';
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    const cellDate = new Date(displayedMonthDate.getFullYear(), displayedMonthDate.getMonth(), day);
    const cell = document.createElement('button');
    const dayNumber = document.createElement('span');

    cell.type = 'button';
    cell.className = 'calendar-day';
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = String(day);

    const cellKey = toDateKey(cellDate);

    if (cellKey === todayKey) {
      cell.classList.add('is-today');
    }

    if (cellKey === selectedKey) {
      cell.classList.add('is-selected');
    }

    if (isPerfectDay(cellDate)) {
      const flame = document.createElement('span');
      flame.className = 'calendar-flame';
      flame.textContent = '🔥';
      flame.title = 'Toutes les tâches prévues sont accomplies';
      cell.appendChild(flame);
    }

    cell.appendChild(dayNumber);
    cell.addEventListener('click', () => {
      selectedDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
      renderStats();
      renderHabits();
      renderCalendar();
    });

    calendarGrid.appendChild(cell);
  }
};

const renderStats = () => {
  const selectedProgress = getProgressForDate(selectedDate);

  totalHabits.textContent = String(habits.length);
  dailyHabits.textContent = String(habits.filter((habit) => habit.frequency === 'daily').length);
  weeklyHabits.textContent = String(habits.filter((habit) => habit.frequency === 'weekly').length);
  monthlyHabits.textContent = String(habits.filter((habit) => habit.frequency === 'monthly').length);
  progressHeading.textContent = `Objectif du ${formatDayLabel(selectedDate)}`;
  progressFill.style.width = `${selectedProgress.rate}%`;
  progressFill.parentElement.setAttribute('aria-valuenow', String(selectedProgress.rate));
  progressText.textContent = `${selectedProgress.completedCount} / ${selectedProgress.dueCount} habitudes complétées`;
};

habitForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = habitName.value.trim();
  if (!name) {
    return;
  }

  habits.unshift({
    id: Date.now(),
    name,
    description: null,
    frequency: habitFrequency.value,
    createdAt: new Date().toISOString(),
    logs: [],
    streak: 0,
  });

  saveHabits();
  habitForm.reset();
  habitFrequency.value = 'daily';
  renderStats();
  renderHabits();
  renderCalendar();
});

filterChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    activeFilter = chip.dataset.filter;
    filterChips.forEach((entry) => entry.classList.toggle('is-active', entry === chip));
    renderHabits();
  });
});

prevDay.addEventListener('click', () => {
  selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1);
  setDisplayedMonthFromSelectedDate();
  populateMonthPicker();
  renderStats();
  renderHabits();
  renderCalendar();
});

nextDay.addEventListener('click', () => {
  selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
  setDisplayedMonthFromSelectedDate();
  populateMonthPicker();
  renderStats();
  renderHabits();
  renderCalendar();
});

todayButton.addEventListener('click', () => {
  const current = new Date();
  selectedDate = new Date(current.getFullYear(), current.getMonth(), current.getDate());
  setDisplayedMonthFromSelectedDate();
  populateMonthPicker();
  renderStats();
  renderHabits();
  renderCalendar();
});

prevMonth.addEventListener('click', () => {
  displayedMonthDate = new Date(displayedMonthDate.getFullYear(), displayedMonthDate.getMonth() - 1, 1);
  populateMonthPicker();
  renderCalendar();
});

nextMonth.addEventListener('click', () => {
  displayedMonthDate = new Date(displayedMonthDate.getFullYear(), displayedMonthDate.getMonth() + 1, 1);
  populateMonthPicker();
  renderCalendar();
});

goMonth.addEventListener('click', () => {
  if (!monthPicker.value) {
    return;
  }

  const [year, month] = monthPicker.value.split('-').map(Number);
  displayedMonthDate = new Date(year, month - 1, 1);

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  if (selectedYear !== year || selectedMonth !== month - 1) {
    selectedDate = new Date(year, month - 1, 1);
  }

  renderStats();
  renderHabits();
  renderCalendar();
});

habits.forEach((habit) => {
  habit.streak = computeStreak(habit);
});

saveHabits();
populateMonthPicker();
renderStats();
renderHabits();
renderCalendar();
