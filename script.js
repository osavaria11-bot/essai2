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
  {
    id: 8,
    name: '20 abdo machine',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:13:00.736Z',
    logs: [],
    streak: 0,
  },
  {
    id: 9,
    name: '20 avant bras',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:13:18.489Z',
    logs: [],
    streak: 0,
  },
  {
    id: 10,
    name: '20 mollets',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:13:39.678Z',
    logs: [],
    streak: 0,
  },
  {
    id: 11,
    name: '20 avant jambre',
    description: null,
    frequency: 'daily',
    createdAt: '2026-03-01T21:16:18.814Z',
    logs: [],
    streak: 0,
  },
];

const habitList = document.getElementById('habitList');
const totalHabits = document.getElementById('totalHabits');
const dailyHabits = document.getElementById('dailyHabits');
const totalStreak = document.getElementById('totalStreak');

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

const renderHabits = () => {
  habitList.innerHTML = '';

  habits.forEach((habit) => {
    const item = document.createElement('li');
    item.className = 'habit-card';

    const title = habit.name;
    const frequency = frequencyLabels[habit.frequency] ?? habit.frequency;
    const details = `Créée le ${formatDate(habit.createdAt)} • Logs: ${habit.logs.length} • Streak: ${habit.streak}`;

    item.innerHTML = `
      <div class="habit-title-row">
        <h3>${title}</h3>
        <span class="badge">${frequency}</span>
      </div>
      <p class="meta">${details}</p>
    `;

    habitList.appendChild(item);
  });
};

const renderStats = () => {
  totalHabits.textContent = String(habits.length);
  dailyHabits.textContent = String(habits.filter((habit) => habit.frequency === 'daily').length);
  totalStreak.textContent = String(habits.reduce((sum, habit) => sum + habit.streak, 0));
};

renderStats();
renderHabits();
