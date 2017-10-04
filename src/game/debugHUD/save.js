import {map, each, concat} from 'lodash';
import {dbgHUD} from './elements';
import {state} from './state';
import {addSlot, refreshSlots} from './slots';
import {clearContent} from './utils';

export function loadListing() {
    const debug_hud_str = window.localStorage.getItem('debug_hud');
    if (debug_hud_str) {
        const debug_hud = JSON.parse(debug_hud_str);
        state.enabled = debug_hud.enabled;
        state.exprSlots = [];
        state.macroSlots = {};
        each(debug_hud.slots, slot => {
            addSlot(slot);
        });
        dbgHUD.root.style.display = state.enabled ? 'block' : 'none';
        refreshSlots(false);
    }
}

export function saveListing() {
    window.localStorage.setItem('debug_hud', JSON.stringify({
        enabled: state.enabled,
        slots: concat(
            map(state.macroSlots, 'expr'),
            map(state.exprSlots, 'expr')
        )
    }));
}

export function loadProfile() {
    dbgHUD.content.style.display = 'none';
    dbgHUD.popup.style.display = 'block';
    dbgHUD.popup_save.style.display = 'none';
    dbgHUD.popup_input.style.display = 'none';
    const profiles_str = window.localStorage.getItem('debug_hud_profiles');
    if (profiles_str) {
        const profiles = JSON.parse(profiles_str);
        listProfiles(profiles, profile => {
            state.exprSlots = [];
            state.macroSlots = {};
            each(profile, slot => {
                addSlot(slot);
            });
            refreshSlots();
            closePopup();
        });
    }
}

export function saveProfile() {
    dbgHUD.content.style.display = 'none';
    dbgHUD.popup.style.display = 'block';
    dbgHUD.popup_save.style.display = 'inline-block';
    dbgHUD.popup_input.style.display = 'inline-block';
    dbgHUD.popup_input.value = '';
    dbgHUD.popup_save.disabled = true;
    const profiles_str = window.localStorage.getItem('debug_hud_profiles');
    const profiles = profiles_str ? JSON.parse(profiles_str) : {};

    function doSave(name = dbgHUD.popup_input.value) {
        if (name) {
            profiles[name] = concat(
                map(state.macroSlots, 'expr'),
                map(state.exprSlots, 'expr')
            );
            window.localStorage.setItem('debug_hud_profiles', JSON.stringify(profiles));
            closePopup();
        }
    }

    dbgHUD.popup_save.onclick = doSave;

    dbgHUD.popup_input.onkeydown = event => {
        const key = event.code || event.which || event.keyCode;
        if (key === 'Enter' || key === 13) {
            doSave();
        }
        event.stopPropagation();
    };

    dbgHUD.popup_input.onkeyup = event => {
        event.stopPropagation();
    };

    listProfiles(profiles, (profile, name) => {
        doSave(name);
    });
}

export function listProfiles(profiles, onClick) {
    clearContent(dbgHUD.popup_content);
    each(profiles, (profile, name) => {
        const elem = document.createElement('div');
        const button = document.createElement('button');
        const content = document.createElement('span');
        button.innerText = '-';
        content.innerText = ` ${name}`;
        content.style.cursor = 'pointer';
        content.onclick = () => onClick(profile, name);
        elem.appendChild(button);
        elem.appendChild(content);
        dbgHUD.popup_content.appendChild(elem);
    });
}

export function closePopup() {
    dbgHUD.popup.style.display = 'none';
    dbgHUD.content.style.display = 'block';
}