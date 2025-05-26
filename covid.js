const totalCasesEl = document.getElementById('totalCases');
const activeCasesEl = document.getElementById('activeCases');
const recoveredEl = document.getElementById('recovered');
const deathsEl = document.getElementById('deaths');
const todayCasesEl = document.getElementById('todayCases');
const countryTitle = document.getElementById('countryTitle');
const ctx = document.getElementById('casesChart').getContext('2d');

let casesChart;

document.getElementById('searchForm').addEventListener('submit', e => {
  e.preventDefault();
  const country = document.getElementById('countryInput').value.trim();
  if (country) {
    fetchCovidData(country);
  }
});

async function fetchCovidData(country) {
  try {
    const statsRes = await fetch(`https://disease.sh/v3/covid-19/countries/${encodeURIComponent(country)}?strict=true`);
    if (!statsRes.ok) throw new Error('Country not found');
    const stats = await statsRes.json();

    totalCasesEl.textContent = stats.cases.toLocaleString();
    activeCasesEl.textContent = stats.active.toLocaleString();
    recoveredEl.textContent = stats.recovered.toLocaleString();
    deathsEl.textContent = stats.deaths.toLocaleString();
    todayCasesEl.textContent = stats.todayCases.toLocaleString();
    countryTitle.textContent = stats.country;

    // Fetch historical data for chart
    const historyRes = await fetch(`https://disease.sh/v3/covid-19/historical/${encodeURIComponent(country)}?lastdays=all`);
    if (!historyRes.ok) throw new Error('Historical data not found');
    const historyData = await historyRes.json();

    const timeline = historyData.timeline.cases;

    // Process yearly data: take last date in each year
    const yearlyCases = {};
    for (const [date, cases] of Object.entries(timeline)) {
      const [month, day, yearSuffix] = date.split('/');
      const year = 2000 + parseInt(yearSuffix, 10);
      if (
        !yearlyCases[year] ||
        isLaterDate(parseInt(month), parseInt(day), yearlyCases[year].month, yearlyCases[year].day)
      ) {
        yearlyCases[year] = { cases, month: parseInt(month), day: parseInt(day) };
      }
    }

    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    const labels = [];
    const dataValues = [];
    years.forEach(year => {
      labels.push(year);
      dataValues.push(yearlyCases[year] ? yearlyCases[year].cases : 0);
    });

    drawChart(labels, dataValues);
  } catch (error) {
    alert(error.message + '. Please try again with a valid country name.');
  }
}

function isLaterDate(m1, d1, m2, d2) {
  if (m1 > m2) return true;
  if (m1 === m2 && d1 > d2) return true;
  return false;
}

function drawChart(labels, data) {
  if (casesChart) casesChart.destroy();

  casesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Cases per Year',
          data,
          borderColor: 'blue',
          backgroundColor: 'rgba(0, 0, 255, 0.3)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#3a6df0',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            boxWidth: 12,
            font: {
              size: 14,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: context => ` ${context.dataset.label}: ${context.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 12,
            },
          },
          title: {
            display: true,
            text: 'Year',
            font: {
              size: 14,
            },
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => value.toLocaleString(),
            font: {
              size: 12,
            },
          },
          title: {
            display: true,
            text: 'Total Cases',
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });
}
