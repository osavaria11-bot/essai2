const STORAGE_KEY = 'mes-habitudes-data';

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
    frequency: 'weekly',
    createdAt: '2026-03-01T21:12:39.163Z',
    logs: [],
    streak: 0,
  },
  {
    id: 7,
    name: '20 bench',
    description: null,
    frequency: 'monthly',
    createdAt: '2026-03-01T21:12:48.245Z',
    logs: [],
    streak: 0,
  },
];

const loadHabits = () => {
  const storedHabits = localStorage.getItem(STORAGE_KEY);
  if (!storedHabits) {
    return defaultHabits;
  }

  try {
    const parsedHabits = JSON.parse(storedHabits);
    if (!Array.isArray(parsedHabits)) {
      return defaultHabits;
    }

    return parsedHabits
      .filter((habit) => typeof habit === 'object' && habit !== null)
      .map((habit) => ({
        id: Number(habit.id) || Date.now() + Math.random(),
        name: typeof habit.name === 'string' ? habit.name : 'Habitude sans nom',
        description: null,
        frequency: ['daily', 'weekly', 'monthly'].includes(habit.frequency) ? habit.frequency : 'daily',
        createdAt: typeof habit.createdAt === 'string' ? habit.createdAt : new Date().toISOString(),
        logs: Array.isArray(habit.logs) ? habit.logs.filter((entry) => typeof entry === 'string') : [],
        streak: 0,
      }));
  } catch (error) {
    return defaultHabits;
  }
};

let habits = loadHabits();
let selectedDate = new Date();
let selectedYear = selectedDate.getFullYear();
let activeFilter = 'all';

const saveHabits = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

const habitList = document.getElementById('habitList');
const totalHabits = document.getElementById('totalHabits');
const dailyHabits = document.getElementById('dailyHabits');
const weeklyHabits = document.getElementById('weeklyHabits');
const monthlyHabits = document.getElementById('monthlyHabits');
const habitForm = document.getElementById('habitForm');
const habitName = document.getElementById('habitName');
const habitFrequency = document.getElementById('habitFrequency');
const calendarGrid = document.getElementById('calendarGrid');
const calendarTitle = document.getElementById('calendarTitle');
const selectedDateTitle = document.getElementById('selectedDateTitle');
const selectedDateSubtitle = document.getElementById('selectedDateSubtitle');
const habitListTitle = document.getElementById('habitListTitle');
const filterButtons = document.querySelectorAll('.filter-btn');
const yearLabel = document.getElementById('yearLabel');
const prevYearBtn = document.getElementById('prevYearBtn');
const nextYearBtn = document.getElementById('nextYearBtn');

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

const hasLogForDay = (habit, dayKey) => {
  return habit.logs.some((isoDate) => toDateKey(new Date(isoDate)) === dayKey);
};

const isHabitDueOnDate = (habit, date) => {
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
};

const getDueHabitsForDate = (date) => habits.filter((habit) => isHabitDueOnDate(habit, date));

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

const getVisibleHabits = () => {
  const dueHabits = getDueHabitsForDate(selectedDate);
  if (activeFilter === 'all') {
    return dueHabits;
  }

  return dueHabits.filter((habit) => habit.frequency === activeFilter);
};

const toggleDone = (habitId) => {
  const habit = habits.find((entry) => entry.id === habitId);
  if (!habit) {
    return;
  }

  const selectedKey = toDateKey(selectedDate);

  if (hasLogForDay(habit, selectedKey)) {
    habit.logs = habit.logs.filter((isoDate) => toDateKey(new Date(isoDate)) !== selectedKey);
  } else {
    const selectedDateCopy = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    habit.logs.push(selectedDateCopy.toISOString());
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

const renderHabits = () => {
  habitList.innerHTML = '';

  const visibleHabits = getVisibleHabits();

  selectedDateTitle.textContent = selectedDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dueCount = getDueHabitsForDate(selectedDate).length;
  selectedDateSubtitle.textContent = `${dueCount} habitude(s) prévue(s) ce jour`;

  const activeFilterLabel = activeFilter === 'all' ? 'toutes fréquences' : frequencyLabels[activeFilter].toLowerCase();
  habitListTitle.textContent = `Habitudes (${activeFilterLabel})`;

  if (visibleHabits.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = "Aucune habitude pour cette date / ce filtre. Essaie une autre fréquence ou un autre jour dans le calendrier.";
    habitList.appendChild(empty);
    return;
  }

  const selectedKey = toDateKey(selectedDate);

  visibleHabits.forEach((habit) => {
    const item = document.createElement('li');
    item.className = `habit-card ${hasLogForDay(habit, selectedKey) ? 'done' : ''}`;

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
        <button type="button" class="check-icon ${hasLogForDay(habit, selectedKey) ? 'is-done' : ''}" data-action="toggle" aria-label="Valider ${habit.name}" title="Valider pour la date sélectionnée">✓</button>
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

const renderMonth = (year, month) => {
  const monthBlock = document.createElement('article');
  monthBlock.className = 'month-block';

  const title = document.createElement('h3');
  title.textContent = new Date(year, month, 1).toLocaleDateString('fr-FR', {
    month: 'long',
  });
  monthBlock.appendChild(title);

  const monthGrid = document.createElement('div');
  monthGrid.className = 'month-grid';

  weekdayLabels.forEach((label) => {
    const weekdayCell = document.createElement('div');
    weekdayCell.className = 'calendar-weekday';
    weekdayCell.textContent = label;
    monthGrid.appendChild(weekdayCell);
  });

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const mondayBasedOffset = (monthStart.getDay() + 6) % 7;

  for (let i = 0; i < mondayBasedOffset; i += 1) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day is-empty';
    monthGrid.appendChild(emptyCell);
  }

  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(selectedDate);

  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    const cellDate = new Date(year, month, day);
    const cellKey = toDateKey(cellDate);
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'calendar-day';
    cell.title = cellDate.toLocaleDateString('fr-FR');

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

    const dayNumber = document.createElement('span');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = String(day);
    cell.appendChild(dayNumber);

    cell.addEventListener('click', () => {
      selectedDate = cellDate;
      selectedYear = selectedDate.getFullYear();
      renderHabits();
      renderCalendar();
    });

    monthGrid.appendChild(cell);
  }

  monthBlock.appendChild(monthGrid);
  return monthBlock;
};

const renderCalendar = () => {
  calendarGrid.innerHTML = '';

  calendarTitle.textContent = 'Calendrier annuel';
  yearLabel.textContent = String(selectedYear);

  for (let month = 0; month < 12; month += 1) {
    calendarGrid.appendChild(renderMonth(selectedYear, month));
  }
};

const renderStats = () => {
  totalHabits.textContent = String(habits.length);
  dailyHabits.textContent = String(habits.filter((habit) => habit.frequency === 'daily').length);
  weeklyHabits.textContent = String(habits.filter((habit) => habit.frequency === 'weekly').length);
  monthlyHabits.textContent = String(habits.filter((habit) => habit.frequency === 'monthly').length);
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
    createdAt: selectedDate.toISOString(),
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

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((entry) => entry.classList.remove('is-active'));
    button.classList.add('is-active');
    renderHabits();
  });
});

prevYearBtn.addEventListener('click', () => {
  selectedYear -= 1;
  renderCalendar();
});

nextYearBtn.addEventListener('click', () => {
  selectedYear += 1;
  renderCalendar();
});

habits.forEach((habit) => {
  habit.streak = computeStreak(habit);
});

saveHabits();
renderStats();
renderHabits();
renderCalendar();
