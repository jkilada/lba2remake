// @flow
import THREE from 'three';
import async from 'async';

import {createState} from './state';
import {createAudioManager} from '../audio'
import {loadHqrAsync} from '../hqr';
import {loadTexts} from '../scene';

export function createGame(params: Object, clock: Object, setUiState: Function, getUiState: Function) {
    let _isPaused = false;
    let _isLoading = false;

    const _state = createState();
    const _audio = createAudioManager(_state);

    return {
        setUiState,
        getUiState,
        controlsState: {
            heroSpeed: 0,
            heroRotationSpeed: 0,
            cameraSpeed: new THREE.Vector3(),
            cameraLerp: new THREE.Vector3(),
            cameraLookAtLerp: new THREE.Vector3(),
            cameraOrientation: new THREE.Quaternion(),
            cameraHeadOrientation: new THREE.Quaternion(),
            freeCamera: false,
            action: 0,
            jump: 0
        },
        loading: function(index: number) {
            _isPaused = true;
            _isLoading = true;
            this.setUiState({loading: true});
            console.log(`Loading scene #${index}`);
        },
        loaded: function() {
            _isPaused = params.pauseOnLoad;
            _isLoading = false;
            this.setUiState({loading: false});
            console.log("Loaded!");
        },

        isPaused: () => _isPaused,
        isLoading: () => _isLoading,

        getState: () => _state,
        getAudioManager: () => _audio,

        pause: () => {
            _isPaused = !_isPaused;
            if(_isPaused) {
                clock.stop();
                console.log("Pause");
            } else {
                clock.start();
            }
        },
        preload: function() {
            const that = this;
            async.auto({
                ress: preloadFileAsync('data/RESS.HQR'),
                text: loadHqrAsync('TEXT.HQR'),
                voxgame: preloadFileAsync(`data/VOX/${_state.config.languageCode}_GAM_AAC.VOX`),
                vox000: preloadFileAsync(`data/VOX/${_state.config.languageCode}_000_AAC.VOX`),
                muslogo: preloadFileAsync('data/MUSIC/LOGADPCM.mp4'),
                mus15: preloadFileAsync('data/MUSIC/JADPCM15.mp4'),
                mus16: preloadFileAsync('data/MUSIC/JADPCM16.mp4')
            }, (error, files) => {
                const gameTexts = {textIndex: 4, texts: null};
                loadTexts(gameTexts, files.text);
                that.texts = gameTexts.texts;
            });
        }
    };
}

function preloadFileAsync(url) {
    return (callback: Function) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            callback();
        };
        request.send();
    }
}
