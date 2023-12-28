import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import '../index.css'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */

import {
    faBell,
    faSidebar,
    faSendBack,
    faLandmark,
    faSackDollar,
    faArrowRightArrowLeft,
    faGear,
    faArrowRight,
    faShieldKeyhole,
    faCreditCard,
    faPlug,
    faCircleCheck,
    faCircleExclamation,
    faAngleDown,
    faCheck,
    faCircleInfo,
    faCopy,
    faVault,
    faArrowUpArrowDown,
    faSpinnerThird,
    faTriangleExclamation,
    faArrowUpRightFromSquare,
    faPlus,
    faTrashAlt,
    faTimes,
    faBoxCircleCheck
  } from '@fortawesome/pro-light-svg-icons'
  library.add(
    faBell,
    faSidebar,
    faSendBack,
    faLandmark,
    faSackDollar,
    faArrowRightArrowLeft,
    faShieldKeyhole,
    faGear,
    faArrowRight,
    faCreditCard,
    faPlug,
    faCircleCheck,
    faCircleExclamation,
    faAngleDown,
    faCheck,
    faCircleInfo,
    faCopy,
    faVault,
    faArrowUpArrowDown,
    faSpinnerThird,
    faTriangleExclamation,
    faArrowUpRightFromSquare,
    faPlus,
    faTrashAlt,
    faTimes,
    faBoxCircleCheck
  )
  import {
    faBell as fasBell,
    faSidebar as fasSidebar,
    faSendBack as fasSendBack,
    faLandmark as fasLandmark,
    faSackDollar as fasSackDollar,
    faArrowRightArrowLeft as fasArrowRightArrowLeft,
    faShieldKeyhole as fasShieldKeyhole,
    faGear as fasGear,
    faCreditCard as fasCreditCard,
    faPlug as fasPlug,
    faCircleCheck as fasCircleCheck,
    faCircleExclamation as fasCircleExclamation,
    faAngleDown as fasAngleDown,
    faCheck as fasCheck,
    faCircleInfo as fasCircleInfo,
    faCopy as fasCopy,
    faVault as fasVault,
    faArrowUpArrowDown as fasArrowUpArrowDown,
    faSpinnerThird as fasSpinnerThird,
    faTriangleExclamation as fasTriangleExclamation,
    faArrowUpRightFromSquare as fasArrowUpRightFromSquare,
    faPlus as fasPlus,
    faTrashAlt as fasTrashAlt,
    faTimes as fasTimes
  } from '@fortawesome/pro-solid-svg-icons'
  import { faXmark } from '@fortawesome/pro-regular-svg-icons'
  import {
    faSendBack as fatSendBack,
    faLandmark as fatLandmark,
    faSackDollar as fatSackDollar,
    faArrowRightArrowLeft as fatArrowRightArrowLeft,
    faShieldKeyhole as fatShieldKeyhole,
    faGear as fatGear,
    faCreditCard as fatCreditCard,
    faPlug as fatPlug,
    faCircleCheck as fatCircleCheck,
    faCircleExclamation as fatCircleExclamation,
    faAngleDown as fatAngleDown,
    faCheck as fatCheck,
    faCircleInfo as fatCircleInfo,
    faCopy as fatCopy,
    faVault as fatVault,
    faArrowUpArrowDown as fatArrowUpArrowDown,
    faSpinnerThird as fatSpinnerThird,
    faTriangleExclamation as fatTriangleExclamation,
    faArrowUpRightFromSquare as fatArrowUpRightFromSquare,
    faPlus as fatPlus,
    faTrashAlt as fatTrashAlt,
    faTimes as fatTimes
  } from '@fortawesome/pro-thin-svg-icons'
  
  library.add(
    fasBell,
    fasSidebar,
    fasSendBack,
    fasLandmark,
    fasSackDollar,
    fasArrowRightArrowLeft,
    fasShieldKeyhole,
    fasGear,
    fasCreditCard,
    fasPlug,
    fasCircleCheck,
    fasCircleExclamation,
    fasAngleDown,
    fasCheck,
    fasCircleInfo,
    fasCopy,
    fasVault,
    fasArrowUpArrowDown,
    fasSpinnerThird,
    fasTriangleExclamation,
    fasArrowUpRightFromSquare,
    fasPlus,
    fasTrashAlt,
    fasTimes,
    faXmark,
    fatSendBack,
    fatLandmark,
    fatSackDollar,
    fatArrowRightArrowLeft,
    fatShieldKeyhole,
    fatGear,
    fatCreditCard,
    fatPlug,
    fatCircleCheck,
    fatCircleExclamation,
    fatAngleDown,
    fatCheck,
    fatCircleInfo,
    fatCopy,
    fatVault,
    fatArrowUpArrowDown,
    fatSpinnerThird,
    fatTriangleExclamation,
    fatArrowUpRightFromSquare,
    fatPlus,
    fatTrashAlt,
    fatTimes
  )

const app = createApp(App).component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
