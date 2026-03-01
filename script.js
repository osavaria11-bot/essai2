const habits = [
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

const habitList = document.getElementById('habitList');
const totalHabits = document.getElementById('totalHabits');
const dailyHabits = document.getElementById('dailyHabits');
const totalStreak = document.getElementById('totalStreak');
const habitForm = document.getElementById('habitForm');
const habitName = document.getElementById('habitName');
const habitFrequency = document.getElementById('habitFrequency');
const calendarGrid = document.getElementById('calendarGrid');
const calendarTitle = document.getElementById('calendarTitle');

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

const toggleDone = (habitId) => {
  const habit = habits.find((entry) => entry.id === habitId);
  if (!habit) {
    return;
  }

  const today = new Date();
  const todayKey = toDateKey(today);

  if (hasLogForDay(habit, todayKey)) {
    habit.logs = habit.logs.filter((isoDate) => toDateKey(new Date(isoDate)) !== todayKey);
  } else {
    habit.logs.push(today.toISOString());
  }

  habit.streak = computeStreak(habit);

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
  renderStats();
  renderHabits();
  renderCalendar();
};

const renderHabits = () => {
  habitList.innerHTML = '';

  if (habits.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'Aucune habitude pour le moment. Ajoute-en une ci-dessus.';
    habitList.appendChild(empty);
    return;
  }

  const todayKey = toDateKey(new Date());

  habits.forEach((habit) => {
    const item = document.createElement('li');
    item.className = `habit-card ${hasLogForDay(habit, todayKey) ? 'done' : ''}`;

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
        <button type="button" class="check-icon ${hasLogForDay(habit, todayKey) ? 'is-done' : ''}" data-action="toggle" aria-label="Valider ${habit.name}" title="Valider du jour">✓</button>
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

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  calendarTitle.textContent = now.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

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
    const cellDate = new Date(now.getFullYear(), now.getMonth(), day);
    const cell = document.createElement('div');
    const dayNumber = document.createElement('span');

    cell.className = 'calendar-day';
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = String(day);

    if (toDateKey(cellDate) === toDateKey(now)) {
      cell.classList.add('is-today');
    }

    if (isPerfectDay(cellDate)) {
      const flame = document.createElement('span');
      flame.className = 'calendar-flame';
      flame.textContent = '🔥';
      flame.title = 'Toutes les tâches prévues sont accomplies';
      cell.appendChild(flame);
    }

    cell.appendChild(dayNumber);
    calendarGrid.appendChild(cell);
  }
};

const renderStats = () => {
  totalHabits.textContent = String(habits.length);
  dailyHabits.textContent = String(habits.filter((habit) => habit.frequency === 'daily').length);
  totalStreak.textContent = String(habits.reduce((sum, habit) => sum + habit.streak, 0));
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

  habitForm.reset();
  habitFrequency.value = 'daily';
  renderStats();
  renderHabits();
  renderCalendar();
});

renderStats();
renderHabits();
renderCalendar();
