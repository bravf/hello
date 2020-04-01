export default {
  data () {
    return {
      delayTimer: null,
    }
  },
  methods: {
    _delay (f) {
      if (this.delayTimer) {
        clearTimeout(this.delayTimer)
      }
      this.delayTimer = setTimeout(f)
    }
  }
}