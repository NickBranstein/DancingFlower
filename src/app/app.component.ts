import { Component } from "@angular/core";
import { registerElement } from 'nativescript-angular/element-registry';

import { Gif } from "nativescript-gif";
registerElement("Gif", () => Gif);

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "./app.component.html"
})
export class AppComponent { }
