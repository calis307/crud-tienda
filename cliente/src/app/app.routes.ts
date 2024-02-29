import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './modules/about-us/about-us/about-us.component';

// Your routing file should look like this
export const routes: Routes = [
  // A route to the home page (component)
  {
    path: '',
    component: HomeComponent,
  },

  {
    path: 'about-us', component: AboutUsComponent,
  },  
  // A route to the about us page (module), ambas opciones de enrutar son válidas
  /* {
    path: 'about-us',
    loadChildren: () =>
      import('./modules/about-us/about-us.module').then((m) => m.AboutUsModule),
  }, */
];
