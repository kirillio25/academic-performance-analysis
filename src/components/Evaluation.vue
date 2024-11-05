<template>
  <div class="container py-4">
    <h1 class="text-center mb-4 display-5 fw-bold">Evaluation</h1>

    <div class="chart-scroll-container mb-4">
      <div class="chart-container">
        <canvas ref="chartCanvas" class="chart"></canvas>
      </div>
    </div>

    <div class="d-flex justify-content-center align-items-center mb-4 gap-3 amplitude-control">
      <div class="form-check form-switch">
        <input type="checkbox" class="form-check-input" id="toggleSlider" v-model="useSlider" />
        <label class="form-check-label" for="toggleSlider">Ползунок</label>
      </div>
      <div v-if="useSlider" class="d-flex align-items-center gap-2">
        <input type="range" class="form-range" :min="min" :max="max" v-model="amplitude" @input="updateAmplitude" />
        <span class="badge bg-primary fs-6">{{ amplitude }}</span>
      </div>
      <div v-else class="input-group input-group-sm" style="max-width: 150px;">
        <input type="number" class="form-control" :min="min" :max="max" v-model="amplitude" @input="updateAmplitude" />
        <span class="input-group-text">Амплитуда</span>
      </div>
    </div>

    <div class="d-flex justify-content-center mb-4 gap-3 checkbox-controls">
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="showY1" v-model="showY1" @change="toggleVisibility" />
        <label class="form-check-label" for="showY1">Y1</label>
      </div>
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="showY2" v-model="showY2" @change="toggleVisibility" />
        <label class="form-check-label" for="showY2">Y2</label>
      </div>
    </div>

    <div class="d-flex justify-content-center gap-3">
      <button class="btn btn-danger" @click="endDisplay">Конец</button>
      <button class="btn btn-secondary" @click="resetZoom" v-if="isZoomEnabled">Сброс масштаба</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

export default {
  name: 'EvaluationComponent',
  setup() {
    const chartCanvas = ref(null);
    let chart = null;
    const amplitude = ref(1);
    const min = 0.1;
    const max = 2;
    const useSlider = ref(true);
    const showY1 = ref(true);
    const showY2 = ref(true);
    const isZoomEnabled = ref(false);
    let sse = null;

    const originalDataY1 = ref([]);
    const originalDataY2 = ref([]);

    onMounted(() => {
      const ctx = chartCanvas.value.getContext('2d');
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            { label: 'Y1', data: [], borderColor: 'blue', hidden: !showY1.value },
            { label: 'Y2', data: [], borderColor: 'red', hidden: !showY2.value }
          ]
        },
        options: {
          scales: { x: { display: true }, y: { display: true } },
          plugins: {
            legend: { display: true },
            zoom: {
              pan: { enabled: false, mode: 'xy' },
              zoom: {
                wheel: { enabled: false },
                drag: { enabled: false },
                pinch: { enabled: false },
                mode: 'xy'
              }
            }
          }
        }
      });

      sse = new EventSource('http://old.iolab.sk/evaluation/sse/sse.php');
      sse.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        const x = parsedData.x;
        const y1 = parsedData.y1;
        const y2 = parsedData.y2;

        originalDataY1.value.push(y1);
        originalDataY2.value.push(y2);
        chart.data.labels.push(x);
        chart.data.datasets[0].data.push(y1 * amplitude.value);
        chart.data.datasets[1].data.push(y2 * amplitude.value);
        chart.update();
      };
    });

    const updateAmplitude = () => {
      if (chart) {
        chart.data.datasets[0].data = originalDataY1.value.map(y => y * amplitude.value);
        chart.data.datasets[1].data = originalDataY2.value.map(y => y * amplitude.value);
        chart.update();
      }
    };

    const endDisplay = () => {
      if (sse) sse.close();
      if (chart && chart.options.plugins.zoom) {
        chart.options.plugins.zoom.pan.enabled = true;
        chart.options.plugins.zoom.zoom.wheel.enabled = true;
        chart.options.plugins.zoom.zoom.drag.enabled = true;
        chart.options.plugins.zoom.zoom.pinch.enabled = true;
        chart.update();
        isZoomEnabled.value = true;
      }
    };

    const toggleVisibility = () => {
      if (chart) {
        chart.data.datasets[0].hidden = !showY1.value;
        chart.data.datasets[1].hidden = !showY2.value;
        chart.update();
      }
    };

    const resetZoom = () => {
      if (chart && chart.resetZoom) {
        chart.resetZoom();
      }
    };

    onUnmounted(() => {
      if (sse) sse.close();
    });

    return {
      chartCanvas,
      amplitude,
      min,
      max,
      useSlider,
      showY1,
      showY2,
      endDisplay,
      updateAmplitude,
      toggleVisibility,
      resetZoom,
      isZoomEnabled
    };
  }
};
</script>

<style scoped>
.chart-scroll-container {
  overflow-x: auto;
  width: 100%;
}

.chart-container {
  width: 1200px;
}

.chart {
  width: 100%;
  height: 400px;
}

.amplitude-control,
.checkbox-controls {
  margin-bottom: 20px;
}

@media (max-width: 576px) {

  .container {
    padding: 0 10px;
  }

  .amplitude-control,
  .checkbox-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .form-check-label {
    font-size: 0.875rem;
  }

  .form-check {
    width: 100%;
    text-align: center;
  }

  .d-flex.justify-content-center.gap-3 button {
    width: 48%;
  }
}
</style>
