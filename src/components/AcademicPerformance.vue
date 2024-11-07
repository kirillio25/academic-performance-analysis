<template>
  <div>
    <h1 class="text-center mb-4">Academic Performance</h1>
    <div v-if="data.length" class="container">
      <div class="row">
        <div class="col-md-12 col-12 mb-12">
          <div class="chart-container">
            <canvas ref="groupedBarChartCanvas"></canvas>
          </div>
        </div>
      </div>
      <div class="row">
        <div v-for="(year, index) in data" :key="index" class="col-md-6 col-12 mb-4">
          <div class="chart-container">
            <canvas :ref="el => pieChartCanvas[index] = el"></canvas>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 col-12 mb-4">
          <div class="chart-container">
            <canvas ref="lineChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
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
  setup() {
    const data = ref([]);
    const pieChartCanvas = ref([]);
    const lineChartCanvas = ref(null);
    const groupedBarChartCanvas = ref(null);
    const charts = ref({});
    let isSmallScreen = window.innerWidth < 768; // Проверка размера экрана при загрузке

    const loadXMLFile = async () => {
      try {
        const response = await fetch('/z03.xml');
        const xmlText = await response.text();
        parseXMLData(xmlText);
      } catch (error) {
        console.error("Error loading XML file:", error);
      }
    };

    const parseXMLData = async (xmlText) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const records = Array.from(xmlDoc.getElementsByTagName('zaznam'));

      data.value = records.map(record => ({
        year: record.getElementsByTagName('rok')[0].textContent.replace('ZS ', ''),
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

      await nextTick();
      createCharts();
    };

    const createChart = (canvas, type, config) => {
      if (!canvas) return null; // Проверка на наличие canvas
      config.options.animation = false;
      config.options.indexAxis = isSmallScreen ? 'y' : 'x';

      return new Chart(canvas, config);
    };

    const destroyCharts = () => {
      Object.values(charts.value).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
      charts.value = {}; // Очищаем объект charts
    };

    const createCharts = async () => {
      destroyCharts();
      await nextTick();

      if (lineChartCanvas.value) {
        charts.value.line = createChart(lineChartCanvas.value, 'line', {
          type: 'line',
          data: {
            labels: data.value.map(item => item.year),
            datasets: [{
              label: 'Average Grade',
              data: data.value.map(item => {
                const grades = Object.values(item.grades);
                return grades.reduce((a, b) => a + b, 0) / grades.length;
              }),
              backgroundColor: 'rgba(255, 99, 132, 0.3)',
              borderColor: 'rgba(255, 99, 132, 0.8)',
              fill: true,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { title: { text: 'Year', display: true }, ticks: { font: { size: 14 } } },
              y: { title: { text: 'Average Grade', display: true }, ticks: { font: { size: 14 } } },
            },
          },
        });
      }

      data.value.forEach((yearData, index) => {
        const canvasRef = pieChartCanvas.value[index];
        if (canvasRef) {
          charts.value[`pie_${index}`] = new Chart(canvasRef, {
            type: 'pie',
            data: {
              labels: ['A', 'B', 'C', 'D', 'E', 'FX', 'FN'],
              datasets: [{
                data: Object.values(yearData.grades),
                backgroundColor: [
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(255, 159, 64, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                  'rgba(255, 205, 86, 0.7)',
                  'rgba(201, 203, 207, 0.7)',
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 99, 132, 0.7)',
                ],
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: `Grade Distribution for ${yearData.year}` },
              },
            },
          });
        }
      });

      if (groupedBarChartCanvas.value) {
        charts.value.groupedBar = createChart(groupedBarChartCanvas.value, 'bar', {
          type: 'bar',
          data: {
            labels: data.value.map(item => item.year),
            datasets: [
              { label: 'A', data: data.value.map(item => item.grades.A), backgroundColor: 'rgba(75, 192, 192, 0.7)' },
              { label: 'B', data: data.value.map(item => item.grades.B), backgroundColor: 'rgba(255, 159, 64, 0.7)' },
              { label: 'C', data: data.value.map(item => item.grades.C), backgroundColor: 'rgba(153, 102, 255, 0.7)' },
              { label: 'D', data: data.value.map(item => item.grades.D), backgroundColor: 'rgba(255, 205, 86, 0.7)' },
              { label: 'E', data: data.value.map(item => item.grades.E), backgroundColor: 'rgba(201, 203, 207, 0.7)' },
              { label: 'FX', data: data.value.map(item => item.grades.FX), backgroundColor: 'rgba(54, 162, 235, 0.7)' },
              { label: 'FN', data: data.value.map(item => item.grades.FN), backgroundColor: 'rgba(255, 99, 132, 0.7)' },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { title: { text: 'Year', display: true }, ticks: { font: { size: 14 } } },
              y: { title: { text: 'Count', display: true }, ticks: { font: { size: 14 } } },
            },
            plugins: {
              title: { display: true, text: 'Grade Comparison by Year' },
            },
          },
        });
      }
    };

    const handleResize = () => {
      const newIsSmallScreen = window.innerWidth < 768;
      if (newIsSmallScreen !== isSmallScreen) {
        isSmallScreen = newIsSmallScreen;
        createCharts();
      }
    };

    onMounted(() => {
      loadXMLFile();
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
      destroyCharts(); // Очищаем все графики перед размонтированием
    });

    return {
      data,
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
  max-width: 1200px; /* Maximum width for centering on large screens */
  height: 800px; /* Increased height for extending the chart */
  margin: auto;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .chart-container {
    height: 600px;
  }
}
</style>
