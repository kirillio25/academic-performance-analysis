import { createRouter, createWebHistory } from 'vue-router'
import AcademicPerformance from '../components/AcademicPerformance.vue';
import EvaluationComponent from '../components/Evaluation.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AcademicPerformance
    },
    {
      path: '/academicPerformance',
      name: 'AcademicPerformance',
      component: AcademicPerformance,
    },
    {
      path: '/evaluation',
      name: 'Evaluation',
      component: EvaluationComponent,
    },

  ]
})

export default router
