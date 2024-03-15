import { ref } from 'vue'
import { defineStore } from 'pinia'

interface PopUp {
  type: 'warning' | 'acknowledge' | 'error'
  title: string
  message: Array<string>
  showTerms: boolean
  leftButtonTitle: string
  rightButtonTitle?: string
  onCancel?: Function
  onAcknowledged?: Function
}

export const usePopUpStore = defineStore('popup', () => {
  const popUp = ref<PopUp | undefined>(undefined)
  const showPopUp = ref<boolean>(false)

  function setPopUp(newPopUp: PopUp) {
    popUp.value = newPopUp
    showPopUp.value = true
  }

  function closePopUp() {
    popUp.value = undefined
    showPopUp.value = false
  }

  return { popUp, showPopUp, setPopUp, closePopUp }
})
