(function () {
    'use strict';

    /* ==========================================================
       STATE
       ========================================================== */

    let state = {
        characters: [],
        roundCount: 1,
        inCombat: false,
        nextId: 1
    };

    let undoStack = [];
    const MAX_UNDO = 50;

    /* ==========================================================
       RP CALCULATION FUNCTIONS  (ported from CharacterInfo.java)
       ========================================================== */

    /**
     * Determine the tier row (1-10) for a given level/CR.
     * Boss/villain creatures add +6 to effective level (one row down).
     * Uses the same modulo-6 loop as the original Java implementation.
     */
    function calculateRow(level, isBoss) {
        let effective = level;
        if (isBoss) effective += 6;

        let row = 1;
        if (effective >= 5) {
            let count = 5;
            while (count <= effective) {
                if ((count + 1) % 6 === 0) row++;
                count++;
            }
        }
        return Math.min(row, 10);
    }

    /** Max RP = row + 1 */
    function getMaxRP(row) {
        return row + 1;
    }

    /** Starting RP at the beginning of combat, by row. */
    function getStartingRP(row) {
        switch (row) {
            case 1:           return 1;
            case 2: case 3:   return 2;
            case 4:           return 3;
            case 5:           return 4;
            case 6:           return 6;
            case 7:           return 7;
            case 8:           return 9;
            case 9:           return 10;
            case 10:          return 11;
            default:          return 0;
        }
    }

    /** RP gained each round. */
    function getRPPerRound(row) {
        switch (row) {
            case 1:  case 2:  return 1;
            case 3:  case 4:  return 2;
            case 5:  case 6:  return 3;
            case 7:  case 8:  return 4;
            case 9:  case 10: return 5;
            default:          return 0;
        }
    }

    /** Bonus RP gained when Adrenaline Rush is used. */
    function getAdrenalineBonus(row) {
        switch (row) {
            case 1:           return 2;
            case 2: case 3:   return 3;
            case 4: case 5:   return 4;
            case 6: case 7:   return 5;
            case 8: case 9:   return 6;
            case 10:          return 7;
            default:          return 0;
        }
    }

    /** Build a fresh character object from input parameters. */
    function createCharacter(name, level, isBoss) {
        var row = calculateRow(level, isBoss);
        return {
            id: state.nextId++,
            name: name,
            level: level,
            isBoss: isBoss,
            row: row,
            currentRP: getStartingRP(row),
            maxRP: getMaxRP(row),
            rpPerRound: getRPPerRound(row),
            adrenalineBonus: getAdrenalineBonus(row),
            adrenalineUsesRemaining: isBoss ? 2 : 1,
            isRattled: false
        };
    }

    /* ==========================================================
       STATE MANAGEMENT
       ========================================================== */

    function pushUndo() {
        undoStack.push(JSON.parse(JSON.stringify(state)));
        if (undoStack.length > MAX_UNDO) undoStack.shift();
    }

    function undo() {
        if (undoStack.length === 0) return;
        state = undoStack.pop();
        render();
        save();
    }

    function findChar(id) {
        return state.characters.find(function (c) { return c.id === id; });
    }

    /* ==========================================================
       ACTIONS
       ========================================================== */

    function spendRP(id) {
        var ch = findChar(id);
        if (!ch || ch.currentRP <= 0) return;
        pushUndo();
        ch.currentRP--;
        render();
        save();
    }

    function gainRP(id) {
        var ch = findChar(id);
        if (!ch) return;
        pushUndo();
        ch.currentRP++;
        render();
        save();
    }

    function useAdrenalineRush(id) {
        var ch = findChar(id);
        if (!ch || ch.adrenalineUsesRemaining <= 0) return;
        pushUndo();
        ch.adrenalineUsesRemaining--;
        ch.currentRP += ch.adrenalineBonus;
        // Adrenaline Rush can exceed max; excess is lost at start of next round.
        render();
        save();
    }

    function toggleRattled(id) {
        var ch = findChar(id);
        if (!ch) return;
        pushUndo();
        ch.isRattled = !ch.isRattled;
        render();
        save();
    }

    function removeCharacterInCombat(id) {
        if (!confirm('Remove this character from combat?')) return;
        pushUndo();
        state.characters = state.characters.filter(function (c) { return c.id !== id; });
        render();
        save();
    }

    function newRound() {
        pushUndo();
        state.roundCount++;
        for (var i = 0; i < state.characters.length; i++) {
            var ch = state.characters[i];
            // Cap at max first (lose adrenaline excess from previous round)
            if (ch.currentRP > ch.maxRP) {
                ch.currentRP = ch.maxRP;
            }
            // Rattled creatures do NOT regain RP
            if (!ch.isRattled) {
                ch.currentRP += ch.rpPerRound;
                if (ch.currentRP > ch.maxRP) {
                    ch.currentRP = ch.maxRP;
                }
            }
        }
        render();
        save();
    }

    function addCharacterAction(name, level, isBoss) {
        if (state.inCombat) pushUndo();
        var ch = createCharacter(name.trim(), level, isBoss);
        state.characters.push(ch);
        render();
        save();
    }

    function removeFromQueue(id) {
        state.characters = state.characters.filter(function (c) { return c.id !== id; });
        render();
    }

    function startCombat() {
        if (state.characters.length === 0) return;
        state.inCombat = true;
        state.roundCount = 1;
        undoStack = [];
        render();
        save();
    }

    function endCombat() {
        if (!confirm('End the current combat? All tracking data will be cleared.')) return;
        state.inCombat = false;
        state.characters = [];
        state.roundCount = 1;
        undoStack = [];
        localStorage.removeItem('rpt-session');
        render();
    }

    /* ==========================================================
       PERSISTENCE  (localStorage)
       ========================================================== */

    function save() {
        localStorage.setItem('rpt-session', JSON.stringify({
            state: state,
            undoStack: undoStack
        }));
    }

    /** Returns true if a saved session was restored. */
    function load() {
        var raw = localStorage.getItem('rpt-session');
        if (!raw) return false;
        try {
            var data = JSON.parse(raw);
            state = data.state;
            undoStack = data.undoStack || [];
            return true;
        } catch (e) {
            localStorage.removeItem('rpt-session');
            return false;
        }
    }

    function saveParty(name) {
        if (!name || state.characters.length === 0) return;
        var parties = JSON.parse(localStorage.getItem('rpt-parties') || '{}');
        parties[name] = state.characters.map(function (c) {
            return { name: c.name, level: c.level, isBoss: c.isBoss };
        });
        localStorage.setItem('rpt-parties', JSON.stringify(parties));
    }

    function loadParty(name) {
        var parties = JSON.parse(localStorage.getItem('rpt-parties') || '{}');
        if (!parties[name]) return;
        state.characters = [];
        for (var i = 0; i < parties[name].length; i++) {
            var p = parties[name][i];
            state.characters.push(createCharacter(p.name, p.level, p.isBoss));
        }
        render();
    }

    function deleteParty(name) {
        if (!name) return;
        if (!confirm('Delete saved party "' + name + '"?')) return;
        var parties = JSON.parse(localStorage.getItem('rpt-parties') || '{}');
        delete parties[name];
        localStorage.setItem('rpt-parties', JSON.stringify(parties));
        renderPartyDropdown();
    }

    function getSavedPartyNames() {
        return Object.keys(JSON.parse(localStorage.getItem('rpt-parties') || '{}'));
    }

    /* ==========================================================
       RENDERING
       ========================================================== */

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /** Format a level value for display (hide decimal if integer). */
    function fmtLevel(level) {
        return level % 1 === 0 ? String(Math.round(level)) : String(level);
    }

    function render() {
        var setupEl = document.getElementById('setup-screen');
        var trackerEl = document.getElementById('tracker-screen');

        if (state.inCombat) {
            setupEl.style.display = 'none';
            trackerEl.style.display = 'block';
            renderTracker();
        } else {
            setupEl.style.display = 'block';
            trackerEl.style.display = 'none';
            renderSetup();
        }
    }

    /* ---------- Setup screen ---------- */

    function renderSetup() {
        var queue = document.getElementById('character-queue');
        var html = '';

        for (var i = 0; i < state.characters.length; i++) {
            var ch = state.characters[i];
            html +=
                '<div class="queue-item">' +
                    '<div class="queue-item-info">' +
                        '<strong>' + escapeHtml(ch.name) + '</strong>' +
                        '<span class="queue-item-level">Lvl ' + fmtLevel(ch.level) + '</span>' +
                        (ch.isBoss ? ' <span class="badge badge-boss">Boss</span>' : '') +
                    '</div>' +
                    '<button class="btn-remove" data-id="' + ch.id + '" title="Remove">&#10005;</button>' +
                '</div>';
        }

        queue.innerHTML = html;

        document.getElementById('start-combat-btn').disabled = state.characters.length === 0;
        renderPartyDropdown();
    }

    function renderPartyDropdown() {
        var select = document.getElementById('load-party-select');
        var names = getSavedPartyNames();
        var html = '<option value="">— Load Saved Party —</option>';
        for (var i = 0; i < names.length; i++) {
            html += '<option value="' + escapeHtml(names[i]) + '">' + escapeHtml(names[i]) + '</option>';
        }
        select.innerHTML = html;
    }

    /* ---------- Tracker screen ---------- */

    function renderTracker() {
        document.getElementById('round-counter').textContent = state.roundCount;
        document.getElementById('undo-btn').disabled = undoStack.length === 0;

        var container = document.getElementById('character-cards');
        var html = '';

        for (var i = 0; i < state.characters.length; i++) {
            var ch = state.characters[i];
            var rattledClass = ch.isRattled ? ' rattled' : '';
            var emptyClass = ch.currentRP <= 0 ? ' empty' : '';

            html +=
                '<div class="character-card' + rattledClass + '">' +
                    '<div class="card-header">' +
                        '<div class="card-header-left">' +
                            '<span class="card-name">' + escapeHtml(ch.name) + '</span>' +
                            '<span class="card-level">Lvl ' + fmtLevel(ch.level) + '</span>' +
                            (ch.isBoss ? '<span class="badge badge-boss">Boss</span>' : '') +
                            (ch.isRattled ? '<span class="badge badge-rattled">Rattled</span>' : '') +
                        '</div>' +
                        '<button class="card-remove" data-action="remove" data-id="' + ch.id + '" title="Remove">&#10005;</button>' +
                    '</div>' +
                    '<div class="card-body">' +
                        '<div class="rp-display">' +
                            '<span class="rp-current' + emptyClass + '">' + ch.currentRP + '</span>' +
                            '<span class="rp-separator">/</span>' +
                            '<span class="rp-max">' + ch.maxRP + '</span>' +
                            '<span class="rp-label">RP</span>' +
                        '</div>' +
                        '<div class="card-controls">' +
                            '<button class="btn btn-spend" data-action="spend" data-id="' + ch.id + '"' +
                                (ch.currentRP <= 0 ? ' disabled' : '') + '>&minus;1</button>' +
                            '<button class="btn btn-gain" data-action="gain" data-id="' + ch.id + '">+1</button>' +
                            '<button class="btn btn-rush" data-action="rush" data-id="' + ch.id + '"' +
                                (ch.adrenalineUsesRemaining <= 0 ? ' disabled' : '') +
                                '>Rush (' + ch.adrenalineUsesRemaining + ')</button>' +
                            '<button class="btn btn-rattled' + (ch.isRattled ? ' active' : '') +
                                '" data-action="rattled" data-id="' + ch.id + '">' +
                                (ch.isRattled ? '\u2605 Rattled' : 'Rattled') + '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="card-stats">' +
                        '<span>RP/Round: ' + ch.rpPerRound + '</span>' +
                        '<span>Rush Bonus: +' + ch.adrenalineBonus + '</span>' +
                        '<span>Row: ' + ch.row + '</span>' +
                    '</div>' +
                '</div>';
        }

        container.innerHTML = html;
    }

    /* ==========================================================
       EVENT BINDING
       ========================================================== */

    function bindEvents() {
        /* ---- Setup: add character form ---- */
        document.getElementById('add-character-form').addEventListener('submit', function (e) {
            e.preventDefault();
            var nameEl = document.getElementById('char-name');
            var levelEl = document.getElementById('char-level');
            var bossEl = document.getElementById('char-boss');

            var name = nameEl.value.trim();
            var level = parseFloat(levelEl.value);
            if (!name || isNaN(level) || level < 0) return;

            addCharacterAction(name, level, bossEl.checked);

            nameEl.value = '';
            levelEl.value = '';
            bossEl.checked = false;
            nameEl.focus();
        });

        /* ---- Setup: queue remove (event delegation) ---- */
        document.getElementById('character-queue').addEventListener('click', function (e) {
            var btn = e.target.closest('.btn-remove');
            if (!btn) return;
            removeFromQueue(parseInt(btn.dataset.id, 10));
        });

        /* ---- Setup: start combat ---- */
        document.getElementById('start-combat-btn').addEventListener('click', startCombat);

        /* ---- Setup: party presets ---- */
        document.getElementById('save-party-btn').addEventListener('click', function () {
            var nameEl = document.getElementById('party-name');
            var name = nameEl.value.trim();
            if (!name) { alert('Enter a party name first.'); return; }
            if (state.characters.length === 0) { alert('Add characters before saving.'); return; }
            saveParty(name);
            nameEl.value = '';
            renderPartyDropdown();
        });

        document.getElementById('load-party-btn').addEventListener('click', function () {
            var name = document.getElementById('load-party-select').value;
            if (!name) return;
            loadParty(name);
        });

        document.getElementById('delete-party-btn').addEventListener('click', function () {
            var name = document.getElementById('load-party-select').value;
            deleteParty(name);
        });

        /* ---- Tracker: global controls ---- */
        document.getElementById('new-round-btn').addEventListener('click', newRound);
        document.getElementById('undo-btn').addEventListener('click', undo);
        document.getElementById('end-combat-btn').addEventListener('click', endCombat);

        /* ---- Tracker: mid-combat add character ---- */
        document.getElementById('add-mid-combat-btn').addEventListener('click', function () {
            var form = document.getElementById('mid-combat-form');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('mid-combat-form').addEventListener('submit', function (e) {
            e.preventDefault();
            var nameEl = document.getElementById('mid-char-name');
            var levelEl = document.getElementById('mid-char-level');
            var bossEl = document.getElementById('mid-char-boss');

            var name = nameEl.value.trim();
            var level = parseFloat(levelEl.value);
            if (!name || isNaN(level) || level < 0) return;

            addCharacterAction(name, level, bossEl.checked);

            nameEl.value = '';
            levelEl.value = '';
            bossEl.checked = false;
            document.getElementById('mid-combat-form').style.display = 'none';
        });

        document.getElementById('mid-cancel-btn').addEventListener('click', function () {
            document.getElementById('mid-combat-form').style.display = 'none';
        });

        /* ---- Tracker: character card actions (event delegation) ---- */
        document.getElementById('character-cards').addEventListener('click', function (e) {
            var btn = e.target.closest('[data-action]');
            if (!btn) return;
            var id = parseInt(btn.dataset.id, 10);
            switch (btn.dataset.action) {
                case 'spend':   spendRP(id);              break;
                case 'gain':    gainRP(id);               break;
                case 'rush':    useAdrenalineRush(id);    break;
                case 'rattled': toggleRattled(id);        break;
                case 'remove':  removeCharacterInCombat(id); break;
            }
        });
    }

    /* ==========================================================
       INITIALISATION
       ========================================================== */

    function init() {
        bindEvents();
        load();   // restore from localStorage if available
        render();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
