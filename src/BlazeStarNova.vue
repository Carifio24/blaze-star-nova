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
          <icon-button v-model="showNovaSheet" fa-icon="book-open" :color="buttonColor"
            :tooltip-text="showNovaSheet ? 'Hide Info' : 'Learn About Novas'" tooltip-location="start">
          </icon-button>
          <icon-button v-model="showUseSheet" fa-icon="info" :color="buttonColor"
            :tooltip-text="showUseSheet ? 'Hide Info' : 'How to Navigate'" tooltip-location="start">
          </icon-button>
          <!-- <icon-button v-model="showVideoSheet" fa-icon="video" :color="buttonColor" tooltip-text="Watch video"
            tooltip-location="start">
          </icon-button> -->
          
          
        </div>

        <div id="center-buttons">
          <icon-button
            v-if="!isTourPlaying"
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
                  icon="xmark"
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
        <div id="right-buttons" v-if="!isTourPlaying">
          <div id="controls" class="control-icon-wrapper">
            <div id="controls-top-row">
              <font-awesome-icon
                size="lg"
                class="tab-focusable"
                :icon="showControls ? `chevron-down` : `gear`"
                @click="showControls = !showControls" 
                @keyup.enter="showControls = !showControls"
                tabindex="0" />
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
          <v-chip
            v-if="crbBelowHorizon"
            class="chip-text"
          >
            Corona Borealis is Set
          </v-chip>
        </div>
      </div>

      <!-- Date Picker -->
      <div id="empty-space">
      </div>
      <div id="playback-controls" :class="{'justify-md-end': isTourPlaying, 'px-4': isTourPlaying, 'pc-widescreen': aspectRatio > 1.5}">    
        <icon-button
          @activate="() => playPauseTour()"
          :fa-icon="isTourPlaying ? 'stop' : 'play'"
          :color="buttonColor"
          :tooltip-text="isTourPlaying ? 'Stop tour' : 'Play tour'"
          tooltip-location="top"
        >
          <template #button>
            <span class="jl_icon_button_text">{{ isTourPlaying ? 'Leave tour and return to main view' : 'Show me how to find the nova'}}</span>
          </template>
        </icon-button>
        <icon-button
          v-if="!isTourPlaying && !(aspectRatio > 1.5 && height < 330)"
          @activate="() => {
            toggleAndGoToNova();  
          }"
          :color="buttonColor"
          :tooltip-text="store.backgroundImageset?.get_name() == TYCHO_ISET_NAME ? 'Show nova' : 'Hide nova'"
          tooltip-location="top"
        >
          <template #button>
            <span class="jl_icon_button_text">{{
              store.backgroundImageset?.get_name() == TYCHO_ISET_NAME ?
              'Show me what the nova will look like' :
              'Show me what T CrB usually looks like'
              }}</span>
          </template>
        </icon-button>
        <!-- icon button to go to TCrB -->
        <icon-button
          v-if="!isTourPlaying"
          @activate="() => goToTCrB()"
          fa-icon="star"
          :color="buttonColor"
          tooltip-text="Center on T CrB"
          tooltip-location="top">
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
                tabindex="0"
                @keyup.enter="props.onClick"
                >
                <time-display class="bsn__time" v-if="!isTourPlaying" :date="localSelectedDate" ampm :short-time-date="smAndDown" show-timezone :timezone="shortTimezone" />
                <v-icon class="td__icon" v-if="!isTourPlaying" >mdi-cursor-default-click</v-icon>
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
        <icon-button 
          v-if="!isTourPlaying"
          :fa-icon="timePlaying ? 'pause' : 'play'"
          :color="buttonColor" 
          :tooltip-text="timePlaying ? 'Pause time' : 'Let time move forward'"
          tooltip-location="start" 
          @activate="()=>{playbackControl.togglePlay()}" 
          style="align-self: center;"
        />
        <div style="flex-grow:1;"></div>
        <credit-logos
          v-if="!smAndDown && !isTourPlaying"
          :default-logos="['cosmicds', 'wwt', 'sciact', 'nasa']"
          style="margin:1em;"
          logo-size="25px"/>
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
      <bottom-nova-sheet
        :cssVars="cssVars"
        v-model="showNovaSheet"
        :accent-color="accentColor"
        :touchscreen="touchscreen"
        :show-blaze-overlay="showBlazeOverlay"
        :show-alpha-overlay="showAlphaOverlay"
        @toggle-blaze="() => store.gotoRADecZoom({ raRad: crbPlace.get_RA() * 15 * D2R, decRad: crbPlace.get_dec() * D2R, zoomDeg: 180, instant: false })"
        @toggle-alpha="() => {
          toggleAlpha();
        }"
        :retain-focus="!showRating"
      />

      <!-- This dialog contains the informational content that is displayed when the info icon is clicked -->
      <bottom-use-sheet
        :cssVars="cssVars"
        v-model="showUseSheet"
        :accent-color="accentColor"
        :touchscreen="touchscreen"
        :show-blaze-overlay="showBlazeOverlay"
        :show-alpha-overlay="showAlphaOverlay"
        @toggle-blaze="() => store.gotoRADecZoom({ raRad: crbPlace.get_RA() * 15 * D2R, decRad: crbPlace.get_dec() * D2R, zoomDeg: 180, instant: false })"
        @toggle-alpha="() => {
          toggleAlpha();
        }"
      />

      <v-container>
        <v-expand-transition>
          <user-experience
            v-show="showRating"
            :question="question"
            icon-size="3x"
            @dismiss="(_rating: UserExperienceRating | null, _comments: string | null) => {
              showRating = false;
            }"
            @rating="(rating: UserExperienceRating | null) => {
              currentRating = rating;
              updateUserExperienceInfo(currentRating, currentComments);
            }"
            @finish="(rating: UserExperienceRating | null, comments: string | null) => {
              currentRating = rating;
              currentComments = comments;
              updateUserExperienceInfo(currentRating, currentComments)
              showRating = false;
            }"
          >
              <template #footer>
                <div id="user-experience-footer" class="mt-4">
                  <v-btn
                    class="rating-opt-put"
                    color="#BDBDBD"
                    size="small"
                    variant="text"
                    @click="onOptOutClicked"
                  >
                  Don't show again
                  </v-btn>
                  <v-btn
                    class="privacy-button"
                    color="#BDBDBD"
                    size="small"
                    @click="showPrivacyPolicy = true"
                    @keyup.enter="showPrivacyPolicy = true"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                  What is this?
                  </v-btn>
                </div>
              </template>
            </user-experience>
          </v-expand-transition>
          <cds-privacy-policy v-model="showPrivacyPolicy" />
        </v-container>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { v4 } from "uuid";
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import { Color, Grids, Place, Settings, WWTControl } from "@wwtelescope/engine";
import { GotoRADecZoomParams, engineStore } from "@wwtelescope/engine-pinia";
import { API_BASE_URL, BackgroundImageset, skyBackgroundImagesets, supportsTouchscreen, blurActiveElement, useWWTKeyboardControls, D2R, LocationDeg, UserExperienceRating } from "@cosmicds/vue-toolkit";
import { useDisplay} from 'vuetify';

import { throttle } from './debounce';

import { equatorialToHorizontal } from "./utils";
import { LocationRad } from "./types";
import { resetAltAzGridText, makeAltAzGridText, setupConstellationFigures, renderOneFrame } from "./wwt-hacks";

import { usePlaybackControl } from "./wwt_playback_control";
import { useTimezone } from "./timezones";

type SheetType = "nova-text" | "use-text" | "video";
type CameraParams = Omit<GotoRADecZoomParams, "instant">;
export interface MainComponentProps {
  wwtNamespace?: string;
  initialCameraParams?: CameraParams;
}

const TYCHO_ISET_NAME = "Tycho (Synthetic, Optical)";
const USNOB_ISET_NAME = "USNOB: US Naval Observatory B 1.0 (Synthetic, Optical)";

const UUID_KEY = "blaze-star-nova-uuid" as const;
const STORY_RATING_URL = `${API_BASE_URL}/blaze-star-nova/user-experience`;
const maybeUUID = window.localStorage.getItem(UUID_KEY);
const uuid = maybeUUID ?? v4();
let ratingOptedOut = window.localStorage.getItem("blaze-star-nova-rating-optout")?.toLowerCase() === "true";
const showPrivacyPolicy = ref(false);
function onOptOutClicked() {
  showRating.value = false;
  ratingOptedOut = true;
  window.localStorage.setItem("blaze-star-nova-rating-optout", "true");
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
const { smAndDown, width, height } = useDisplay();

const aspectRatio = computed(() => width.value / height.value);

const question = Math.random() > 0.5 ? 
  "Does this spark your curiosity?" :
  "Are you learning something new?";
const currentRating = ref<UserExperienceRating | null>(null);
const currentComments = ref<string | null>(null);
const showRating = ref(false);


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
crbPlace.set_zoomLevel(180);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const wwtSettings: Settings = Settings.get_active();
function getWWTLocation(): LocationRad {
  return {
    longitudeRad: wwtSettings.get_locationLng() * D2R,
    latitudeRad: wwtSettings.get_locationLat() * D2R,
  };
}

async function goToTCrB(instant=false): Promise<void> {
  return store.gotoTarget({
    place: crbPlace,
    noZoom: false,
    instant,
    trackObject: false,
  });
}

function toggleAndGoToNova() {
  // const instant = isTCrBOnScreen();
  // console.log("Instant", instant);
  goToTCrB().then(() => {
    store.setBackgroundImageByName(store.backgroundImageset?.get_name() == TYCHO_ISET_NAME ? USNOB_ISET_NAME : TYCHO_ISET_NAME);
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

let href = window.location.href;
if (href.endsWith("/")) {
  href = href.slice(0, href.length - 1);
}

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

window.addEventListener("orientationchange", function() {
  adjustWWTSize(isTourPlaying.value);
});

window.addEventListener("resize", function() {
  adjustWWTSize(isTourPlaying.value);
});

onMounted(() => {
  store.waitForReady().then(async () => {
    skyBackgroundImagesets.forEach(iset => backgroundImagesets.push(iset));

    store.setBackgroundImageByName(TYCHO_ISET_NAME);

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
  }).then(()=>{updateCrbBelowHorizon(store.currentTime);});

  // ratingDisplaySetup();
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

/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  // get the text-bottom-sheet id height and subtract it from 100vh
  return {
    "--accent-color": accentColor.value,
    "--app-content-height": (showNovaSheet.value | showUseSheet.value) ? "66%" : "100%",
  };
});


/**
  Computed flags that control whether the relevant dialogs display.
  The `sheet` data member stores which sheet is open, so these are just
  computed wrappers around modifying/querying that which can be used as
  dialog v-model values
*/
const showNovaSheet = computed({
  get() {
    return sheet.value === "nova-text";
  },
  set(_value: boolean) {
    selectSheet("nova-text");
  }
});

const showUseSheet = computed({
  get() {
    return sheet.value === "use-text";
  },
  set(_value: boolean) {
    selectSheet("use-text");
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
    beforeTourTime = selectedDate.value;
    store.loadTour({ url: `${href}/FindingCoronaBorealis.WTT`, play: true });
  } else {
    clearCurrentTour();
    store.setBackgroundImageByName(TYCHO_ISET_NAME);
  }
}

function onTourPlayingChange(playing: boolean) {
  WWTControl.singleton.renderOneFrame = playing ? originalFrameRender : newFrameRender;
  if (playing) {
    playbackControl.pause();
  } else {
    clearCurrentTour();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    WWTControl.singleton.set__mover(null);
    store.applySetting(["localHorizonMode", true]);
    store.setBackgroundImageByName(TYCHO_ISET_NAME);
    selectedDate.value = beforeTourTime;
    // The watcher will do this, but we need it to happen now,
    // before we move
    store.setTime(beforeTourTime);
    goToTCrB(true);
  }
  adjustWWTSize(playing);
}

function adjustWWTSize(tourPlaying: boolean) {
  const wwt = document.querySelector(".wwtelescope-component");
  if (!(wwt instanceof HTMLElement)) {
    return;
  }
  const aspectRatio = window.innerWidth / window.innerHeight;
  if (aspectRatio < (4 / 3)) {
    const height = tourPlaying ? 0.75 * window.innerWidth : window.innerHeight;
    const top = tourPlaying ? 0.5 * (window.innerHeight - height) : 0;
    wwt.style.width = `${window.innerWidth}px`;
    wwt.style.height = `${height}px`;
    wwt.style.top = `${top}px`;
    wwt.style.left = "0px";
  } else {
    const width = tourPlaying ? (4 / 3) * window.innerHeight : window.innerWidth;
    const left = tourPlaying ? 0.5 * (window.innerWidth - width) : 0;
    wwt.style.height = `${window.innerHeight}px`;
    wwt.style.width = `${width}px`;
    wwt.style.left = `${left}px`;
    wwt.style.top = "0px";
  }
}

// function logWWTState() {
//   const loc = getWWTLocation();
//   const locDeg = {
//     latitudeDeg: loc.latitudeRad * 180 / Math.PI,
//     longitudeDeg: loc.longitudeRad * 180 / Math.PI,
//   };
//   console.log(getWWTLocation());
//   console.table({
//     time: store.currentTime,
//     location: locDeg,
//     selectedLocation: selectedLocation.value,
//     showHorizon: showHorizon.value,
//     showAltAzGrid: showAltAzGrid.value,
//     showConstellations: showConstellations.value,
//     crbBelowHorizon: crbBelowHorizon.value,
//   });
// }


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

function toggleAlpha() {
  store.gotoRADecZoom({ raRad: 233.6719500 * D2R, decRad: 26.7146850 * D2R, zoomDeg: 180, instant: false }).then(() => {
    showAlphaOverlay.value = true;
  }).then(() => {
    setTimeout(() => {
      showAlphaOverlay.value = false;
    }, 5000);
  });
}

async function _ratingDisplaySetup() {
  if (ratingOptedOut) {
    console.log("opted out of ratings");
    return;
  }
  const existsResponse = await fetch(`${STORY_RATING_URL}/${uuid}`, {
    method: "GET",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: { "Authorization": process.env.VUE_APP_CDS_API_KEY ?? "" }
  });
  // NB: If we want to ask multiple questions, this logic can be adjusted
  const existsContent = await existsResponse.json();
  const exists = existsResponse.status === 200 && existsContent.ratings?.length > 0;
  if (exists) {
    return;
  }
  setTimeout(() => {
    showRating.value = true; 
  }, 40_000);
}

function updateUserExperienceInfo(rating: UserExperienceRating | null, comments: string | null) {
  const body: Record<string, unknown> = {
    uuid,
    question,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    story_name: "blaze-star-nova",
  };
  if (rating) {
    body.rating = rating;
  }
  if (comments) {
    body.comments = comments;
  }
  fetch(STORY_RATING_URL, {
    method: "PUT",
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Authorization": process.env.VUE_APP_CDS_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
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
  --default-font-size: ~"max(14px, calc(0.7em + 0.3vw))";
  --default-line-height: ~"max(20px, calc(1em + 0.4vw))";
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
  // top: 0;
  // left: 0;
  // width: calc(100vw - 2rem);
  max-height: 2rem;
  flex-grow:0;
  margin: 1rem;
  pointer-events: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  z-index: 1000;
}

#top-content > #left-buttons > #controls {
  pointer-events: auto;
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
  height: auto;
}

.chip-text {
  font-size: var(--default-font-size) !important;
  max-width: 33vw; 
  white-space: normal; 
  height: auto !important; 
  padding-inline: 1em !important;
  padding-block: 0.5em !important;
  text-align: center;
  border-radius: 20px;
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

#playback-controls.pc-widescreen {
  flex-direction: column;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 5px;
  max-height: calc(100vh - 5rem);
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

.tab-focusable {
  color: var(--accent-color);

  &:focus {
    color: white;
  }
}

// From Sara Soueidan (https://www.sarasoueidan.com/blog/focus-indicators/) & Erik Kroes (https://www.erikkroes.nl/blog/the-universal-focus-state/)
:focus-visible,
button:focus-visible,
.focus-visible {
  outline: 9px double black;
  box-shadow: 0 0 0 6px white !important;
  border-radius: .125rem;
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

    .v-selection-control--focused .v-selection-control__input {
      outline: 9px double black;
      box-shadow: 0 0 0 6px white !important;
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
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.jl_icon-button {
  border-radius: 20px;
  border:2px solid  var(--accent-color);
  background-color: black;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.jl_icon_button_text {
  font-size : var(--default-font-size) !important;
  padding-inline: 1em; 
  max-width: 20ch; 
  text-align: center;
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
  overflow: visible;
}

.td__icon {
  position: absolute;
  bottom: -4px;
  right: 0px;
  z-index: 10000;
}

.bsn__time .td__time_time {
  font-size: var(--default-font-size);
}

.bsn__time .td__date_date {
  font-size: calc(0.85 * var(--default-font-size));
}

.bsn__time .td__timezone_tz {
  font-size: calc(0.85 * var(--default-font-size));
}

.rating-root {
  position: absolute !important;
  right: 5px;
  bottom: 0;
  padding: 5px;
  width: fit-content !important;
  // left: 50%;
  // transform: translateX(-50%);
  gap: 0 !important;
  border: solid 1px #EFEFEF !important;
  border-radius: 10px !important;
  background-color: #222222 !important;
  opacity: 0.95 !important;
  z-index: 20000;
  .rating-title {
    color: #EFEFEF;
    font-size: calc(0.7*var(--default-font-size));
    padding-left:0;
    text-align: left;
  }
  .rating-icon-row {
    
    padding: 0px;
    .svg-inline--fa {
      height: 30px;
    }
  }
  .comments-box {
    width: 100%;
    margin-top: 20px;
  }
  .v-card-text {
    padding-bottom: 0;
  }
  .v-card-actions {
    padding: 0;
  }
  #user-experience-footer {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
    gap: 5px;
  }


}
</style>
