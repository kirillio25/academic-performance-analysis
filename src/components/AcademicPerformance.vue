<template>
    <div>
      <h1>Академическая успеваемость</h1>
      <!-- Кнопка для загрузки XML-файла -->
      <input type="file" @change="handleFileUpload" accept=".xml" />
  
      <div v-if="data.length">
        <div class="chart-container">
          <!-- Столбчатый график -->
          <canvas ref="barChartCanvas"></canvas>
        </div>
        <div v-for="(year, index) in data" :key="index" class="chart-container">
          <!-- Круговая диаграмма для каждого года -->
          <canvas :ref="el => pieChartCanvas[index] = el"></canvas>
        </div>
        <div class="chart-container">
          <!-- Дополнительный график -->
          <canvas ref="lineChartCanvas"></canvas>
        </div>
        <div class="chart-container">
          <!-- Новый сгруппированный столбчатый график -->
          <canvas ref="groupedBarChartCanvas"></canvas>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, nextTick } from 'vue';
  import {
    Chart,
    BarController,
    PieController,
    LineController,
    CategoryScale,
    LinearScale,
    ArcElement,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  
  // Регистрация компонентов и шкал
  Chart.register(
    BarController,
    PieController,
    LineController,
    CategoryScale,
    LinearScale,
    ArcElement,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
  export default {
    name: 'AcademicPerformance',
    setup() {
      const data = ref([]);
      const barChartCanvas = ref(null);
      const pieChartCanvas = ref([]);
      const lineChartCanvas = ref(null);
      const groupedBarChartCanvas = ref(null); // Новый график
  
      // Обработка загрузки файла
      const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
          const xmlText = await file.text();
          parseXMLData(xmlText);
        }
      };
  
      // Парсинг XML-данных
      const parseXMLData = async (xmlText) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const records = Array.from(xmlDoc.getElementsByTagName('zaznam'));
  
        data.value = records.map(record => ({
          year: record.getElementsByTagName('rok')[0].textContent,
          grades: {
            A: parseInt(record.getElementsByTagName('A')[0].textContent),
            B: parseInt(record.getElementsByTagName('B')[0].textContent),
            C: parseInt(record.getElementsByTagName('C')[0].textContent),
            D: parseInt(record.getElementsByTagName('D')[0].textContent),
            E: parseInt(record.getElementsByTagName('E')[0].textContent),
            FX: parseInt(record.getElementsByTagName('FX')[0].textContent),
            FN: parseInt(record.getElementsByTagName('FN')[0].textContent),
          },
        }));
  
        // Дожидаемся отрисовки элементов, затем создаем графики
        await nextTick();
        createCharts();
      };
  
      // Построение графиков
      const createCharts = () => {
        // Столбчатый график
        if (barChartCanvas.value) {
          new Chart(barChartCanvas.value, {
            type: 'bar',
            data: {
              labels: data.value.map(item => item.year),
              datasets: [
                {
                  label: 'A',
                  data: data.value.map(item => item.grades.A),
                },
                // Добавьте остальные метки (B, C, D и т. д.)
              ],
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { text: 'Год', display: true } },
                y: { title: { text: 'Количество', display: true } },
              },
            },
          });
        }
  
        // Круговые диаграммы для каждого года
        data.value.forEach((yearData, index) => {
          const canvasRef = pieChartCanvas.value[index];
          if (canvasRef) {
            new Chart(canvasRef, {
              type: 'pie',
              data: {
                labels: ['A', 'B', 'C', 'D', 'E', 'FX', 'FN'],
                datasets: [{
                  data: Object.values(yearData.grades),
                }],
              },
              options: {
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: `Распределение оценок за ${yearData.year}` },
                },
              },
            });
          }
        });
  
        // Дополнительный график, например, линейный
        if (lineChartCanvas.value) {
          new Chart(lineChartCanvas.value, {
            type: 'line',
            data: {
              labels: data.value.map(item => item.year),
              datasets: [
                {
                  label: 'Средний балл',
                  data: data.value.map(item => {
                    const grades = Object.values(item.grades);
                    return grades.reduce((a, b) => a + b, 0) / grades.length;
                  }),
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { text: 'Год', display: true } },
                y: { title: { text: 'Средний балл', display: true } },
              },
            },
          });
        }
  
        // Новый сгруппированный столбчатый график
        if (groupedBarChartCanvas.value) {
          new Chart(groupedBarChartCanvas.value, {
            type: 'bar',
            data: {
              labels: data.value.map(item => item.year),
              datasets: [
                {
                  label: 'A',
                  data: data.value.map(item => item.grades.A),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                  label: 'B',
                  data: data.value.map(item => item.grades.B),
                  backgroundColor: 'rgba(255, 159, 64, 0.6)',
                },
                {
                  label: 'C',
                  data: data.value.map(item => item.grades.C),
                  backgroundColor: 'rgba(153, 102, 255, 0.6)',
                },
                {
                  label: 'D',
                  data: data.value.map(item => item.grades.D),
                  backgroundColor: 'rgba(255, 205, 86, 0.6)',
                },
                {
                  label: 'E',
                  data: data.value.map(item => item.grades.E),
                  backgroundColor: 'rgba(201, 203, 207, 0.6)',
                },
                {
                  label: 'FX',
                  data: data.value.map(item => item.grades.FX),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
                {
                  label: 'FN',
                  data: data.value.map(item => item.grades.FN),
                  backgroundColor: 'rgba(255, 99, 132, 0.6)',
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                x: { stacked: false, title: { text: 'Год', display: true } },
                y: { stacked: false, title: { text: 'Количество', display: true } },
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Сравнение оценок по годам',
                },
              },
            },
          });
        }
      };
  
      return {
        data,
        handleFileUpload,
        barChartCanvas,
        pieChartCanvas,
        lineChartCanvas,
        groupedBarChartCanvas,
      };
    },
  };
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    max-width: 600px;
    margin: auto;
    margin-bottom: 30px;
  }
  
  @media (max-width: 576px) {
    .chart-container {
      max-width: 100%;
    }
  }
  </style>
  