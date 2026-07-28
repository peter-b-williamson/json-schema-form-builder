import { createRouter, createWebHistory } from 'vue-router';
import FormBuilderView from '@/views/FormBuilderView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'form-builder',
      component: FormBuilderView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'form-builder' },
    },
  ],
});

export default router;
