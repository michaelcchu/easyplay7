const audioContext = new AudioContext();
const badKeys = ["Alt","Arrow","Audio","Enter","Home","Launch","Meta","Play",
    "Tab"];
const gainNode = new GainNode(audioContext);
const oscillator = new OscillatorNode(audioContext, {frequency: 0});
const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(container);
const value = {"c":0,"d":2,"e":4,"f":5,"g":7,"a":9,"b":11,"#":1,"&":-1};

let activePress; let loadPromise; let normalGain; let on = false; let parts;
let press; let track; let tuning; let playedFirstNote; let tieCount;

oscillator.connect(gainNode).connect(audioContext.destination);
osmd.FollowCursor = true;

setGain();
setTuning();

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
            
            // Special behavior for first note
            if (playedFirstNote) {osmd.cursor.next();} 
            else {playedFirstNote = true;}

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
                console.log(press, freq);
                if (activePress === null) {
                    oscillator.frequency.value = freq;
                    gainNode.gain.setTargetAtTime(normalGain, 
                        audioContext.currentTime, 0.015);
                } else {
                    oscillator.frequency.setTargetAtTime(freq, 
                        audioContext.currentTime, 0.003)   
                }
                activePress = press;
                if (osmd.cursor.NotesUnderCursor()[0].tie !== undefined) {
                    const tie = osmd.cursor.NotesUnderCursor()[0].tie;
                    tieCount = tie.notes.length - 1;

                }
            }
    } else if (strPress.includes("Arrow") && (activePress === null)) {
        if (strPress.includes("Left")) {
            if (osmd.cursor.iterator.currentTimeStamp.realValue > 0) {
                osmd.cursor.previous();
                playedFirstNote = false;
            }
        }
        else if (strPress.includes("Right")) {osmd.cursor.next();}
    } else if (strPress.includes("Home") && (activePress === null)) {
        begin();
    }
}

function format(x) {return x.trim().toLowerCase();}

function key(e) { 
    if (e.type.includes("key")) {press = e.key;} 
    else {press = e.changedTouches[0].identifier;}
    if (["keydown","touchstart"].includes(e.type)) {down(e);} else {up();}
}

function parse() {
    for (const file of input.files) {
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
             const text = e.target.result;
             const parser = new DOMParser();
             const mxlDoc = parser.parseFromString(text,'text/xml');
             console.log(mxlDoc);
             loadPromise = osmd.load(mxlDoc);             
             parts = mxlDoc.querySelectorAll("part");

             // replace the old track options with new track options 
             while (select.options.length) {select.options.remove(0);}
             for (let i = 0; i < parts.length; i++) {
                 const option = document.createElement("option");
                 option.text = parts[i].id; select.add(option);
             }
             resetVars();
             setTrack();
        });
        reader.readAsText(file);
    }
}

function render() {
    loadPromise.then(() => {
        osmd.render();
        osmd.cursor.show();
    });
}

function resetVars() {
    activePress = null; playedFirstNote = false;
    tieCount = 0;
    gainNode.gain.value = 0;
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

function begin() {
    if (!on) {oscillator.start(); on = true;}
    if (osmd.cursor) {osmd.cursor.reset();}
    resetVars();
}

start.addEventListener("click", begin);

function setGain() {
    normalGain = 10**(dbfs.value/20);
};

function setView() {
    if (view.value === "horizontal") {
        osmd.setOptions({renderSingleHorizontalStaffline: true});
    } else {
        osmd.setOptions({renderSingleHorizontalStaffline: false});
    }
    render();
}

function setTrack() {
    track = select.selectedIndex;
    for (let i = 0; i < parts.length; i++) {
        osmd.sheet.Instruments[i].Visible = (i === track);
    }
    render();
}

function setTuning() {
    tuning = {
        pitch: value[tuningPitch.value],
        octave: +tuningOctave.value,
        frequency: +tuningFrequency.value
    }
}

input.addEventListener("change", parse);
dbfs.addEventListener("change", setGain);
view.addEventListener("change", setView);
select.addEventListener("change", setTrack);
tuningBlock.addEventListener("change", setTuning);