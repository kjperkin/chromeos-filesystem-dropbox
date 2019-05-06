'use strict';

class MountWindow extends BaseWindow {

    constructor() {
        super();
    }

    onLoad() {
        this.initializeSentry();
        this.assignEventHandlers();
        this.showSeasonImage();
    }

    initializeSentry() {
        Raven.config('https://8f30bd158dea44d2ad5dbce094b67274@sentry.io/189250').install();
    }

    showSeasonImage() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const date = today.getDate();
        // Xmas
        if (month === 12 && (1 <= date && date <= 25)) {
            const img = document.createElement('img');
            img.src = 'icons/xmas.png';
            img.classList.add('season');
            const logo = document.querySelector('#logo');
            img.style.top = logo.getBoundingClientRect().top + 'px';
            img.style.left = (logo.getBoundingClientRect().left + 32) + 'px';
            const body = document.querySelector('body');
            body.appendChild(img);
        }
    }

    assignEventHandlers() {
        const btnMount = document.querySelector('#btnMount');
        btnMount.addEventListener('click', e => {
            this.onClickedBtnMount(e);
        });
       // Settings dialog
        const btnSettings = document.querySelector('#btnSettings');
        btnSettings.addEventListener('click', e => {
            this.onClickedBtnSettings(e);
        });
        const openedFilesLimits = [0, 5, 10, 15];
        for (let i = 0; i < openedFilesLimits.length; i++) {
            const limit = document.querySelector('#openedFilesLimit' + openedFilesLimits[i]);
            /*jshint loopfunc: true */
            limit.addEventListener('click', e => {
                this.onChangedOpenedFilesLimit(e);
            });
        }
        document.querySelector('#useWatcherOn').addEventListener('click', () => {
            this.onChangedUseWatcher(true);
        });
        document.querySelector('#useWatcherOff').addEventListener('click', () => {
            this.onChangedUseWatcher(false);
        });
    }

    onClickedBtnMount(evt) {
        const btnMount = document.querySelector('#btnMount');
        evt.preventDefault();
        btnMount.setAttribute('disabled', 'true');
        $.toast({
            text: chrome.i18n.getMessage('mountAttempt'),
            position: 'bottom-right'
        });
        const request = {
            type: 'mount'
        };
        chrome.runtime.sendMessage(request, response => {
            if (response && response.success) {
                $.toast({
                    text: chrome.i18n.getMessage('mountSuccess'),
                    position: 'bottom-right'
                });
                window.setTimeout(() => {
                    window.close();
                }, 2000);
            } else {
                const texts = [chrome.i18n.getMessage('mountFail')];
                if (response && response.error) {
                    texts.push(response.error);
                } else {
                    texts.push('Something wrong.');
                }
                $.toast({
                    text: texts.join(' '),
                    position: 'bottom-right'
                });
                btnMount.removeAttribute('disabled');
            }
        });
    }

    onClickedBtnSettings() {
        chrome.storage.local.get('settings', items => {
            const settings = items.settings || {};
            const openedFilesLimit = settings.openedFilesLimit || '10';
            const useWatcher = settings.useWatcher || false;
            document.querySelector('#openedFilesLimit' + openedFilesLimit).checked = true;
            document.querySelector('#useWatcher' + (useWatcher ? 'On' : 'Off')).checked = true;
            $('#settingsDialog').modal('show');
        });
    }

    onChangedOpenedFilesLimit(evt) {
        chrome.storage.local.get('settings', items => {
            const settings = items.settings || {};
            const selected = evt.target.id;
            const value = selected.substring(16);
            settings.openedFilesLimit = value;
            chrome.storage.local.set({settings: settings}, () => {
                console.log('Saving settings done.');
            });
        });
    }

    onChangedUseWatcher(use) {
        chrome.storage.local.get('settings', items => {
            const settings = items.settings || {};
            settings.useWatcher = use;
            chrome.storage.local.set({settings: settings}, () => {
                console.log('Saving settings done.');
            });
        });
    }

};

window.addEventListener('load', () => {
    new MountWindow().onLoad();
});
