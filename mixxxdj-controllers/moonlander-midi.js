var Moonlander = {};

const PLAY = "play";
const CUE = "cue_default";
const HEADPHONES = "headMix";
const SYNC = "sync_enabled";
const FORWARD = "forward";
const BACKWARD = "backward";

const FILTER = {
    LOW: 0.0,
    MID: 0.5,
    HIGH: 1.0
};

function deckGroup(deck) {
    return "[Channel" + deck + "]";
}

const MI = {
    C: 0,
    Cs: 1,
    Db: 1,
    D: 2,
    Ds: 3,
    Eb: 3,
    E: 4,
    F: 5,
    Fs: 6,
    Gb: 6,
    G: 7,
    Gs: 8,
    Ab: 8,
    A: 9,
    As: 10,
    Bb: 10,
    B: 11
};

function note(note, octave) {
    return 12 * (octave + 1) + MI[note];
}

function onKey(midiNote, callback) {
    midi.makeInputHandler(0x90, midiNote, callback);
    midi.makeInputHandler(0x80, midiNote, function(channel, control, value, status) {
        callback(channel, control, 0, status);
    });
}

function pausePlay(deck) {
    return function(channel, control, value, status) {
        if (value > 0) {
            const group = deckGroup(deck);
            const playing = engine.getValue(group, PLAY);
            engine.setValue(group, PLAY, !playing);
        }
    };
}

function cue(deck) {
    return function(channel, control, value, status) {
        engine.setValue(deckGroup(deck), CUE, value);
    };
}

function sync(deck) {
		return function(channel, control, value, status) {
				engine.setValue(deckGroup(deck), SYNC, value);
		}
}

function toggleHeadphones(deck) {
		return function(channel, control, value, status) {
			const group = deckGroup(deck);
			const current = engine.getValue(group, HEADPHONES);
			engine.setValue(group, HEADPHONES, !current);
		}
}

function volume(deck, amount) {
    return function(channel, control, value, status) {
        if (value > 0) {
            engine.setValue(deckGroup(deck), "volume", amount);
        }
    };
}

function reverse(deck) {
    return function(channel, control, value, status) {
        engine.setValue(
            deckGroup(deck),
            "reverseroll",
            value > 0 ? 1 : 0
        );
    };
}

function beatJump(deck, beats, direction) {
    return function(channel, control, value, status) {
        if (value > 0) {
            const group = deckGroup(deck);
            engine.setValue(
                group,
                "beatjump_" + beats + "_" + direction,
                1
            );
        }
    };
}

Moonlander.init = function(id) {
    onKey(note("Ab", 2), pausePlay(1));
    onKey(note("Db", 3), pausePlay(2));

    onKey(note("F", 2), cue(1));
    onKey(note("E", 3), cue(2));

		onKey(note("G", 1), sync(1));
		onKey(note("Bb", 1), sync(2));

		onKey(note("G", 2), toggleHeadphones(1));
		onKey(note("C", 3), toggleHeadphones(2));

		onKey(note("Gb", 0), volume(1, FILTER.HIGH));
		onKey(note("Ab", 1), volume(1, FILTER.MID));
		onKey(note("Bb", 2), volume(1, FILTER.LOW));

		onKey(note("G", 0), volume(2, FILTER.HIGH));
		onKey(note("A", 1), volume(2, FILTER.MID));
		onKey(note("B", 2), volume(2, FILTER.LOW));

		onKey(note("E", 2), reverse(1));
		onKey(note("F", 3), reverse(2));


		onKey(note("Gb", 1), beatJump(1, 8, FORWARD));
		onKey(note("Eb", 1), beatJump(1, 8, BACKWARD));

		onKey(note("F", 1), beatJump(1, 1, FORWARD));
		onKey(note("E", 1), beatJump(1, 1, BACKWARD));

		onKey(note("B", 1), beatJump(2, 8, FORWARD));
		onKey(note("D", 2), beatJump(2, 8, BACKWARD));

		onKey(note("C", 2), beatJump(2, 1, FORWARD));
		onKey(note("Db", 2), beatJump(2, 1, BACKWARD));
};

Moonlander.shutdown = function() {
};
