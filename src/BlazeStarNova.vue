<template>
  <v-app id="app" :style="cssVars">
    <div id="main-content">
      <WorldWideTelescope :wwt-namespace="wwtNamespace"></WorldWideTelescope>


      <!-- This contains the splash screen content -->

      <v-overlay :model-value="showSplashScreen" absolute opacity="0.6" :style="cssVars" id="splash-overlay">
        <div id="splash-screen" v-click-outside="closeSplashScreen" :style="cssVars">
          <div id="close-splash-button" @click="closeSplashScreen">&times;
          </div>
          <div id="splash-screen-text">
            <p>Splash Screen Content</p>
          </div>
          <div id="splash-screen-acknowledgements" class="small">
            This Data Story is brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank"
              rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/"
              target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.

            <div id="splash-screen-logos">
              <credit-logos logo-size="5vmin" />
            </div>
          </div>
        </div>
      </v-overlay>

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
        <div id="left-buttons">
          <icon-button v-model="showTextSheet" fa-icon="book-open" :color="buttonColor"
            :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'" tooltip-location="start">
          </icon-button>
          <icon-button v-model="showVideoSheet" fa-icon="video" :color="buttonColor" tooltip-text="Watch video"
            tooltip-location="start">
          </icon-button>
          <icon-button
            @activate="() => playPauseTour()"
            :fa-icon="isTourPlaying ? 'pause' : 'play'"
            :color="buttonColor"
            :tooltip-text="isTourPlaying ? 'Stop playing tour' : 'Play tour'"
            tooltip-location="start">
          </icon-button>
        </div>
        <div id="center-buttons">
        </div>
        <div id="right-buttons">
          <v-chip
            v-if="crbBelowHorizon"
          >
            Corona Borealis is Set
          </v-chip>
        </div>
      </div>


      <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

      <div id="bottom-content">
        <credit-logos logo-size="3vmin"/>
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
          </div>
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

      <v-dialog :style="cssVars" class="bottom-sheet" id="text-bottom-sheet" hide-overlay persistent no-click-animation
        absolute width="100%" :scrim="false" location="bottom" v-model="showTextSheet"
        transition="dialog-bottom-transition">
        <v-card height="100%">
          <v-tabs v-model="tab" height="32px" :color="accentColor" :slider-color="accentColor" id="tabs" dense>
            <v-tab class="info-tabs" tabindex="0">
              <h3>Information</h3>
            </v-tab>
            <v-tab class="info-tabs" tabindex="0">
              <h3>Using WWT</h3>
            </v-tab>
          </v-tabs>
          <font-awesome-icon id="close-text-icon" class="control-icon" icon="times" size="lg"
            @click="showTextSheet = false" @keyup.enter="showTextSheet = false" tabindex="0"></font-awesome-icon>
          <v-window v-model="tab" id="tab-items" class="pb-2 no-bottom-border-radius">
            <v-window-item>
              <v-card class="no-bottom-border-radius scrollable">
                <v-card-text class="info-text no-bottom-border-radius">
                  Information goes here
                </v-card-text>
              </v-card>
            </v-window-item>
            <v-window-item>
              <v-card class="no-bottom-border-radius scrollable">
                <v-card-text class="info-text no-bottom-border-radius">
                  <v-container>
                    <v-row align="center">
                      <v-col cols="4">
                        <v-chip label outlined>
                          Pan
                        </v-chip>
                      </v-col>
                      <v-col cols="8" class="pt-1">
                        <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong> {{ touchscreen ? ":" : "or"
                        }} <strong>{{ touchscreen ? ":" : "W-A-S-D" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                      </v-col>
                    </v-row>
                    <v-row align="center">
                      <v-col cols="4">
                        <v-chip label outlined>
                          Zoom
                        </v-chip>
                      </v-col>
                      <v-col cols="8" class="pt-1">
                        <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? ":"
                          : "or" }} <strong>{{ touchscreen ? ":" : "I-O" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <div class="credits">
                          <h3>Credits:</h3>
                          <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank"
                              rel="noopener noreferrer">CosmicDS</a> Vue Data Stories Team:</h4>
                          John Lewis<br>
                          Jon Carifio<br>
                          Pat Udomprasert<br>
                          Alyssa Goodman<br>
                          Mary Dussault<br>
                          Harry Houghton<br>
                          Anna Nolin<br>
                          Evaluator: Sue Sunbury<br>
                          <br>
                          <h4>WorldWide Telescope Team:</h4>
                          Peter Williams<br>
                          A. David Weigel<br>
                          Jon Carifio<br>
                        </div>
                        <v-spacer class="end-spacer"></v-spacer>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <funding-acknowledgement />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-window-item>
          </v-window>
        </v-card>
      </v-dialog>

    </div>
  </v-app>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import { Color, Grids, Place, Settings, WWTControl } from "@wwtelescope/engine";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";
import { GotoRADecZoomParams, engineStore } from "@wwtelescope/engine-pinia";
import { BackgroundImageset, skyBackgroundImagesets, supportsTouchscreen, blurActiveElement, useWWTKeyboardControls, D2R } from "@cosmicds/vue-toolkit";
// import { useDisplay } from "vuetify";

import { createHorizon, createSky, removeHorizon, equatorialToHorizontal } from "./annotations";
import { EquatorialRad, HorizontalRad, LocationRad } from "./types";
import { Annotation2 } from "./Annotation2";
import { initializeConstellationNames, makeAltAzGridText, setupConstellationFigures } from "./wwt-hacks";


type SheetType = "text" | "video";
type CameraParams = Omit<GotoRADecZoomParams, "instant">;
export interface MainComponentProps {
  wwtNamespace?: string;
  initialCameraParams?: CameraParams;
}

const store = engineStore();
const { isTourPlaying } = storeToRefs(store);
console.log(isTourPlaying);

useWWTKeyboardControls(store);

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

const splash = new URLSearchParams(window.location.search).get("splash")?.toLowerCase() !== "false";
const showSplashScreen = ref(splash);
const backgroundImagesets = reactive<BackgroundImageset[]>([]);
const sheet = ref<SheetType | null>(null);
const layersLoaded = ref(false);
const positionSet = ref(false);
const accentColor = ref("#ffffff");
const buttonColor = ref("#ffffff");
const tab = ref(0);
const timePlaying = ref(false);
const tourLoaded = ref(false);
const showHorizon = ref(true);
const showAltAzGrid = ref(true);
const showControls = ref(false);
const showConstellations = ref(true);
const crbBelowHorizon = ref(true);

// For now, we're not allowing a user to change this
const clockRate = 1000;

const sunPlace = new Place();
sunPlace.set_names(["Sun"]);
sunPlace.set_classification(Classification.solarSystem);
sunPlace.set_target(SolarSystemObjects.sun);
sunPlace.set_zoomLevel(20);

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

onMounted(() => {
  store.waitForReady().then(async () => {
    skyBackgroundImagesets.forEach(iset => backgroundImagesets.push(iset));

    store.setBackgroundImageByName("USNOB: US Naval Observatory B 1.0 (Synthetic, Optical)");

    // If there are layers to set up, do that here!
    layersLoaded.value = true;

    initializeConstellationNames();

    store.setClockSync(timePlaying.value);
    store.setClockRate(clockRate);

    store.applySetting(["localHorizonMode", true]);
    store.applySetting(["showAltAzGrid", showAltAzGrid.value]);
    store.applySetting(["showAltAzGridText", showAltAzGrid.value]);
    store.applySetting(["altAzGridColor", Color.fromArgb(180, 133, 201, 254)]);
    store.applySetting(["showConstellationLabels", showConstellations.value]);
    store.applySetting(["showConstellationFigures", showConstellations.value]);
    updateHorizonAndSky();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Grids._makeAltAzGridText = makeAltAzGridText;

    // Hack the engine to display our Annotation2 annotations
    // which go in front of the planet layer
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const originalFrameRenderer = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
    function renderOneFrame() {
      originalFrameRenderer();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Annotation2.prepBatch(this.renderContext);
      for (const item of Annotation2.annotations) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        item.draw(this.renderContext);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Annotation2.drawBatch(this.renderContext);
    }
    WWTControl.singleton.renderOneFrame = renderOneFrame.bind(WWTControl.singleton);
    WWTControl.singleton.renderOneFrame();
    setupConstellationFigures();

    console.log(`${window.location.origin}/FindingCoronaBorealis.wtt`);


    setInterval(() => {
      if (timePlaying.value) {
        updateHorizonAndSky(store.currentTime); 
        updateCrbBelowHorizon(store.currentTime);
      }
    }, 100);

    // We want to make sure that the location change happens AFTER
    // the camera reposition caused by local horizon mode.
    // TODO: What is a better way to do this?
    setTimeout(() => {
      store.gotoRADecZoom({
        ...props.initialCameraParams,
        instant: true
      }).then(() => positionSet.value = true);
    }, 500);
  });
});

const ready = computed(() => layersLoaded.value && positionSet.value);

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

function getSunPosition(when: Date | null): EquatorialRad & HorizontalRad {
  const location = getWWTLocation();
  const sunAltAz = equatorialToHorizontal(sunPlace.get_RA() * 15 * D2R,
    sunPlace.get_dec() * D2R,
    location.latitudeRad,
    location.longitudeRad,
    when ?? store.currentTime);

  return {
    raRad: sunPlace.get_RA() * 15 * D2R,
    decRad: sunPlace.get_dec() * D2R,
    ...sunAltAz
  };
}

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

function removeSky() {
  store.clearAnnotations();
}


function updateHorizonAndSky(when: Date | null = null) {
  try {
    removeHorizon();
    removeSky();
  } finally {
    const location = getWWTLocation();
    if (showHorizon.value) {
      const time = when ?? store.currentTime;
      createHorizon({ location, when: time });
      const sunPosition = getSunPosition(time);
      const opacity = skyOpacityForSunAlt(sunPosition.altRad);
      store.setForegroundOpacity((1 - opacity) * 100);
      createSky({ location, when: time, opacity });
    }
  }
}

function updateCrbBelowHorizon(when: Date | null = null) {
  const alt = getCrbAlt(when);
  crbBelowHorizon.value = alt <= 0;
}

function skyOpacityForSunAlt(sunAltRad: number) {
  const civilTwilight = -6 * D2R;
  const astronomicalTwilight = 3 * civilTwilight;
  
  return (1 + Math.atan(Math.PI * sunAltRad / (-astronomicalTwilight))) / 2;
}

function playPauseTour() {
  console.log("playPauseTour");
  if (!isTourPlaying.value) {
    store.loadTour({ url: `${window.location.origin}/FindingCoronaBorealis.WTT`, play: true })
      .then(() => tourLoaded.value = true);
    showHorizon.value = false;
  } else {
    store.toggleTourPlayPauseState();
  }
}

watch(showHorizon, (_show) => updateHorizonAndSky());

watch(showAltAzGrid, (show) => {
  store.applySetting(["showAltAzGrid", show]);
});

watch(showConstellations, (show) => {
  store.applySetting(["showConstellationLabels", show]);
  store.applySetting(["showConstellationFigures", show]);
});

watch(timePlaying, (play) => store.setClockSync(play));

</script>

<style lang="less">
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("./assets/HighwayGothicNarrow.ttf");
}

:root {
  --default-font-size: clamp(0.7rem, min(1.7vh, 1.7vw), 1.1rem);
  --default-line-height: clamp(1rem, min(2.2vh, 2.2vw), 1.6rem);
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

#main-content {
  position: fixed;
  width: 100%;
  height: var(--app-content-height);
  overflow: hidden;

  transition: height 0.1s ease-in-out;
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
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#bottom-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: calc(100% - 2rem);
  height: fit-content;
  pointer-events: none;
  align-items: center;
  gap: 5px;
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
    padding-left: calc(0.5 * var(--default-line-height));

    .v-checkbox .v-selection-control {
      font-size: calc(1.1 * var(--default-font-size));
      height: calc(1.2 * var(--default-line-height));
      min-height: calc(1.2 * var(--default-line-height));
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

#splash-overlay {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#splash-screen {
  color: #FFFFFF;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: space-around;

  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
  font-size: min(8vw, 7vh);

  border-radius: 10%;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  padding-top: 4rem;
  padding-bottom: 1rem;

  @media (max-width: 699px) {
    max-height: 80vh;
    max-width: 90vw;
  }

  @media (min-width: 700px) {
    max-height: 85vh;
    max-width: min(70vw, 800px);
  }

  div {
    margin-inline: auto;
    text-align: center;
  }

  .small {
    font-size: var(--default-font-size);
    font-weight: bold;
  }

  #close-splash-button {
    position: absolute;
    top: 0.5rem;
    right: 1.75rem;
    text-align: end;
    color: var(--accent-color);
    font-size: min(8vw, 5vh);

    &:hover {
      cursor: pointer;
    }
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

.bottom-sheet {
  .v-overlay__content {
    align-self: flex-end;
    padding: 0;
    margin: 0;
    max-width: 100%;
    height: 34%;
  }

  #tabs {
    width: calc(100% - 3em);
    align-self: left;
  }

  .info-text {
    height: 33vh;
    padding-bottom: 25px;

    & a {
      text-decoration: none;
    }
  }

  .close-icon {
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

  .scrollable {
    overflow-y: auto;
  }

  #tab-items {
    // padding-bottom: 2px !important;

    .v-card-text {
      font-size: ~"max(14px, calc(0.7em + 0.3vw))";
      padding-top: ~"max(2vw, 16px)";
      padding-left: ~"max(4vw, 16px)";
      padding-right: ~"max(4vw, 16px)";

      .end-spacer {
        height: 25px;
      }
    }

  }

  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: white;
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next,
  .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }
}
</style>
