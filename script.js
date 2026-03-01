const habits = [
  {
    id: 4,
    name: 'Marcher 10 000 pas ou courir 5 km',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:07:00.527Z',
    logs: [],
    streak: 0,
    doneToday: false,
  },
  {
    id: 5,
    name: '20 pull up',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:12:28.727Z',
    logs: [],
    streak: 0,
    doneToday: false,
  },
  {
    id: 6,
    name: '20 dip',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:12:39.163Z',
    logs: [],
    streak: 0,
    doneToday: false,
  },
  {
    id: 7,
    name: '20 bench',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:12:48.245Z',
    logs: [],
    streak: 0,
    doneToday: false,
  },
];

const habitList = document.getElementById('habitList');
const totalHabits = document.getElementById('totalHabits');
const dailyHabits = document.getElementById('dailyHabits');
const totalStreak = document.getElementById('totalStreak');
const habitForm = document.getElementById('habitForm');
const habitName = document.getElementById('habitName');
const habitFrequency = document.getElementById('habitFrequency');

const frequencyLabels = {
  daily: 'Quotidienne',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle',
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const toggleDone = (habitId) => {
  const habit = habits.find((entry) => entry.id === habitId);
  if (!habit) {
    return;
  }

  habit.doneToday = !habit.doneToday;
  if (habit.doneToday) {
    habit.logs.push(new Date().toISOString());
    habit.streak += 1;
  } else {
    habit.logs.pop();
    habit.streak = Math.max(0, habit.streak - 1);
  }

  renderStats();
  renderHabits();
};

const removeHabit = (habitId) => {
  const index = habits.findIndex((entry) => entry.id === habitId);
  if (index === -1) {
    return;
  }

  habits.splice(index, 1);
  renderStats();
  renderHabits();
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

  habits.forEach((habit) => {
    const item = document.createElement('li');
    item.className = `habit-card ${habit.doneToday ? 'done' : ''}`;

    const frequency = frequencyLabels[habit.frequency] ?? habit.frequency;
    const details = `Créée le ${formatDate(habit.createdAt)} • Logs: ${habit.logs.length} • Streak: ${habit.streak}`;

    item.innerHTML = `
      <div class="habit-title-row">
        <h3>${habit.name}</h3>
        <span class="badge">${frequency}</span>
      </div>
      <p class="meta">${details}</p>
      <div class="actions">
        <button type="button" data-action="toggle">${habit.doneToday ? 'Annuler du jour' : 'Valider du jour'}</button>
        <button type="button" class="delete" data-action="delete">Supprimer</button>
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
    doneToday: false,
  });

  habitForm.reset();
  habitFrequency.value = 'daily';
  renderStats();
  renderHabits();
});

renderStats();
renderHabits();
