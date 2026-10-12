import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { Home } from './home/home';
import { SobreNos } from './sobre-nos/sobre-nos';
import { Tecnologias } from './tecnologias/tecnologias';
import { Desafio } from './desafio/desafio';
import { Impactos } from './impactos/impactos';

@NgModule({
  declarations: [App, Navbar, Footer, Home, SobreNos, Tecnologias, Desafio, Impactos],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
