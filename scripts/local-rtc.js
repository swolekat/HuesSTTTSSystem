import {initRTC} from "./helpers/rtc-helpers.js";
import {toggleVoiceRecognition} from './voice-recognition.js';
import {voiceOptionsDropdown_onChange} from './state/selected-voice.js';
import {connectAws} from "./aws.js";
import {audioOutputDeviceDropdown_onChange} from './state/selected-audio-device.js';
import {getCookie, writeCookies} from "./helpers/cookies.js";

let rtcOn = true;

const rtcToggleButton = document.getElementById('rtc-toggle-button');
const rtcCaption = document.getElementById('rtc-caption');

const updateButtonUIAndCookies = () => {
    writeCookies('rtcOn', rtcOn);
    if(rtcOn){
        rtcToggleButton.className = 'ui button negative';
        rtcToggleButton.innerText = 'Turn RTC OFF';
        rtcCaption.innerText = 'RTC is currently ON';
        return;
    }
    rtcToggleButton.className = 'ui button POSITIVE';
    rtcToggleButton.innerText = 'Turn RTC ON';
    rtcCaption.innerText = 'RTC is currently OFF';
};

rtcToggleButton.onclick = () => {
    rtcOn = !rtcOn;
    updateButtonUIAndCookies();
};

export const initLocalRTC = () => {
    if(getCookie('rtcOn') === 'false'){
        rtcOn = false;
        updateButtonUIAndCookies();
    }
    initRTC((event) => {
        if(!rtcOn){
            return;
        }
        const {type} = event;
        if(type === 'start'){
            toggleVoiceRecognition(true, true);
            return;
        }
        if(type === 'stop'){
            toggleVoiceRecognition(true, false);
            return;
        }
        if(type === 'randomVoice'){
            const voiceDropdown = document.getElementById("voice-options-dropdown");
            const options = voiceDropdown.options;
            const randomOption = options[Math.floor(Math.random() * options.length)].value;
            voiceDropdown.value = randomOption;
            voiceOptionsDropdown_onChange();
            return;
        }
        if(type === 'setup') {
            const {region, identity, audioDevice} = event;
            document.getElementById('awsRegionTextBox').value = region;
            document.getElementById('awsIdentityPoolTextBox').value = identity;
            connectAws();

            const options = document.getElementById('audio-devices-dropdown').options;
            let value = '';
            for(let x = 0; x < options.length; x+=1) {
                if(options[x].innerHtml === audioDevice){
                    value = options[x].value;
                }
            }
            document.getElementById('audio-devices-dropdown').value = value;
            audioOutputDeviceDropdown_onChange();
        }
        console.log(`Unrecognized message ${JSON.stringify(type)}`);
    });
};