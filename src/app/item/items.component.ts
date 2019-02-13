import { Component, OnInit } from "@angular/core";

import { Page } from 'tns-core-modules/ui/page';

import { setInterval } from 'tns-core-modules/timer';
import { AudioRecorderOptions, TNSRecorder } from 'nativescript-audio';
import { File, knownFolders } from 'tns-core-modules/file-system';
import { EventData } from "tns-core-modules/data/observable";
import './async-await';
import { componentNeedsResolution } from "@angular/core/src/metadata/resource_loading";

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./items.component.html",
    styleUrls: ["./items.component.css"]
})
export class ItemsComponent implements OnInit {
    private recorder: TNSRecorder;
    private audioFile: string; 
    private dancingInterval: any;
    private flower: any;
    private page: Page;
    private dancing: boolean;
    color: string;

    // This pattern makes use of Angular’s dependency injection implementation to
    // inject an instance of the ItemService service into this class.
    // Angular knows about this service because it is included in your app’s main NgModule,
    // defined in app.module.ts.
    constructor(page: Page) { 
        this.recorder = new TNSRecorder();
        this.recorder.debug = true;
        this.page = page;
        this.dancing = false;
    }

    ngOnInit(): void {
        this.flower = this.page.getViewById('flower');
        
        let interval = setInterval(() => {
            this.flower.stop();
            clearInterval(interval);
        }, 100);
    }

    onStart(args: EventData) {
        this.startRecording();
    }

    onStop(args: EventData) {
        this.stopRecording();
    }

    public async startRecording() {
        try {
          if (!TNSRecorder.CAN_RECORD()) {
                console.log('This device cannot record.')
            return;
          }
          const audioFolder = knownFolders.currentApp().getFolder('temp');
          console.log(JSON.stringify(audioFolder));
    
          this.audioFile = `${audioFolder.path}/temp.caf`;
          
    
          const recorderOptions: AudioRecorderOptions = {
            filename: this.audioFile,
            metering: true,
    
            infoCallback: infoObject => {
              console.log(JSON.stringify(infoObject));
            },
    
            errorCallback: errorObject => {
              console.log(JSON.stringify(errorObject));
            }
          };
    
            await this.recorder.start(recorderOptions);
            
          if (recorderOptions.metering) {
            this.setupDancing();
          }
        } catch (err) {
          this.stopDancing();
            console.log(err);
        }
    }

    public async stopRecording() {
        this.stopDancing();

        await this.recorder.stop().catch(ex => {
            console.log(ex);
            this.stopDancing();
        });
    }
    
    private setupDancing() {
        this.stopDancing();
        this.removeFile();

        this.dancingInterval = setInterval(() => {            
            let meters = parseFloat(this.recorder.getMeters(0));
            
            if (meters >= -15.0) {
                if (!this.dancing) {
                    console.log('starting dancing');
                    this.flower.start();
                    this.dancing = true;
                }
            } else {
                this.flower.stop()
                this.dancing = false;
            }

            console.log(meters);
            console.log(this.dancing);
        }, 1000)
    }

    private stopDancing() {
        this.flower.stop();
        this.dancing = false;
        
        if (this.dancingInterval) {
            clearInterval(this.dancingInterval);
            this.dancingInterval = undefined;
        }
    }

    private removeFile() {
        let folder = knownFolders.currentApp().getFolder('temp');
        let file = folder.getFile('temp.caf');

        file.remove().then((res) => {
            console.log('Temp file removed.');
        }).catch((err) => {
            console.log(err.stack);
        });
    }
}
