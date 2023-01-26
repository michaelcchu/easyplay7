# easyplay7

play music by pressing keys on the keyboard (or tapping the screen).

upload any .musicxml, .xml, or .mxl file.

uses [opensheetmusicdisplay](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay) and [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

user controls timing and duration of notes in real time / during live performance.

the sequence of notes is specified beforehand.

why is this useful?
- you only need to play the rhythms; the computer takes care of playing the right notes.
- much of musical expression comes from the [timing and duration of notes](https://en.wikipedia.org/wiki/Expressive_timing).
- it's a way to play music files expressively (rather than like a metronome / robot).
- when you don't have to worry about technique / getting all the right notes out / playing in tune (since the computer ensures that this will happen), your mind is freed and liberated so that you can focus on what matters most: expression.
- it's a good division of labor: computers do the hard technical stuff (playing the right sequence of notes in tune), and humans focus on what we're good at: musical expression.

what can i use this for?
- you can play on your own, or with a friend / ensemble, or with a recording.
- you can play any piece you want, as long as you can find a .musicxml, .xml, or .mxl file for it on the internet. you can also create your own .musicxml file or convert a midi file to .musicxml.
  additionally, you can use a score editor such as [MuseScore](https://musescore.com/), [NoteFlight](https://www.noteflight.com/), [Flat.io](https://flat.io/), or [LilyPond](http://lilypond.org/)/[Frescobaldi](https://www.frescobaldi.org/) to modify your score before uploading it to easyplay7.

in summary:

the general philosophy of this software: playing music / expressing your musical ideas should be as easy, fluid, dynamic, and natural as possible.

in the past, the dichotomy was that you could either 

1) spend hours learning the notes of a piece (committing them to muscle-memory) in order to play a piece expressively on a traditional physical instrument (like a violin, clarinet, or piano), or

2) have a computer play the notes and rhythms accurately, but in the style of a strict robot/metronome, with no expression or human input/interaction at all.

we would like to provide a third and better way, in which you can engage directly with the music and play it easily and expressively, yet without having to practice for hours to learn all of the notes.

we imagine that in the future, most people will play music with tapper-like programs, because it is so much easier to do it this way. combined with innovations in musical robotics, tapper-like programs will be an important part of the ecosystem of human-musical-instrument interfaces in the 21st century.

what next?

try the [website](https://mcchu.com/easyplay7/) and/or see [demonstrations](https://www.youtube.com/playlist?list=PLB1dz46HEVoSqZvxaY-xkh17CvYgUGq3F); it can be fun! :)

similar to:

[touchpianist.com](https://touchpianist.com/) by Batuhan Bozkurt (2015, Turkey)
 - first time this kind of software was available in web browser, accessible on both desktop and mobile, and could be downloaded as an [iOS/Android app](https://www.youtube.com/watch?v=ZtrG4893f74) 
 - first time this kind of software became widely used / popular among the general public
 - the position that you touch on the screen controls the volume/dynamics of the sound
 
[expresseur.com](http://www.expresseur.com/) by Frank Revolle (2008, France)
- related to [MuseScore](https://musescore.com/)
- can be used for [piano accompaniment](https://www.youtube.com/watch?v=LpqxokZFm6w)

[tapper](http://www.musanim.com/Tapper/) by Stephen Malinowski (1998, USA, known for "music animation machine")
- can be played on [computer keyboard](https://youtu.be/IKsGZCkoNr4?t=571) or connected to [midi keyboard](https://www.youtube.com/watch?v=gTlIYcg_LSQ) (see [official demonstration](https://www.youtube.com/watch?v=wKd4RyhivtI))
