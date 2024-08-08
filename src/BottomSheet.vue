<template>
  <v-dialog :style="cssVars" class="bottom-sheet" id="text-bottom-sheet" hide-overlay persistent no-click-animation
  absolute width="100%" :scrim="false" location="bottom" v-model="showTextSheet"
  transition="dialog-bottom-transition">
  <v-card id="bottom-sheet-card" height="100%">
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
          <v-card-text v-if="tab==0" class="info-text tab-items no-bottom-border-radius scrollable">
            <p>You may have heard that a star in our night sky is going to "go nova" soon. Learn what this means and how you can see the nova!</p>

            <h4>What is a nova?</h4>
            <p>
              Novas are bright stars that seem to appear out of nowhere. They are named for the Latin word for "new." In reality, stars that "go nova" have been there the whole time, but they did not not appear very bright, and therefore were not obvious in the sky. An explosion of gas on the surface of the star (the nova event) temporarily makes the star much, <strong>MUCH</strong> brighter than it was before.
            </p>
            <h4>How do I see this nova?</h4>
            <p>
            The star that will become a nova is named "T Coronae Borealis." It is often referred to as "T CrB" for short and is also nicknamed, the "Blaze Star." As the name suggests, it is located within the constellation Corona Borealis, the "Northern Crown." <a :href="tourLink">This guide</a> explains how you can find Corona Borealis in your night sky.
            </p>
            <p>
              On a clear night, go out and look for Corona Borealis, so you can get used to its U-shape in the sky. Once T CrB goes nova, which can be any day now, or possibly weeks or months from now, it will seem as if a new star appeared just to the lower left of the U shape of the constellation.
            </p>
            <h4>How bright will the nova be?</h4>
            <p>
              At its normal brightness, T CrB is about a 10th magnitude star. This is about 30-40 times fainter than the faintest star a person could see from a dark sky, so you would need a telescope to see it. When it goes nova, it is predicted to be about 2-2.5 magnitudes. It is comparable in brightness to Alphecca, the brightest star you can see in the crown of Corona Borealis.(TODO: add a link to turn on the layer that shows the brightness comparison.)
            </p>
            <h4>What causes a nova?</h4>
            <v-row>
              <v-col cols="7">
                <p>
                  Novas occur in binary star systems where small, very dense, very hot stars called white dwarfs orbit another large star at close range. The graviational pull from the white dwarf can pull gas from the outer layers of the large companion star onto the surface of the white dwarf. When enough of this gas collects on the surface of the white dwarf, it triggers a nuclear explosion that causes the temporary brightening of the nova.
                </p>
              </v-col>
              <v-col cols="5">
                <v-img
                  src="https://www.nasa.gov/wp-content/uploads/2024/06/novacyg093500952-print.jpg"
                ></v-img>
                <p>TODO - this needs a caption with credit and alt text</p>
              </v-col>
            </v-row>
            <h4>How do we know this nova is getting ready to blow?</h4>
            <p>
              Luckily, novas only blow up the gas that has settled on the surface of the white dwarf, and NOT the white dwarf itself. This means that the white dwarf can pull a new round of gas from its companion star. In some nova systems, this cycle of collecting gas, going nova, collecting more gas, going nova again, happens at a repeatable timescale. For T CrB, this has happened roughly every 80 years. It last blew in 1946, and before that, it blew in 1866. Astronomers have observed changes in the star's overall brightness that suggest it is getting ready to go nova again soon!
            </p>
            <h4>Why does this star have multiple names?</h4>
            <p>
              Astronomers usually name stars for the constellation they are in, and approximately for the relative brightness within the constellation, as designated by Greek letters. For example, the brightest star in Corona Borealis, Alphecca, is also known as &#945;-CrB. The 2nd brightest star is &#946;-CrB. 
            </p>
            <p>
              The astronomer Friedrich Argelander began the practice of assigning Roman letters to stars that vary in brightness, beginning with the letter R. So the "T" in T CrB means that it is the third variable star discovered within Corona Borealis.
            </p>
            <p>
              The nickname "Blaze Star" was given to T CrB after it "blazed forth suddenly" on May 12, 1866, becoming as bright as Alphecca. Learn more about the history in this 1897 <a href="https://articles.adsabs.harvard.edu/pdf/1897PA......5...97P" target="_blank"
              rel="noopener noreferrer">paper</a> by Mary Proctor.
            </p>
          </v-card-text>
          <v-card-text v-if="tab==1" class="info-text tab-items no-bottom-border-radius scrollable">
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
  </v-dialog>
</template>


<script setup lang="ts">
import { defineProps, defineEmits, withDefaults, defineModel, watch, ref } from 'vue';

export interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cssVars?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accentColor?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  touchscreen?: any;
}

const props = withDefaults(defineProps<Props>(),{
  cssVars: () => ({}),
  accentColor: () => 'accent',
  touchscreen: () => false
});

const emits = defineEmits(['close']);

const { cssVars, accentColor, touchscreen } = props;

const tab = ref(0);

const showTextSheet = defineModel({default: true});

const tourLink = ref(`${window.location.origin}/FindingCoronaBorealis.WTT`);

watch(() => showTextSheet, (newVal) => {
  if (!newVal) {
    emits('close');
  }
});

</script>

<style lang="less">

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
  
  .info-tabs {
    border-bottom: 2px solid var(--accent-color);
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



  #bottom-sheet-card .tab-items.v-card-text {
    font-size: ~"max(14px, calc(0.7em + 0.3vw))";
    padding-top: ~"max(2vw, 16px)";
    padding-left: ~"max(4vw, 16px)";
    padding-right: ~"max(4vw, 16px)";

    .end-spacer {
      height: 25px;
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
