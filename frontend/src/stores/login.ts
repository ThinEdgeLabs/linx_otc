import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoginStore = defineStore('login', () => {
    const showModal = ref(false)

    function toggleModal() {
        showModal.value = !showModal.value
    }
    
  return { showModal, toggleModal }
})