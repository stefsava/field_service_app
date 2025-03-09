import { Application } from "@hotwired/stimulus";
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading";

const application = Application.start();

// Carica automaticamente tutti i controller Stimulus
eagerLoadControllersFrom("controllers", application);

// Configurazione Stimulus
application.debug = false;
window.Stimulus = application;

export { application };
