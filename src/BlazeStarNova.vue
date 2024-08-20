<template>
  <v-app id="app" :style="cssVars">
    <div id="main-content">
      <WorldWideTelescope :wwt-namespace="wwtNamespace"></WorldWideTelescope>


      <!-- This contains the splash screen content -->
      <splash-screen
        v-model="showSplashScreen"
        @close="closeSplashScreen"
        :css-vars="cssVars"
      />

      <transition name="fade">
        <div class="modal" id="modal-loading" v-show="isLoading">
          <div class="container">
            <div class="spinner"></div>
            <p>Loading …</p>
          </div>
        </div>
      </transition>


      <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->

      <div id="top-content">
        <div id="left-buttons" v-if="!isTourPlaying">
          <icon-button v-model="showTextSheet" fa-icon="book-open" :color="buttonColor"
            :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'" tooltip-location="start">
          </icon-button>
          <!-- <icon-button v-model="showVideoSheet" fa-icon="video" :color="buttonColor" tooltip-text="Watch video"
            tooltip-location="start">
          </icon-button> -->
          
          
          <div id="controls" class="control-icon-wrapper">
          <div id="controls-top-row">
            <font-awesome-icon size="lg" :color="accentColor" :icon="showControls ? `chevron-down` : `gear`"
              @click="showControls = !showControls" @keyup.enter="showControls = !showControls" tabindex="0" />
          </div>
          
          <div v-if="showControls" id="control-checkboxes">
            <v-checkbox :color="accentColor" v-model="showAltAzGrid" @keyup.enter="showAltAzGrid = !showAltAzGrid"
              label="Sky Grid" hide-details />
            <v-checkbox :color="accentColor" v-model="showHorizon" @keyup.enter="showHorizon = !showHorizon"
              label="Horizon" hide-details />
            <v-checkbox :color="accentColor" v-model="showConstellations" @keyup.enter="showConstellations = !showConstellations"
              label="Constellations" hide-details />
            <v-checkbox :color="accentColor" v-model="showBlazeOverlay" @keyup.enter="showBlazeOverlay = !showBlazeOverlay"
              label="Blaze Star Location" hide-details />
            <v-checkbox :color="accentColor" v-model="showAlphaOverlay" @keyup.enter="showAlphaOverlay = !showAlphaOverlay"
              label="Alphecca Location" hide-details />
          </div>
        </div>
          
        </div>
        <div id="center-buttons">
          <icon-button
            v-model="showLocationSelector"
            fa-icon="location-dot"
            :color="buttonColor"
            tooltip-text="Select Location"
            tooltip-location="start"
            ></icon-button>

              <v-dialog
                v-model="showLocationSelector"
                max-width="fit-content"
                transition="slide-y-transition"
                id="eclipse-prediction-sheet"
              >
                <v-card>
                    <font-awesome-icon
                      style="position: absolute; right: 12px; top: 12px; cursor: pointer; padding: 1em; margin: -1em; z-index: 1000;"
                      icon="square-xmark"
                      size="xl"
                      @click="showLocationSelector = false"
                      @keyup.enter="showLocationSelector = false"
                      tabindex="0"
                      color="black"
                    ></font-awesome-icon>
                    <location-selector
                      v-model="selectedLocation"
                      />
                    <geolocation-button
                      :debug="false"
                      size="30px"
                      density="default"
                      elevation="5"
                      color="black"
                      @location="selectedLocation = {longitudeDeg: $event.longitude, latitudeDeg: $event.latitude}"
                    />
                </v-card>
              </v-dialog>
                

              
        </div>
        <div id="right-buttons">
          <v-chip
            v-if="crbBelowHorizon"
          >
            Corona Borealis is Set
          </v-chip>
          <button 
            class="icon-wrapper jl_icon-button jl_debug" 
            @click="() => updateHorizonAndSky()"
            >Update Horizon and Sky</button>
          <button
            class="icon-wrapper jl_icon-button jl_debug"
            @click="() => updateCrbBelowHorizon()"
            >Update CRB Below Horizon</button>
          <button
            class="icon-wrapper jl_icon-button jl_debug"
            @click="() => logWWTState()"
            >Log WWT State</button>
          <button
            class="icon-wrapper jl_icon-button jl_debug"
            @click="() => WWTControl.singleton.renderOneFrame()"
            >Render one frame</button>
        </div>
      </div>

      <!-- Date Picker -->
       <div id="empty-space">
       </div>
       <div id="playback-controls">
            
            <icon-button
            @activate="() => playPauseTour()"
            :fa-icon="isTourPlaying ? 'stop' : 'play'"
            :color="buttonColor"
            :tooltip-text="isTourPlaying ? 'Stop tour' : 'Play tour'"
            tooltip-location="start">
              <template #button>
                <span class="jl_icon_button_text">{{ isTourPlaying ? 'Leave tour and return to main view' : 'Show me how to find the Nova!'}}</span>
              </template>
          </icon-button>
          <!-- icon button to go to TCrB -->
          <icon-button
            v-if="!isTourPlaying"
            @activate="() => goToTCrB()"
            :fa-icon="'star'"
            :color="buttonColor"
            :tooltip-text="'Go to T CrB'"
            tooltip-location="start">
              <template #button>
                <span class="jl_icon_button_text"><v-icon>mdi-flare</v-icon><span> Go to T CrB</span></span>
              </template>
          </icon-button>
          
          <!-- reset time to now button -->
           <button 
            class="icon-wrapper jl_icon-button jl_debug"
            @click="selectedDate = new Date()"
            :style="{color: buttonColor}"
            ><font-awesome-icon icon="clock"/>&nbsp;Set time to Now</button>
            <!-- reset to 9pm button -->
            <button
            class="icon-wrapper jl_icon-button jl_debug"
            @click="selectedDate = todayAt9pm()"
            :style="{color: buttonColor}"
            ><font-awesome-icon icon="clock"/>&nbsp;Set time to 9pm</button>
       </div>
       
       
       
       
      
      <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->
      
      <div id="bottom-content">
        <credit-logos style="margin:1em;" logo-size="25px"/>
        
        <div style="flex-grow:1;"></div>
        
        <icon-button 
          :fa-icon="timePlaying ? 'pause' : 'play'"
          :color="buttonColor" 
          tooltip-text="Let time move forward"
          tooltip-location="start" 
          @activate="()=>{playbackControl.togglePlay()}" 
          style="align-self: center;"
        />
        <div id="date-picker">
            <v-overlay 
            activator="parent"
            location-strategy="connected"
            location="top end"
            origin="bottom end"
            :scrim="false"
            :style="cssVars"
            >
            <template #activator="{props}">
              <!-- any props added are passed directly to v-card -->
              <v-card 
                v-bind="props"
                class="td__card"
                width="fit-content"
                rounded="lg"
                elevation="5"
                >
                <time-display :date="localSelectedDate" ampm show-timezone :timezone="shortTimezone" />
                <v-icon class="td__icon">mdi-cursor-default-click</v-icon>
              </v-card>
            </template>
              <v-card width="fit-content" elevation="5">
                <date-time-picker v-model="localSelectedDate" :editable-time="true">
                  <button class="dtp__button" @click="() => {playbackControl.pause(); set9pm(); goToTCrB()}" name="set-9pm" aria-label="Set time to 9pm">9pm</button>
                  <button class="dtp__button" @click="() => {playbackControl.pause(); setMidnight(); goToTCrB()}" name="set-midnight" aria-label="Set time to Midnight">Midnight</button>
                  <button class="dtp__button" @click="() => {playbackControl.pause(); selectedDate = new Date(); goToTCrB()}" name="set-now" aria-label="Set time to Now">Now</button>
                </date-time-picker>
              </v-card>
            </v-overlay>
        </div>
        
        
      </div>
    

      <!-- This dialog contains the video that is displayed when the video icon is clicked -->

      <v-dialog id="video-container" v-model="showVideoSheet" transition="slide-y-transition" fullscreen>
        <div class="video-wrapper">
          <font-awesome-icon id="video-close-icon" class="close-icon" icon="times" size="lg"
            @click="showVideoSheet = false" @keyup.enter="showVideoSheet = false" tabindex="0"></font-awesome-icon>
          <video controls id="info-video">
            <source src="" type="video/mp4">
          </video>
        </div>
      </v-dialog>




      <!-- This dialog contains the informational content that is displayed when the book icon is clicked -->
      <bottom-sheet
        :cssVars="cssVars"
        v-model="showTextSheet"
        :accent-color="accentColor"
        :touchscreen="touchscreen"
        :show-blaze-overlay="showBlazeOverlay"
        :show-alpha-overlay="showAlphaOverlay"
        @toggle-blaze="() => store.gotoRADecZoom({ raRad: crbPlace.get_RA() * 15 * D2R, decRad: crbPlace.get_dec() * D2R, zoomDeg: 90, instant: false })"
        @toggle-alpha="() => store.gotoRADecZoom({ raRad: 233.6719500 * D2R, decRad: 26.7146850 * D2R, zoomDeg: 90, instant: false })"
       />
     

    </div>
  </v-app>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import { Color, Grids, Place, Settings, WWTControl } from "@wwtelescope/engine";
import { GotoRADecZoomParams, engineStore } from "@wwtelescope/engine-pinia";
import { BackgroundImageset, skyBackgroundImagesets, supportsTouchscreen, blurActiveElement, useWWTKeyboardControls, D2R, LocationDeg } from "@cosmicds/vue-toolkit";
import { useDisplay} from 'vuetify';

import {throttle} from './debounce';

import { createArrow } from "./arrow";
import { equatorialToHorizontal } from "./utils";
import { EquatorialRad, LocationRad } from "./types";
import { resetAltAzGridText, makeAltAzGridText, setupConstellationFigures, renderOneFrame } from "./wwt-hacks";

import { usePlaybackControl } from "./wwt_playback_control";
import { useTimezone } from "./timezones";

type SheetType = "text" | "video";
type CameraParams = Omit<GotoRADecZoomParams, "instant">;
export interface MainComponentProps {
  wwtNamespace?: string;
  initialCameraParams?: CameraParams;
}

const store = engineStore();
const { isTourPlaying } = storeToRefs(store);

useWWTKeyboardControls(store);

const playbackControl = usePlaybackControl(store, true);
// initialize playback. 
playbackControl.setSpeed(1000);
playbackControl.pause();
// destructure playbackControl
const { timePlaying } = playbackControl;

const touchscreen = supportsTouchscreen();
// const { smAndDown } = useDisplay();



const props = withDefaults(defineProps<MainComponentProps>(), {
  wwtNamespace: "MainComponent",
  initialCameraParams: () => {
    return {
      raRad: 4.001238944138198,
      decRad: 0.5307600894728279,
      zoomDeg: 180
    };
  }
});


const { smAndUp } = useDisplay();

const splash = new URLSearchParams(window.location.search).get("splash")?.toLowerCase() !== "false";
const showSplashScreen = ref(splash);
const backgroundImagesets = reactive<BackgroundImageset[]>([]);
const sheet = ref<SheetType | null>(null);
const layersLoaded = ref(false);
const positionSet = ref(false);
const accentColor = ref("#f7bb48");
const buttonColor = ref("#f7bb48");
// const tab = ref(0);
const showHorizon = ref(true);
const showAltAzGrid = ref(true);
const showControls = ref(smAndUp.value);
const showConstellations = ref(true);
const showBlazeOverlay = ref(true);
const showAlphaOverlay = ref(false);
const crbBelowHorizon = ref(true);
const _showDatePicker= ref(false);

const originalFrameRender = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
const boundRenderOneFrame = renderOneFrame.bind(WWTControl.singleton);
const newFrameRender = function() { 
  boundRenderOneFrame(
    showBlazeOverlay.value,
    showAlphaOverlay.value,
    showHorizon.value,
    showHorizon.value
  );
};
let beforeTourTime: Date = new Date();

// For now, we're not allowing a user to change this
const clockRate = 1000;

const crbPlace = new Place();
crbPlace.set_RA(15 + 59 / 60 + 30.1622 / 3600);
crbPlace.set_dec(25 + 55 / 60 + 12.613 / 3600);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const wwtSettings: Settings = Settings.get_active();
function getWWTLocation(): LocationRad {
  return {
    longitudeRad: wwtSettings.get_locationLng() * D2R,
    latitudeRad: wwtSettings.get_locationLat() * D2R,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const blazeStarLocation: EquatorialRad = {
  raRad: (15 + 59 / 60 + 30.1622 / 3600) * 15 * D2R,
  decRad: (25 + 55 / 60 + 12.613 / 3600) * D2R,
};


function goToTCrB(instant=false) {
  store.gotoRADecZoom({
    raRad: blazeStarLocation.raRad,
    decRad: blazeStarLocation.decRad,
    zoomDeg: 180,
    instant: instant,
  });
}
// create selectedDate by default is today at 9pm localtime
function todayAt9pm() {
  // get's today's date and 
  // sets time time to 9pm local time
  const today = new Date();
  today.setHours(21, 0, 0, 0);
  return today;
}

const selectedDate = ref(todayAt9pm());

function updateDate(value: Date) {
  selectedDate.value = value;
}
const throttledUpdateDate = throttle(updateDate, 500);

const showLocationSelector = ref(false);

const selectedLocation = ref<LocationDeg>({
  longitudeDeg: -71.1056,
  latitudeDeg: 42.3581,
});

// useTimezone also provides selectedTimezone and browserTimezone
const { shortTimezone, selectedTimezoneOffset, browserTimezoneOffset} = useTimezone(selectedLocation);


// faking localization because
// <date-time-picker> and <time-display> are not timezone aware
const localSelectedDate = computed({
  // if you console log this date it will still say the local timezone 
  // as determined by the browser Intl.DateTimeFormat().resolvedOptions().timeZone
  // but we have manually offset it so the hours are correct for the selected timezone
  get: () => {
    const time = selectedDate.value.getTime();
    const fakeUTC = time + browserTimezoneOffset;
    return new Date(fakeUTC + selectedTimezoneOffset.value);
  },
  set: (value: Date) => {
    // get local time
    const time = value.getTime();
    // undo fake localization
    const newTime = time - selectedTimezoneOffset.value - browserTimezoneOffset;
    selectedDate.value = new Date(newTime);
  }
});


function setWWTLocation(location: LocationDeg) {
  wwtSettings.set_locationLat(location.latitudeDeg);
  wwtSettings.set_locationLng(location.longitudeDeg);
  console.log("Setting location to", location);
}

onMounted(() => {
  store.waitForReady().then(async () => {
    skyBackgroundImagesets.forEach(iset => backgroundImagesets.push(iset));

    store.setBackgroundImageByName("Tycho (Synthetic, Optical)");

    // If there are layers to set up, do that here!
    layersLoaded.value = true;

    store.setTime(selectedDate.value);
    setWWTLocation(selectedLocation.value);

    store.setClockSync(timePlaying.value);
    store.setClockRate(clockRate);

    store.applySetting(["localHorizonMode", true]);
    store.applySetting(["showAltAzGrid", showAltAzGrid.value]);
    store.applySetting(["showAltAzGridText", showAltAzGrid.value]);
    store.applySetting(["altAzGridColor", Color.fromArgb(180, 133, 201, 254)]);
    store.applySetting(["showConstellationLabels", showConstellations.value]);
    store.applySetting(["showConstellationFigures", showConstellations.value]);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Grids._makeAltAzGridText = makeAltAzGridText;

    // We need to render one frame ahead of time
    // as there's a lot of setup done on the first frame
    // render that we need to use
    WWTControl.singleton.renderOneFrame();

    // as well as our custom text overlays
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    WWTControl.singleton.renderOneFrame = newFrameRender;
    setupConstellationFigures();

    const arrow = createArrow(store, {
      pointsTo: [crbPlace.get_RA() * 15, crbPlace.get_dec()],
      angleDeg: -60,
      halfHeight: 0.02,
      stemFraction: 0.4,
      headWidth: 0.05,
      stemWidth: 0.05,
      color: "#ffffff",
      innerThickness: 0.002,
    });
    arrow.forEach(ann => store.addAnnotation(ann));
    console.log(arrow);

    setInterval(() => {
      if (timePlaying.value) {
        updateCrbBelowHorizon(store.currentTime);
        throttledUpdateDate(new Date(store.currentTime));
      }
    }, 10);

    // We want to make sure that the location change happens AFTER
    // the camera reposition caused by local horizon mode.
    // TODO: What is a better way to do this?
    setTimeout(() => {
      store.gotoRADecZoom({
        ...props.initialCameraParams,
        instant: true
      }).then(() => {
        positionSet.value = true;
      });
    }, 50);
  });
});

const ready = computed(() => layersLoaded.value && positionSet.value);

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

// It doesn't really matter which one we note here
const inNorthernHemisphere = computed(() => selectedLocation.value.latitudeDeg > 0);

function getCrbAlt(when: Date | null = null) {
  const location = getWWTLocation();
  const crbAltAz = equatorialToHorizontal(
    crbPlace.get_RA() * 15 * D2R,
    crbPlace.get_dec() * D2R,
    location.latitudeRad,
    location.longitudeRad,
    when ?? store.currentTime);

  return crbAltAz.altRad;
}

/* Properties related to device/screen characteristics */
// TODO: This seems to be giving the wrong value? Investigate why
// const smallSize = computed(() => smAndDown);

/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  // get the text-bottom-sheet id height and subtract it from 100vh
  return {
    "--accent-color": accentColor.value,
    "--app-content-height": showTextSheet.value ? "66%" : "100%",
  };
});


/**
  Computed flags that control whether the relevant dialogs display.
  The `sheet` data member stores which sheet is open, so these are just
  computed wrappers around modifying/querying that which can be used as
  dialog v-model values
*/
const showTextSheet = computed({
  get() {
    return sheet.value === "text";
  },
  set(_value: boolean) {
    selectSheet("text");
  }
});

const showVideoSheet = computed({
  get() {
    return sheet.value === "video";
  },
  set(value: boolean) {
    selectSheet("video");
    if (!value) {
      const video = document.querySelector("#info-video") as HTMLVideoElement;
      video.pause();
    }
  }
});

/**
  This is convenient if there's any other logic that we want to run
  when the splash screen is closed
*/
function closeSplashScreen() {
  showSplashScreen.value = false;
}

function selectSheet(sheetType: SheetType | null) {
  if (sheet.value === sheetType) {
    sheet.value = null;
    nextTick(() => {
      blurActiveElement();
    });
  } else {
    sheet.value = sheetType;
  }
}

function updateCrbBelowHorizon(when: Date | null = null) {
  const alt = getCrbAlt(when);
  crbBelowHorizon.value = alt <= 0;
}

function clearCurrentTour() {
  // NB: Both of these calls are necessary
  WWTControl.singleton.stopCurrentTour();
  WWTControl.singleton.uiController = null;
}

function playPauseTour() {
  if (!isTourPlaying.value) {
    beforeTourTime = store.currentTime;
    store.loadTour({ url: `${window.location.origin}/FindingCoronaBorealis.WTT`, play: true });
  } else {
    clearCurrentTour();
    store.setBackgroundImageByName("Tycho (Synthetic, Optical)");
  }
}

function onTourPlayingChange(playing: boolean) {
  WWTControl.singleton.renderOneFrame = playing ? originalFrameRender : newFrameRender;
  if (!playing) {
    clearCurrentTour();
    store.applySetting(["localHorizonMode", true]);
    store.gotoRADecZoom({
      raRad: store.raRad,
      decRad: store.decRad,
      zoomDeg: store.zoomDeg,
      rollRad: 0,
      instant: true,
    });
    store.setTime(beforeTourTime);
    store.setBackgroundImageByName("Tycho (Synthetic, Optical)");
    WWTControl.singleton.renderOneFrame();
  }
}


function logWWTState() {
  const loc = getWWTLocation();
  const locDeg = {
    latitudeDeg: loc.latitudeRad * 180 / Math.PI,
    longitudeDeg: loc.longitudeRad * 180 / Math.PI,
  };
  console.log(getWWTLocation());
  console.table({
    time: store.currentTime,
    location: locDeg,
    selectedLocation: selectedLocation.value,
    showHorizon: showHorizon.value,
    showAltAzGrid: showAltAzGrid.value,
    showConstellations: showConstellations.value,
    crbBelowHorizon: crbBelowHorizon.value,
  });
}


function set9pm() {
  const time = new Date(selectedDate.value.getTime());
  time.setHours(21, 0, 0, 0);
  selectedDate.value = time;
}

function setMidnight(){
  const time = new Date(selectedDate.value.getTime());
  time.setHours(23, 59, 0, 0);
  selectedDate.value = time;
}


watch(isTourPlaying, onTourPlayingChange);

watch(showAltAzGrid, (show) => {
  store.applySetting(["showAltAzGrid", show]);
});

watch(showConstellations, (show) => {
  store.applySetting(["showConstellationLabels", show]);
  store.applySetting(["showConstellationFigures", show]);
});


watch(selectedDate, (date) => {
  // if we are playing this already getting updated
  store.setTime(date);
  updateCrbBelowHorizon(date);
  WWTControl.singleton.renderOneFrame();
});

watch(selectedLocation, (location: LocationDeg) => {
  setWWTLocation(location);
  updateCrbBelowHorizon();
  WWTControl.singleton.renderOneFrame();
});

watch(inNorthernHemisphere, (_inNorth: boolean) => resetAltAzGridText());

</script>

<style lang="less">
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("./assets/HighwayGothicNarrow.ttf");
}

:root {
  --default-font-size: clamp(0.9rem, min(2.2vh, 2.2vw), 1.4rem);
  --default-line-height: clamp(1.3rem, min(2.8vh, 2.8vw), 2.1rem);
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  overflow: hidden;


  -ms-overflow-style: none;
  // scrollbar-width: none;
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

  font-family: Verdana, Arial, Helvetica, sans-serif;
}

h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--accent-color);
}

p {
  margin-bottom: 0.5rem;
}

#main-content {
  position: fixed;
  width: 100%;
  height: var(--app-content-height);
  overflow: hidden;

  transition: height 0.1s ease-in-out;
  display: flex;
  flex-direction: column;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  font-size: 11pt;

  .wwtelescope-component {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    border-style: none;
    border-width: 0;
    margin: 0;
    padding: 0;
  }
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal-loading {
  background-color: #000;

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .spinner {
      background-image: url("https://projects.cosmicds.cfa.harvard.edu/cds-website/misc/lunar_loader.gif");
      background-repeat: no-repeat;
      background-size: contain;
      width: 3rem;
      height: 3rem;
    }

    p {
      margin: 0 0 0 1rem;
      padding: 0;
      font-size: 150%;
    }
  }
}

#top-content {
  position: relative;
  flex-grow:0;
  margin: 1rem;
  pointer-events: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  flex-grow: .333;
  gap: 10px;
  align-items: flex-start;
}

#center-buttons {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.map-container {
  width: 60svw;
  width:60vw;
  height: 60svh;
  height: 60vh;
}

#geolocation-wrapper {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 1000;
}

#right-buttons {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 10px;
  align-items: flex-end;
}

#empty-space {
  flex-grow:1;
}

#playback-controls {
  position: relative;
  pointer-events: auto;
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: center;
}

#bottom-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  flex-grow: 0;
  height: fit-content;
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

#logo-credits {
  align-self: flex-end;
}
#date-picker {
  margin: 1rem;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

#controls {
  background: black;
  padding-block: 0.5em;
  padding-right: 0.5em;
  border-radius: 5px;
  border: solid 1px var(--accent-color);
  display: flex;
  flex-direction: column;
  pointer-events: auto;

  .v-label {
    color: var(--accent-color);
    opacity: 1;
    font-size: var(--default-font-size);
  }

  #control-checkboxes {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    // padding-left: calc(0.5 * var(--default-line-height));

    .v-checkbox .v-selection-control {
      font-size: calc(1.1 * var(--default-font-size));
      height: calc(1.2 * var(--default-line-height));
      min-height: calc(1.2 * var(--default-line-height));
    }
    
    .v-selection-control .v-label {
      white-space: nowrap;
    }

    .v-checkbox .v-selection-control__input {
      width: calc(1.2 * var(--default-line-height));
      height: calc(1.2 * var(--default-line-height));
    }

    .v-checkbox .v-selection-control__wrapper {
      width: calc(1.2 * var(--default-line-height));
      height: calc(1.2 * var(--default-line-height));
    }

    .v-btn {
      align-self: center;
      padding-left: 5px;
      padding-right: 5px;
      border: solid 1px #899499;

      &:focus {
        border: 2px solid white;
      }
    }

    .v-btn__content {
      color: black;
      font-weight: 900;
      white-space: break-spaces;
      width: 150px;
    }
  }
  #controls-top-row {
    padding-left: 0.5em;
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
}

.video-wrapper {
  height: 100%;
  background: black;
  text-align: center;
  z-index: 1000;

  #video-close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 15;

    &:hover {
      cursor: pointer;
    }

    &:focus {
      color: white;
      border: 2px solid white;
    }
  }
}

video {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

#info-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 10;
}

#left-buttons, #right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}
.icon-wrapper {
  width: fit-content;
  min-width: 50px;
}

.jl_icon-button {
  border-radius: 20px;
  border:2px solid  var(--accent-color);
  background-color: black;
}

.jl_icon_button_text {
  font-size : 1.15em; 
  padding-inline: 1em; 
  max-width: 20ch; text-align: center;
}

.jl_debug {
  display: none !important;
  outline: 3px solid red !important;
  background-color: teal;
}

.dtp__button {
  background-color: var(--accent-color);
  font-size: 0.85em;
  color: black;
  border-radius: 5px;
  padding: 4px;
  margin: 4px;
  cursor: pointer;
}

.td__card {
  border: 1px solid var(--accent-color);
  text-align: right;
  position: relative;
}

.td__icon {
  position: absolute;
  bottom: 2px;
  right: 2px;
}
</style>
