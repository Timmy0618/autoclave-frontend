<template>
    <g class="layer-labels">
        <text v-for="(p, i) in points" :key="i" :x="p.x" :y="p.y - 10" text-anchor="middle" font-size="12"
            fill="#8884d8">
            {{ p.props.data[dataKeys[1]] }}
        </text>
    </g>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue'
import { usePoints } from 'vue3-charts'

export default defineComponent({
    props: {
        dataKeys: {
            type: Object as () => [string, string],
            required: true
        }
    },
    setup(props) {
        const { points } = usePoints(props.dataKeys)
        return { points }
    }
})
</script>