const audioContext = new AudioContext();
const badKeys = ["Alt","Arrow","Audio","Enter","Home","Launch","Meta","Play",
    "Tab"];
const gainNode = new GainNode(audioContext);
const oscillator = new OscillatorNode(audioContext, {frequency: 0});
const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(container);
const value = {"c":0,"d":2,"e":4,"f":5,"g":7,"a":9,"b":11,"#":1,"&":-1,"":0};

let activePress; let loadPromise; let normalGain; let on = false; let parts;
let press; let track; let tuning; let tieCount;

oscillator.connect(gainNode).connect(audioContext.destination);
osmd.FollowCursor = true;

setGain();
setTuning();

function begin() {
    document.querySelector(".splash").classList.toggle("splash-toggle");
    if (!on) {oscillator.start(); on = true;}
    resetVars();
    parse("Aus_meines_Herzens_Grunde.mxl");
}

function down(e) {
    const strPress = "" + press;
    if (on && !badKeys.some(badKey => strPress.includes(badKey))
        && !e.repeat && (document.activeElement.nodeName !== 'INPUT') 
        && (press != activePress) && (osmd.cursor !== null)) {            
            // Skip tied notes
            if (tieCount > 0) {
                for (let i=0; i < tieCount; i++) {osmd.cursor.next();}
                tieCount = 0;
            }

            osmd.cursor.next();
            
            // Skip rests
            while ((osmd.cursor.NotesUnderCursor().length > 0) 
                && (osmd.cursor.NotesUnderCursor()[0].pitch === undefined)) {
                osmd.cursor.next();
            }
            
            if (osmd.cursor.NotesUnderCursor()[0] 
                && osmd.cursor.NotesUnderCursor()[0].pitch !== undefined) {                
                const pitch = osmd.cursor.NotesUnderCursor()[0].pitch;
                const note = {
                    pitch: pitch.fundamentalNote 
                        + pitch.AccidentalHalfTones, 
                    octave: pitch.octave + 3,
                }
                const freq = toFreq(note);
                let gain = 0;
                if (freq > 0) {
                    gain = normalGain * (49 / freq);
                }
                if (activePress === null) {
                    oscillator.frequency.value = freq;
                } else {
                    oscillator.frequency.setTargetAtTime(freq, 
                        audioContext.currentTime, 0.003);   
                }
                gainNode.gain.setTargetAtTime(gain, 
                    audioContext.currentTime, 0.015);

                activePress = press;

                // if there's a tie, keep track of it
                if (osmd.cursor.NotesUnderCursor()[0].tie !== undefined) {
                    const tie = osmd.cursor.NotesUnderCursor()[0].tie;
                    tieCount = tie.notes.length - 1;
                }
            }
    } else if (document.activeElement.nodeName !== 'INPUT') {
        if (strPress.includes("Arrow") && (activePress === null)) {
            if (strPress.includes("Left")) {
                osmd.cursor.previous();
            }
            else if (strPress.includes("Right")) {osmd.cursor.next();}
        }
    }
}

function getCurrentMeasure() {
    return osmd.cursor.iterator.currentMeasureIndex + 1;
}

function goToMeasure() {
    if (osmd.cursor) {
        const measure = +measureInput.value;
        const first = osmd.sheet.FirstMeasureNumber;
        const last = osmd.sheet.LastMeasureNumber;
        if ((first <= measure) && (measure <= last)) {
            if (getCurrentMeasure() < measure) {
                while (getCurrentMeasure() < measure) {osmd.cursor.next();}
                osmd.cursor.previous();
            } else if (getCurrentMeasure() > measure) {
                if (measure === 1) {
                    osmd.cursor.reset();
                    osmd.cursor.previous();
                } else {
                    while (getCurrentMeasure() > measure - 1) {
                        osmd.cursor.previous();
                    }
                }
            }
        }
        document.activeElement.blur();
    }
}

function key(e) { 
    if (e.type.includes("key")) {press = e.key;} 
    else {press = e.changedTouches[0].identifier;}
    if (["keydown","touchstart"].includes(e.type)) {down(e);} else {up();}
}

function parse(text) {
    loadPromise = osmd.load(text);
    loadPromise.then(() => {
       // replace the old track options with new track options 
       while (select.options.length) {select.options.remove(0);}
       parts = osmd.sheet.Instruments;
       for (let i = 0; i < parts.length; i++) {
           const option = document.createElement("option");
           option.text = parts[i].nameLabel.text; select.add(option);
       }
       resetVars();
       setTrack(null, true);
   });       
}

function readFile() {
    for (const file of input.files) {
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {parse(e.target.result);});
        const name = file.name.toLowerCase();
        if (name.endsWith(".musicxml") || name.endsWith(".xml")) {
            reader.readAsText(file);
        } else if (name.endsWith(".mxl")) {
            reader.readAsBinaryString(file);
        }
    }
}

function render(reset=false) {
    if (loadPromise) {
        loadPromise.then(() => {
            osmd.render();
            if (reset) {
                osmd.cursor.reset();
                osmd.cursor.previous();
            }
            osmd.cursor.show();
            document.activeElement.blur();
        });
    }
}

function resetVars() {
    activePress = null;
    tieCount = 0;
    gainNode.gain.value = 0;
}

function setGain() {
    normalGain = 10**(dbfs.value/20);
};

function setTrack(e, reset=false) {
    track = select.selectedIndex;
    for (let i = 0; i < parts.length; i++) {
        osmd.sheet.Instruments[i].Visible = (i === track);
    }
    render(reset);
}

function setTuning() {
    tuning = {
        pitch: value[tuningPitch.value] + value[tuningAccidental.value],
        octave: +tuningOctave.value,
        frequency: +tuningFrequency.value
    }
}

function setView() {
    if (view.value === "horizontal") {
        osmd.setOptions({renderSingleHorizontalStaffline: true});
    } else {
        osmd.setOptions({renderSingleHorizontalStaffline: false});
    }
    render();
}

function setZoom() {
    osmd.zoom = zoomFactor.value;
    render();
}

function toFreq(note) {
    return tuning.frequency * 2**((note.pitch - tuning.pitch)/12 
        + note.octave - tuning.octave)
}

function up() {
    if (on && (press === activePress)) {
        gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.015);
        activePress = null;
    }
}

const containerEventTypes = ["touchstart","touchend"];
for (et of containerEventTypes) {container.addEventListener(et, key);}
const docEventTypes = ["keydown","keyup"];
for (et of docEventTypes) {document.addEventListener(et, key);}

dbfs.addEventListener("change", setGain);
go.addEventListener("click", goToMeasure);
input.addEventListener("change", readFile);
select.addEventListener("change", setTrack);
start.addEventListener("click", begin);
tuningBlock.addEventListener("change", setTuning);
view.addEventListener("change", setView);
zoomFactor.addEventListener("change", setZoom);
document.querySelector(".side-panel-toggle").addEventListener("click", () => {
    document.querySelector(".wrapper").classList.toggle("side-panel-close");
});