# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

## Architettura

* Odoo → È il sistema centrale dove vengono salvati e sincronizzati i dati.
* Rails → Funziona come un proxy tra la PWA e Odoo, gestendo l'autenticazione e il recupero dei dati.
* Service Worker JS → Si occupa di memorizzare i dati offline, permettendo di accedere alle informazioni anche senza connessione.
