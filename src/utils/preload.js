import { createApp } from 'vue';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

// Note: Vue 3 loading setup is different
let loader = null;
function loaderStart() {
    console.log('Loading started');
}
function loaderEnd() {
    loader.hide();
}

function loaderContainerStart() {
    loader = Vue.$loading.show({
        loader: 'spinner',
        color: '#5D00FF',
        zIndex: 999,
        canCancel: true,
        isFullPage : false
   });
}


export default {loaderStart, loaderEnd, loaderContainerStart}